import httpStatus from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { envVars } from '../config/env';
import AppError from '../error/AppError';
import { IsActive, IUser } from '../modules/user/user.interface';
import { User } from '../modules/user/user.model';
import { generateToken, verifyToken } from './jwt';

export const createUserTokens = (user: Partial<IUser>) => {
    const jwtPayload = {
        userId: user._id?.toString(), // Convert ObjectId to string for JWT
        email: user.email,
        role: user.role,
        tokenVersion: user.refreshTokenVersion || 0,
    };

    const secret = (envVars.JWT_ACCESS_TOKEN_SECRET || '').trim();

    const accessToken = generateToken(
        jwtPayload,
        secret,
        envVars.JWT_ACCESS_EXPIRATION_TIME
    );

    const refreshToken = generateToken(
        jwtPayload,
        (envVars.JWT_REFRESH_TOKEN_SECRET || '').trim(),
        envVars.JWT_REFRESH_EXPIRATION_TIME
    );

    return {
        accessToken,
        refreshToken,
    };
};

export const createNewAccessTokenWithRefreshToken = async (
    refreshToken: string
) => {
    let verifiedRefreshToken: JwtPayload;
    try {
        verifiedRefreshToken = verifyToken(
            refreshToken,
            envVars.JWT_REFRESH_TOKEN_SECRET
        ) as JwtPayload & { tokenVersion?: number };
    } catch {
        throw new AppError(
            httpStatus.UNAUTHORIZED,
            'Invalid or expired refresh token'
        );
    }

    const isUserExist = await User.findOne({
        email: verifiedRefreshToken.email,
    });

    if (!isUserExist) {
        throw new AppError(httpStatus.BAD_REQUEST, 'User does not exist');
    }

    // Check token rotation: if versions don't match, token was already used (security breach)
    if (
        verifiedRefreshToken.tokenVersion !== undefined &&
        verifiedRefreshToken.tokenVersion !==
            (isUserExist.refreshTokenVersion || 0)
    ) {
        // Possible token reuse attack - invalidate all tokens by incrementing version
        await User.findByIdAndUpdate(isUserExist._id, {
            refreshTokenVersion: (isUserExist.refreshTokenVersion || 0) + 1,
        });
        throw new AppError(
            httpStatus.UNAUTHORIZED,
            'Refresh token has already been used. Possible security breach. Please login again.'
        );
    }

    if (
        isUserExist.isActive === IsActive.BLOCKED ||
        isUserExist.isActive === IsActive.INACTIVE
    ) {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            `User is ${isUserExist.isActive}`
        );
    }
    if (isUserExist.isDeleted) {
        throw new AppError(httpStatus.BAD_REQUEST, 'User is deleted');
    }

    // Increment refresh token version (rotation)
    const newVersion = (isUserExist.refreshTokenVersion || 0) + 1;
    await User.findByIdAndUpdate(isUserExist._id, {
        refreshTokenVersion: newVersion,
    });

    const jwtPayload = {
        userId: isUserExist._id?.toString(), // Convert ObjectId to string for JWT
        email: isUserExist.email,
        role: isUserExist.role,
        tokenVersion: newVersion,
    };

    const accessToken = generateToken(
        jwtPayload,
        (envVars.JWT_ACCESS_TOKEN_SECRET || '').trim(),
        envVars.JWT_ACCESS_EXPIRATION_TIME
    );

    // Generate new refresh token with updated version
    const newRefreshToken = generateToken(
        jwtPayload,
        (envVars.JWT_REFRESH_TOKEN_SECRET || '').trim(),
        envVars.JWT_REFRESH_EXPIRATION_TIME
    );

    return {
        accessToken,
        refreshToken: newRefreshToken,
    };
};

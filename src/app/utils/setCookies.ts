import { Response } from 'express';

interface IAuthCookies {
    accessToken?: string;
    refreshToken?: string;
}

export const setAuthCookies = (res: Response, tokenInfo: IAuthCookies) => {
    const isProduction = process.env.NODE_ENV === 'production';

    if (tokenInfo.accessToken) {
        res.cookie('accessToken', tokenInfo.accessToken, {
            httpOnly: true,
            secure: isProduction, // Only true in production (HTTPS)
            sameSite: isProduction ? 'none' : 'lax',
        });
    }

    if (tokenInfo.refreshToken) {
        res.cookie('refreshToken', tokenInfo.refreshToken, {
            httpOnly: true,
            secure: isProduction, // Only true in production (HTTPS)
            sameSite: isProduction ? 'none' : 'lax',
        });
    }
};

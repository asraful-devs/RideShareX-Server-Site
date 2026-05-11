import { Types } from 'mongoose';

export enum Role {
    ADMIN = 'ADMIN',
    RIDER = 'RIDER',
    DRIVER = 'DRIVER',
}

export interface IAuthProvider {
    provider: 'google' | 'credential'; // 'Google', 'Credential', etc.
    providerId: string;
}

export enum IsActive {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    BLOCKED = 'BLOCKED',
}

export interface IUser {
    _id?: Types.ObjectId;
    name: string;
    email: string;
    password?: string;
    phone?: string;
    picture?: string;
    isDeleted?: boolean;
    isActive?: IsActive;
    isVerified?: boolean;
    role: Role;
    auths: IAuthProvider[];
    refreshTokenVersion?: number; // For token rotation - prevents replay attacks
}

import { Response } from 'express';

interface TResponse<T, TMeta = unknown> {
    statusCode: number;
    success: boolean;
    message: string;
    data: T;
    meta?: TMeta;
}

const sendResponse = <T, TMeta = unknown>(
    res: Response,
    data: TResponse<T, TMeta>
) => {
    res.status(data.statusCode).json({
        statusCode: data.statusCode,
        success: data.success,
        message: data.message,
        meta: data.meta,
        data: data.data,
    });
};

export default sendResponse;

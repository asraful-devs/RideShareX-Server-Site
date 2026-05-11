import { Request } from 'express';
import httpStatus from 'http-status';
import AppError from '../../error/AppError';
import { sendRidePickedEmail } from '../../utils/email/emailService';
import { PaymentStatus } from '../payment/payment.interface';
import { Payment } from '../payment/payment.model';
import { Ride } from '../ride/ride.model';

// import { IDriver } from './driver.interface';
// import { Driver } from './driver.model';

const getAvailableRides = async () => {
    const result = await Ride.find({ status: 'PENDING' });
    return result;
};

import mongoose from 'mongoose';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const pickUpRide = async (req: Request, user: any) => {
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        const rideId = req.params.rideId;

        // Find Ride
        const ride = await Ride.findById(rideId)
            .populate('user driver')
            .session(session);

        if (!ride) {
            throw new AppError(httpStatus.NOT_FOUND, 'Ride not found');
        }

        // Check status
        if (ride.status !== 'PENDING') {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                'Ride is not available for pickup'
            );
        }

        // Check already assigned
        if (ride.driver) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                'Ride is already assigned to another driver'
            );
        }

        // Update Ride
        const result = await Ride.findByIdAndUpdate(
            rideId,
            {
                status: 'PICKED',
                driver: user.userId,
            },
            {
                new: true,
                session,
            }
        ).populate('user driver');

        // Send Email After Commit
        if (result && result.user && result.driver) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const populatedUser = result.user as any;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const populatedDriver = result.driver as any;

            await sendRidePickedEmail({
                userFirstName:
                    populatedUser.fullName || populatedUser.name || 'Rider',

                userEmail: populatedUser.email || '',

                driverName:
                    populatedDriver.fullName ||
                    populatedDriver.name ||
                    'Driver',

                driverPhone: populatedDriver.phone || '',

                rideStartLocation: result.pickupLocation || 'N/A',

                rideEndLocation: result.dropLocation || 'N/A',

                estimatedFare: result.payment || 0,

                rideId: result._id?.toString() || '',
            });
        }

        // Commit Transaction
        await session.commitTransaction();

        return result;
    } catch (error) {
        // Rollback Transaction
        await session.abortTransaction();

        throw error;
    } finally {
        // End Session
        session.endSession();
    }
};

const updateRideStatus = async (
    rideId: string,
    payload: { status: 'COMPLETED' | 'CANCELLED' }
) => {
    const foundRide = await Ride.findById(rideId);
    const { status } = payload;

    if (!foundRide) {
        throw new AppError(httpStatus.NOT_FOUND, 'Ride not found');
    }

    if (foundRide.status === 'COMPLETED' || foundRide.status === 'CANCELLED') {
        throw new AppError(
            httpStatus.BAD_REQUEST,
            `This ride is already ${foundRide.status.toLowerCase()}`
        );
    }

    if (foundRide.status !== 'PICKED') {
        throw new AppError(httpStatus.BAD_REQUEST, 'Ride is not picked');
    }

    if (status === 'COMPLETED') {
        const payment = await Payment.findOne({ ride: rideId });

        if (!payment) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                'Payment record not found for this ride'
            );
        }

        if (payment.status !== PaymentStatus.PAID) {
            throw new AppError(
                httpStatus.BAD_REQUEST,
                `❌ Payment has not been received yet. Payment Status: ${payment.status}. Please wait for payment to be confirmed before completing the ride.`
            );
        }
    }

    if (status === 'CANCELLED') {
        const payment = await Payment.findOne({ ride: rideId });

        if (payment && payment.status === PaymentStatus.PAID) {
            await Payment.findByIdAndUpdate(payment._id, {
                status: PaymentStatus.REFUNDED,
            });
        }
    }

    foundRide.status = status as unknown as typeof foundRide.status;
    const result = await foundRide.save();
    return result;
};

const getMyRides = async (driverId: string) => {
    const result = await Ride.find({ driver: driverId });
    return result;
};

export const getDailyEarnings = async () => {
    return Ride.aggregate([
        { $match: { status: 'COMPLETED' } },
        {
            $group: {
                _id: {
                    $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
                },
                earnings: { $sum: '$payment' },
            },
        },
        { $sort: { _id: 1 } },
    ]);
};

export const DriverService = {
    getAvailableRides,
    pickUpRide,
    updateRideStatus,
    getMyRides,
    getDailyEarnings,
};

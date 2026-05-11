/* eslint-disable no-console */
import { Server } from 'http';
import mongoose from 'mongoose';
import app from './app';
import { envVars } from './app/config/env';
import { sendAdmin } from './app/utils/sendAdmin';

// dotenv.config();

let server: Server;

const startServer = async () => {
    try {
        await mongoose.connect(envVars.MONGODB_URL);
        console.log('Connected to MongoDB');
        server = app.listen(envVars.PORT, () => {
            console.log(
                `Server is running on http://localhost:${envVars.PORT}`
            );
        });
    } catch (error) {
        console.error('Error starting server:', error);
    }
};

(async () => {
    await startServer();
    await sendAdmin();
})();

// Handle unhandled rejections and uncaught exceptions
// This is important for production environments to avoid crashes

process.on('unhandledRejection', (error) => {
    console.error('Unhandled Rejection. Shutting down server...', error);
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception. Shutting down server...', error);
    if (server) {
        server.close(() => {
            process.exit(1);
        });
    } else {
        process.exit(1);
    }
});

process.on('SIGTERM', () => {
    console.log('SIGTERM signal received. Shutting down gracefully...');
    if (server) {
        server.close(() => {
            console.log('Server closed gracefully');
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received. Shutting down gracefully...');
    if (server) {
        server.close(() => {
            console.log('Server closed gracefully');
            process.exit(0);
        });
    } else {
        process.exit(0);
    }
});

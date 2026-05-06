import mongoose from "mongoose";
import { ENV } from "./env";


const RETRY_LIMIT = 5;
const RETRY_DELAY_MS = 3000;

export const connectDB = async (attempt= 1): Promise<void> => {
    try {
        await mongoose.connect(ENV.MONGODB_URI, {
            dbName: 'velorent'
        });
        console.log('MongoDB connected');

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected. Reconnecting...');
            setTimeout(() => connectDB(), RETRY_DELAY_MS);
        });

        mongoose.connection.on('error', (err) => {
            console.log('MongoDB error:', err.message);
        });
    } catch (error: any) {
        console.log(`MongoDB connected failed (attemp ${attempt}/${RETRY_LIMIT})`);
        console.log('MongoDB error: ',error.message);
        if (attempt < RETRY_LIMIT) {
            setTimeout(() => connectDB(attempt + 1), RETRY_DELAY_MS);
        } else {
            console.log('Could not connect to MongoDB after max retries. Exiting.');
            process.exit(1)
        }
    }
}
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const mongoose_1 = __importStar(require("mongoose"));
// Load environment variables
dotenv_1.default.config();
const CounterSchema = new mongoose_1.Schema({
    value: Number,
});
const Counter = mongoose_1.default.model('Counter', CounterSchema);
// Initialize Express app
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
// Ensure MONGODB_URI is defined
const mongoUri = process.env.MONGODB_URI;
if (!mongoUri) {
    throw new Error('MONGODB_URI environment variable is not set');
}
// Define custom CORS options
const corsOptions = {
    origin: 'https://e-commerce-sep-2024.vercel.app', // Allow requests from the Vercel frontend
    credentials: true, // Allow credentials if needed
};
// Apply CORS middleware with options
app.use((0, cors_1.default)(corsOptions));
// Handle CORS preflight requests for all routes
app.options('*', (0, cors_1.default)(corsOptions));
// Define routes
app.get('/', async (req, res) => {
    try {
        if (mongoose_1.default.connection.readyState !== 1) {
            throw new Error('Database connection not established');
        }
        const db = mongoose_1.default.connection.db;
        await db.admin().ping();
        res.json({
            message: 'Welcome to EscapeRelaxandBeJeweled API',
            dbStatus: 'Connected to MongoDB successfully',
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Welcome to EscapeRelaxandBeJeweled API',
            dbStatus: 'Failed to connect to MongoDB',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
});
app.get('/api/count', async (req, res) => {
    try {
        let counter = await Counter.findOne();
        if (!counter) {
            counter = new Counter({ value: 0 });
        }
        counter.value += 1;
        await counter.save();
        res.json({
            count: counter.value,
            message: 'Counter updated successfully and saved to the database',
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});
// Connect to MongoDB
async function connectToDatabase() {
    try {
        await mongoose_1.default.connect(mongoUri);
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }
    catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
}
connectToDatabase();
// Monitor MongoDB connection
const db = mongoose_1.default.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function () {
    console.log('MongoDB connected successfully');
});
// server/src/index.ts

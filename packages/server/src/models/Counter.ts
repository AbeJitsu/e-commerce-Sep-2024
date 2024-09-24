// src/models/Counter.ts
import mongoose from 'mongoose';

interface ICounter extends mongoose.Document {
  value: number;
}

const CounterSchema = new mongoose.Schema({
  value: { type: Number, default: 0 },
});

export const Counter = mongoose.model<ICounter>('Counter', CounterSchema);

// server/src/models/Counter.ts

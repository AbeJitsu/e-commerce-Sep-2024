require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const CounterSchema = new mongoose.Schema({ value: Number });

const Counter = mongoose.model('Counter', CounterSchema);

const app = express();
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGODB_URI);

app.get('/', async (req, res) => {
  try {
    // Simple database operation
    await mongoose.connection.db.admin().ping();
    res.json({
      message: 'Welcome to EscapeRelaxandBeJeweled API',
      dbStatus: 'Connected to MongoDB successfully',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Welcome to EscapeRelaxandBeJeweled API',
      dbStatus: 'Failed to connect to MongoDB',
      error: error.message,
    });
  }
});

app.get('/count', async (req, res) => {
  try {
    let counter = await Counter.findOne();
    if (!counter) {
      counter = new Counter({ value: 0 });
    }
    counter.value += 1;
    await counter.save();
    res.json({ count: counter.value });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', function () {
  console.log('MongoDB connected successfully');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

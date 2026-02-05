import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

const app = express();

// Middleware
app.use(cors()); // Allow Frontend to connect
app.use(express.json());

// Routes
app.use('/api', authRoutes);
app.use('/api/admin', adminRoutes);

// Health Check (Optional)
app.get('/', (req, res) => res.send('Infinitus API is Live 🚀'));

export default app;
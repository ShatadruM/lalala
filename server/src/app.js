import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import vendorRoutes from './routes/vendorRoutes.js';
import studentRoutes from './routes/studentRoutes.js';

const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:5173', // For local testing
  process.env.CLIENT_URL,  // Your deployed Frontend URL (e.g., https://infinitus.vercel.app)
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true, // Important for cookies/sessions if you use them
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.json());

// Routes
app.use('/api', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/student', studentRoutes);

// Health Check (Optional)
app.get('/', (req, res) => res.send('Infinitus API is Live 🚀'));

export default app;
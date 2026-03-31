const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { PORT } = require('./config/env');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const propertyRoutes = require('./routes/property.routes');
const rentalRequestRoutes = require('./routes/rentalRequest.routes');
const contractRoutes = require('./routes/contract.routes');
const { errorHandler } = require('./middlewares/error.middleware');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Heartbeat route
app.get('/', (req, res) => res.send('API Running'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/rental-requests', rentalRequestRoutes);
app.use('/api/contracts', contractRoutes);

// Error Handler
app.use(errorHandler);

// Database and Server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const apiRoutes = require('./routes/api');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend Vite development & production
app.use(cors());

// Parse JSON request payloads
app.use(express.json());

// API Routes
app.use('/api', apiRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Movie Theater Ticket Engine REST API',
    documentation: '/api/health',
    status: 'ONLINE'
  });
});

// Centralized error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🎬 Movie Theater Ticket Engine Backend`);
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
  console.log(`🏥 Health check at http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});

module.exports = app;


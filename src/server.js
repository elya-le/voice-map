const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// import database initialization function
const { initializeDatabase } = require('./utils/db-init');

// import routes (to be created later)
const cardRoutes = require('./routes/cards');
const resourceRoutes = require('./routes/resources');
const cardSetRoutes = require('./routes/cardSets');
// const authRoutes = require('./routes/auth');


const app = express();
const PORT = process.env.PORT || 5000;

// middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use('/api/card-sets', cardSetRoutes);

// route middleware
app.use('/api/cards', cardRoutes);
app.use('/api', resourceRoutes); // note the different base path
// app.use('/api/card-sets', cardSetRoutes);
// app.use('/api/auth', authRoutes);

// basic route for testing
app.get('/', (req, res) => {
  res.send('Voice Map API is running');
});

// error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// initialize database and then start server
const startServer = async () => {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
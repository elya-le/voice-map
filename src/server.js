const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

// import routes (to be created later)
// const cardRoutes = require('./routes/cards');
// const cardSetRoutes = require('./routes/cardSets');
// const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// route middleware (uncomment when routes are created)
// app.use('/api/cards', cardRoutes);
// app.use('/api/card-sets', cardSetRoutes);
// app.use('/api/auth', authRoutes);

// Basic route for testing
app.get('/', (req, res) => {
  res.send('Voice Map API is running');
});

// error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
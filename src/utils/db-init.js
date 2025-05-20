const db = require('./db');

const initializeDatabase = async () => {
  try {
    // create cards table
    await db.query(`
      CREATE TABLE IF NOT EXISTS cards (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        content JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // create card_sets table
    await db.query(`
      CREATE TABLE IF NOT EXISTS card_sets (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        description TEXT,
        created_by VARCHAR(100),
        retrieval_code VARCHAR(20) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // create cards_to_sets junction table for many-to-many relationship
    await db.query(`
      CREATE TABLE IF NOT EXISTS cards_to_sets (
        id SERIAL PRIMARY KEY,
        card_id INTEGER REFERENCES cards(id) ON DELETE CASCADE,
        card_set_id INTEGER REFERENCES card_sets(id) ON DELETE CASCADE,
        position INTEGER,
        is_core_belief BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(card_id, card_set_id)
      )
    `);

    // create resources table
    await db.query(`
      CREATE TABLE IF NOT EXISTS resources (
        id SERIAL PRIMARY KEY,
        card_id INTEGER REFERENCES cards(id) ON DELETE CASCADE,
        title VARCHAR(200) NOT NULL,
        url TEXT,
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// export the function to be called from server.js
module.exports = { initializeDatabase };
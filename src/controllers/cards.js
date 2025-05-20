const db = require('../utils/db');

// get all cards
const getAllCards = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM cards ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting cards:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// get a single card by ID
const getCardById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // get card details
    const cardResult = await db.query('SELECT * FROM cards WHERE id = $1', [id]);
    
    if (cardResult.rows.length === 0) {
      return res.status(404).json({ message: 'Card not found' });
    }
    
    const card = cardResult.rows[0];
    
    // get resources associated with this card
    const resourcesResult = await db.query('SELECT * FROM resources WHERE card_id = $1', [id]);
    card.resources = resourcesResult.rows;
    
    res.json(card);
  } catch (error) {
    console.error('Error getting card:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// create a new card
const createCard = async (req, res) => {
  try {
    const { title, description, content } = req.body;
    
    // validate required fields
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }
    
    // insert the card into the database
    const result = await db.query(
      'INSERT INTO cards (title, description, content) VALUES ($1, $2, $3) RETURNING *',
      [title, description, content || {}]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating card:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// update a card
const updateCard = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, content } = req.body;
    
    // validate required fields
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }
    
    // check if card exists
    const checkResult = await db.query('SELECT * FROM cards WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Card not found' });
    }
    
    // update the card
    const result = await db.query(
      'UPDATE cards SET title = $1, description = $2, content = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [title, description, content || {}, id]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating card:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// delete a card
const deleteCard = async (req, res) => {
  try {
    const { id } = req.params;
    
    // check if card exists
    const checkResult = await db.query('SELECT * FROM cards WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Card not found' });
    }
    
    // delete the card (cascade will delete related resources)
    await db.query('DELETE FROM cards WHERE id = $1', [id]);
    
    res.json({ message: 'Card deleted successfully' });
  } catch (error) {
    console.error('Error deleting card:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllCards,
  getCardById,
  createCard,
  updateCard,
  deleteCard
};
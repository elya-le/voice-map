const db = require('../utils/db');
const { generateUniqueCode } = require('../utils/code-generator');

// get all card sets
const getAllCardSets = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM card_sets ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error getting card sets:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// get a card set by ID
const getCardSetById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // get card set details
    const cardSetResult = await db.query('SELECT * FROM card_sets WHERE id = $1', [id]);
    
    if (cardSetResult.rows.length === 0) {
      return res.status(404).json({ message: 'Card set not found' });
    }
    
    const cardSet = cardSetResult.rows[0];
    
    // get cards associated with this set
    const cardsResult = await db.query(`
      SELECT c.*, cts.position, cts.is_core_belief 
      FROM cards c
      JOIN cards_to_sets cts ON c.id = cts.card_id
      WHERE cts.card_set_id = $1
      ORDER BY cts.position
    `, [id]);
    
    cardSet.cards = cardsResult.rows;
    
    res.json(cardSet);
  } catch (error) {
    console.error('Error getting card set:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// get a card set by retrieval code
const getCardSetByCode = async (req, res) => {
  try {
    const { code } = req.params;
    
    // get card set details
    const cardSetResult = await db.query('SELECT * FROM card_sets WHERE retrieval_code = $1', [code]);
    
    if (cardSetResult.rows.length === 0) {
      return res.status(404).json({ message: 'Card set not found' });
    }
    
    const cardSet = cardSetResult.rows[0];
    
    // get cards associated with this set
    const cardsResult = await db.query(`
      SELECT c.*, cts.position, cts.is_core_belief 
      FROM cards c
      JOIN cards_to_sets cts ON c.id = cts.card_id
      WHERE cts.card_set_id = $1
      ORDER BY cts.position
    `, [cardSet.id]);
    
    cardSet.cards = cardsResult.rows;
    
    res.json(cardSet);
  } catch (error) {
    console.error('Error getting card set by code:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// create a new card set
const createCardSet = async (req, res) => {
  try {
    const { title, description, created_by } = req.body;
    
    // validate required fields
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }
    
    // generate a unique retrieval code
    const retrieval_code = await generateUniqueCode();
    
    // insert the card set into the database
    const result = await db.query(
      'INSERT INTO card_sets (title, description, created_by, retrieval_code) VALUES ($1, $2, $3, $4) RETURNING *',
      [title, description, created_by, retrieval_code]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating card set:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// update a card set
const updateCardSet = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;
    
    // validate required fields
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }
    
    // check if card set exists
    const checkResult = await db.query('SELECT * FROM card_sets WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Card set not found' });
    }
    
    // update the card set
    const result = await db.query(
      'UPDATE card_sets SET title = $1, description = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [title, description, id]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating card set:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// delete a card set
const deleteCardSet = async (req, res) => {
  try {
    const { id } = req.params;
    
    // check if card set exists
    const checkResult = await db.query('SELECT * FROM card_sets WHERE id = $1', [id]);
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Card set not found' });
    }
    
    // delete the card set (cascade will delete related entries in junction table)
    await db.query('DELETE FROM card_sets WHERE id = $1', [id]);
    
    res.json({ message: 'Card set deleted successfully' });
  } catch (error) {
    console.error('Error deleting card set:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// add a card to a set
const addCardToSet = async (req, res) => {
  try {
    const { set_id, card_id } = req.params;
    const { position, is_core_belief } = req.body;
    
    // Validate inputs
    if (position === undefined) {
      return res.status(400).json({ message: 'Position is required' });
    }
    
    // Check if card and set exist
    const cardResult = await db.query('SELECT * FROM cards WHERE id = $1', [card_id]);
    const setResult = await db.query('SELECT * FROM card_sets WHERE id = $1', [set_id]);
    
    if (cardResult.rows.length === 0) {
      return res.status(404).json({ message: 'Card not found' });
    }
    
    if (setResult.rows.length === 0) {
      return res.status(404).json({ message: 'Card set not found' });
    }
    
    // check if the card is already in the set
    const checkResult = await db.query(
      'SELECT * FROM cards_to_sets WHERE card_id = $1 AND card_set_id = $2',
      [card_id, set_id]
    );
    
    if (checkResult.rows.length > 0) {
      // update the existing relationship
      const result = await db.query(
        'UPDATE cards_to_sets SET position = $1, is_core_belief = $2 WHERE card_id = $3 AND card_set_id = $4 RETURNING *',
        [position, is_core_belief || false, card_id, set_id]
      );
      
      return res.json(result.rows[0]);
    }
    
    // add the card to the set
    const result = await db.query(
      'INSERT INTO cards_to_sets (card_id, card_set_id, position, is_core_belief) VALUES ($1, $2, $3, $4) RETURNING *',
      [card_id, set_id, position, is_core_belief || false]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding card to set:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// remove a card from a set
const removeCardFromSet = async (req, res) => {
  try {
    const { set_id, card_id } = req.params;
    
    // check if the relationship exists
    const checkResult = await db.query(
      'SELECT * FROM cards_to_sets WHERE card_id = $1 AND card_set_id = $2',
      [card_id, set_id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ message: 'Card not found in this set' });
    }
    
    // remove the card from the set
    await db.query(
      'DELETE FROM cards_to_sets WHERE card_id = $1 AND card_set_id = $2',
      [card_id, set_id]
    );
    
    res.json({ message: 'Card removed from set successfully' });
  } catch (error) {
    console.error('Error removing card from set:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// update card positions in a set (for drag and drop)
const updateCardPositions = async (req, res) => {
  try {
    const { set_id } = req.params;
    const { positions } = req.body;
    
    // validate input
    if (!Array.isArray(positions) || positions.length === 0) {
      return res.status(400).json({ message: 'Positions array is required' });
    }
    
    // check if set exists
    const setResult = await db.query('SELECT * FROM card_sets WHERE id = $1', [set_id]);
    if (setResult.rows.length === 0) {
      return res.status(404).json({ message: 'Card set not found' });
    }
    
    // start a transaction for updating multiple positions
    const client = await db.getClient();
    try {
      await client.query('BEGIN');
      
      // update each card's position
      for (const item of positions) {
        await client.query(
          'UPDATE cards_to_sets SET position = $1, is_core_belief = $2 WHERE card_id = $3 AND card_set_id = $4',
          [item.position, item.is_core_belief || false, item.card_id, set_id]
        );
      }
      
      await client.query('COMMIT');
      res.json({ message: 'Card positions updated successfully' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating card positions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllCardSets,
  getCardSetById,
  getCardSetByCode,
  createCardSet,
  updateCardSet,
  deleteCardSet,
  addCardToSet,
  removeCardFromSet,
  updateCardPositions
};
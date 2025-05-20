const db = require('../utils/db');

// add a resource to a card
const addResource = async (req, res) => {
  try {
    const { card_id } = req.params;
    const { title, url, description } = req.body;
    
    // validate required fields
    if (!title || !url) {
      return res.status(400).json({ message: 'Title and URL are required' });
    }
    
    // check if card exists
    const cardResult = await db.query('SELECT * FROM cards WHERE id = $1', [card_id]);
    if (cardResult.rows.length === 0) {
      return res.status(404).json({ message: 'Card not found' });
    }
    
    // insert the resource
    const result = await db.query(
      'INSERT INTO resources (card_id, title, url, description) VALUES ($1, $2, $3, $4) RETURNING *',
      [card_id, title, url, description]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding resource:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// update a resource
const updateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, url, description } = req.body;
    
    // validate required fields
    if (!title || !url) {
      return res.status(400).json({ message: 'Title and URL are required' });
    }
    
    // check if resource exists
    const resourceResult = await db.query('SELECT * FROM resources WHERE id = $1', [id]);
    if (resourceResult.rows.length === 0) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    // update the resource
    const result = await db.query(
      'UPDATE resources SET title = $1, url = $2, description = $3 WHERE id = $4 RETURNING *',
      [title, url, description, id]
    );
    
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating resource:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// delete a resource
const deleteResource = async (req, res) => {
  try {
    const { id } = req.params;
    
    // check if resource exists
    const resourceResult = await db.query('SELECT * FROM resources WHERE id = $1', [id]);
    if (resourceResult.rows.length === 0) {
      return res.status(404).json({ message: 'Resource not found' });
    }
    
    // delete the resource
    await db.query('DELETE FROM resources WHERE id = $1', [id]);
    
    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('Error deleting resource:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  addResource,
  updateResource,
  deleteResource
};
const crypto = require('crypto');
const db = require('./db');

// Function to generate a unique retrieval code
const generateUniqueCode = async (length = 8) => {
  let isUnique = false;
  let code;
  
  while (!isUnique) {
    // Generate a random code using crypto
    code = crypto.randomBytes(Math.ceil(length / 2))
      .toString('hex')
      .slice(0, length);
    
    // Check if the code already exists in the database
    const result = await db.query(
      'SELECT COUNT(*) FROM card_sets WHERE retrieval_code = $1',
      [code]
    );
    
    // If count is 0, the code is unique
    if (parseInt(result.rows[0].count) === 0) {
      isUnique = true;
    }
  }
  
  return code;
};

module.exports = { generateUniqueCode };
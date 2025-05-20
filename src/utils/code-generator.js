const { nanoid } = require('nanoid');
const db = require('./db');

// function to generate a unique retrieval code
const generateUniqueCode = async (length = 8) => {
  let isUnique = false;
  let code;
  
  while (!isUnique) {
    // generate a code using nanoid
    code = nanoid(length);
    
    // check if the code already exists in the database
    const result = await db.query(
      'SELECT COUNT(*) FROM card_sets WHERE retrieval_code = $1',
      [code]
    );
    
    // if count is 0, the code is unique
    if (parseInt(result.rows[0].count) === 0) {
      isUnique = true;
    }
  }
  
  return code;
};

module.exports = { generateUniqueCode };
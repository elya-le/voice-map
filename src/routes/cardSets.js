const express = require('express');
const {
  getAllCardSets,
  getCardSetById,
  getCardSetByCode,
  createCardSet,
  updateCardSet,
  deleteCardSet,
  addCardToSet,
  removeCardFromSet,
  updateCardPositions
} = require('../controllers/cardSets');

const router = express.Router();

// public routes
router.get('/', getAllCardSets);
router.get('/:id', getCardSetById);
router.get('/code/:code', getCardSetByCode);

// Ccrd set management
router.post('/', createCardSet);
router.put('/:id', updateCardSet);
router.delete('/:id', deleteCardSet);

// card to set relationships
router.post('/:set_id/cards/:card_id', addCardToSet);
router.delete('/:set_id/cards/:card_id', removeCardFromSet);
router.put('/:set_id/card-positions', updateCardPositions);

module.exports = router;
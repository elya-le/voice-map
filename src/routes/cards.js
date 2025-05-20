const express = require('express');
const { getAllCards, getCardById, createCard, updateCard, deleteCard } = require('../controllers/cards');
const auth = require('../middleware/auth');

const router = express.Router();

// public routes (no authentication required)
router.get('/', getAllCards);
router.get('/:id', getCardById);

// protected routes (authentication required)
// note: We're not enforcing auth yet, but the middleware is in place for later
router.post('/', createCard);
router.put('/:id', updateCard);
router.delete('/:id', deleteCard);

module.exports = router;
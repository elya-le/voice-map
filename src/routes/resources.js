const express = require('express');
const { addResource, updateResource, deleteResource } = require('../controllers/resources');

const router = express.Router();

// resource routes (all attached to cards)
router.post('/card/:card_id/resources', addResource);
router.put('/resources/:id', updateResource);
router.delete('/resources/:id', deleteResource);

module.exports = router;
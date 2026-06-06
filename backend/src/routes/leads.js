const express = require('express');
const router = express.Router();
const {
  createLead,
  getLeads,
  getLead,
  updateLead,
  deleteLead,
  getStats,
} = require('../controllers/leadController');

// Statistics — must be before /:id to avoid conflict
router.get('/stats', getStats);

router.route('/').get(getLeads).post(createLead);

router.route('/:id').get(getLead).put(updateLead).delete(deleteLead);

module.exports = router;

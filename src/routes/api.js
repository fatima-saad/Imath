const express = require('express');
const router = express.Router();
const {
  generateQuestions,
  generateSimilarQuestions
} = require('../controllers/questionController');

router.post('/generate', generateQuestions);
router.post('/generate-similar', generateSimilarQuestions);

module.exports = router;

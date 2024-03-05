const express = require('express');

const router = express.Router();

//Review Feedback
router.get('/', (req, res) => {
    res.send('Retrieve all feedback');
});

//could create path with param for filter and sort?

module.exports = router;
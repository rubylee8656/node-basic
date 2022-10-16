const express = require('express');
const router = express.Router();

console.log('admin2:', express.miee);

router.use((req, res, next) => {
    res.locals.my = 789;
    next();
})

router.get('/:action?/:id?', (req, res) => {
    const { params, url, baseUrl, originalUrl } = req;
    res.json({ params, url, baseUrl, originalUrl, my: res.locals.my });
})

module.exports = router;
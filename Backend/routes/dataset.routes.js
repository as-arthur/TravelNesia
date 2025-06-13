const express = require('express');
const router = express.Router();
const fs = require('fs');
const csv = require('csv-parser');

router.get('/dataset', (req, res) => {
    const results = [];
    fs.createReadStream('dataset_tempat_final.csv')
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
            res.json(results);
        })
        .on('error', (err) => {
            res.status(500).json({ error: 'Failed to read dataset' });
        });
});

module.exports = router;

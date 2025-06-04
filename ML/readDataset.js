const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');

const results = [];

fs.createReadStream(path.resolve(__dirname, './dataset_tempat_final.csv'))
  .pipe(csv())
  .on('data', (data) => results.push(data))
  .on('end', () => {
    console.log('CSV data as JSON:', results);

  })
  .on('error', (error) => {
    console.error('Error reading CSV:', error);
  });

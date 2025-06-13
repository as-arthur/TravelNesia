const mongoose = require('mongoose');
const dotenv = require('dotenv');
const datasetRoutes = require('./routes/dataset.routes');

dotenv.config();

const app = require('./app');

const PORT = process.env.PORT || 4000;

app.use(cors());
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
app.use('/api', datasetRoutes);

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/wisata-indonesia')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`);
  server.close(() => process.exit(1));
});

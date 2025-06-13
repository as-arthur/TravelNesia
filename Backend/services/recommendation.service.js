const path = require('path');
const fs = require('fs').promises;
const logger = require('../utils/logger');
const natural = require('natural');
const knn = require('ml-knn');
const { TfIdf } = natural;

class RecommendationService {
  constructor() {
    this.model = null;            
    this.places = null;           
    this.userPreferences = {};    
    this.initialized = false;
    this.modelPath = path.join(__dirname, '../model_ml/recommendation_model.json');
    this.placesDataPath = path.join(__dirname, '../model_ml/places_data.json');
  }

  async initialize() {
    try {
      await this.loadModel();
      await this.loadPlacesData();
      this.initialized = true;
      logger.info('Recommendation service initialized successfully');
      return true;
    } catch (error) {
      logger.error(`Error initializing recommendation service: ${error.message}`);
      return false;
    }
  }

  async loadModel() {
    try {
      const modelData = await fs.readFile(this.modelPath, 'utf8');
      this.model = JSON.parse(modelData); // Atau jika menggunakan ml-knn, deserialize model
      logger.info('Recommendation model loaded successfully');
    } catch (error) {
      logger.error(`Error loading recommendation model: ${error.message}`);
      throw new Error('Failed to load recommendation model');
    }
  }

  async loadPlacesData() {
    try {
      const placesData = await fs.readFile(this.placesDataPath, 'utf8');
      this.places = JSON.parse(placesData);
      logger.info(`Loaded ${this.places.length} places data`);
    } catch (error) {
      logger.error(`Error loading places data: ${error.message}`);
      throw new Error('Failed to load places data');
    }
  }

  processTextToVector(text) {
    const tfidf = new TfIdf();
    tfidf.addDocument(text);

    const features = [];
    const terms = Object.keys(tfidf.documents[0]);

    for (let term of terms) {
      if (term === '__key') continue;
      features.push(tfidf.tfidf(term, 0));
    }

    return features;
  }

  calculateSimilarity(userVector, placeVector) {
    if (userVector.length !== placeVector.length) return 0;

    let dotProduct = 0, userMagnitude = 0, placeMagnitude = 0;

    for (let i = 0; i < userVector.length; i++) {
      dotProduct += userVector[i] * placeVector[i];
      userMagnitude += userVector[i] ** 2;
      placeMagnitude += placeVector[i] ** 2;
    }

    userMagnitude = Math.sqrt(userMagnitude);
    placeMagnitude = Math.sqrt(placeMagnitude);

    if (userMagnitude === 0 || placeMagnitude === 0) return 0;

    return dotProduct / (userMagnitude * placeMagnitude);
  }

  updateUserPreferences(userId, placeId, action) {
    // Misal action = 'view' atau 'like', bisa dipakai untuk memberi bobot
    if (!this.userPreferences[userId]) {
      this.userPreferences[userId] = new Array(this.places.length).fill(0);
    }

    // Cari index tempat wisata
    const placeIndex = this.places.findIndex(place => place.id === placeId);
    if (placeIndex === -1) return;

    // Contoh sederhana: tambah bobot sesuai aksi
    let weight = 0;
    if (action === 'view') weight = 1;
    else if (action === 'like') weight = 3;

    this.userPreferences[userId][placeIndex] += weight;
  }

  recommendPlaces(userId, topN = 5) {
    if (!this.initialized) {
      throw new Error('Recommendation service not initialized');
    }

    const userPrefVector = this.userPreferences[userId];
    if (!userPrefVector) {
      // Jika belum ada preferensi user, return tempat populer (top rating)
      return this.places
        .filter(place => place.isActive)
        .sort((a, b) => b.averageRating - a.averageRating)
        .slice(0, topN);
    }

    // Hitung similarity user preference dengan deskripsi tempat
    // Misal kita convert deskripsi tempat ke TF-IDF vector dulu
    const scoredPlaces = this.places
      .filter(place => place.isActive)
      .map(place => {
        const placeVector = this.processTextToVector(place.description || '');
        const similarity = this.calculateSimilarity(userPrefVector, placeVector);
        return { place, similarity };
      });

    // Urutkan berdasarkan similarity
    scoredPlaces.sort((a, b) => b.similarity - a.similarity);

    // Ambil top N
    return scoredPlaces.slice(0, topN).map(item => item.place);
  }
}

module.exports = new RecommendationService();

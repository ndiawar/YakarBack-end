import mongoose from 'mongoose';

const DonneesSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  heure: {
    type: String, // Format attendu : "HH:mm"
    required: true,
  },
  temperature: {
    type: Number,
    required: true,
  },
  humidite: {
    type: Number,
    required: true,
  },
  ventiloActive: {
    type: Boolean,
    default: false, // Valeur par défaut
  },
  buzzer: {
    type: Boolean,
    default: false, // Valeur par défaut
  },
  signal: {
    type: Boolean,
    default: false, // Valeur par défaut
  },
  moyTemp: {
    type: Number,
    required: false,
  },
  moyhum: {
    type: Number,
    required: false,
  },
});

const Donnees = mongoose.model('Donnees', DonneesSchema);

export default Donnees;

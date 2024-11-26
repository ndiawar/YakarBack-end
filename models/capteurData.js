import mongoose from 'mongoose';

const capteurDataSchema = new mongoose.Schema({
  date: { type: String, required: true },
  heure: { type: String, required: true },
  temperature: { type: Number, required: true },
  humidite: { type: Number, required: true },
  ventilloActive: { type: Boolean, default: false },
  buzzer: { type: Boolean, default: false },
  signale: { type: String, default: 'vert' },
});


const CapteurData = mongoose.model('CapteurData', capteurDataSchema);

export default CapteurData;
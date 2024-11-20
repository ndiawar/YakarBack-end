import mongoose from 'mongoose';

const HistoriqueSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  heure: {
    type: String, // Format attendu : "HH:mm"
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  id_users: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
});

const Historique = mongoose.model('Historique', HistoriqueSchema);

export default Historique;

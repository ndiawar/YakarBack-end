const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const uri = 'mongodb://ndiawar:yaneFaye;79Pi@127.0.0.1:27017/<votre_nom_de_base>?authSource=admin';
    await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connexion réussie à MongoDB');
  } catch (error) {
    console.error('Erreur de connexion à MongoDB', error);
    process.exit(1); // Arrête le processus si la connexion échoue
  }
};

module.exports = connectDB;

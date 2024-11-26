import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';

const path = '/dev/ttyUSB0'; // Le chemin du port série

const port = new SerialPort({
  path: '/dev/ttyUSB0',
  baudRate: 9600,
  autoOpen: false
});


// Ouvrir le port série
port.open((err) => {
    if (err) {
      console.error('Erreur de connexion au port série:', err);
    } else {
      console.log('Connexion au port série réussie');
    }
  });
  
  // Initialiser le parser pour lire les données ligne par ligne
  const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));
  
  / Gestion des données reçues via le port série
  parser.on('data', (data) => {
    const secretCode = data.trim();
    console.log(Données reçues depuis Arduino : ${secretCode});
  
    // Séparer chaque chiffre du code secret et les émettre un par un
    for (let digit of secretCode) {
      io.emit('codeReceived', digit); // Émettre chaque chiffre au client
    }
  });
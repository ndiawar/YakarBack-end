//imports
var express = require('express');

//Instensier notre server
var server = express();

//Définition du port d'écoute
var port = process.env.PORT || 8080;

//Définition de la route '/'
server.get('/', function (req, res) {
//   res.send('Hello, World!');
    res.setHeader('content-Type', 'text/HTML');
    res.status(200).send('<h1>Bonjour sur mon service</h1>');
});

//Lancement du serveur sur le port définit
server.listen(port, function () {
  console.log('Server is running on port ' + port);
});
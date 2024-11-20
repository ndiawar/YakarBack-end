const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Route pour créer un utilisateur
router.post('/users', userController.createUser);

// Route pour obtenir tous les utilisateurs
router.get('/users', userController.getUsers);

// Route pour obtenir un utilisateur par ID
router.get('/users/:id', userController.getUserById);

// Route pour mettre à jour un utilisateur
router.put('/users/:id', userController.updateUser);

// Route pour supprimer un utilisateur
router.delete('/users/:id', userController.deleteUser);

module.exports = router;
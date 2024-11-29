import express from 'express';
import { logoutUser, checkEmailExistence, loginWithEmail, loginWithSecretCode , changePassword} from '../controllers/authController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { roleMiddleware } from '../middleware/roleMiddleware.js';
import User from '../models/user.js';
import multer from 'multer';
import bcrypt from 'bcryptjs';
import path from 'path';
const router = express.Router();

// *** Routes Authentification ***

/**
 * @swagger
 * tags:
 *   - name: "authentification"
 *     description: "Opérations liées à l'authentification des utilisateurs"
 */

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Connexion d'un utilisateur
 *     description: Permet à un utilisateur de se connecter avec un nom d'utilisateur et un mot de passe ou un code secret.
 *     tags:
 *       - "authentification"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: L'email de l'utilisateur pour se connecter (obligatoire si le mot de passe est utilisé)
 *                 example: "johndoe@example.com"
 *               password:
 *                 type: string
 *                 description: Le mot de passe de l'utilisateur (obligatoire si l'email est fourni)
 *                 example: "Password123"
 *               secretCode:
 *                 type: string
 *                 description: Le code secret pour se connecter (utilisé à la place de l'email et du mot de passe)
 *                 example: "1234"
 *     responses:
 *       200:
 *         description: Connexion réussie. Retourne le token d'authentification et les informations de l'utilisateur.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Connexion réussie."
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: "60f74f8f87b5c234b4e1bcdf"
 *                     name:
 *                       type: string
 *                       example: "John Doe"
 *                     email:
 *                       type: string
 *                       example: "johndoe@example.com"
 *                     telephone:
 *                       type: string
 *                       example: "+1234567890"
 *                     adresse:
 *                       type: string
 *                       example: "123 rue Exemple, Paris"
 *                     photo:
 *                       type: string
 *                       example: "http://example.com/photo.jpg"
 *                     role:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["user"]
 *                     status:
 *                       type: string
 *                       example: "active"
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: "2024-11-20T12:34:56Z"
 *       400:
 *         description: Mauvaise demande, email/mot de passe ou code secret manquants ou invalides.
 *       401:
 *         description: Identifiants invalides.
 *       404:
 *         description: Utilisateur non trouvé.
 *       500:
 *         description: Une erreur serveur s'est produite.
 */
router.post('/login-email', loginWithEmail);
router.post('/change-password', changePassword);
router.post('/login-secret', loginWithSecretCode);

// router.post('/login-secret', async (req, res) => {
//     const { secretCode } = req.body;

//     if (!secretCode || isNaN(secretCode) || secretCode.toString().length !== 4) {
//         return res.status(400).json({ message: 'Code secret invalide. Il doit être un nombre de 4 chiffres.' });
//     }

//     try {
//         const user = await User.findOne({ codeSecret: secretCode });

//         if (!user) {
//             return res.status(400).json({ message: 'Code secret incorrect.' });
//         }

//         if (user.archivé) {
//             return res.status(403).json({ message: 'Votre compte est archivé. Vous ne pouvez pas vous connecter.' });
//         }

//         const token = jwt.sign({ userId: user._id, role: user.role }, SECRET_KEY, { expiresIn: '1h' });

//         res.status(200).json({
//             message: 'Connexion réussie.',
//             user: {
//                 name: user.name,
//                 email: user.email,
//                 role: user.role,
//                 photo: user.photo,
//                 telephone: user.telephone,
//             },
//             token: token,
//         });
//     } catch (error) {
//         console.error('Erreur serveur:', error);
//         res.status(500).json({ message: 'Erreur serveur.' });
//     }
// });

// Route pour vérifier l'existence de l'email
router.post('/check-email', checkEmailExistence);

/**
 * @swagger
 * /logout:
 *   post:
 *     summary: Déconnexion d'un utilisateur
 *     description: Permet à un utilisateur de se déconnecter de son compte en effaçant le cookie d'authentification.
 *     tags:
 *       - "authentification"
 *     responses:
 *       200:
 *         description: Déconnexion réussie.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Déconnexion réussie."
 *       401:
 *         description: Utilisateur non authentifié.
 *       500:
 *         description: Une erreur serveur s'est produite.
 */
router.post('/logout',  logoutUser);

router.post('/change-password', async (req, res) => {
    const { userId, currentPassword, newPassword } = req.body;
  
    if (!userId || !currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Tous les champs sont requis.' });
    }
  
    try {
      const user = await User.findById(userId).select('authentication.password');
      
  
      const isMatch = await bcrypt.compare(currentPassword, user.authentication.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Mot de passe actuel incorrect' });
      }
  
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.authentication.password = hashedPassword;
      await user.save();
  
      res.status(200).json({ message: 'Mot de passe mis à jour avec succès.' });
    } catch (error) {
      res.status(500).json({ message: 'Erreur interne du serveur.', error });
    }
  });

  // Configuration de stockage pour multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });
  
  const upload = multer({ storage });
  
  // Route pour mettre à jour la photo de profil
  router.post('/update-photo', upload.single('photo'), async (req, res) => {
    const { userId } = req.body;
  
    console.log('Requête reçue avec :', { userId, file: req.file });
  
    // Vérifier si le fichier est bien reçu
    if (!req.file) {
      return res.status(400).json({ message: 'Aucun fichier envoyé.' });
    }
  
    const filePath = req.file.path;
  
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'Utilisateur introuvable' });
      }
  
      // Mettre à jour la photo
      user.photo = filePath;
      await user.save();
  
      console.log('Photo mise à jour avec succès pour l\'utilisateur', userId);
  
      res.status(200).json({ message: 'Photo mise à jour avec succès', photo: filePath });
    } catch (error) {
      console.error('Erreur serveur lors de la mise à jour de la photo :', error);
      res.status(500).json({ message: 'Erreur interne du serveur', error: error.message });
    }
  });
  

export default router;

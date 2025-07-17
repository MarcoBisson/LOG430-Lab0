import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authenticateJWT } from '../middlewares/authentificateJWT';
import { authorize } from '../middlewares/authorize';

const router = Router();

/**
 * @openapi
 * /api/users/profile:
 *   get:
 *     summary: Récupérer le profil de l'utilisateur connecté
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profil utilisateur récupéré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       401:
 *         description: Token non fourni ou invalide
 */
router.get('/profile', authenticateJWT, UserController.getProfile);

/**
 * @openapi
 * /api/users/profile/access:
 *   get:
 *     summary: Récupérer les accès magasin de l'utilisateur connecté
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Accès utilisateur récupérés avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   type:
 *                     type: string
 *                   address:
 *                     type: string
 *       401:
 *         description: Token non fourni ou invalide
 */
router.get('/profile/access', authenticateJWT, UserController.getUserAccess);

/**
 * @openapi
 * /api/users:
 *   get:
 *     summary: Lister tous les utilisateurs (Admin seulement)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       403:
 *         description: Accès interdit
 */
router.get('/', authenticateJWT, authorize(['ADMIN']), UserController.getAllUsers);

/**
 * @openapi
 * /api/users:
 *   post:
 *     summary: Créer un nouvel utilisateur (Admin seulement)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - role
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [ADMIN, MANAGER, EMPLOYEE]
 *               storeId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Utilisateur créé avec succès
 *       400:
 *         description: Données invalides
 *       403:
 *         description: Accès interdit
 */
router.post('/', UserController.createUser);

/**
 * @openapi
 * /api/users/{id}:
 *   put:
 *     summary: Mettre à jour un utilisateur
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour avec succès
 *       403:
 *         description: Accès interdit
 *       404:
 *         description: Utilisateur non trouvé
 */
router.put('/:id', authenticateJWT, authorize(['ADMIN', 'MANAGER']), UserController.updateUser);

/**
 * @openapi
 * /api/users/{id}:
 *   delete:
 *     summary: Supprimer un utilisateur (Admin seulement)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Utilisateur supprimé avec succès
 *       403:
 *         description: Accès interdit
 *       404:
 *         description: Utilisateur non trouvé
 */
router.delete('/:id', authenticateJWT, authorize(['ADMIN']), UserController.deleteUser);

/**
 * @openapi
 * /api/users/{id}/stores:
 *   post:
 *     summary: Ajouter un accès magasin à un staff
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - storeId
 *             properties:
 *               storeId:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Accès ajouté avec succès
 *       400:
 *         description: Données invalides
 *       403:
 *         description: Accès interdit
 */
router.post('/:id/stores', authenticateJWT, authorize(['ADMIN', 'MANAGER']), UserController.addStoreAccess);

/**
 * @openapi
 * /api/users/{id}/stores/{storeId}:
 *   delete:
 *     summary: Supprimer un accès magasin d'un staff
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: storeId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Accès supprimé avec succès
 *       400:
 *         description: Données invalides
 *       403:
 *         description: Accès interdit
 */
router.delete('/:id/stores/:storeId', authenticateJWT, authorize(['ADMIN', 'MANAGER']), UserController.removeStoreAccess);

/**
 * @openapi
 * /api/users/{id}/stores:
 *   put:
 *     summary: Définir les accès magasins d'un staff
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - storeIds
 *             properties:
 *               storeIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *     responses:
 *       200:
 *         description: Accès définis avec succès
 *       400:
 *         description: Données invalides
 *       403:
 *         description: Accès interdit
 */
router.put('/:id/stores', authenticateJWT, authorize(['ADMIN', 'MANAGER']), UserController.setStoreAccess);

export { router as userRoutes };

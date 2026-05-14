import express from 'express';
import {
  getUserProfile,
  updateProfile,
  getAllUsers,
  deleteUser,
} from '../controllers/userController.js';
import verifyToken from '../middleware/verifyToken.js';
import isAdmin from '../middleware/isAdmin.js';

const router = express.Router();

// Protected
router.put('/profile', verifyToken, updateProfile);

// Admin only — dono middleware lagte hain
router.get('/', verifyToken, isAdmin, getAllUsers);
router.delete('/:id', verifyToken, isAdmin, deleteUser);

// Public (last mein rakho — :username generic hai)
router.get('/:username', getUserProfile);

export default router;
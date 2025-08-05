import { Router } from "express";
import multer from "multer";
import * as authController from '../controllers/auth.controller';
import { checkAuth } from "../middleware/auth.middleware";

const router = Router();
const upload = multer({dest: 'uploads/'});

router.post('/register', upload.single('profilePicture'), authController.register);
router.post('/login', authController.login);
router.post('/admin/login', authController.adminLogin);
router.post('/change-password', checkAuth, authController.changePassword);

export default router;

// auth
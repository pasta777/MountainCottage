import { Router } from "express";
import * as userController from '../controllers/user.controller';
import { checkAuth } from "../middleware/auth.middleware";
import multer from "multer";

const router = Router();

const upload = multer({dest: 'uploads/'})

router.get('/profile', checkAuth, userController.getUser);
router.put('/profile', checkAuth, upload.single('profilePicture'), userController.updateUser);

export default router;

// users
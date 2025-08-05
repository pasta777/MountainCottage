import { Router } from "express";
import * as userController from '../controllers/user.controller';
import { checkAuth } from "../middleware/auth.middleware";

const router = Router();

router.get('/profile', checkAuth, userController.getUser);
router.put('/profile', checkAuth, userController.updateUser);

export default router;

// users
import { Router } from "express";
import * as statsController from '../controllers/stats.controller';
import { checkAuth } from "../middleware/auth.middleware";

const router = Router();

router.get('/general', statsController.getGeneralStats);
router.get('/owner', checkAuth, statsController.getOwnerStats);

export default router;

// stats
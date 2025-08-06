import { Router } from "express";
import * as adminController from '../controllers/admin.controller';
import { checkAuth } from "../middleware/auth.middleware";

const router = Router();

router.get('/users', checkAuth, adminController.getUsers);
router.get('/users/:id', checkAuth, adminController.getUserById);
router.get('/registration-requests', checkAuth, adminController.getRegistrationRequests);
router.get('/cottages', checkAuth, adminController.getCottages);
router.put('/users/:id', checkAuth, adminController.updateUser);
router.post('/users', checkAuth, adminController.createUser);
router.post('/users/:id/toggle-status', checkAuth, adminController.toggleStatus);
router.post('/approve-request/:userId', checkAuth, adminController.approveRequest);
router.post('/reject-request/:userId', checkAuth, adminController.rejectRequest);
router.post('/cottages/:id/block', checkAuth, adminController.blockCottage);
router.delete('/users/:id', checkAuth, adminController.deleteUser);

export default router;

// admin
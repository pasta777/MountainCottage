import { Router } from "express";
import { checkAuth } from "../middleware/auth.middleware";
import * as reservationController from '../controllers/reservation.controller';

const router = Router();

router.get('/my', checkAuth, reservationController.getMyReservations);
router.get('/owner', checkAuth, reservationController.getOwnerReservations);
router.post('/', checkAuth, reservationController.createReservation);
router.post('/:id/approve', checkAuth, reservationController.approveReservation);
router.post('/:id/deny', checkAuth, reservationController.denyReservation);
router.post('/:id/cancel', checkAuth, reservationController.cancelReservation);

export default router;

// resevations
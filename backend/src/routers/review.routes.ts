import { Router } from "express";
import * as reviewController from '../controllers/review.controller';
import { checkAuth } from "../middleware/auth.middleware";

const router = Router();

router.get('/cottage/:cottageId', reviewController.getReviewsForCottage);
router.post('/', checkAuth, reviewController.createReview);

export default router;

// reviews

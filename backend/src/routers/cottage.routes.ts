import { Router } from "express";
import * as cottageController from '../controllers/cottage.controller';
import { checkAuth } from "../middleware/auth.middleware";
import multer from "multer";

const router = Router();

const cottageUpload = multer({dest: 'uploads/cottages/'});

router.get('/', cottageController.getCottages);
router.get('/my-cottages', checkAuth, cottageController.getMyCottages);
router.get('/:id', cottageController.getCottageDetails);
router.put('/:id', checkAuth, cottageUpload.array('pictures', 10), cottageController.updateCottage);
router.post('/', checkAuth, cottageUpload.array('pictures', 10), cottageController.createCottage);
router.delete('/:id', checkAuth, cottageController.deleteCottage);
router.delete('/:id/pictures', checkAuth, cottageController.deletePicture);

export default router;

// cottages
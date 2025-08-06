import { Request, Response } from "express";
import Cottage from '../models/cottage.model';
import fs from 'fs';
import path from 'path';

export const getCottages = async (req: Request, res: Response) => {
    try {
        const { name, location, sortBy, sortOrder } = req.query;

        const filter: any = {};
        if(name) {
            filter.name = {$regex: name, $options: 'i'};
        }
        if(location) {
            filter.location = {$regex: location, $options: 'i'};
        }

        const sort: any = {};
        if(sortBy && (sortBy === 'name' || sortBy === 'location')) {
            sort[sortBy as string] = sortOrder === 'desc' ? -1 : 1;
        } else {
            sort['name'] = 1;
        }

        const cottages = await Cottage.find(filter).sort(sort);
        res.json(cottages);
    } catch(error) {
        res.status(500).json({message: "Gathering cottages error."});
    }
};

export const getCottageDetails = async (req: Request, res: Response) => {
    try {
        const cottage = await Cottage.findById(req.params.id);
        if(!cottage) {
            return res.status(404).json({message: "Cottage not found."});
        }
        res.status(200).json(cottage);
    } catch(error) {
        res.status(500).json({message: "Server error."});
    }
};

export const getMyCottages = async (req: any, res: Response) => {
    try {
        if(req.userData.userType !== 'owner') {
            return res.status(403).json({message: "Only owners can access this page."});
        }
        const cottages = await Cottage.find({ownerId: req.userData.id});
        res.status(200).json(cottages);
    } catch(error) {
        res.status(500).json({message: "Server error."});
    }
}

export const updateCottage = async (req: any, res: Response) => {
    try {
        const cottage = await Cottage.findById(req.params.id);
        if(!cottage) {
            return res.status(404).json({message: "Cottage not found."});
        }

        if(cottage.ownerId.toString() !== req.userData.id) {
            return res.status(403).json({message: "Permission denied."});
        }

        const data = req.body;
        const picturesFiles = req.files as Express.Multer.File[];

        if(picturesFiles && picturesFiles.length > 0) {
            const newPicturesPaths = picturesFiles.map(file => file.path);
            data.pictures = [...cottage.pictures, ...newPicturesPaths];
        }

        const updatedCottage = await Cottage.findByIdAndUpdate(req.params.id, data, {new: true});
        res.status(200).json(updatedCottage);
    } catch(error) {
        res.status(500).json({message: "Server error."});
    }
};

export const createCottage = async (req: any, res: Response) => {
    try {
        const data = req.body;
        const picturesFiles = req.files as Express.Multer.File[];

        const picturesPaths = picturesFiles.map(file => file.path);

        const newCottage = new Cottage({
            ...data,
            pictures: picturesPaths,
            ownerId: req.userData.id
        });

        await newCottage.save();
        res.status(201).json(newCottage);
    } catch(error) {
        res.status(500).json({message: "Server error."});
    }
};

export const deleteCottage = async (req: any, res: Response) => {
    try {
        const cottage = await Cottage.findOne({_id: req.params.id, ownerId: req.userData.id});
        if(!cottage) {
            return res.status(404).json({message: "Cottage not found or you are not its owner"});
        }

        const picturesForDeleting = cottage.pictures;

        await cottage.deleteOne();

        if(picturesForDeleting && picturesForDeleting.length > 0) {
            picturesForDeleting.forEach(relativePath => {
                const fullPath = path.join(__dirname, '..', relativePath);
                fs.unlink(fullPath, (err) => {
                    if(err) {
                        console.error(`Error while deleting file ${fullPath}`, err);
                    }
                });
            });
        }

        res.status(200).json({message: "Cottage has been successfully removed."});
    } catch(error) {
        res.status(500).json({message: "Server error."});
    }
};

export const deletePicture = async (req: any, res: Response) => {
    try {
        const { id } = req.params;
        const { picturePath } = req.body;

        const cottage = await Cottage.findById(id);
        if(!cottage) {
            return res.status(404).json({message: "Cottage not found."});
        }
        if(cottage.ownerId.toString() !== req.userData.id) {
            return res.status(403).json({message: "Permission denied."});
        }

        cottage.pictures = cottage.pictures.filter(p => p !== picturePath);
        await cottage.save();

        const fullPath = path.join(__dirname, '..', '..', picturePath);
        fs.unlink(fullPath, (err) => {
            if(err) {
                console.error(`Error while deleting file ${fullPath}: `, err);
            }
        });

        res.status(200).json({message: "Picture deleted successfully.", pictures: cottage.pictures});
    } catch(error) {
        res.status(500).json({message: "Server error."});
    }
};
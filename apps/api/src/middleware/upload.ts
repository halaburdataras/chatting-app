// Multer configuration for file uploads
import multer from "multer";
import type { Request } from "express";

// Configure multer to use memory storage (files stored in RAM, not disk)
// This is better for cloud uploads since we'll upload directly to Cloudinary
const storage = multer.memoryStorage();

// File filter to only accept images
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback,
) => {
  const allowedMimes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed.",
      ),
    );
  }
};

// Configure multer
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
    files: 5, // Max 5 files
  },
});

// Middleware for multiple image uploads
export const uploadImages = upload.array("attachments", 5);

// Middleware for single image upload (avatar)
export const uploadAvatar = upload.single("avatar");

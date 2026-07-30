import multer from "multer";

// Files are buffered in memory, then handed to storeFile() which decides where
// they land (Supabase Storage in prod, ./uploads locally). See lib/storage.ts.
export const uploadMiddleware = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB limit
});

import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import { AppError } from "../errors/app_error";

const BUCKET = process.env.SUPABASE_BUCKET || "uploads";
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const supabase =
    SUPABASE_URL && SUPABASE_SERVICE_KEY ? createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY) : null;

const uploadDir = path.join(process.cwd(), "uploads");

/**
 * Persist one uploaded file and return the public path to store in the DB.
 * Supabase Storage in production (Render's disk is ephemeral — local files are
 * wiped on every deploy); plain ./uploads locally when Supabase isn't configured.
 */
export async function storeFile(file: Express.Multer.File): Promise<string> {
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;

    if (!supabase) {
        fs.mkdirSync(uploadDir, { recursive: true });
        fs.writeFileSync(path.join(uploadDir, name), file.buffer);
        return `/uploads/${name}`;
    }

    const { error } = await supabase.storage
        .from(BUCKET)
        .upload(name, file.buffer, { contentType: file.mimetype });
    if (error) throw new AppError(`فشل رفع الصورة: ${error.message}`, 500);

    return supabase.storage.from(BUCKET).getPublicUrl(name).data.publicUrl;
}

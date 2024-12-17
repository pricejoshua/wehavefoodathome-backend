import express from "express";
import multer from "multer";
import supabase from "../utils/supabase";
import { randomUUID } from "crypto";
import exp from "constants";
const router = express.Router();
const upload = multer();
const app = express();

// curl -X POST -F "image=@/path/to/file" localhost:5000/upload
router.post("/", upload.single("image"), async (req: express.Request, res:express.Response) => {
    console.log(req.file);
    if (!req.file) {
        return res.status(400).send("No file uploaded.");
    }
    const { buffer, originalname } = req.file;
    const fileName = Date.now() + "-" + randomUUID();

    const filePath = `receipts/${fileName}`;
    const { data, error } = await supabase.storage
        .from("receipts")
        .upload(filePath, buffer, {
            contentType: req.file.mimetype,
        });
    if (error) return res.status(500).send(error.message);

    res.json({ path: data.path });
});

export default router;
import express from "express";
import multer from "multer";
import supabase from "../utils/supabase";
const router = express.Router();
const upload = multer({ dest: "uploads/" });
const app = express();

app.post('/profile', upload.single('avatar'), function (req, res, next) {
    // req.file is the `avatar` file
    // req.body will hold the text fields, if there were any
  })


  
router.post("/upload", upload.single("image"), async (req: express.Request, res:express.Response) => {
    const { buffer, originalname } = req.file;

    const filePath = `avatars/${originalname}`;
    const { data, error } = await supabase.storage
        .from("avatars")
        .upload(filePath, buffer, {
            contentType: req.file.mimetype,
            upsert: true,
        });
    if (error) return res.status(500).send(error.message);

    res.json({ path: data.path });
});



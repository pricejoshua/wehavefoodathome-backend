import express from 'express';
import multer from 'multer';
import supabase from '../utils/supabase';
import { randomUUID } from 'crypto';
import { check_token } from '../middleware/auth';

const router = express.Router();
const upload = multer();

// Apply authentication to upload
router.use(check_token);

// Allowed MIME types for receipt images
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'application/pdf',
];

// Maximum file size: 10MB
const MAX_FILE_SIZE = 10 * 1024 * 1024;

// curl -X POST -F "image=@/path/to/file" localhost:5000/upload -H "Authorization: Bearer YOUR_TOKEN"
router.post('/', upload.single('image'), async (req: express.Request, res:express.Response) => {
  console.log(req.file);
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  // Validate MIME type
  if (!ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
    return res.status(400).json({
      error: 'Invalid file type. Only JPEG, PNG, WebP, and PDF files are allowed',
    });
  }

  // Validate file size
  if (req.file.size > MAX_FILE_SIZE) {
    return res.status(400).json({
      error: `File size exceeds maximum limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`,
    });
  }

  const { buffer } = req.file;
  const fileName = Date.now() + '-' + randomUUID();

  const filePath = `receipts/${fileName}`;
  const { data, error } = await supabase.storage
    .from('receipts')
    .upload(filePath, buffer, {
      contentType: req.file.mimetype,
    });
  if (error) return res.status(500).json({ error: error.message });

  res.json({ path: data.path });
});

export default router;
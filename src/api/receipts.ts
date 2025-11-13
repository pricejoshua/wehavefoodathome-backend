import express from 'express';
import getReceiptData from '../external/receipt';
import { check_token } from '../middleware/auth';

const router = express.Router();

type ReceiptResponse = any;

const test_url = 'https://miro.medium.com/v2/resize:fit:640/format:webp/1*MLRlL9W69PMWAcTF-rV36Q.jpeg';

// Apply authentication to receipts
router.use(check_token);

router.get<{}, ReceiptResponse>('/', (req, res) => {
  getReceiptData(test_url).then((response) => {
    res.json(response);
  });
});

export default router;

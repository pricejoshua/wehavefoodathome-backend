import express from 'express';
import getReceiptData from '../external/receipt'

const router = express.Router();

type RecieptResponse = any;

const test_url = "https://miro.medium.com/v2/resize:fit:640/format:webp/1*MLRlL9W69PMWAcTF-rV36Q.jpeg"

router.get<{}, RecieptResponse>('/', (req, res) => {
    const repsonse = getReceiptData(test_url);
    console.log(repsonse);
    res.json(repsonse);
});

export default router;

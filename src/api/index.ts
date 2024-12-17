import express from 'express';

import MessageResponse from '../interfaces/MessageResponse';
import emojis from './emojis';
import receipts from './receipts';
import upload from './upload-reciept';

const router = express.Router();

router.get<{}, MessageResponse>('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏',
  });
});

router.use('/emojis', emojis);
router.use('/upload', upload);
router.use('/receipts', receipts);

export default router;

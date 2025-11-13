import express from 'express';

import MessageResponse from '../interfaces/MessageResponse';
import emojis from './emojis';
import receipts from './receipts';
import upload from './upload-receipt';
import products from './item';
import foodItems from './food-items';
import houses from './houses';
import profiles from './profiles';

const router = express.Router();

router.get<{}, MessageResponse>('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏',
  });
});

router.use('/emojis', emojis);
router.use('/upload', upload);
router.use('/receipts', receipts);
router.use('/products', products);
router.use('/food-items', foodItems);
router.use('/houses', houses);
router.use('/profiles', profiles);

export default router;

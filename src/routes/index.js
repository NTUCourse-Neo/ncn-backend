import express from 'express';
import { MongoClient } from 'mongodb';
require('dotenv-defaults').config();

const router = express.Router();


router.get('/healthcheck', (req, res) => {
  res.send('OK');
});


export default router;

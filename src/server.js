import { MongoClient } from 'mongodb';
import express from 'express';
import router from './route/index';
import cors from 'cors';
require('dotenv-defaults').config();

const app = express();

app.use(cors());
app.use('/api/v1', router);

app.listen('5000', async () => {
  console.log('Server is running on port 5000');
});

import express from 'express';
import { MongoClient } from 'mongodb';
import search from './search';
require('dotenv-defaults').config();

const router = express.Router();

const client = new MongoClient(process.env.MONGO_URL);
client.connect();
const collection = client.db('NTUCourse-Neo').collection('courses');

router.get('/search', async (req, res) => {
  const query = req.query.query;
  console.log(query);
  console.log(collection);
  try {
    const result = await search(query, ['course_name', 'teacher'], collection);

    res.status(200).send({ courses: result });
  } catch {
    res.status(500).send('Internal Server Error');
  }
});

export default router;

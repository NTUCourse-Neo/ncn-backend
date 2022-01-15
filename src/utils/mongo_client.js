import { MongoClient } from 'mongodb';
require('dotenv-defaults').config();

const client = new MongoClient(process.env.MONGO_URL);
client.connect();
const collection = client.db('NTUCourse-Neo').collection('1102_courses');

export default collection;
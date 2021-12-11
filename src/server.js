import express from 'express';
import router from './routes/index';
import course_router from './routes/courses';
import cors from 'cors';
require('dotenv-defaults').config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api/v1', router);
app.use('/api/v1/courses', course_router);



app.listen('5000', async () => {
  console.log('Server is running on port 5000');
});

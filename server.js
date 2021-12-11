import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv-defaults';
import cors from 'cors';
import bodyParser from 'body-parser';
import get_router from './routes/get_method';

dotenv.config();
mongoose.connect(
    process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then((res) => console.log("mongo db connection created"))

const port = process.env.PORT || 4000;
const app = express();

app.use(bodyParser.json());
app.use('/api/v1/courses', get_router);

app.listen(port, () => {
    console.log(`Server is up on port ${port}!`);
})


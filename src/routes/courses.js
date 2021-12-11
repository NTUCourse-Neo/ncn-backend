import express from "express";
import courses from '../models/Courses';
import search from '../utils/search';
import collection from "../utils/mongo_client";

const router = express.Router();

router.get('/', async (req, res) => {
    let courses_pack;
    try {
        courses_pack = await courses.find();
        res.status(200).json({message: courses_pack})
        console.log('Get full courses package.')
    }
    catch (err) {
        res.status(400).json({message: err})
        console.error(err);
    }
})

router.post('/search', async (req, res) => {
    const query = req.body.query;
    const paths = req.body.paths;
    try {
      const result = await search(query, paths, collection);
  
      res.status(200).send({ courses: result });
    } catch {
      res.status(500).send('Internal Server Error');
    }
  });


export default router;

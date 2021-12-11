import express from "express";
import courses from '../models/Courses';

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



export default router;

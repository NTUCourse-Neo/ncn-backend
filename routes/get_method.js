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

router.get('/id/:id', async (req, res) => {
    let course;
    let id = req.params.id;
    // console.log(id);
    try {
        course = await courses.find({'_id': id});
        if(course.length === 0) {
            let msg = `Can not find course '${id}'!`;
            res.status(404).json({message: msg});
        }
        else {
            res.status(200).json({message: course});
            console.log(`Get course '${id}' from database!`);
        }
    }
    catch(err) {
        res.status(500).json({message: err})
        console.error(err);
    }
})


router.get('/query/name', async (req, res) => {
    let course;
    let name = req.query.name;
    // console.log(name);
    try {
        course = await courses.find({'course_name': name});
        // console.log(course);
        if(course.length === 0) {
            let msg = `Can not find course '${name}'!`;
            res.status(404).json({message: msg});
        }
        else {
            res.status(200).json({message: course});
            console.log(`Get course '${name}' from database!`);
        }
    }
    catch (err) {
        res.status(500).json({message: err});
        console.error(err);
    }
})


export default router;

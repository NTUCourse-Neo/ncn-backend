import express from 'express';
import Course_table from '../models/Course_table';


const router = express.Router();

router.get('/', async (req, res) => {
    let result;
    try {
        reuslt = await Course_table.find();
        res.status(200).send({message: result});
        console.log('Get full course table package.');
    }
    catch (err) {
        res.status(500).send({message: err});
        console.error(err);
    }
})

router.get('/:id', async (req, res) => {
    let course_id = req.params.id;
    let result;
    try {
        result = await Course_table.find({'_id': course_id});
        res.status(200).send({course_table: result});
    }
    catch (err) {
        res.status(500).send({message: err});
        console.error(err);
    }
})

router.post('/', async (req, res) => {
    const _id = req.body._id;
    const course_table_name = req.body.name;
    const user_id = req.body.user_id;
    const semester = req.body.semester;
    
    let existing;
    try {
        existing = await Course_table.findOne({'_id': _id});
    }
    catch (err) {
        console.error(err);
    }
    
    if(existing) {
        console.log('update course table.');
        existing.name = course_table_name;
        existing.user_id = user_id;
        existing.semester = semester;
        try {
            await existing.save();
            res.status(200).send({course_table: existing});
        }
        catch (err) {
            res.status(500).send({message: err});
            console.error(err);
        }
        
    }
    else {
        try {
            let day = 1;
            let expire_time_interval = 1000 * 60 * 60 * 24 * day;
            let current_time = + new Date();
            let expire_time = current_time + expire_time_interval;
            let new_course_table = new Course_table({
                _id: _id,
                name: course_table_name,
                user_id: user_id,
                semester: semester,
                courses: [],
                expire_ts: expire_time
            })
            await new_course_table.save();
            // let expire_date = new Date(new_course_table.expire_ts);
            // console.log(new_course_table.expire_ts);
            // console.log(expire_date.toString());
            res.status(200).send({course_table: new_course_table});
        }
        catch (err) {
            res.status(500).send({message: err});
            console.error(err);
        }     
    }
})

router.patch('/:id', async (req, res) => {
    const _id = req.params.id;
    const name = req.body.name;
    const user_id = req.body.user_id;
    const expire_ts = req.body.expire_ts;
    const courses = req.body.courses;

    let target;
    try {
        target = await Course_table.findOne({'_id': _id});
    }
    catch (err) {
        console.error(err);
    }

    if(!target) {
        res.status(200).send({message: 'Course not found.'});
    }
    else {
        target.name = name;
        target.user_id = user_id;
        target.expire_ts = expire_ts;
        target.courses = courses;
        try {
            await target.save();
            res.status(200).send({course_table: target});
        }
        catch (err) {
            res.statue(500).send({message: err});
            console.error(err);
        }
    }
   
})

router.delete('/', async (req, res) => {
    try {
        await Course_table.deleteMany({});
        res.status(200).send({message: 'delete all course table successfully'});
        console.log('delete all course table successfully.');
    }
    catch (err) {
        res.status(500).send({message: err});
        console.error(err);
    }
})

router.delete('/:id', async (req, res) => {
    const _id = req.params.id;
    try {
        await Course_table.deleteOne({'_id': _id});
        res.status(200).send({message: 'delete course table successfully.'});
        console.log('delete course table successfully.');
    }
    catch (err) {
        res.status(500).send({message: err});
        console.error(err); 
    }
})



export default router;
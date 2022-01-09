import express from 'express';
import Course_table from '../models/Course_table';
import { checkJwt } from '../auth';
import * as auth0_client from "../utils/auth0_client";


const router = express.Router();

const check_is_admin = async (user_id) => {
    const token = await auth0_client.get_token();
    const user_roles = await auth0_client.get_user_meta_roles(user_id, token);
    if(!user_roles.includes('admin')){
        return false;
    }
    return true;
};

router.get('/', checkJwt, async (req, res) => {
    if(await check_is_admin(req.user.sub)){
        res.status(403).send({course_table: null, message: "You are not authorized to get this data."});
        return;
    }
    let result;
    try {
        reuslt = await Course_table.find();
        res.status(200).send({course_table: result, message: "Get full course table package"});
        console.log('Get full course table package.');
    }
    catch (err) {
        res.status(500).send({coures_table: null, message: err});
        console.error(err);
    }
})

router.get('/:id', checkJwt, async (req, res) => {
    const token_sub = req.user.sub;
    let course_id = req.params.id;
    let result;
    const expire_over_day = 1;
    try {
        result = await Course_table.findOne({'_id': course_id});
        let user_id = result.user_id;
        let expire_time_stamp = result.expire_ts;
        let current_time_stamp = + new Date();
        current_time_stamp = parseInt(current_time_stamp/1000, 10);   // convernt milliseconds to senconds
        // console.log(expire_time_stamp);
        // console.log(current_time_stamp);
        let overtime = current_time_stamp - expire_time_stamp;
        let overday = overtime/(60*60*24);
        // console.log(overday);
        if(!user_id && overday > expire_over_day) {
            res.status(403).send({course_table: null, message: "this course table is expired"});
        }else if(user_id && user_id !== token_sub){
            res.status(403).send({course_table: null, message: "you are not authorized to get this coursetable."});
        }
        else {
            res.status(200).send({course_table: result, message: "get course table"});
        }
    }
    catch (err) {
        res.status(500).send({course_table: null, message: err});
        console.error(err);
    }
})

router.post('/', checkJwt, async (req, res) => {
    const _id = req.body.id;
    const course_table_name = req.body.name;
    const user_id = req.user.sub;
    const semester = req.body.semester;
    
    let existing;
    try {
        existing = await Course_table.findOne({'_id': _id});
    }
    catch (err) {
        console.error(err);
    }
    
    if(existing) {
        console.log('course table is existing')
        res.status(400).send({course_table: existing, message: 'course table is existing'});        
    }
    else {
        try {
            let day = 1;
            let expire_time_interval = 60 * 60 * 24 * day;
            let current_time = + new Date();
            current_time = parseInt(current_time/1000, 10);
            let expire_time = current_time + expire_time_interval;
            let new_course_table = new Course_table({
                _id: _id,
                name: course_table_name,
                user_id: user_id,
                semester: semester,
                courses: [],
            })
            if(!user_id) {
                new_course_table.expire_ts = expire_time;
            }
            else {
                new_course_table.expire_ts = null;
            }
            await new_course_table.save();
            // let expire_date = new Date(new_course_table.expire_ts);
            // console.log(new_course_table.expire_ts);
            // console.log(expire_date.toString());
            res.status(200).send({course_table: new_course_table, message: 'create course table successfully'});
        }
        catch (err) {
            res.status(500).send({course_table: null, message: err});
            console.error(err);
        }     
    }
})

router.patch('/:id', checkJwt,async (req, res) => {
    const _id = req.params.id;
    const name = req.body.name;
    const user_id = req.body.user_id;
    const expire_ts = req.body.expire_ts;
    const courses = req.body.courses;
    const token_sub = req.user.sub;
    if(token_sub !== user_id) {
        res.status(403).send({course_table: null, message: "you are not authorized to update this course table."});
        return;
    }

    let current_ts = + new Date();
    current_ts = parseInt(current_ts/1000, 10);
    let target;
    try {
        target = await Course_table.findOne({'_id': _id});
    }
    catch (err) {
        console.error(err);
    }

    if(!target) {
        res.status(200).send({course_table: null, message: 'Course not found.'});
    }
    else {
        if(user_id && expire_ts) {
            res.status(403).send({course_table: null, message: 'User_id is not null, expire_ts should be null.'});
        }
        else if(user_id && !expire_ts) {
            target.name= name;
            target.user_id = user_id;
            target.expire_ts = expire_ts;
            target.courses = courses;
            try {
                await target.save();
                res.status(200).send({course_table: target, message: 'Course table has been patched'});
            }
            catch (err) {
                res.status(500).send({course_table: null, message: err});
                console.error(err);
            }
        }
        else {
            if(log_10(expire_ts) - log_10(current_ts) > 1) {
                res.status(403).send({course_table: null, message: 'expire_ts is in milliseconds, please convert it to seconds'});
            }
            else if(current_ts > expire_ts) {
                res.status(403).send({course_table: null, message: 'expire_ts is earlier than current time'});
            }
            else {
                target.name= name;
                target.user_id = user_id;
                target.expire_ts = expire_ts;
                target.courses = courses;
                try {
                    await target.save();
                    res.status(200).send({course_table: target, message: 'Course table has been patched'});
                }
                catch (err) {
                    res.status(500).send({course_table: null, message: err});
                    console.error(err);
                }
            }
            
        }
    }
   
})

router.delete('/', checkJwt, async (req, res) => {
    if(await check_is_admin(req.user.sub)){
        res.status(403).send({course_table: null, message: "You are not authorized to get this data."});
        return;
    }
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

router.delete('/:id', checkJwt, async (req, res) => {
    if(await check_is_admin(req.user.sub)){
        res.status(403).send({course_table: null, message: "You are not authorized to get this data."});
        return;
    }
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

function log_10(x) {
    return Math.log(x)/Math.log(10);
}



export default router;
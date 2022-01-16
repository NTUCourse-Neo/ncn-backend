import express from 'express';
import Course_table from '../models/Course_table';
import { sendWebhookMessage } from '../utils/webhook_client';
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
        const fields = [
            {name: "Component", value: "Backend API endpoint"},
            {name: "Method", value: "GET"},
            {name: "Route", value: "/course_tables/"},
            {name: "Request Body", value: "```\n"+JSON.stringify(req.body)+"\n```"},
            {name: "Error Log", value: "```\n" + err + "\n```"}
        ]
        await sendWebhookMessage("error","Error occurred in ncn-backend.", fields);
        console.error(err);
    }
})

router.get('/:id', async (req, res) => {
    let course_id = req.params.id;
    let result;
    try {
        result = await Course_table.findOne({'_id': course_id});
        if(!result){
            res.status(404).send({message: "Course table not found."});
            return;
        }
        let user_id = result.user_id;
        let expire_time_stamp = result.expire_ts;
        let current_time_stamp = + new Date();
        current_time_stamp = parseInt(current_time_stamp/1000, 10);   // convernt milliseconds to senconds
        if(!user_id && (current_time_stamp > expire_time_stamp)) {
            res.status(403).send({course_table: null, message: "this course table is expired"});
        }
        else {
            res.status(200).send({course_table: result, message: "get course table"});
        }
    }
    catch (err) {
        res.status(500).send({course_table: null, message: err});
        const fields = [
            {name: "Component", value: "Backend API endpoint"},
            {name: "Method", value: "GET"},
            {name: "Route", value: "/course_tables/:id"},
            {name: "Request Body", value: "```\n"+JSON.stringify(req.body)+"\n```"},
            {name: "Error Log", value: "```\n" + err + "\n```"}
        ]
        await sendWebhookMessage("error","Error occurred in ncn-backend.", fields);
        console.error(err);
    }
})

router.post('/', async (req, res) => {
    const _id = req.body.id;
    const course_table_name = req.body.name;
    const user_id = req.body.user_id;
    const semester = req.body.semester;
    
    let existing;

    try {
        existing = await Course_table.findOne({'_id': _id});
        if(existing) {
            console.log('course table is existing')
            res.status(400).send({course_table: existing, message: 'course table is existing'});
            return;        
        }
        else {
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
    }
    catch (err) {
        res.status(500).send({course_table: null, message: err});
        const fields = [
            {name: "Component", value: "Backend API endpoint"},
            {name: "Method", value: "POST"},
            {name: "Route", value: "/course_tables/"},
            {name: "Request Body", value: "```\n"+JSON.stringify(req.body)+"\n```"},
            {name: "Error Log", value: "```\n" + err + "\n```"}
        ]
        await sendWebhookMessage("error","Error occurred in ncn-backend.", fields);
        console.error(err);
    }
})

router.patch('/:id', async (req, res) => {
    const _id = req.params.id;
    const name = req.body.name;
    const user_id = req.body.user_id;
    const expire_ts = req.body.expire_ts;
    const courses = req.body.courses;
    let current_ts = + new Date();
    current_ts = parseInt(current_ts/1000, 10);
    try{
        let target = await Course_table.findOne({'_id': _id});
        if(!target) {
            res.status(200).send({course_table: null, message: 'Course not found.'});
        }
        else {
            const origin_expire_ts = target.expire_ts;
            if(origin_expire_ts && (current_ts > origin_expire_ts)) {
                res.status(403).send({course_table: null, message: 'Course table is expired'});
            }
            else if(user_id && expire_ts) {
                res.status(403).send({course_table: null, message: 'User_id is not null, expire_ts should be null.'});
            }
            else if(user_id && !expire_ts) {
                target.name = name;
                target.user_id = user_id;
                target.expire_ts = expire_ts;
                target.courses = courses;
                await target.save();
                res.status(200).send({course_table: target, message: 'Course table has been patched'});
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
                    await target.save();
                    res.status(200).send({course_table: target, message: 'Course table has been patched'});
                }
                
            }
        }
    }catch(err){
        res.status(500).send({course_table: null, message: err});
        const fields = [
            {name: "Component", value: "Backend API endpoint"},
            {name: "Method", value: "PATCH"},
            {name: "Route", value: "/course_tables/:id"},
            {name: "Request Body", value: "```\n"+JSON.stringify(req.body)+"\n```"},
            {name: "Error Log", value: "```\n" + err + "\n```"}
        ]
        await sendWebhookMessage("error","Error occurred in ncn-backend.", fields);
        console.error(err);
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
        const fields = [
            {name: "Component", value: "Backend API endpoint"},
            {name: "Method", value: "DELETE"},
            {name: "Route", value: "/course_tables/"},
            {name: "Request Body", value: "```\n"+JSON.stringify(req.body)+"\n```"},
            {name: "Error Log", value: "```\n" + err + "\n```"}
        ]
        await sendWebhookMessage("error","Error occurred in ncn-backend.", fields);
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
        const fields = [
            {name: "Component", value: "Backend API endpoint"},
            {name: "Method", value: "DELETE"},
            {name: "Route", value: "/course_tables/:id"},
            {name: "Request Body", value: "```\n"+JSON.stringify(req.body)+"\n```"},
            {name: "Error Log", value: "```\n" + err + "\n```"}
        ]
        await sendWebhookMessage("error","Error occurred in ncn-backend.", fields);
        console.error(err); 
    }
})

function log_10(x) {
    return Math.log(x)/Math.log(10);
}



export default router;
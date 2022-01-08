import e from "express";
import express from "express";
import Course_table from "../models/Course_table";
import Users from "../models/Users";
import * as auth0_client from "../utils/auth0_client";
import { checkJwt } from "../auth";

const router = express.Router();

router.get('/:id', async (req, res) => {
  const user_id = req.params.id;
  try {
    const token = await auth0_client.get_token();
    const auth0_user = await auth0_client.get_user_by_id(user_id, token);
    if (!auth0_user){
      res.status(404).send({user: null, message: "User is not registered in Auth0"});
      return;
    }
    const db_user = await Users.findOne({'_id': user_id}).exec();
    if(db_user){
      res.status(200).send({user: {db: db_user, auth0: auth0_user}, message: "Successfully get user by id."});
    }else{
      res.status(200).send({user: null, message: "User not found in MongoDB."});
    }
  }
  catch (err) {
      res.status(500).send({user: null, message: err});
      console.error(err);
  }
})

router.post('/', async (req, res) => {
  const email = req.body.user.email;
  try{
    if(!email){
      res.status(400).send({message: "email is required", user: null});
      return;
    }else{
      const db_user = await Users.findOne({'email': email});
      if(db_user){
        res.status(400).send({message: "email is already registered", user: null});
        return;
      }
      const token = await auth0_client.get_token()
      const auth0_users = await auth0_client.get_user_by_email(email, token)
      let auth0_user;
      if(auth0_users.length === 0){
        res.status(400).send({message: "email is not registered", user: null});
        return;
      }else if(auth0_users.length === 1){
        auth0_user = auth0_users[0];
      }else{
        auth0_user = auth0_users.filter(user => !user.identities.isSocial)[0];
      }
      let new_user = new Users({
        _id: auth0_user.user_id,
        name: auth0_user.name,
        email: auth0_user.email,
        gender: 0,
        student_id: "",
        department: [],
        minor: [],
        year: 0,
        language: "",
        favorites:[],
        course_tables: [],
        history_courses: []
      });
      await new_user.save();
      res.status(200).send({message: "User created", user: {db: new_user, auth0: auth0_user}});
      return;
    }
  }catch(err){
    res.status(500).send({user: null, message: err});
  }
});

router.post('/:id/course_table', async (req, res) => {
  const course_table_id = req.body.course_table_id;
  const user_id = req.params.id;
  try{
    if(!course_table_id || !user_id){
      res.status(400).send({message: "course_table_id and user_id is required", user: null});
      return;
    }else{
      const token = await auth0_client.get_token()
      const auth0_user = await auth0_client.get_user_by_id(user_id, token)
      // Check if user is registered in Auth0
      if(!auth0_user){
        res.status(400).send({message: "User is not registered"});
        return;
      }
      // Check if user is registered in MongoDB
      const db_user = await Users.findOne({'_id': user_id});
      if(!db_user){
        res.status(400).send({message: "User data not found"});
        return;
      }
      // check if course_table_id is already in db_user.course_tables.
      if(db_user.course_tables.includes(course_table_id)){
        res.status(400).send({message: "Course table is already linked to this user"});
        return;
      }
      // check if course_table_id is valid (is in coursetable collection).
      // check if user_id in course_table object is the same as user_id.
      const course_table = await Course_table.findOne({"_id": course_table_id})
      if(course_table.user_id && course_table.user_id !== user_id){
        res.status(400).send({message: "Course table is already linked to another user"});
        return;
      }
      // Add user id to course_table object.
      try{
        if(!course_table.user_id){
          course_table.user_id = user_id;
        }
        if(course_table.expire_ts){
          course_table.expire_ts = null;
        }
        await course_table.save();
      }catch{
        res.status(500).send({message: "Error in saving coursetable."});
        return;
      }
      // Add course table id to user object.
      // !if this step fails, it will set the user_id in course_table object back to null to prevent data inconsistency.
      try{
        db_user.course_tables.push(course_table_id);
        console.log(db_user.course_tables);
        await db_user.save();
      }catch{
        course_table.user_id = null;
        await course_table.save();
        res.status(500).send({message: "Error in saving user data, restored coursetable data."});
        return;
      }
      res.status(200).send({message: "Successfully linked course table to user.", user: {db: db_user, auth0: auth0_user}});
      return;
    }
  }catch(err){
    console.error(err);
    res.status(500).send({message: err});
  }
});

router.post('/:id/student_id/otp', async (req, res) => {
  const user_id = req.params.id;
  const student_id = req.body.student_id;
  const expire_minutes = 5;
})

router.post('/:id/student_id/link', async (req, res) => {
  const user_id = req.params.id;
  const student_id = req.body.student_id;
  const otp = req.body.otp;
})

router.patch('/:id', async (req, res) => {
  const user_id = req.params.id;
  const patch_user = req.body.user;
  // Check if user exists
  try {
    let db_user = await Users.findOne({'_id': user_id}).exec();
    if(!db_user){
      res.status(404).send({message: "User not found"});
      return;
    }
    // Check if user is registered in Auth0
    const token = await auth0_client.get_token()
    const auth0_user = await auth0_client.get_user_by_id(user_id, token)
    if (!auth0_user){
      res.status(404).send({message: "User is not registered in Auth0"});
      return;
    }
    // Check each field and update if necessary.
    let query = {};
    for(let key in patch_user){
      console.log(key);
      // Make sure client won't update _id and email.
      if(key == "_id" || key == "email" || key == "student_id"){
        res.status(400).send({message: "Cannot update _id or email and student_id."});
        return;
      }
      // If the field exists and is not the same as the one in the database, update it.
      if(key in db_user && (db_user[key] != patch_user[key])){
        query[key] = patch_user[key];
      }
    }
    // No updates.
    if(Object.keys(query).length === 0){
      res.status(200).send({message: "No update"});
      return;
    }
    // Update user in MongoDB.
    await Users.updateOne({'_id': user_id}, query).exec();
    db_user = await Users.findOne({'_id': user_id}).exec();
    res.status(200).send({user:{ db:db_user, auth0: auth0_user}, message: "User updated."});
  } catch (err) {
    res.status(500).send({message: err});
    console.error(err);
  }
});

router.delete("/:id/profile", async(req, res) => {
  try{
    const user_id = req.params.id;
    let db_user = await Users.findOne({'_id': user_id}).exec();
    if(!db_user){
      res.status(400).send({message: "User profile data is not in DB."});
      return;
    }
    await Users.deleteOne({'_id': user_id}).exec();
    res.status(200).send({message: "Successfully deleted user profile."})
  }catch(err){
    res.status(500).send({message: err});
  }
});

router.delete("/:id/account", async(req, res) => {
  try{
    const user_id = req.params.id;
    let db_user = await Users.findOne({'_id': user_id}).exec();
    if(!db_user){
      res.status(400).send({message: "User profile data is not in DB."});
      return;
    }
    await Users.deleteOne({'_id': user_id}).exec();
    const token = await auth0_client.get_token();
    const auth0_user = await auth0_client.get_user_by_id(user_id, token);
    if(!auth0_user){
      res.status(400).send({message: "User is not registered in Auth0"});
      return;
    }
    const result = await auth0_client.delete_user_by_id(user_id, token);
    res.status(200).send({message: "Successfully deleted user account and profile."});
  }catch(err){
    res.status(500).send({message: err});
  }
});



export default router;
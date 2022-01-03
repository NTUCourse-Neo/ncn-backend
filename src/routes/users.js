import e from "express";
import express from "express";
import Users from "../models/Users";
import * as auth0_client from "../utils/auth0_client";

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

router.patch('/:id', async (req, res) => {
  const user_id = req.params.id;
  const patch_user = req.body.user;
  // Check if user exists
  try {
    const db_user = await Users.findOne({'_id': user_id}).exec();
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
      if(key == "_id" || key == "email"){
        res.status(400).send({message: "Cannot update _id or email"});
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
    res.status(200).send({updates: query, message: "User updated."});
  } catch (err) {
    res.status(500).send({message: err});
    console.error(err);
  }
});



export default router;
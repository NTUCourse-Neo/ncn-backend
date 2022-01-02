import e from "express";
import express from "express";
import Users from "../models/Users";
import * as auth0_client from "../utils/auth0_client";

const router = express.Router();

router.get('/:id', async (req, res) => {
  const user_id = req.params.id;
  let auth0_user;
  await auth0_client.get_token().then(async (token) => {
    await auth0_client.get_user_by_id(user_id, token).then(async (user) => {
      if (!user){
        res.status(404).send({user: null, message: "User is not registered in Auth0"});
        return;
      }else{
        auth0_user = user;
      }
    });
  });
  try {
    let result = await Users.findOne({'_id': user_id});
    if(result){
      res.status(200).send({db: result, auth0: auth0_user, message: "Successfully get user by id."});
    }else{
      res.status(404).send({db: null, message: "User not found in MongoDB."});
    }
  }
  catch (err) {
      res.status(500).send({db: null, message: err});
      console.error(err);
  }
})

router.post('/register', async (req, res) => {
  const email = req.body.user.email;
  try{
    if(!email){
      res.status(400).send({message: "email is required"});
      return;
    }else{
      const db_user = await Users.findOne({'email': email});
      if(db_user){
        res.status(400).send({message: "email is already registered"});
        return;
      }
      await auth0_client.get_token().then(async (token) => {
        await auth0_client.get_user_by_email(email, token).then(async (users) => {
          let user;
          if(users.length === 0){
            res.status(400).send({message: "email is not registered"});
            return;
          }else if(users.length === 1){
            user = users[0];
          }else{
            user = users.filter(user => !user.identities.isSocial)[0];
          }
          let new_user = new Users({
            _id: user.user_id,
            name: user.name,
            email: user.email,
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
          new_user.save().then(() => {
            res.status(200).send({message: "User created", user: new_user});
            return;
          }
          ).catch((err) => {
            res.status(500).send({message: err});
            console.error(err);
            return;
          });
        }).catch((err) => {
          res.status(500).send({message: err});
          console.error(err);
          return;
        });
      })
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
    const user = await Users.findOne({'_id': user_id}).exec();
    if(!user){
      res.status(404).send({message: "User not found"});
      return;
    }
    // Check if user is registered in Auth0
    await auth0_client.get_token().then(async (token) => {
      await auth0_client.get_user_by_id(user_id, token).then(async (user) => {
        if (!user){
          res.status(404).send({message: "User is not registered in Auth0"});
          return;
        }
      });
    });
    // Update user
    // Check each field and update if necessary.
    let query = {};
    for(let key in patch_user){
      console.log(key);
      if(key == "_id" || key == "email"){
        res.status(400).send({message: "Cannot update _id or email"});
        return;
      }
      if(key in user && (user[key] != patch_user[key])){
        query[key] = patch_user[key];
      }
    }
    if(Object.keys(query).length === 0){
      res.status(200).send({message: "No update"});
      return;
    }
    await Users.updateOne({'_id': user_id}, query).exec().then(() => {
      res.status(200).send({updates: query, message: "User updated."});
      return;
    });
  } catch (err) {
    res.status(500).send({message: err});
    console.error(err);
  }
});



export default router;
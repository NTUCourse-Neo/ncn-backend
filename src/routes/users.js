import e from "express";
import express from "express";
import Users from "../models/Users";
import * as auth0_client from "../utils/auth0_client";

const router = express.Router();

router.get('/', async (req, res) => {
  let user_id = req.params.id;
  let result;
  try {
    result = await Users.findOne({'_id': user_id});
    res.status(200).send({user: result, message: "Get user"});
  }
  catch (err) {
      res.status(500).send({user: null, message: err});
      console.error(err);
  }
})

router.post('/register', async (req, res) => {
  const email = req.body.user.email;
  try{
    if(!email){
      res.status(400).send({message: "email is required"});
    }else{
      await auth0_client.get_token().then(async (token) => {
        await auth0_client.get_user_by_email(email, token).then(async (users) => {
          let user;
          if(users.length === 0){
            res.status(400).send({message: "email is not registered"});
          }else if(users.length === 1){
            user = users[0];
          }else{
            user = users.filter(user => !user.identities.isSocial)[0];
          }
          console.log(user);
        }).catch((err) => {
          console.error(err);
        });
      })
    }
  }catch(err){
    res.status(500).send({user: null, message: err});
  }
});



export default router;
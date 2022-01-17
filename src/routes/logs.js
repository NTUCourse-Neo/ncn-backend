import express from 'express';
import {sendWebhookMessage} from "../utils/webhook_client"
require('dotenv-defaults').config();

const router = express.Router();


router.post('/error', async(req, res) => {
  try{
    // use request body msg as fields.
    const fields = Object.keys(req.body).map(key => {
      return {name: key, value: req.body[key]}
    })
    console.log(fields)
    await sendWebhookMessage("error","New error reported to logging api.", fields);
    res.status(200).send({message: 'Successfully reported error.'})
  }catch(err){
    console.error(err);
  }
});

router.post('/info', async(req, res) => {
  try{
    const fields = Object.keys(req.body).map(key => {
      return {name: key, value: req.body[key]}
    })
    await sendWebhookMessage("info","New info reported to logging api.", fields);
    res.status(200).send({message: 'Successfully reported info.'})
  }catch(err){
    console.error(err);
  }
});


export default router;

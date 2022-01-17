import express from 'express';
import {sendWebhookMessage} from "../utils/webhook_client"
require('dotenv-defaults').config();

const router = express.Router();


router.post('/error', async(req, res) => {
  try{
    const err_comp = req.body.component;
    const err_log = req.body.log;
    const fields = [
      {name: "Component", value: err_comp},
      {name: "Error Log", value: "```\n" + err_log + "\n```"},
      {name: "Request body", value: "```\n" + JSON.stringify(req.body) + "\n```"}
    ]
    console.log(fields)
    await sendWebhookMessage("error","New error reported to logging api", fields);
    res.status(200).send({message: 'Successfully reported error.'})
  }catch(err){
    console.error(err);
  }
});

router.post('/info', async(req, res) => {
  const err_comp = req.body.component;
  const err_log = req.body.log;
  const fields = [
    {name: "Component", value: err_comp},
    {name: "Info Log", value: "```\n" + err_log + "\n```"},
    {name: "Request body", value: "```\n" + JSON.stringify(req.body) + "\n```"}
  ]

  await sendWebhookMessage("info","New info reported to logging api", fields);
  res.status(200).send({message: 'Successfully reported info.'})
});


export default router;

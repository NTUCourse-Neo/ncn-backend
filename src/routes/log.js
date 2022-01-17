import express from 'express';
require('dotenv-defaults').config();

const router = express.Router();


router.post('/error', (req, res) => {
  const comp = req.body.component;
  const err = req.body.error_log;
  const fields = [
    {name: "Component", value: comp},
    {name: "Error Log", value: "```\n" + err + "\n```"}
  ]
  await sendWebhookMessage("error","New Error Reported!", fields);
  res.status(200).send({message: 'Successfully reported error.'})
});


export default router;

import dotenv from 'dotenv-defaults';
import express from "express";
import { validate_recaptcha } from "../utils/captcha_client";
import { sendWebhookMessage } from "../utils/webhook_client";

dotenv.config();

const router = express.Router();
router.post('/', async (req, res) => {
  const captcha_response = req.body.captcha_token;
  const captcha_verify = await validate_recaptcha(captcha_response);
  try {
    if(captcha_verify) {
      res.status(200).send({message: "Captcha verified", data: captcha_verify});
    }else {
      res.status(403).send({message: "Unable to verify captcha."});
    }
  }
  catch (err) {
    const fields = [
      {name: "Component", value: "Backend API endpoint"},
      {name: "Method", value: "POST"},
      {name: "Route", value: "/recaptcha"},
      {name: "Request Body", value: "```\n"+JSON.stringify(req.body)+"\n```"},
      {name: "Error Log", value: "```\n" + err + "\n```"}
    ]
    await sendWebhookMessage("error","Error occurred in ncn-backend.", fields);
    res.status(500).send({message: 'error in captcha'})
  }
})

export default router;
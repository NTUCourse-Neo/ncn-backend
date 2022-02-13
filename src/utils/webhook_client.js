import dotenv from 'dotenv-defaults';
import axios from 'axios';
dotenv.config();

const msg_tmpl =
{
  content: "",
  embeds: [
    {
      title: "",
      description: "",
      color: 16711680,
      fields: [
      ],
      footer: {
        text: "via ncn-backend"
      },
      timestamp: "2022-01-13T07:09:00.000Z"
    }
  ],
  username: "NTUCourse Neo",
  avatar_url: "https://external-preview.redd.it/UEwzwB-90sxfOxpN5kjf3qmfSLS6o-sat995maKZS5Q.png?auto=webp&s=21032b88ac0ee2ee73a2dda37d3560ae1277cfc1"
}

const msg_type = {
  "error": {
    "title": "Error",
    "color": 16711680,
  },
  "warning": {
    "title": "Warning",
    "color": 16776960,
  },
  "info": {
    "title": "Info",
    "color": 39423,
  },
  "success": {
    "title": "Success",
    "color": 65379,
  },
}

const sendWebhookMessage = async(type, desc, fields) => {
  if(process.env.ENV === "dev") { return; }
  try{
    let msg = JSON.parse(JSON.stringify(msg_tmpl));
    if(type === "error" || type === "warning") {
      msg.content = "<@&932646597370720319>\n"+desc;
    }else{
      msg.content = desc;
    }
    msg.embeds[0].description = desc;
    msg.embeds[0].title = msg_type[type].title;
    msg.embeds[0].color = msg_type[type].color;
    msg.embeds[0].fields = fields;
    msg.embeds[0].timestamp = new Date().toISOString();
    let options = {
      method: 'POST',
      url: process.env.DISCORD_WEBHOOK_URL,
      headers: {'content-type': 'application/json'},
      data: JSON.stringify(msg)
    };
    await axios.request(options);
  }catch(err){
    console.error(err);
  }
};

export { sendWebhookMessage }

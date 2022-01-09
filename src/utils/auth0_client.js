import axios from 'axios';
import dotenv from 'dotenv-defaults';
import { get } from 'mongoose';

dotenv.config();

const get_token = async () => {
  let options = {
    method: 'POST',
    url: `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
    headers: {'content-type': 'application/json'},
    data: {
      grant_type: 'client_credentials',
      client_id: process.env.AUTH0_CLIENT_ID,
      client_secret: process.env.AUTH0_CLIENT_SECRET,
      audience: process.env.AUTH0_API_AUDIENCE
    }
  };
  let resp = await axios.request(options);
  return resp.data.access_token;
}

const get_user_by_email = async (email, token) => {
  let options = {
    method: 'GET',
    url: `https://${process.env.AUTH0_DOMAIN}/api/v2/users-by-email?email=${email}`,
    headers: {'content-type': 'application/json', authorization: 'Bearer ' + token}
  };
  let resp = await axios.request(options);
  return resp.data;
}

const get_user_by_id = async (id, token) => {
  let options = {
    method: 'GET',
    url: `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${id}`,
    headers: {'content-type': 'application/json', authorization: 'Bearer ' + token}
  };
  let resp = await axios.request(options);
  return resp.data;
}

const delete_user_by_id = async(id, token) => {
  let options = {
    method: 'DELETE',
    url: `https://${process.env.AUTH0_DOMAIN}/api/v2/users/${id}`,
    headers: {'content-type': 'application/json', authorization: 'Bearer ' + token}
  };
  let resp = await axios.request(options);
  return resp.data;
};

export { get_token ,get_user_by_email, get_user_by_id, delete_user_by_id };
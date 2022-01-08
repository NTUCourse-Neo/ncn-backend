import { auth } from 'express-oauth2-jwt-bearer';
import dotenv from 'dotenv-defaults';

dotenv.config();

const checkJwt = auth({
  audience: process.env.SELF_API_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_DOMAIN,
});

export { checkJwt };

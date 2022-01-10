import axios from 'axios';
import dotenv from 'dotenv-defaults';
dotenv.config();

const validate_recaptcha = async (token) => {
    const url = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET}&response=${token}`
    try {
        const response = await axios.post(url);
        return response.data;
    } catch (e) {
        return null;
    }
}

export { validate_recaptcha };
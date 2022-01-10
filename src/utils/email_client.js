import dotenv from 'dotenv-defaults';
import sgMail from '@sendgrid/mail'
dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendOtpEmail = async (to, otp_code, user_name) => {
  const msg = {
    from: process.env.SENDGRID_FROM_EMAIL,
    template_id: process.env.SENDGRID_OTP_TMPL_ID,
    personalizations: [
      {
        to:[{email:to}],
        dynamic_template_data: {
            otp_code: otp_code,
            name: user_name
        },
      }
    ],
  };
  await sgMail.send(msg)
}

export { sendOtpEmail };
import mongoose from 'mongoose';
const otps = new mongoose.Schema({
    user_id: String,    // 流水號
    student_id: String,  // 學號
    code: String,    // OTP
    expire_ts: Date,    // expire timestamp
})

const Otps = mongoose.model('otps', otps);

export default Otps;


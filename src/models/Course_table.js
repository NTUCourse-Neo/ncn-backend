import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const course_table = new Schema({
    _id: String,
    name: String,
    user_id: String,
    semester: String,
    courses: Array,
    expire_ts: Number
})

const Course_table = mongoose.model('course_table', course_table);

export default Course_table;


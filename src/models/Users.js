import mongoose from 'mongoose';
const users = new mongoose.Schema({
    _id: String,    // 流水號
    name: String,    // 姓名
    email: String,   // email
    student_id: String,  // 學號
    department: Array,  // 學院
    minor: Array,   // 輔系
    year: Number,    // 年級
    language: String,    // 母語
    favorites: Array, // 最愛課程列表(內為課程id)
    course_tables: Array,     // 課表列
    history_courses: Array,    // 已修過的課程
})

const Users = mongoose.model('users', users);

export default Users;


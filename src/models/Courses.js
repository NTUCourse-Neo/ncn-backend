import mongoose from 'mongoose';

const Schema = mongoose.Schema;
const courses = new Schema({
    _id: String,    // 流水號
    id: String,
    department: Array,  // 科系
    course_code: String,    // 課號
    class_id: String,   // 班次
    course_name: String,    // 課程名稱
    area: String,
    credit: Number,     // 學分
    course_id: String,  // 課程識別碼
    is_half_year: Boolean,  // 全/半年
    required: Number,   // 必/選修
    teacher: String,    // 授課教師
    enroll_method: String,  // 加選方式
    time_loc: String,   // 時間,地點
    total_slot: Number,     // 人數
    litmit: String,     // 限制
    note: String,   // 備註
    url: Object,
    semester: String,   //  學年
    departments_dependency: Array,    // 預修課程
    is_intensive_course: Array,
    time_loc_pair: Array,
    provider: String,
})

const Courses = mongoose.model('1102_courses', courses);

export default Courses;


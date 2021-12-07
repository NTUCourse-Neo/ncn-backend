import { mongoose } from 'mongoose';
import { dotenv } from 'dotenv';
dotenv.config()

mongoose.connect(process.env.MONGO_URL);

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

const courseSchema = new mongoose.Schema({
        id: String,
        department: Array,
        course_code: String,
        class_id: String,
        course_name: String,
        area: String,
        credit: Number,
        course_id: String,
        is_half_year: Boolean,
        required: Number,
        teacher: String,
        enroll_method:String,
        time_loc: String,
        total_slot: Number,
        limit: String,
        note: String,
        url: Object,
        semester: String,
        departments_dependency: Array,
        is_intensive_course: Array,
        time_loc_pair: Array,
        provider: String,
        _id: String
    });


const Course = mongoose.model('courses', courseSchema);

const findAll = async ()=>{
    const res = await Course.find({course_name: '排球'}).exec()
    console.log(res)
    return res
}
db.once('open', () => {
    console.log('connected to mongo');
    findAll();
});
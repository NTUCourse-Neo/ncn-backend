import mongoose from 'mongoose';

const Schema = mongoose.Schema;


const sign_up_content_schema = new Schema({
  amount: Number, // 人數
  when: String,   // 時間
  rule: String,   // 規則
  comment: String // 備註
});

const social_post = new Schema({
    _id: String,    // uuid4
    course_id: String, //(map to course._id)
    type: String, // available types: sign_up_info
    content: sign_up_content_schema,
    user_id: String,
    user_type: String,
    create_ts: Date,
    upvotes: [String],
    downvotes: [String]
})

const Social_posts = mongoose.model('social_posts', social_post);

export default Social_posts;


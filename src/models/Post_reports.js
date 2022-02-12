import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const post_report = new Schema({
    _id: String,    // uuid4
    post_id: String, //(map to post._id)
    user_id: String, //(map to user._id)
    reason: String,
    create_ts: Date,
    resolve_comment: String,
    resolved_ts: Date,
})

const Post_reports = mongoose.model('post_reports', post_report);

export default Post_reports;


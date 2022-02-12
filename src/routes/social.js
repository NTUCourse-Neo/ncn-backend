import express from 'express';
import Course_reports from '../models/Course_reports';
import Post_reports from '../models/Post_reports';
import Courses from '../models/Courses';
import { sendWebhookMessage } from '../utils/webhook_client';
import { checkJwt } from '../auth';
import { v4 as uuidv4 } from 'uuid';
import e from 'express';

// route: "/api/v1/social"
const router = express.Router();

const get_self_vote_status = (post, user_id) => {
  if(post.upvotes.includes(user_id)){
    return 1;
  }else if(post.downvotes.includes(user_id)){
    return -1;
  }else{
    return 0;
  }
}


router.get('/posts/:id/', checkJwt, async (req, res) => {
  // get course social posts by course id
  const user_id = req.user.sub;
  const post_id = req.params.id;
  const post = await Course_reports.findOne({'_id': post_id});
  if (!post) {
    res.status(404).send({message: "Post not found."});
    return;
  }

  res.status(200).send({post: {
    _id: post._id,
    course_id: post.course_id,
    type: post.type,
    content: post.content,
    is_owner: post.user_id === user_id,
    user_type: post.user_type,
    create_ts: post.create_ts,
    upvotes: post.upvotes.length,
    downvotes: post.downvotes.length,
    self_vote_status: get_self_vote_status(post, user_id)
  }});
})

router.get('/courses/:id/posts', checkJwt, async (req, res) => {
  // get course social posts by course id
  const user_id = req.user.sub;
  const course_id = req.params.id;
  const posts = await Course_reports.find({'course_id': course_id});
  if(posts.length === 0){
    res.status(404).send({message: "No posts found."});
    return;
  }
  res.status(200).send({
    posts: posts.map(post => { 
      return {
        _id: post._id,
        course_id: post.course_id,
        type: post.type,
        content: post.content,
        is_owner: post.user_id === user_id,
        user_type: post.user_type,
        create_ts: post.create_ts,
        upvotes: post.upvotes.length,
        downvotes: post.downvotes.length,
        self_vote_status: get_self_vote_status(post, user_id) 
      }
    })
  });
})

router.post('/courses/:id/posts', checkJwt, async (req, res) => {
  // create course social posts by course id
  const user_id = req.user.sub;
  const course_id = req.params.id;
  const course = await Courses.findOne({'_id': course_id});
  if (!course) {
    res.status(404).send({message: "Course not found."});
    return;
  }
  const old_post = await Course_reports.findOne({'course_id': course_id, 'user_id': user_id});
  if(old_post){
    res.status(400).send({message: "You have already posted."});
    return;
  }
  const post = req.body.post;
  // provided by frondend:
  // post: {
  //   "type": "",
  //   "content": "",
  //   "user_type": "",
  // }
  await Course_reports.create({
    _id: uuidv4(),
    course_id: course_id,
    type: post.type,
    content: post.content,
    user_id: user_id,
    user_type: post.user_type,
    create_ts: Date.now(),
    upvotes: [],
    downvotes: []
  });
  res.status(200).send({message: "Post created."})
})

router.post('/posts/:id/report', checkJwt, async (req, res) => {
  // report a post by post id
  const user_id = req.user.sub;
  const post_id = req.params.id;
  const new_report = req.body.report;
  const post = await Course_reports.findOne({'_id': post_id});
  const report = await Post_reports.findOne({'post_id': post_id, 'user_id': user_id});
  if(report){
    res.status(400).send({message: "You have already reported this post."})
    return;
  }
  if(!post){
    res.status(404).send({message: "Post not found."});
    return;
  }
  if(post.user_id === user_id){
    res.status(400).send({message: "You cannot report your own post."});
    return;
  }
  await Post_reports.create({
    _id: uuidv4(),
    post_id: post_id,
    user_id: user_id,
    reason: new_report.reason,
    create_ts: Date.now(),
    resolve_comment: null,
    resolved_ts: null
  });
  res.status(200).send({message: "Post reported."})
})

router.patch('/posts/:id/votes', checkJwt, async (req, res) => {
  // like or dislike a social post by post id
  // type: like (1), dislike (-1)
  const post_id = req.params.id;
  const user_id = req.user.sub;
  const type = req.body.type;
  const post = await Course_reports.findOne({'_id': post_id});
  if(!post){
    res.status(404).send({message: "Post not found."});
    return;
  }
  if(type === 1){
    // check if user has already liked this post
    if(post.upvotes.includes(user_id)){
      res.status(400).send({message: "You have already liked this post."});
      return;
    }
    if(post.downvotes.includes(user_id)){
      // remove user's dislike
      post.downvotes = post.downvotes.filter(id => id !== user_id);
    }
    post.upvotes.push(user_id);
  }
  else if(type === -1){
    // check if user has already disliked this post
    if(post.downvotes.includes(user_id)){
      res.status(400).send({message: "You have already disliked this post."});
      return;
    }
    if(post.upvotes.includes(user_id)){
      // remove user's like
      post.upvotes = post.upvotes.filter(id => id !== user_id);
    }
    post.downvotes.push(user_id);
  }
  else if(type === 0){
    if(post.upvotes.includes(user_id)){
      // remove user's like
      post.upvotes = post.upvotes.filter(id => id !== user_id);
    }
    if(post.downvotes.includes(user_id)){
      // remove user's dislike
      post.downvotes = post.downvotes.filter(id => id !== user_id);
    }
  }
  else{
    res.status(400).send({message: "type not supported."});
    return;
  }
  await Course_reports.findByIdAndUpdate({'_id': post_id}, post);
  res.status(200).send({message: "Vote updated."});
})

router.delete('/posts/:id', checkJwt, async (req, res) => {
  // delete a social post by post id
  const user_id = req.user.sub;
  const post_id = req.params.id;
  const post = await Course_reports.findOne({'_id': post_id});
  if(!post){
    res.status(404).send({message: "Post not found."});
    return;
  }
  if(post.user_id !== user_id){
    res.status(400).send({message: "You cannot delete this post."});
    return;
  }
  await Course_reports.deleteOne({'_id': post_id});
  res.status(200).send({message: "Post deleted."});
})



export default router;
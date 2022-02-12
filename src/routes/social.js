import express from 'express';
import Course_reports from '../models/Course_reports';
import Post_reports from '../models/Post_reports';
import { sendWebhookMessage } from '../utils/webhook_client';
import { checkJwt } from '../auth';
import { uuid } from 'uuidv4';

// route: "/api/v1/social"
const router = express.Router();

const get_self_vote_status = (post, user_id) => {
  if(post.upvotes.includes(user_id)){
    self_vote_status = 1;
  }else if(post.downvotes.includes(user_id)){
    self_vote_status = -1;
  }else{
    self_vote_status = 0;
  }
}


router.get('/posts/:id/', async (req, res) => {
  // get course social posts by course id
  const user_id = req.user.sub;
  const post_id = req.params.id;
  const post = await Course_reports.findOne({_id: post_id});
  if (!post) {
    res.status(404).send({message: "Post not found."});
    return;
  }

  res.status(200).send({post: {
    _id: post._id,
    course_id: post.course_id,
    type: post.type,
    content: post.content,
    user_type: post.user_type,
    create_ts: post.create_ts,
    upvotes: post.upvotes.length,
    downvotes: post.downvotes.length,
    self_vote_status: get_self_vote_status(post, user_id)
  }});
})

router.get('/courses/:id/', async (req, res) => {
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
        user_type: post.user_type,
        create_ts: post.create_ts,
        upvotes: post.upvotes.length,
        downvotes: post.downvotes.length,
        self_vote_status: get_self_vote_status(post, user_id) 
      }
    })
  });
})

router.post('/courses/:id/', async (req, res) => {
  // create course social posts by course id
  const user_id = req.user.sub;
  const course_id = req.params.id;
  const post = req.body.post;
  // provided by frondend:
  // post: {
  //   "type": "",
  //   "content": "",
  //   "user_type": "",
  // }
  await Course_reports.create({
    _id: uuid(),
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

router.post('/posts/:id/report', async (req, res) => {
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
    _id: uuid(),
    post_id: post_id,
    user_id: user_id,
    reason: new_report.reason,
    create_ts: Date.now(),
    resolve_comment: null,
    resolved_ts: null
  });
  res.status(200).send({message: "Post reported."})
})

router.patch('/posts/:id', async (req, res) => {
  // like or dislike a social post by post id
  // operation: like (1), dislike (-1)
  const post_id = req.params.id;
  const user_id = req.user.sub;
  const operation = req.body.operation;
  const post = await Course_reports.findOne({'_id': post_id});
  if(!post){
    res.status(404).send({message: "Post not found."});
    return;
  }
  if(operation === 1){
    // check if user has already liked this post
    if(post.upvotes.includes(user_id)){
      // if already liked, do un-like.
      post.upvotes.splice(post.upvotes.indexOf(user_id), 1);
    }else{
      post.upvotes.push(user_id);
    }
  }
  else if(operation === -1){
    // check if user has already disliked this post
    if(post.downvotes.includes(user_id)){
      // if already disliked, do un-dislike.
      post.downvotes.splice(post.downvotes.indexOf(user_id), 1);
    }else{
      post.downvotes.push(user_id);
    }
  }
  else{
    res.status(400).send({message: "Operation not supported."});
    return;
  }
  await post.update();
  res.status(200).send({message: "Post updated."});
})

router.delete('/posts/:id', async (req, res) => {
  // delete a social post by post id
  const user_id = req.user.sub;
  const post_id = req.params.id;
  const post = await Course_reports.deleteOne({'_id': post_id});
  if(!post){
    res.status(404).send({message: "Post not found."});
    return;
  }
  if(post.user_id !== user_id){
    res.status(400).send({message: "You cannot delete this post."});
    return;
  }
  res.status(200).send({message: "Post deleted."});
})



export default router;
import express from "express";
import courses from '../models/Courses';
import search from '../utils/search';
import collection from "../utils/mongo_client";

const router = express.Router();

router.get('/', async (req, res) => {
    let courses_pack;
    try {
        courses_pack = await courses.find();
        res.status(200).json({message: courses_pack})
        console.log('Get full courses package.')
    }
    catch (err) {
        res.status(500).json({message: err})
        console.error(err);
    }
})

router.post('/search', async (req, res) => {
    const query = req.body.query;
    const paths = req.body.paths;
    try {
      const result = await search(query, paths, collection);
  
      res.status(200).send({ courses: result });
    } catch {
      res.status(500).send('Internal Server Error');
    }
  });

/*
  filter: {
    time: [
      ["1","2","3",...,"A","B","C",...],  // Mon
      ["1","2","3",...,"A","B","C",...],  // Tue
      ["1","2","3",...,"A","B","C",...],  // Wed
      ["1","2","3",...,"A","B","C",...],  // Thur
      ["1","2","3",...,"A","B","C",...],  // Fri
      ["1","2","3",...,"A","B","C",...],  // Sat
      ["1","2","3",...,"A","B","C",...]   // Sun
    ],
    department: [str],
    category: [str],
  }
*/
//EX: {_id: {$in: ["1101_97009","1101_97115"]},"time_loc_pair.time.2": {$all: ["3","4"]}}
router.post('/ids', async (req, res) => {
  const course_list = req.body.courses;
  const filter = req.body.filter; 
  if(course_list.length === 0) {
    res.status(404).send('No courses found');
  }
  else {
    let days = filter.time;
    let record = [];
    for(let i=0; i<days.length; i++) {
      if(days[i].length != 0) {
        let constraint_title = 'time_loc_pair.time.' + (i+1);
        let constraint_clause = {
          [constraint_title]: {$all: days[i]}
        }
        record.push(constraint_clause);
      }
    }
    let search = {
      '_id': {$in: course_list},
      $or: record,
    }
    // console.log(search);
    try {
      const result = await courses.find(search);
      if(result.length != 0) {
        res.status(200).send({courses: result});
      }
      else {
        res.status(404).send({message: 'No courses found'});
      }
    }
    catch (err) {
      res.status(500).json({message: err})
      console.error(err);
    }
  }
});

export default router;

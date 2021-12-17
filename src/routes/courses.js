import express from "express";
import courses from '../models/Courses';
import search from '../utils/search';
import collection from "../utils/mongo_client";

const router = express.Router();

router.get('/', async (req, res) => {
    let courses_pack;
    try {
        courses_pack = await courses.find();
        res.status(200).send({message: courses_pack})
        console.log('Get full courses package.')
    }
    catch (err) {
        res.status(500).send({message: err})
        console.error(err);
    }
})

router.post('/search', async (req, res) => {
    const query = req.body.query;
    const paths = req.body.paths;
    if (query === "" || !query) {
      // if query is empty, return all courses
      try {
          const courses_pack = await courses.find().select({"_id": 1});
          let result = courses_pack.map(a => a._id);
          res.status(200).send({ids: result});
      }catch (err) {
          res.status(500).send({message: "Internal Server Error", log: err})
          console.error(err);
      }
    }
    try {
      const result = await search(query, paths, collection);
  
      res.status(200).send({ ids: result });
    } catch(err) {
      res.status(500).send({message: "Internal Server Error", log: err})
      console.error(err);
    }
  });
/*
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
*/
router.post('/ids', async (req, res) => {
  const ids = req.body.ids;
  const filter = req.body.filter;
  const batch_size = req.body.batch_size;
  const offset = req.body.offset;

  const strict_match = filter.strict_match;
  const time = filter.time;
  const department = filter.department;
  const category = filter.category;
  const enroll_method = filter.enroll_method;

  if(ids.length === 0) {
    res.status(200).send('No courses found');
  }
  else {
    if(strict_match) {
      let filter_condition = [];
      if(time !== null) {
        let record_time_list = [];
        let record_time;
        for(let i=0; i<time.length; i++) {
          if(time[i].length != 0) {
            let constraint_title = 'time_loc_pair.time.' + (i+1);
            let constraint_clause = {
              [constraint_title]: time[i]
            }
            record_time_list.push(constraint_clause);
          }
        }
        if(record_time_list.length != 0) {
          record_time = {
            $or: record_time_list
          }
          filter_condition.push(record_time); 
        }
      }

      if(department !== null && department.length != 0) {
        let dep_list = [];
        let dep;
        for(let i=0; i<department.length; i++) {
          let dep_clause = {
            "departments_dependency": department[i]
          }
          dep_list.push(dep_clause);
        }
        dep = {
          $or: dep_list
        }
        filter_condition.push(dep);
      }

      if(category !== null && category.length != 0) {
        let cat_list = [];
        let cat;
        for(let i=0; i<category.length; i++) {
          let cat_clause = {
            "category": category[i]
          }
          cat_list.push(cat_clause);
        }
        cat = {
          $or: cat_list
        }
        filter_condition.push(cat);
      }
      
      if(enroll_method !== null) {
        let enroll = {
          "enroll_method": enroll_method
        }
        filter_condition.push(enroll);
      }

      let search;
      if(filter_condition.length == 0) {
        search = {
          "_id": {$in: ids}
        }
      }
      else {
        search = {
          $and: [
            {"_id": {$in: ids}},
            {$and: filter_condition}
          ]
        }
      }
      try {
        const result_num = await courses.find(search).count();
        const result = await courses.find(search).skip(offset).limit(batch_size);
        if(offset == 0) {
          res.status(200).send({courses: result, total_count: result_num});
        }
        else {
          res.status(200).send({courses: result, total_count: null});
        }
      }
      catch (err) {
        res.status(500).send({message: err});
      }
    }
    else {
      let filter_condition = [];
      if(time !== null) {
        let record_time_list = [];
        let record_time;
        for(let i=0; i<time.length; i++) {
          if(time[i].length != 0) {
            let constraint_title = 'time_loc_pair.time.' + (i+1);
            let constraint_clause = {
              [constraint_title]: {$all: time[i]}
            }
            record_time_list.push(constraint_clause);
          }
        }
        if(record_time_list.length != 0) {
          record_time = {
            $or: record_time_list
          }
          filter_condition.push(record_time); 
        }
      }

      if(department !== null && department.length != 0) {
        let dep_list = [];
        let dep;
        for(let i=0; i<department.length; i++) {
          let dep_clause = {
            "departments_dependency": department[i]
          }
          dep_list.push(dep_clause);
        }
        dep = {
          $or: dep_list
        }
        filter_condition.push(dep);
      }

      if(category !== null && category.length != 0) {
        let cat_list = [];
        let cat;
        for(let i=0; i<category.length; i++) {
          let cat_clause = {
            "category": category[i]
          }
          cat_list.push(cat_clause);
        }
        cat = {
          $or: cat_list
        }
        filter_condition.push(cat);
      }
      
      if(enroll_method !== null && enroll_method.length != 0) {
        let enroll = {
          "enroll_method": enroll_method
        }
        filter_condition.push(enroll);
      }
      let search;
      if(filter_condition.length == 0) {
        search = {
          "_id": {$in: ids}
        }
      }
      else {
        search = {
          $and: [
            {"_id": {$in: ids}},
            {$or: filter_condition}
          ]
        }
      }
      try {
        const result_num = await courses.find(search).count();
        const result = await courses.find(search).skip(offset).limit(batch_size);
        if(offset == 0) {
          res.status(200).send({courses: result, total_count: result_num});
        }
        else {
          res.status(200).send({courses: result, total_count: null});
        }
      }
      catch (err) {
        res.status(500).send({message: err});
      }
    }
  }

})

export default router;
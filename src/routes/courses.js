import express from "express";
import courses from '../models/Courses';
import search from '../utils/search';
import collection from "../utils/mongo_client";
import { sendWebhookMessage } from "../utils/webhook_client";

const router = express.Router();

router.get('/', async (req, res) => {
    let courses_pack;
    try {
      courses_pack = await courses.find();
      res.status(200).send({message: courses_pack});
      console.log('Get full courses package.');
    }
    catch (err) {
      res.status(500).send({message: err})
      const fields = [
          {name: "Component", value: "Backend API endpoint"},
          {name: "Method", value: "GET"},
          {name: "Route", value: "/courses/"},
          {name: "Request Body", value: "```\n"+JSON.stringify(req.body)+"\n```"},
          {name: "Error Log", value: "```\n" + err + "\n```"}
      ]
      await sendWebhookMessage("error","Error occurred in ncn-backend.", fields);
      console.error(err);
    }
})

router.post('/search', async (req, res) => {
    const query = req.body.query;
    const paths = req.body.paths;

    try {
      if (query === "" || !query) {
        // if query is empty, return all courses
        const courses_pack = await courses.find().select({"_id": 1});
        let result = courses_pack.map(a => a._id);
        res.status(200).send({ids: result});
      }
      else {
        const result = await search(query, paths, collection);
        res.status(200).send({ ids: result });
      }
    }
    catch (err) {
      res.status(500).send({message: "Internal Server Error", log: err})
      const fields = [
        {name: "Component", value: "Backend API endpoint"},
        {name: "Method", value: "POST"},
        {name: "Route", value: "/courses/search"},
        {name: "Request Body", value: "```\n"+JSON.stringify(req.body)+"\n```"},
        {name: "Error Log", value: "```\n" + err + "\n```"}
      ]
      await sendWebhookMessage("error","Error occurred in ncn-backend.", fields);
      console.error(err);
    }
});

router.post('/ids', async (req, res) => {
  const ids = req.body.ids;
  const filter = req.body.filter;
  const batch_size = req.body.batch_size;
  const offset = req.body.offset;

  const strict_match = filter.strict_match;
  const time = filter.time;
  const department = filter.department;
  const area = filter.category;
  const enroll_method = filter.enroll_method;

  if(ids.length === 0) {
    console.log('No ids provided.');
    res.status(200).send({courses: [], total_count: 0});
    return;
  }
  else if(ids.length >= process.env.COURSE_REQUEST_LIMIT) {
    console.log('Request course ids size exceeds limit.');
    res.status(400).send({courses: [], message: 'Request course ids size exceeds limit.'});
    return;
  }
  try {
    let search;
    let filter_condition = [];
    if(strict_match) {
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

      if(area !== null && area.length != 0) {
        let cat_list = [];
        let cat;
        for(let i=0; i<area.length; i++) {
          let cat_clause = {
            "area": area[i]
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
          "enroll_method": {$in: enroll_method}
        }
        filter_condition.push(enroll);
      }
      
    }
    else {
      if(time !== null) {
        let record_time_list = [];
        let record_time;
        for(let i=0; i<time.length; i++) {
          if(time[i].length != 0) {
            let constraint_title = 'time_loc_pair.time.' + (i+1);
            let time_in_one_day = [];
            for(let j=0; j<time[i].length; j++) {
              let constraint_clause = {
                [constraint_title]: time[i][j]
              }
              time_in_one_day.push(constraint_clause);
            }
            if(time_in_one_day.length != 0) {
              record_time_list.push({
                $or: time_in_one_day
              })
            }
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

      if(area !== null && area.length != 0) {
        let cat_list = [];
        let cat;
        for(let i=0; i<area.length; i++) {
          let cat_clause = {
            "area": area[i]
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
          "enroll_method": {$in: enroll_method}
        }
        filter_condition.push(enroll);
      }
    }
  
    if(filter_condition.length === 0) {
      search = [
        {
            $match: { _id: { $in: ids } }
        },
        {
            $addFields: {
                index: { $indexOfArray: [ ids, "$_id" ] }
            }
        },
        {
            $sort: { index: 1 }
        }
      ];
    }
    else {
      search = 
      [
        {
            $match: {
              $and: [
                { _id: { $in: ids } },
                { $and: filter_condition }
              ]
            }
        },
        {
            $addFields: {
                index: { $indexOfArray: [ ids, "$_id" ] }
            }
        },
        {
            $sort: { index: 1 }
        }
      ];
    }
    const result_num = await (await courses.aggregate(search)).length;
    let result = await courses.aggregate(search).skip(offset).limit(batch_size);
    if(offset == 0) {
      res.status(200).send({courses: result, total_count: result_num});
    }
    else {
      res.status(200).send({courses: result, total_count: null});
    }
  }
  catch (err) {
    res.status(500).send({message: err});
    const fields = [
      {name: "Component", value: "Backend API endpoint"},
      {name: "Method", value: "POST"},
      {name: "Route", value: "/courses/ids"},
      {name: "Request Body", value: "```\n"+JSON.stringify(req.body)+"\n```"},
      {name: "Error Log", value: "```\n" + err + "\n```"}
    ];
    await sendWebhookMessage("error","Error occurred in ncn-backend.", fields);
  }

})

export default router;
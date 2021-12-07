import { MongoClient } from "mongodb";
const Express = require("express");
const Cors = require("cors");
const BodyParser = require("body-parser");
require("dotenv-defaults").config();
console.log("MongoDB Query");
const server = Express();
const client = new MongoClient(process.env.MONGO_URL);

var collection;

async function search(query, paths) {
  try {
      await client.connect();
      console.log("Pipeline");
      let result = await collection.aggregate([
          {$search: {
            index: 'test',
            text: {
              query: `${query}`,
              path: ["course_name", "teacher"]
            }
          }},
          {$limit: 20},
          {$project: {_id: 1, course_name: 1, teacher:1}}
      ]).toArray();
      return result;
  } catch (err) {
      throw err;
  }
}

server.get("/api/v1/search", (request, response) => {
  console.log(request.body);
  const query = request.query.query;
  console.log(query);
  try{
    search(query).then(result => {
      response.send(result);
    });
  }catch{
    response.status(500).send("Internal Server Error");
  }
});

server.listen("5000", async () => {
  try {
      await client.connect();
      collection = client.db("NTUCourse-Neo").collection("courses");
  } catch (e) {
      console.error(e);
  }
});
async function search(query, paths = ['course_name', 'teacher'], collection) {
  try {
    console.log('Start searching...');
    let objArray = await collection
      .aggregate([
        {
          $search: {
            index: 'default',
            text: {
              query: `${query}`,
              path: paths,
            },
          },
        },
        { $limit: 10000 },
        { $project: { _id: 1 } },
      ])
      .toArray();
    let result = objArray.map(a => a._id);
    return result;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export default search;

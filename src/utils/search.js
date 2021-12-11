async function search(query, paths = ['course_name', 'teacher'], collection) {
  try {
    console.log('Start searching...');
    let result = await collection
      .aggregate([
        {
          $search: {
            index: 'test',
            text: {
              query: `${query}`,
              path: paths,
            },
          },
        },
        { $limit: 20 },
        { $project: { _id: 1, id: 1, department: 1, course_code: 1, class_id: 1, course_name: 1, credit: 1, course_id: 1, is_half_year: 1, required: 1, teacher: 1, enroll_method: 1, time_loc: 1, total_slot: 1, limit: 1, note: 1, url: 1, semester: 1, departments_dependency: 1, is_intensive_course: 1, time_loc_pair: 1, provider: 1 } },
      ])
      .toArray();
    return result;
  } catch (err) {
    console.log(err);
    throw err;
  }
}

export default search;

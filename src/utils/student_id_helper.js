const validate_student_id = (student_id) => {
  // Correct format: (1 letter)(2 digits)(6 digits)
  // Example: B07505032
  if(student_id.length !== 9) {
    return false;
  }
  if(student_id.charAt(0) < 'A' || student_id.charAt(0) > 'Z') {
    return false;
  }
  return true;
};
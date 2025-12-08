const getPagination = (query) => {
  const page = parseInt(query.page) || 1;
  const limit = parseInt(query.count) || 10;
  const skip = (page - 1) * limit;

  return { skip, limit };
};
module.exports = getPagination;
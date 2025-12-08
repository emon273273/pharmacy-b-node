function paginateQuery(req) {
    const page = parseInt(req.query.page) || 1;
    const count = parseInt(req.query.count) || 10;

    const skip = (page - 1) * count;
    const take = count;

    return { page, count, skip, take };
}

module.exports = { paginateQuery };

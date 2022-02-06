const advancedResults = (model, populate, select) => async (req, res, next) => {
  const reqQuery = { ...req.query };

  const removeFields = ['select', 'sort', 'limit', 'page'];

  removeFields.forEach((p) => delete reqQuery[p]);

  let queryStr = JSON.stringify(reqQuery);

  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);

  let query = model.find(JSON.parse(queryStr));

  if (req.query.select) {
    const fields = req.query.select.replace(/\,/g, ' ');
    query = query.select(fields);
  }

  if (req.query.sort) {
    query = query.sort(req.query.sort.replace(/\,/g, ' '));
  } else {
    query = query.sort('-createdAt');
  }

  const limit = parseInt(req.query.limit) || 25;
  const page = parseInt(req.query.page) || 1;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await model.countDocuments();

  query = query.limit(limit).skip(startIndex);

  if (populate) {
    query.populate(populate, select);
  }

  const results = await query;

  const pagination = {};

  if (startIndex > 0) {
    pagination.previous = { page: page - 1, limit: limit };
  }
  pagination.current = { limit: limit, page: page };
  if (endIndex < total) {
    pagination.next = { page: page + 1, limit: limit };
  }

  res.advancedResults = {
    sucess: true,
    count: results.length,
    pagination,
    data: results,
  };
  next();
};

module.exports = advancedResults;


export const parseUserQuery = async (req, res, next) => {
  if (!req.body.userQuery) {
    const error = {
      log: 'User query not provided',
      status: 400,
      message: { err: 'An error occurred while parsing the user query' },
    };
    return next(error);
  }

  const { userQuery } = req.body;

  if (typeof userQuery !== 'string') {
    const error = {
      log: 'User query is not a string',
      status: 400,
      message: { err: 'An error occurred while parsing the user query' },
    };
    return next(error);
  }
  console.log("userquery: ", userQuery);
  res.locals.userQuery = userQuery;
  return next();
};

const responseByClientError = (h, { message, statusCode }) => {
  const response = h.response({
    status: 'fail',
    message,
  });

  response.code(statusCode);

  return response;
};

const responseByServerError = (h, error = 'Server Error') => {
  const response = h.response({
    status: 'error',
    message: 'Maaf, terjadi kegagalan pada server kami.',
  });

  response.code(500);

  console.log(error);

  return response;
};

const successResponse = (h, { data = {}, message = '', statusCode = 200 }) => {
  const response = h.response({
    status: 'success',
    message,
    data,
  });

  response.code(statusCode);

  return response;
};

module.exports = { responseByClientError, responseByServerError, successResponse };

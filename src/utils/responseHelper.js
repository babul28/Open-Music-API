const responseByClientError = (h, error) => {
  const response = h.response({
    status: 'fail',
    message: error.message,
  });

  response.code(error.statusCode);

  return response;
};

const responseByServerError = (h, error) => {
  const response = h.response({
    status: 'error',
    message: 'Maaf, terjadi kegagalan pada server kami.',
  });

  response.code(500);

  console.log(error);

  return response;
};

module.exports = { responseByClientError, responseByServerError };

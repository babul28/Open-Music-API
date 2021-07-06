const ClientError = require('../../exceptions/ClientError');

class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postSongHandler = this.postSongHandler.bind(this);
  }

  async postSongHandler(request, h) {
    try {
      const {
        title, year, performer, genre, duration,
      } = request.payload;

      this._validator.validateSongPayload(request.payload);

      const songId = await this._service.storeNewSong({
        title, year, performer, genre, duration,
      });

      const response = h.response({
        status: 'success',
        message: 'Song berhasil ditambahkan',
        data: {
          songId,
        },
      });

      response.code(201);

      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });

        response.code(error.statusCode);

        return response;
      }

      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });

      console.log(error);

      response.code(500);

      return response;
    }
  }
}

module.exports = SongsHandler;

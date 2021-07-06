const ClientError = require('../../exceptions/ClientError');
const { responseByClientError, responseByServerError } = require('../../utils/responseHelper');

class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postSongHandler = this.postSongHandler.bind(this);
    this.getAllSongsHandler = this.getAllSongsHandler.bind(this);
    this.getSongByIdHandler = this.getSongByIdHandler.bind(this);
    this.putSongByIdHandler = this.putSongByIdHandler.bind(this);
    this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
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
        return responseByClientError(h, error);
      }

      return responseByServerError(h, error);
    }
  }

  async getAllSongsHandler(request, h) {
    try {
      const songs = await this._service.getAllSongs();

      const response = h.response({
        status: 'success',
        data: {
          songs,
        },
      });

      response.code(200);

      return response;
    } catch (error) {
      return responseByServerError(h, error);
    }
  }

  async getSongByIdHandler(request, h) {
    try {
      const { songId } = request.params;

      const song = await this._service.findSongById(songId);

      const response = h.response({
        status: 'success',
        data: {
          song,
        },
      });

      response.code(200);

      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        return responseByClientError(h, error);
      }

      return responseByServerError(h, error);
    }
  }

  async putSongByIdHandler(request, h) {
    try {
      const { songId } = request.params;

      this._validator.validateSongPayload(request.payload);

      await this._service.updateSongById(songId, request.payload);

      const response = h.response({
        status: 'success',
        message: 'Successfully update a specified song',
      });

      response.code(200);

      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        return responseByClientError(h, error);
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

  async deleteSongByIdHandler(request, h) {
    try {
      const { songId } = request.params;

      await this._service.destorySongById(songId);

      const response = h.response({
        status: 'success',
        message: 'Successfully delete a specified song',
      });

      response.code(200);

      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        return responseByClientError(h, error);
      }

      return responseByServerError(h, error);
    }
  }
}

module.exports = SongsHandler;

const ClientError = require('../../exceptions/ClientError');
const { responseByClientError, responseByServerError, successResponse } = require('../../utils/responseHelper');

class PlaylistHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getAllPlaylistsHandler = this.getAllPlaylistsHandler.bind(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
  }

  async postPlaylistHandler(request, h) {
    try {
      this._validator.validatePlaylistPayload(request.payload);

      const { name } = request.payload;
      const { id: credentialId } = request.auth.credentials;

      const playlistId = await this._service.storeNewPlaylist({
        name, owner: credentialId,
      });

      return successResponse(h, {
        message: 'Playlist berhasil ditambahkan',
        data: {
          playlistId,
        },
        statusCode: 201,
      });
    } catch (error) {
      if (error instanceof ClientError) {
        return responseByClientError(h, error);
      }

      return responseByServerError(h, error);
    }
  }

  async getAllPlaylistsHandler(request, h) {
    try {
      const { id: credentialId } = request.auth.credentials;

      const playlists = await this._service.getAllPlaylists(credentialId);

      return successResponse(h, {
        message: 'Sukses mendapatkan daftar playlist',
        data: { playlists },
      });
    } catch (error) {
      if (error instanceof ClientError) {
        return responseByClientError(h, error);
      }

      return responseByServerError(h, error);
    }
  }

  async deletePlaylistByIdHandler(request, h) {
    try {
      const { playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._service.verifyPlaylistOwner(playlistId, credentialId);

      await this._service.deletePlaylistById(playlistId);

      return successResponse(h, {
        message: 'Playlist berhasil dihapus',
      });
    } catch (error) {
      if (error instanceof ClientError) {
        return responseByClientError(h, error);
      }

      return responseByServerError(h, error);
    }
  }
}

module.exports = PlaylistHandler;

const ClientError = require('../../exceptions/ClientError');
const { responseByClientError, responseByServerError, successResponse } = require('../../utils/responseHelper');

class PlaylistSongHandler {
  constructor(playlistService, playlistSongService, validator) {
    this._playlistService = playlistService;
    this._playlistSongService = playlistSongService;
    this._validator = validator;

    this.postPlaylistSongHandler = this.postPlaylistSongHandler.bind(this);
    this.getAllPlaylistSongHandler = this.getAllPlaylistSongHandler.bind(this);
    this.deletePlaylistSongHandler = this.deletePlaylistSongHandler.bind(this);
  }

  async postPlaylistSongHandler(request, h) {
    try {
      this._validator.validatePlaylistSongPayload(request.payload);

      const { playlistId } = request.params;
      const { songId } = request.payload;
      const { id: credentialId } = request.auth.credentials;

      await this._playlistService.verifyPlaylistAccess(playlistId, credentialId);

      await this._playlistSongService.addSongToPlaylist(playlistId, songId);

      return successResponse(h, {
        message: 'Lagu berhasil ditambahkan ke playlist',
        statusCode: 201,
      });
    } catch (error) {
      if (error instanceof ClientError) {
        return responseByClientError(h, error);
      }

      return responseByServerError(h, error);
    }
  }

  async getAllPlaylistSongHandler(request, h) {
    try {
      const { playlistId } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._playlistService.verifyPlaylistAccess(playlistId, credentialId);
      const songs = await this._playlistSongService.getAllPlaylistSongs(playlistId);

      return successResponse(h, {
        message: 'Daftar lagu dari playlist berhasil didapatkan',
        data: { songs },
      });
    } catch (error) {
      if (error instanceof ClientError) {
        return responseByClientError(h, error);
      }

      return responseByServerError(h, error);
    }
  }

  async deletePlaylistSongHandler(request, h) {
    try {
      this._validator.validatePlaylistSongPayload(request.payload);

      const { playlistId } = request.params;
      const { songId } = request.payload;
      const { id: credentialId } = request.auth.credentials;

      await this._playlistService.verifyPlaylistAccess(playlistId, credentialId);

      await this._playlistSongService.deleteSongFromPlaylist(playlistId, songId);

      return successResponse(h, {
        message: 'Lagu berhasil dihapus dari playlist',
      });
    } catch (error) {
      if (error instanceof ClientError) {
        return responseByClientError(h, error);
      }

      return responseByServerError(h, error);
    }
  }
}

module.exports = PlaylistSongHandler;

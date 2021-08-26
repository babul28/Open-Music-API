const ClientError = require('../../exceptions/ClientError');
const { responseByClientError, responseByServerError, successResponse } = require('../../utils/responseHelper');

class ExportsHandler {
  constructor(playlistService, exportPlaylistService, validator) {
    this._playlistService = playlistService;
    this._exportPlaylistService = exportPlaylistService;
    this._validator = validator;

    this.postExportPlaylistHandler = this.postExportPlaylistHandler.bind(this);
  }

  async postExportPlaylistHandler(request, h) {
    try {
      this._validator.validateExportPlaylistPayload(request.payload);

      const { id: credentialId } = request.auth.credentials;
      const { playlistId } = request.params;

      await this._playlistService.verifyPlaylistOwner(playlistId, credentialId);

      const message = {
        playlistId,
        targetEmail: request.payload.targetEmail,
      };

      await this._exportPlaylistService.dispatch(JSON.stringify(message));

      return successResponse(h, {
        status: 'success',
        message: 'Permintaan Anda dalam antrean',
        statusCode: 201,
      });
    } catch (error) {
      if (error instanceof ClientError) {
        return responseByClientError(h, error);
      }

      return responseByServerError(h, error);
    }
  }
}

module.exports = ExportsHandler;

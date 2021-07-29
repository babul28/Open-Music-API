const ClientError = require('../../exceptions/ClientError');
const { responseByClientError, responseByServerError, successResponse } = require('../../utils/responseHelper');

class CollaborationHandler {
  constructor(collaborationService, playlistService, validator) {
    this._collaborationService = collaborationService;
    this._playlistService = playlistService;
    this._validator = validator;

    this.postCollaborationHandler = this.postCollaborationHandler.bind(this);
    this.deleteCollaborationHandler = this.deleteCollaborationHandler.bind(this);
  }

  async postCollaborationHandler(request, h) {
    try {
      this._validator.validateCollaborationPayload(request.payload);

      const { id: credentialId } = request.auth.credentials;
      const { playlistId, userId } = request.payload;

      await this._playlistService.verifyPlaylistOwner(playlistId, credentialId);

      const collaborationId = await this._collaborationService
        .addNewCollaboration(playlistId, userId);

      return successResponse(h, {
        message: 'Kolaborasi berhasil ditambahkan',
        data: { collaborationId },
        statusCode: 201,
      });
    } catch (error) {
      if (error instanceof ClientError) {
        return responseByClientError(h, error);
      }
      // Server ERROR!
      return responseByServerError(h, error);
    }
  }

  async deleteCollaborationHandler(request, h) {
    try {
      this._validator.validateCollaborationPayload(request.payload);

      const { id: credentialId } = request.auth.credentials;
      const { playlistId, userId } = request.payload;

      await this._playlistService.verifyPlaylistOwner(playlistId, credentialId);

      await this._collaborationService.deleteCollaboration(playlistId, userId);

      return {
        status: 'success',
        message: 'Kolaborasi berhasil dihapus',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        return responseByClientError(h, error);
      }
      // Server ERROR!
      return responseByServerError(h, error);
    }
  }
}

module.exports = CollaborationHandler;

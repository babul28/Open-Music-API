const ClientError = require('../../exceptions/ClientError');
const { responseByClientError, responseByServerError, successResponse } = require('../../utils/responseHelper');

class AuthenticationsHandler {
  constructor(authenticationService, userService, tokenManager, validator) {
    this._authenticationService = authenticationService;
    this._userService = userService;
    this._tokenManager = tokenManager;
    this._validator = validator;

    this.postAuthenticationHandler = this.postAuthenticationHandler.bind(this);
    this.putAuthenticationHandler = this.putAuthenticationHandler.bind(this);
    this.deleteAuthenticationHandler = this.deleteAuthenticationHandler.bind(this);
  }

  async postAuthenticationHandler(request, h) {
    try {
      this._validator.validatePostAuthenticationPayload(request.payload);

      const { username, password } = request.payload;
      const id = await this._userService.verifyUserCredential(username, password);

      const accessToken = this._tokenManager.generateAccessToken({ id });
      const refreshToken = this._tokenManager.generateRefreshToken({ id });

      await this._authenticationService.storeNewRefreshToken(refreshToken);

      return successResponse(h, {
        message: 'Authentication berhasil ditambahkan',
        data: {
          accessToken,
          refreshToken,
        },
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

  async putAuthenticationHandler(request, h) {
    try {
      this._validator.validatePutAuthenticationPayload(request.payload);

      const { refreshToken } = request.payload;
      await this._authenticationService.verifyRefreshToken(refreshToken);
      const { id } = this._tokenManager.verifyRefreshToken(refreshToken);

      const accessToken = this._tokenManager.generateAccessToken({ id });

      return successResponse(h, {
        message: 'Access Token berhasil diperbarui',
        data: {
          accessToken,
        },
      });
    } catch (error) {
      if (error instanceof ClientError) {
        return responseByClientError(h, error);
      }

      // Server ERROR!
      return responseByServerError(h, error);
    }
  }

  async deleteAuthenticationHandler(request, h) {
    try {
      this._validator.validateDeleteAuthenticationPayload(request.payload);

      const { refreshToken } = request.payload;
      await this._authenticationService.verifyRefreshToken(refreshToken);
      await this._authenticationService.deleteRefreshToken(refreshToken);

      return successResponse(h, { message: 'Refresh token berhasil dihapus' });
    } catch (error) {
      if (error instanceof ClientError) {
        return responseByClientError(h, error);
      }

      // Server ERROR!
      return responseByServerError(h, error);
    }
  }
}

module.exports = AuthenticationsHandler;

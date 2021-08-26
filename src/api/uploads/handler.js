const ClientError = require('../../exceptions/ClientError');
const { responseByClientError, responseByServerError, successResponse } = require('../../utils/responseHelper');

class UploadsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postUploadImageHandler = this.postUploadImageHandler.bind(this);
  }

  async postUploadImageHandler(request, h) {
    try {
      const { data } = request.payload;
      this._validator.validateImageHeaders(data.hapi.headers);

      const filename = await this._service.writeFile(data, data.hapi);

      return successResponse(h, {
        status: 'success',
        message: 'Gambar berhasil diunggah',
        data: {
          pictureUrl: `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`,
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
}

module.exports = UploadsHandler;

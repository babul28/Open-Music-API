const routes = (handler) => [
  {
    method: 'POST',
    path: '/songs',
    handler: handler.postSongHandler,
  },
  {
    method: 'GET',
    path: '/songs',
    handler: handler.getAllSongsHandler,
  },
  {
    method: 'GET',
    path: '/songs/{songId}',
    handler: handler.getSongByIdHandler,
  },
  {
    method: 'PUT',
    path: '/songs/{songId}',
    handler: handler.putSongByIdHandler,
  },
  {
    method: 'DELETE',
    path: '/songs/{songId}',
    handler: handler.deleteSongByIdHandler,
  },
];

module.exports = routes;

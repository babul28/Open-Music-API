const PlaylistSongHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'playlist-songs',
  version: '1.0.0',
  register: async (server, { playlistService, playlistSongService, validator }) => {
    const playlistHandler = new PlaylistSongHandler(
      playlistService,
      playlistSongService,
      validator,
    );
    server.route(routes(playlistHandler));
  },
};

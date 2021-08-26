const ExportsHandler = require('./handler');
const routes = require('./routes');

module.exports = {
  name: 'exports',
  version: '1.0.0',
  register: async (server, { playlistService, exportPlaylistService, validator }) => {
    const exportsHandler = new ExportsHandler(playlistService, exportPlaylistService, validator);
    server.route(routes(exportsHandler));
  },
};

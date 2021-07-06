require('dotenv').config();

const Hapi = require('@hapi/hapi');
const songs = require('./api/songs/index');
const SongService = require('./services/postgres/SongService');
const SongValidator = require('./validator/songs/index');

const init = async () => {
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

  await server.register({
    plugin: songs,
    options: {
      service: new SongService(),
      validator: SongValidator,
    },
  });

  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

init();

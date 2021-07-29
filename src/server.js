require('dotenv').config();

const Hapi = require('@hapi/hapi');

// Songs
const songs = require('./api/songs/index');
const SongService = require('./services/postgres/SongService');
const SongValidator = require('./validator/songs/index');

// Users
const users = require('./api/users/index');
const UserService = require('./services/postgres/UserService');
const UserValidator = require('./validator/users/index');

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

  await server.register([
    {
      plugin: songs,
      options: {
        service: new SongService(),
        validator: SongValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: new UserService(),
        validator: UserValidator,
      },
    },
  ]);

  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

init();

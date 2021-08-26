require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Inert = require('@hapi/inert');
const Jwt = require('@hapi/jwt');
const path = require('path');

// Songs
const songs = require('./api/songs/index');
const SongService = require('./services/postgres/SongService');
const SongValidator = require('./validator/songs/index');

// Users
const users = require('./api/users/index');
const UserService = require('./services/postgres/UserService');
const UserValidator = require('./validator/users/index');

// Authentications
const authentications = require('./api/authentications');
const AuthenticationService = require('./services/postgres/AuthenticationService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');

// Playlists
const playlists = require('./api/playlists/index');
const PlaylistService = require('./services/postgres/PlaylistService');
const PlaylistValidator = require('./validator/playlists/index');

// Playlist Songs
const playlistSongs = require('./api/playlist-songs/index');
const PlaylistSongService = require('./services/postgres/PlaylistSongService');
const PlaylistSongValidator = require('./validator/playlist-songs/index');

// Collaborations
const collaborations = require('./api/collaborations/index');
const CollaborationService = require('./services/postgres/CollaborationService');
const CollaborationValidator = require('./validator/collaborations/index');

// Exports
const _exports = require('./api/exports');
const ExportPlaylistService = require('./services/rabbitmq/ExportPlaylistService');
const ExportsValidator = require('./validator/exports');

// uploads
const uploads = require('./api/uploads');
const StorageService = require('./services/storage/StorageService');
const UploadsValidator = require('./validator/uploads');

// Cache
const CacheService = require('./services/redis/CacheService');

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

  // registrasi plugin eksternal
  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
    },
  ]);

  // Define strategy for authentication user
  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  const songService = new SongService();
  const userService = new UserService();
  const authenticationService = new AuthenticationService();
  const collaborationService = new CollaborationService();
  const cacheService = new CacheService();
  const playlistService = new PlaylistService(collaborationService, cacheService);
  const playlistSongService = new PlaylistSongService(songService, cacheService);
  const storageService = new StorageService(path.resolve(__dirname, 'api/uploads/file/images'));

  // register custom plugin
  await server.register([
    {
      plugin: songs,
      options: {
        service: songService,
        validator: SongValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: userService,
        validator: UserValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationService,
        userService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        service: playlistService,
        validator: PlaylistValidator,
      },
    },
    {
      plugin: playlistSongs,
      options: {
        playlistService,
        playlistSongService,
        validator: PlaylistSongValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        collaborationService,
        playlistService,
        validator: CollaborationValidator,
      },
    },
    {
      plugin: _exports,
      options: {
        playlistService,
        exportPlaylistService: ExportPlaylistService,
        validator: ExportsValidator,
      },
    },
    {
      plugin: uploads,
      options: {
        service: storageService,
        validator: UploadsValidator,
      },
    },
  ]);

  await server.start();
  console.log(`Server running on ${server.info.uri}`);
};

init();

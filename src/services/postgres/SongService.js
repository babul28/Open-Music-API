const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const mapDBToModel = require('../../utils/mapDBToModel');

class SongService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async storeNewSong({
    title, year, performer, genre, duration,
  }) {
    const id = `song-${nanoid(16)}`;
    const insertedAt = new Date().toISOString();
    const updatedAt = insertedAt;

    const query = {
      text: 'INSERT INTO songs VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      values: [id, title, year, performer, genre, duration, insertedAt, updatedAt],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Song gagal ditambahkan');
    }

    await this._cacheService.delete(this._generateSongsCacheName());

    return result.rows[0].id;
  }

  async getAllSongs() {
    try {
      const result = await this._cacheService.get(this._generateSongsCacheName());

      return JSON.parse(result);
    } catch (error) {
      const result = await this._pool.query('SELECT id, title, performer FROM songs');

      await this._cacheService.set(this._generateSongsCacheName(), JSON.stringify(result.rows));

      return result.rows;
    }
  }

  async findSongById(songId) {
    const query = {
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Song is Not Found!!');
    }

    return result.rows.map(mapDBToModel)[0];
  }

  async updateSongById(
    songId,
    {
      title, year, performer, genre, duration,
    },
  ) {
    const updatedAt = new Date().toISOString;

    const query = {
      text: 'UPDATE songs SET title = $1, year = $2, performer = $3, genre = $4, duration = $5, updated_at = $6 WHERE id = $7 RETURNING id',
      values: [title, year, performer, genre, duration, updatedAt, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Cannot update the song. Id not found!');
    }

    await this._cacheService.delete(this._generateSongsCacheName());
  }

  async destorySongById(songId) {
    const query = {
      text: 'DELETE FROM songs WHERE id = $1 RETURNING id',
      values: [songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new NotFoundError('Cannot delete the song. Id not found!');
    }

    await this._cacheService.delete(this._generateSongsCacheName());
  }

  // eslint-disable-next-line class-methods-use-this
  _generateSongsCacheName() {
    return 'songs';
  }
}

module.exports = SongService;

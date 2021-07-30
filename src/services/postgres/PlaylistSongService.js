const { nanoid } = require('nanoid');
const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');

class PlaylistSongService {
  constructor(songService) {
    this._pool = new Pool();
    this._songService = songService;
  }

  async addSongToPlaylist(playlistId, songId) {
    await this._songService.findSongById(songId);

    const id = `playlist-song-${nanoid(16)}`;

    const query = {
      text: 'INSERT INTO playlist_songs VALUES ($1, $2, $3) RETURNING playlist_id',
      values: [id, playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist');
    }
  }

  async getAllPlaylistSongs(playlistId) {
    const query = {
      text: `SELECT s.id, s.title, s.performer FROM playlists p, playlist_songs ps, songs s
              WHERE p.id = $1 AND p.id = ps.playlist_id AND s.id = ps.song_id`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);

    return result.rows;
  }

  async deleteSongFromPlaylist(playlistId, songId) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id = $1 AND song_id = $2 RETURNING playlist_id',
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);

    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal dihapus dari playlist, id lagu tidak ditemukan');
    }
  }
}

module.exports = PlaylistSongService;

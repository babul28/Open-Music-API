/* eslint-disable camelcase */
const mapDBToModel = ({
  id, title, year, performer, genre, duration, inserted_at, updated_at,
}) => ({
  id,
  title,
  year: parseInt(year, 10),
  performer,
  genre,
  duration: parseInt(duration, 10),
  insertedAt: inserted_at,
  updatedAt: updated_at,
});

module.exports = mapDBToModel;

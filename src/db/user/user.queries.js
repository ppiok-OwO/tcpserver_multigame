export const SQL_QUERIES = {
  FIND_USER_BY_ID: 'SELECT * FROM user WHERE id = ?',
  CREATE_USER: 'INSERT INTO user (id) VALUES (?)',
  UPDATE_USER_LOGIN:
    'UPDATE user SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
  UPDATE_LAST_LOCATION:
    'UPDATE user SET last_location_x = ?, last_location_y = ? WHERE id = ?;',
  UPDATE_LAST_GAME_ID: 'UPDATE user SET last_gameId = ? WHERE id = ?;',
};

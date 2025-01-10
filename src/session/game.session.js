import { gameSessions } from './sessions.js';
import Game from '../classes/models/game.class.js';
import { getUserById } from './user.session.js';

export const addGameSession = () => {
  const session = new Game();
  gameSessions.push(session);

  // console.log('gameSessions', gameSessions);
  // console.log('users', gameSessions.users);

  console.log('게임 세션 생성!');

  return session;
};

export const removeGameSession = (id) => {
  const index = gameSessions.findIndex((session) => session.id === id);
  if (index !== -1) {
    return gameSessions.splice(index, 1)[0];
  }
};

export const removeUserInSession = (userId, gameId) => {
  const session = getGameSession(gameId);
  session.removeUser(userId);

  if (session.users.length === 0) {
    removeGameSession(gameId);
  }
};

export const getGameSession = (id) => {
  return gameSessions.find((session) => session.id === id);
};

export const getAllGameSessions = () => {
  return gameSessions;
};

export const getUserLocationInSession = (session) => {
  let data = {};
  data.users = [];

  for (const element of session) {
    const user = getUserById(element.id);

    data.users.push({
      id: user.id,
      playerId: user.playerId,
      x: user.x,
      y: user.y,
    });
  }

  return data;
};

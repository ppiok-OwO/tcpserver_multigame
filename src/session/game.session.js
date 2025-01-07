import { gameSessions } from './sessions.js';
import Game from '../classes/models/game.class.js';
import { v4 as uuidv4 } from 'uuid';

export const addGameSession = () => {
  const sessionId = uuidv4();
  const session = new Game();
  session.setGameId(sessionId);
  gameSessions.push(session);
  return session;
};

export const removeGameSession = (id) => {
  const index = gameSessions.findIndex((session) => session.id === id);
  if (index !== -1) {
    return gameSessions.splice(index, 1)[0];
  }
};

export const getGameSession = (id) => {
  return gameSessions.find((session) => session.id === id);
};

export const getAllGameSessions = () => {
  return gameSessions;
};

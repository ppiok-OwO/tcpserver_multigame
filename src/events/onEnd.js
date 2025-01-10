import { updateLastLocation } from '../db/user/user.db.js';
import { removeUserInSession } from '../session/game.session.js';
import { gameSessions, userSessions } from '../session/sessions.js';
import { getUserBySocket, removeUser } from '../session/user.session.js';

export const onEnd = (socket) => async () => {
  // console.log('클라이언트 연결이 종료되었습니다.');

  // console.log(userSessions);
  // console.log(gameSessions);

  // 플레이어의 마지막 위치 저장
  const user = getUserBySocket(socket);
  await updateLastLocation(user.x, user.y, user.id);

  // 세션에서 유저 삭제
  removeUser(socket);
  // 게임 세션에서 유저 삭제, 세션의 유저 배열이 빈 배열이면 세션도 삭제
  removeUserInSession(user.id, user.gameId);
};

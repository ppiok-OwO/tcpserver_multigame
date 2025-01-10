import { getUserById, removeUser } from '../../session/user.session.js';
import { removeUserInSession } from '../../session/game.session.js';
import { gameSessions, userSessions } from '../../session/sessions.js';

export const disconnectHandler = async ({ socket, userId }) => {
  console.log('클라이언트가 연결을 종료했습니다.');

  const user = getUserById(userId);

  // 세션에서 유저 삭제
  removeUser(socket);
  // 게임 세션에서 유저 삭제, 세션의 유저 배열이 빈 배열이면 세션도 삭제
  removeUserInSession(user.id, user.gameId);

  console.log('유저 세션', userSessions);
  console.log('게임 세션', gameSessions);

  socket.destroy(); // 정상적으로 소켓 종료
};

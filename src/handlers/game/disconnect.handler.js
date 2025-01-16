import { getUserById, removeUser } from '../../session/user.session.js';
import { removeUserInSession } from '../../session/game.session.js';
import { gameSessions, userSessions } from '../../session/sessions.js';
import { updateLastGameId, updateLastLocation } from '../../db/user/user.db.js';

export const disconnectHandler = async ({ socket, userId }) => {
  console.log('클라이언트가 연결을 종료했습니다.');

  const user = getUserById(userId);

  if (!user) {
    throw new CustomError(
      ErrorCodes.USER_NOT_FOUND,
      '유저를 찾을 수 없습니다.',
    );
  }

  // 플레이어의 마지막 위치 저장
  await updateLastLocation(user.x, user.y, user.id);
  // 플레이어의 마지막 게임 세션 ID 저장
  await updateLastGameId(user.gameId, user.id);

  // 세션에서 유저 삭제
  removeUser(socket);
  // 게임 세션에서 유저 삭제, 세션의 유저 배열이 빈 배열이면 세션도 삭제
  removeUserInSession(user.id, user.gameId);

  console.log('유저 세션', userSessions);
  console.log('게임 세션', gameSessions);

  socket.destroy(); // 정상적으로 소켓 종료
};

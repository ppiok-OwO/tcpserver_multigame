import { handleError } from '../../utils/error/errorHandler.js';
import CustomError from '../../utils/error/custom.error.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';
import { getGameSession } from '../../session/game.session.js';
import { getUserById } from '../../session/user.session.js';
import { createMonsterPacket } from '../../utils/notification/game.notification.js';

export const monsterBroadcastHandler = async ({ socket, userId, payload }) => {
  try {
    const user = await getUserById(userId);
    if (!user) {
      throw new CustomError(
        ErrorCodes.USER_NOT_FOUND,
        '유저를 찾을 수 없습니다.',
      );
    }
    const gameId = user.gameId;

    const gameSession = getGameSession(gameId);

    if (!gameSession) {
      throw new CustomError(
        ErrorCodes.GAME_NOT_FOUND,
        '게임 세션을 찾을 수 없습니다.',
      );
    }

    const data = createMonsterPacket(gameSession.monsters);

    socket.write(data);
  } catch (error) {
    handleError(socket, error);
  }
};

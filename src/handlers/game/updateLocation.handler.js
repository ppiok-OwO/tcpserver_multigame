import { handleError } from '../../utils/error/errorHandler.js';
import CustomError from '../../utils/error/custom.error.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';
import { addGameSession, getGameSession } from '../../session/game.session.js';
import { getUserById } from '../../session/user.session.js';
import { userSessions } from '../../session/sessions.js';
import { createLocationPacket } from '../../utils/notification/game.notification.js';

const updateLocationHandler = async ({ socket, userId, payload }) => {
  try {
    // const { x, y } = payload;
    // 이 좌표는 나중에 검증용으로 쓸까?

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

    if (!user) {
      throw new CustomError(
        ErrorCodes.USER_NOT_FOUND,
        '유저를 찾을 수 없습니다.',
      );
    }

    // user.updatePosition(x, y);
    // const packet = gameSession.getAllLocation();

    const data = createLocationPacket(gameSession.users);

    // console.log('data: ', data);
    // console.log('gameSession.users: ', gameSession.users);

    socket.write(data);
  } catch (error) {
    handleError(socket, error);
  }
};

export default updateLocationHandler;

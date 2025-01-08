import { handleError } from '../../utils/error/errorHandler.js';
import CustomError from '../../utils/error/custom.error.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';
import { addGameSession, getGameSession } from '../../session/game.session.js';
import { getUserById } from '../../session/user.session.js';

const updateLocationHandler = async ({ socket, userId, payload }) => {
  try {
    const { x, y } = payload;
    const user = await getUserById(userId);
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

    user.updatePosition(x, y);
    // const packet = gameSession.getAllLocation();

    // socket.write(packet);
  } catch (error) {
    handleError(socket, error);
  }
};

export default updateLocationHandler;

import { handleError } from '../../utils/error/errorHandler.js';
import CustomError from '../../utils/error/custom.error.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';
import { getUserById } from '../../session/user.session.js';
import { userSessions } from '../../session/sessions.js';

const updateLocationHandler = ({ socket, userId, payload }) => {
  try {
    // const { gameId, x, y } = payload;
    const { x, y } = payload;
    console.log('userId: ', userId);
    // console.log('users: ', userSessions);

    const user = getUserById(userId);

    // const gameSession = getGameSession();

    // if (!gameSession) {
    //   throw new CustomError(
    //     ErrorCodes.GAME_NOT_FOUND,
    //     '게임 세션을 찾을 수 없습니다.',
    //   );
    // }

    // const user = gameSession.getUser(userId);
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

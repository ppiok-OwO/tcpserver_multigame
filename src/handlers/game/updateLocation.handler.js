import { handleError } from '../../utils/error/errorHandler.js';
import CustomError from '../../utils/error/custom.error.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';
import { addGameSession, getGameSession } from '../../session/game.session.js';
import { getUserById } from '../../session/user.session.js';
import { userSessions } from '../../session/sessions.js';
import { createLocationPacket } from '../../utils/notification/game.notification.js';

const updateLocationHandler = async ({ socket, userId, payload }) => {
  try {
    const { x, y } = payload;

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

    // 클라이언트가 보낸 좌표를 서버가 가진 user의 좌표와 비교했을 때, 오차 범위 내인지 판정
    // 서버 기준에선 클라이언트가 과거에 있는 거기 때문에 레이턴시 기반으로 범위 내에 있는지만 봐야 할 듯
    const result = user.validatePosition(gameSession.getMaxLatency(), x, y);
    if (!result) {
      // throw new CustomError(
      //   ErrorCodes.INVALID_POSITION,
      //   '올바르지 않은 좌표입니다.',
      // );
      console.log('클라이언트 좌표 : ', x, y);
      console.log('서버 좌표 : ', user.x, user.y);
    }

    const data = createLocationPacket(gameSession.users);

    // console.log('data: ', data);
    // console.log('gameSession.users: ', gameSession.users);

    socket.write(data);
  } catch (error) {
    handleError(socket, error);
  }
};

export default updateLocationHandler;

import { addUser, getUserById } from '../../session/user.session.js';
import { createResponse } from '../../utils/response/createResponse.js';
import {
  HANDLER_IDS,
  RESPONSE_SUCCESS_CODE,
} from '../../constants/handlerIds.js';
import { handleError } from '../../utils/error/errorHandler.js';
import { findUserByDeviceID, updateUserLogin } from '../../db/user/user.db.js';
import { createUser } from '../../db/user/user.db.js';
import { addGameSession } from '../../session/game.session.js';
import CustomError from '../../utils/error/custom.error.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';

const initialHandler = async ({ socket, userId, payload }) => {
  try {
    const { deviceId, playerId, latency } = payload;

    let user = await findUserByDeviceID(deviceId);

    if (!user) {
      user = await createUser(deviceId, playerId, latency);
    } else {
      await updateUserLogin(user.id);
    }

    user = addUser(socket, user.id);

    const gameSession = addGameSession();
    gameSession.setGameId();

    if (!user) {
      throw new CustomError(
        ErrorCodes.USER_NOT_FOUND,
        '유저를 찾을 수 없습니다.',
      );
    }
    // 게임 세션에 유저를 추가하고, 유저에게 게임 세션의 id를 부여한다.
    gameSession.addUser(user);
    user.setGameId(gameSession.id);

    const initailResponse = createResponse(
      HANDLER_IDS.INITIAL,
      RESPONSE_SUCCESS_CODE,
      { userId: user.id, playerId: playerId },
      deviceId,
    );

    // 소켓을 통해 클라이언트에게 응답 메시지 전송
    socket.write(initailResponse);
  } catch (err) {
    handleError(socket, err);
  }
};

export default initialHandler;

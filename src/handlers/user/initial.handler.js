import { addUser, getUserById } from '../../session/user.session.js';
import { createResponse } from '../../utils/response/createResponse.js';
import {
  HANDLER_IDS,
  RESPONSE_SUCCESS_CODE,
} from '../../constants/handlerIds.js';
import { handleError } from '../../utils/error/errorHandler.js';
import { findUserByDeviceID, updateUserLogin } from '../../db/user/user.db.js';
import { createUser } from '../../db/user/user.db.js';
import {
  addGameSession,
  getAllGameSessions,
} from '../../session/game.session.js';
import CustomError from '../../utils/error/custom.error.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';

const initialHandler = async ({ socket, userId, payload }) => {
  try {
    // console.log('이니셜 핸들러 실행!');

    const { deviceId, playerId, latency } = payload;

    // console.log('플레이어 id야 나와라', playerId);

    // DB에서 유저 데이터를 찾는다.
    let user = await findUserByDeviceID(deviceId);
    let x = null;
    let y = null;

    // console.log('DB에서 검색된 유저:', user);

    if (!user) {
      user = await createUser(deviceId, playerId, latency);
    } else {
      await updateUserLogin(user.id);
      x = user.lastLocationX;
      y = user.lastLocationY;
    }

    // 유저 세션에 유저 추가, 유저 객체 반환
    user = addUser(socket, user.id, playerId, x, y);

    if (!user) {
      throw new CustomError(
        ErrorCodes.USER_NOT_FOUND,
        '유저를 찾을 수 없습니다.',
      );
    }

    // 게임 세션이 없으면 객체를 만들고 유저에게 게임 객체의 id(uuid)를 부여
    // 기존 게임 세션이 있는지 확인
    let gameSession = getAllGameSessions()[0];

    if (!gameSession) {
      // 게임 세션이 없으면 새로 생성
      gameSession = addGameSession();
    }

    user.setGameId(gameSession.id);

    // 게임 세션에 유저를 추가
    gameSession.addUser(user);

    console.log('접속 중인 유저들', gameSession.users);

    const initailResponse = createResponse(
      HANDLER_IDS.INITIAL,
      RESPONSE_SUCCESS_CODE,
      { userId, x: user.x, y: user.y },
      deviceId,
    );

    // 소켓을 통해 클라이언트에게 응답 메시지 전송
    socket.write(initailResponse);
  } catch (err) {
    handleError(socket, err);
  }
};

export default initialHandler;

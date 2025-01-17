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
  getEnableGameSession,
  getGameSession,
} from '../../session/game.session.js';
import CustomError from '../../utils/error/custom.error.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';
import { config } from '../../config/config.js';
import { initialPacket } from '../../utils/notification/game.notification.js';

const initialHandler = async ({ socket, userId, payload }) => {
  try {
    // console.log('이니셜 핸들러 실행!');

    const { deviceId, playerId, latency } = payload;

    // console.log('플레이어 id야 나와라', playerId);

    // DB에서 유저 데이터를 찾는다.
    let user = await findUserByDeviceID(deviceId);
    let x = null;
    let y = null;
    let gameId = null;

    if (!user) {
      user = await createUser(deviceId, playerId, latency);
    } else if (user && getUserById(userId)) {
      console.log('이미 접속 중인 ID입니다. 접속을 차단합니다.');
      socket.destroy();
      return;
    } else {
      await updateUserLogin(user.id);
      x = user.lastLocationX;
      y = user.lastLocationY;
      gameId = user.lastGameId; // 마지막 게임 세션 ID도 받아오기
    }

    // 유저 세션에 유저 추가, 유저 객체 반환
    user = addUser(socket, user.id, playerId, x, y);
    if (!user) {
      throw new CustomError(
        ErrorCodes.USER_NOT_FOUND,
        '유저를 찾을 수 없습니다.',
      );
    }

    // 유저의 마지막 게임 세션ID가 여전히 존재하는지 확인
    let gameSession;
    gameSession = getGameSession(gameId);

    // 여전히 있고 정원이 꽉차지 않았다면 그대로 접속
    if (
      gameSession &&
      gameSession.users.length < config.gameSession.MAX_PLAYERS
    ) {
      user.setGameId(gameId);
    } else {
      // 처음 온 유저라면 기존 게임 세션 중에 빈 곳이 있는지 확인
      gameSession = getEnableGameSession();

      // 게임 세션이 없으면 새로 생성
      if (!gameSession) {
        gameSession = addGameSession();
      }
      // 게임 세션의 id를 유저의 속성으로 추가
      user.setGameId(gameSession.id);
    }

    // 게임 세션에 유저를 추가
    gameSession.addUser(user);

    console.log('접속 중인 유저들', gameSession.users);
    console.log('초기 좌표 : ', user.x, user.y);

    const data = initialPacket({ x: user.x, y: user.y });
    socket.write(data);
  } catch (err) {
    handleError(socket, err);
  }
};

export default initialHandler;

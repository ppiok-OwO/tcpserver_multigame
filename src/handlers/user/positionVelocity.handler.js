import { getUserById } from '../../session/user.session.js';
import { targetLocationPacket } from '../../utils/notification/game.notification.js';
import { handleError } from '../../utils/error/errorHandler.js';
import { createResponse } from '../../utils/response/createResponse.js';
import {
  HANDLER_IDS,
  RESPONSE_SUCCESS_CODE,
} from '../../constants/handlerIds.js';

export const positionVelocityHandler = ({ socket, userId, payload }) => {
  try {
    const { x, y } = payload;

    // console.log('velocity : ', velocityX, velocityY);

    const user = getUserById(userId);

    const targetLocation = user.calculatePosition(user.latency, x, y);

    // console.log('다음 좌표는 여기! : ', targetLocation);

    // 클라이언트로 다시 보내주기
    const data = targetLocationPacket(targetLocation);

    // const targetLocationResponse = createResponse(
    //   HANDLER_IDS.POSITION_VELOCITY,
    //   RESPONSE_SUCCESS_CODE,
    //   targetLocation,
    //   userId,
    // );

    // console.log('data', data);

    // socket.write(targetLocationResponse);
    socket.write(data);
  } catch (err) {
    handleError(socket, err);
  }
};

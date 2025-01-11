import {
  HANDLER_IDS,
  RESPONSE_SUCCESS_CODE,
} from '../../constants/handlerIds.js';
import { getUserById } from '../../session/user.session.js';
import { onCollisionPacket } from '../../utils/notification/game.notification.js';
import { createResponse } from '../../utils/response/createResponse.js';

export const onCollisionHandler = ({ socket, userId, payload }) => {
  // 충돌이 일어난 x, y 좌표를 payload에서 추출
  const { x0, y0, x1, y1 } = payload;

  // 서버에서 추측항법으로 정한 유저 좌표를 기반으로 충돌을 검증
  // 유니티 콜라이더가 세로 1px 가로가 0.7px인 타원형이므로, 지름 1.2 정도의 원으로 검증한다.
  const user = getUserById(userId);
  if (!user) {
    throw new CustomError(
      ErrorCodes.USER_NOT_FOUND,
      '유저를 찾을 수 없습니다.',
    );
  }

  const triggerDistance = 1.2;
  const distance = Math.sqrt(Math.pow(x0 - x1, 2) + Math.pow(y0 - y1, 2));

  // 충돌이 맞다고 판단하면 stopResponse 생성
  if (distance <= triggerDistance) {
    const dx = (x0 - x1) / distance; // x 방향 단위 벡터
    const dy = (y0 - y1) / distance; // y 방향 단위 벡터

    // 부딪힌 물체들이 일정 거리 뒤로 밀려남
    const pushDistance = triggerDistance - distance;

    // 첫 번째 물체 이동
    const newX0 = x0 + dx * pushDistance * 0.2;
    const newY0 = y0 + dy * pushDistance * 0.2;

    // 두 번째 물체 이동
    const newX1 = x1 - dx * pushDistance * 0.2; // 반대 방향으로 밀려남
    const newY1 = y1 - dy * pushDistance * 0.2;

    // const stopResponse = createResponse(
    //   HANDLER_IDS.ONCOLLISION,
    //   RESPONSE_SUCCESS_CODE,
    //   { x0: newX0, y0: newY0, x1: newX1, y1: newY1 },
    //   userId,
    // );

    user.x = newX0;
    user.y = newY0;

    const data = onCollisionPacket({
      x0: newX0,
      y0: newY0,
      x1: newX1,
      y1: newY1,
    });

    socket.write(data);
  }
};

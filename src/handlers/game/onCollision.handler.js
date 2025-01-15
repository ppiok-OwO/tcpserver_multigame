import { config } from '../../config/config.js';
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

  const user = getUserById(userId);
  if (!user) {
    throw new CustomError(
      ErrorCodes.USER_NOT_FOUND,
      '유저를 찾을 수 없습니다.',
    );
  }

  // 현재 user.x와 x0, user.y의 y0 가 오차 범위 내인지 판정
  const offset = Math.sqrt(Math.pow(x0 - user.x, 2) + Math.pow(y0 - user.y, 2));
  if (offset > config.ingame.offsetRange) {
    console.log('올바르지 않은 좌표에서 충돌이 일어났습니다.');
    return;
  }

  // 오차범위 이내라면 충돌이 맞다고 판단하여 onCollisionPacket 생성
  // 부딪힌 물체들이 일정 거리 뒤로 밀려남 => 현재 방향과 반대 방향으로 단위 벡터 구하기
  const distance = Math.sqrt(Math.pow(x0 - x1, 2) + Math.pow(y0 - y1, 2));

  const dx = (x0 - x1) / distance; // x 방향 단위 벡터
  const dy = (y0 - y1) / distance; // y 방향 단위 벡터
  // 방향이 시작점(x1, y1) -> 끝점 (x0, y0)인 단위 벡터

  // 첫 번째 물체 이동
  const newX0 = x0 + dx * distance * 0.2; // 0.2에 별 의미는 없다. 직접 부딪혀봤을 때 이 정도 밀려나는 게 보기 좋아서 결정한 숫자.
  const newY0 = y0 + dy * distance * 0.2;

  // 두 번째 물체 이동
  // 만약 상대가 플레이어라면 없어도 됨.
  // 플레이어에 의해 게임 오브젝트가 움직이는 경우를 고려해서 계산식은 남겨둠
  const newX1 = x1 - dx * distance * 0.2; // 반대 방향으로 밀려남
  const newY1 = y1 - dy * distance * 0.2;

  user.x = newX0;
  user.y = newY0;

  const data = onCollisionPacket({
    x0: newX0,
    y0: newY0,
    x1: newX1,
    y1: newY1,
  });

  socket.write(data);
};

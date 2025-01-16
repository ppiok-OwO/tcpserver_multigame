import { monsterMovePacket } from '../utils/notification/game.notification.js';
import { getGameSession } from './game.session.js';

// 유저마다 인터벌로 monsterMove 함수를 호출하게 된다.
export const monsterMove = (gameId, socket) => {
  let monstersNextLocation = [];

  let closestDistance = Infinity;
  let closestPlayer = {};

  const gameSession = getGameSession(gameId);

  gameSession.monsters.forEach((monster) => {
    gameSession.users.forEach((user) => {
      // 세션 내 몬스터와 유저 사이의 거리
      let distance = Math.sqrt(
        Math.pow(monster.x - user.x, 2) + Math.pow(monster.y - user.y, 2),
      );

      if (distance < closestDistance) {
        closestDistance = distance;
        closestPlayer = { x: user.x, y: user.y };
      }
    });

    // 몬스터의 다음 좌표는 가장 가까운 플레이어의 좌표로 설정된다.
    if (closestDistance > 0) {
      const nextLocation = {
        id: monster.id,
        x: closestPlayer.x,
        y: closestPlayer.y,
      };

      monstersNextLocation.push(nextLocation);
    }
  });

  const data = monsterMovePacket(monstersNextLocation);

  socket.write(data);
};

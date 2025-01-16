import Monster from '../classes/models/monster.class.js';
import { monsterMovePacket } from '../utils/notification/game.notification.js';
import { getGameSession } from './game.session.js';
import { monsterSessions } from './sessions.js';

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

// 서버에서 모든 게임 세션의 몬스터를 관리하려면 아래 코드를 사용하면 된다.
// 그러나 몬스터가 대량으로 생성되는 게임은 부하가 심할 수 있다.
// 따라서, 각 게임의 세션별로 몬스터를 관리하기로 결정했다.(game.class.js 파일 참고)
// export const addMonster = (x, y, index, hp, dmg, gateId) => {
//   const monster = new Monster(x, y, index, hp, dmg, gateId);
//   monsterSessions.push(monster);
//   return monster;
// };

// export const removeMonster = (monsterId) => {
//   const index = monsterSessions.findIndex(
//     (monster) => monster.id === monsterId,
//   );
//   if (index !== -1) {
//     return monsterSessions.splice(index, 1)[0];
//   }
// };


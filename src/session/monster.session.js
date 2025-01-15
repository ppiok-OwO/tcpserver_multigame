import { monsterMovePacket } from '../utils/notification/game.notification.js';
import { getGameSession } from './game.session.js';

export const monsterMove = (gameId, socket) => {
  let monstersNextLocation = [];

  let closestDistance = Infinity;
  let closestPlayer = {};

  const gameSession = getGameSession(gameId);

  gameSession.monsters.forEach((monster) => {
    gameSession.users.forEach((user) => {
      let distance = Math.sqrt(
        Math.pow(monster.x - user.x, 2) + Math.pow(monster.y - user.y, 2),
      );

      if (distance < closestDistance) {
        closestDistance = distance;
        closestPlayer = { x: user.x, y: user.y };
      }
    });

    if (closestDistance > 0) {
      const nextLocation = {
        id: monster.id,
        // x: (user.x - monster.x) / distance,
        // y: (user.y - monster.y) / distance,
        x: closestPlayer.x,
        y: closestPlayer.y,
      };

      monstersNextLocation.push(nextLocation);
    }
  });

  console.log('monstersNextLocation :', monstersNextLocation);

  const data = monsterMovePacket(monstersNextLocation);

  // gameSession.broadcast(data);
  socket.write(data);
};

import { config } from '../../config/config.js';
import { getGameSession } from '../../session/game.session.js';
import { getUserById } from '../../session/user.session.js';
import CustomError from '../../utils/error/custom.error.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';
import { attackPacket } from '../../utils/notification/game.notification.js';

export const attackMonsterHandler = async ({ socket, userId, payload }) => {
  // console.log('몬스터 공격 패킷 도착!');

  const { monsterX, monsterY, monsterId } = payload;
  let isDead = false;

  // 세션에서 유저 찾기
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

  // 세션에서 몬스터 찾기
  const monster = gameSession.getMonster(monsterId);
  if (!monster) {
    // 멀티 플레이 중이면 이미 죽인 몬스터에 대한 패킷을 처리해야 할 때도 있다.
    console.log('몬스터를 찾을 수 없습니다.', monsterId);

    return;
  }

  // 몬스터가 플레이어의 사정거리 내에 있는지 검증
  const distance = Math.sqrt(
    Math.pow(user.x - monsterX, 2) + Math.pow(user.y - monsterY, 2),
  );
  if (distance > user.range) {
    console.log('공격할 수 없는 대상입니다.');
    return;
  }

  // 공격하기
  const damagedMonsterHp = Math.floor(monster.hp - user.dmg);
  monster.hp = damagedMonsterHp;

  if (damagedMonsterHp <= 0) {
    isDead = true;
    gameSession.removeMonster(monsterId);
    // console.log(
    //   `${monsterId}는 죽었다! 몬스터 체력 : ${monster.hp} isDead: ${isDead}`,
    // );
  } else {
    isDead = false;
    // console.log(
    //   `${monsterId}는 죽지 않았다! 몬스터 체력 : ${monster.hp} isDead: ${isDead}`,
    // );
  }

  const data = {
    userId,
    x0: user.x,
    y0: user.y,
    x1: monsterX,
    y1: monsterY,
    hp: damagedMonsterHp,
    bulletSpeed: config.ingame.bulletSpeed,
    isDead,
    monsterId,
  };
  const packet = attackPacket(data);

  // socket.write(packet);
  gameSession.broadcast(packet);
};

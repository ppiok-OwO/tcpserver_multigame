import Monster from '../../classes/models/monster.class.js';
import { config } from '../../config/config.js';
import { getGameAssets } from '../../init/assets.js';
import { getGameSession } from '../../session/game.session.js';
import CustomError from '../../utils/error/custom.error.js';
import { ErrorCodes } from '../../utils/error/errorCodes.js';
import { getUserById } from '../../session/user.session.js';
import { createMonsterPacket } from '../../utils/notification/game.notification.js';
import { handleError } from '../../utils/error/errorHandler.js';

export const createMonsterHandler = async ({ socket, userId, payload }) => {
  try {
    const { monsters } = payload;

    // console.log('monsterHp', monsterHp, 'monsterDmg', monsterDmg);

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

    // gateId가 있으면 gate.json에서 gate의 좌표를 알아낼 수 있음
    const { gates } = getGameAssets();

    const gate = gates.data.find((value) => {
      return value.id === monsters[0].gateId;
    });

    // 유저의 현재 좌표가 해당 게이트를 활성화 할 수 있는지 검증하기
    const offset = Math.sqrt(
      Math.pow(gate.position.x - user.x, 2) +
        Math.pow(gate.position.y - user.y, 2),
    );
    if (offset > config.ingame.interactionOffset) {
      // throw new CustomError(
      //   ErrorCodes.INVALID_POSITION,
      //   '게이트를 활성화할 수 없는 위치입니다.',
      // );
      console.log('게이트를 활성화할 수 없는 위치입니다.');
    }

    for (let monster of monsters) {
      let monsterObj = new Monster(
        monster.monsterPosX,
        monster.monsterPosY,
        monster.monsterIndex,
        monster.monsterHp,
        monster.monsterDmg,
        monster.gateId,
      );

      gameSession.addMonster(monsterObj);
    }

    console.log(gameSession.monsters);

    // 게임 세션의 몬스터 배열을 패킷에 담아서 클라로 보내기
    // const data = createMonsterPacket(gameSession.monsters);
    const data = createMonsterPacket(monsters);
    // console.log('data: ', data);

    gameSession.broadcast(data);
    //socket.write(data);

    // 브로드 캐스트를 해주려면 updateLocation핸들러에서 몬스터 배열을 같이 보내줘야 할까?(서버는 세션 내 유저들의 소켓을 알지 않나)
  } catch (err) {
    handleError(socket, err);
  }
};

// =============================================== //
// 만약 서버에서 한다면...
// TO DO: 몬스터의 종류는 monster.json에서 유저 레벨+5 이하인 몬스터를 랜덤하게 고르겠음
// 하지만 지금은 0부터 3 중에 랜덤한 걸 고르면 됨
// const randomIndex = Math.floor(Math.random(0, 4));

// // 몬스터 스폰 위치는 gate에서 100 픽셀 이내의 어딘가로 정하겠음
// const monsterPosX = Math.floor(Math.random(0, 100));
// const monsterPosY = Math.floor(Math.random(0, 100));

// // 몬스터의 스탯은 gate.json에 있는 monsterLv의 값에 따라 달라짐
// const monsterHp = 100 + gate.monsterLv * 10;
// const monsterDmg = 10 + gate.monsterLv;

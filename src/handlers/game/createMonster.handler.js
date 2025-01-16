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

    // waveCount가 0이라면 유저의 현재 좌표가 해당 게이트를 활성화 할 수 있는지 검증하기
    if (monsters[0].waveCount === 0) {
      const offset = Math.sqrt(
        Math.pow(gate.position.x - user.x, 2) +
          Math.pow(gate.position.y - user.y, 2),
      );
      if (offset > config.ingame.interactionOffset) {
        throw new CustomError(
          ErrorCodes.INVALID_POSITION,
          '게이트를 활성화할 수 없는 위치입니다.',
        );
      }
    }

    let createdMonsters = [];
    for (let monster of monsters) {
      // 몬스터 체력과 데미지 계산하기
      const monsterHp = 100 + gate.monsterLv * 10;
      const monsterDmg = 10 + gate.monsterLv;

      if (
        monsterHp !== monster.monsterHp ||
        monsterDmg !== monster.monsterDmg
      ) {
        throw new CustomError(ErrorCodes.ABUSER, '악의적인 사용자입니다.');
      }

      const monsterObj = new Monster(
        monster.monsterPosX,
        monster.monsterPosY,
        monster.monsterIndex,
        monsterHp,
        monsterDmg,
        monster.gateId,
      );

      // 게임 세션에 몬스터 객체 추가
      gameSession.addMonster(monsterObj);
      createdMonsters.push({ ...monster, monsterId: monsterObj.id });
    }

    // ID가 발급된 몬스터 배열을 패킷에 담아서 클라로 보내기
    const data = createMonsterPacket(createdMonsters);
    // 브로드 캐스트
    gameSession.broadcast(data);
  } catch (err) {
    handleError(socket, err);
  }
};

// =============================================== //
// 만약 몬스터 데이터도 서버에서 생성한다면...
// TO DO: 몬스터의 종류는 monster.json에서 유저 레벨+5 이하인 몬스터를 랜덤하게 고르기
// const randomIndex = Math.floor(Math.random(0, 4));

// // 몬스터 스폰 위치는 gate에서 100 픽셀 이내의 어딘가로 정하기
// const monsterPosX = Math.floor(Math.random(0, 100));
// const monsterPosY = Math.floor(Math.random(0, 100));

// // 몬스터의 스탯은 gate.json에 있는 monsterLv의 값에 따라 달라짐
// const monsterHp = 100 + gate.monsterLv * 10;
// const monsterDmg = 10 + gate.monsterLv;

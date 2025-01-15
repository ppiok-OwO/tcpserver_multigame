import { getGameAssets } from '../../init/assets.js';
import { v4 as uuidv4 } from 'uuid';

class Monster {
  constructor(
    monsterPosX,
    monsterPosY,
    monsterIndex,
    monsterHp,
    monsterDmg,
    gateId,
  ) {
    this.id = uuidv4();
    this.x = monsterPosX;
    this.y = monsterPosY;
    this.index = monsterIndex;
    this.hp = monsterHp;
    this.dmg = monsterDmg;
    this.gateId = gateId;
  }

  // addMonster(gateId) {
  //   // gateId가 있으면 gate.json에서 gate의 좌표를 알아낼 수 있음
  //   const { gates } = getGameAssets();
  //   const gate = gates.data.find((value) => {
  //     value.id === gateId;
  //   });
  //   const gatePosition = gate.position;
  //   this.level = gate.monsterLv;
  // }
}

export default Monster;

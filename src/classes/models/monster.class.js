import { getGameAssets } from '../../init/assets.js';
import { v4 as uuidv4 } from 'uuid';
import { getGameSession } from '../../session/game.session.js';
import { config } from '../../config/config.js';

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
    this.range = config.ingame.monsterBaseRange;
    this.gateId = gateId;
  }
}

export default Monster;

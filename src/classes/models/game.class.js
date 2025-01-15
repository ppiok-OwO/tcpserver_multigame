import updateLocationHandler from '../../handlers/game/updateLocation.handler.js';
import { positionVelocityHandler } from '../../handlers/user/positionVelocity.handler.js';
import { createLocationPacket } from '../../utils/notification/game.notification.js';
import IntervalManager from '../managers/interval.manager.js';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../../config/config.js';
import { monsterMove } from '../../session/monster.session.js';

class Game {
  constructor() {
    this.users = [];
    this.monsters = [];
    this.intervalManager = new IntervalManager();
    // this.state = 'waiting'; // 'waiting', 'inProgress'
    this.id = uuidv4();
  }

  // 업데이트 함수(능동적인 서버)

  getGameId() {
    return this.id;
  }

  addUser(user) {
    if (this.users.length >= config.gameSession.MAX_PLAYERS) {
      throw new Error('Game session is full');
    }
    this.users.push(user);
    this.intervalManager.addPlayer(
      user.id,
      user.ping.bind(user), // intervalManager라는 객체 속에서 user 객체의 메서드를 실행할 때 실행 컨텍스트를 명시해주기 위함
      1000, // 1초마다 핑 측정
    );
    this.intervalManager.updateMonsterPosition(
      user.id,
      () => monsterMove(this.id, user.socket),
      500,
    );
    this.intervalManager.checkPong(user.id, user.checkPong.bind(user), 3000); // 연결 상태 체크
  }

  addMonster(monster) {
    this.monsters.push(monster);
  }

  getUser(userId) {
    return this.users.find((user) => user.id === userId);
  }

  removeUser(userId) {
    this.users = this.users.filter((user) => user.id !== userId);
    this.intervalManager.removePlayer(userId);

    if (this.users.length < config.gameSession.MAX_PLAYERS) {
      this.state = 'waiting';
    }
  }

  getMaxLatency() {
    let maxLatency = 0;
    this.users.forEach((user) => {
      maxLatency = Math.max(maxLatency, user.latency);
    });

    return maxLatency;
  }

  broadcast(packet) {
    this.users.forEach((user) => {
      user.socket.write(packet);
    });
  }
}

export default Game;

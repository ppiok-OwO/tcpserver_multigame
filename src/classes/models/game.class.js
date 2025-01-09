import updateLocationHandler from '../../handlers/game/updateLocation.handler.js';
import { positionVelocityHandler } from '../../handlers/user/positionVelocity.handler.js';
import {
  createLocationPacket,
  gameStartNotification,
} from '../../utils/notification/game.notification.js';
import IntervalManager from '../managers/interval.manager.js';
import { v4 as uuidv4 } from 'uuid';

const MAX_PLAYERS = 2;

class Game {
  constructor() {
    this.users = [];
    this.intervalManager = new IntervalManager();
    this.state = 'waiting'; // 'waiting', 'inProgress'
    this.id = uuidv4();
  }

  getGameId() {
    return this.id;
  }

  addUser(user) {
    if (this.users.length >= MAX_PLAYERS) {
      throw new Error('Game session is full');
    }
    this.users.push(user);
    this.intervalManager.addPlayer(
      user.id,
      user.ping.bind(user), // intervalManager라는 객체 속에서 user 객체의 메서드를 실행할 때 실행 컨텍스트를 명시해주기 위함
      1000, // 1초마다 핑 측정
    );
  }

  getUser(userId) {
    return this.users.find((user) => user.id === userId);
  }

  removeUser(userId) {
    this.users = this.users.filter((user) => user.id !== userId);
    this.intervalManager.removePlayer(userId);

    if (this.users.length < MAX_PLAYERS) {
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

  startGame() {
    this.state = 'inProgress';

    const startPacket = gameStartNotification(this.id, Date.now());
    console.log(this.getMaxLatency());

    this.users.forEach((user) => {
      user.socket.write(startPacket);
    });
  }

  getAllLocation() {
    const maxLatency = this.getMaxLatency();

    const locationData = this.users.map((user) => {
      const { x, y } = user.calculatePosition(maxLatency);
      return { id: user.id, x, y };
    });
    return createLocationPacket(locationData);
  }
}

export default Game;

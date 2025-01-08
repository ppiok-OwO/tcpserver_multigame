import { createPingPacket } from '../../utils/notification/game.notification.js';

class User {
  constructor(id, socket, playerId, x, y) {
    this.id = id;
    this.socket = socket;
    this.x = x ?? 0;
    this.y = y ?? 0;
    // this.sequence = 0;
    this.lastUpdateTime = Date.now();
    this.playerId = playerId;
  }

  setGameId(gameId) {
    this.gameId = gameId;
  }

  updatePosition(x, y) {
    this.x = x;
    this.y = y;
    this.lastUpdateTime = Date.now();
  }

  getNextSequence() {
    return ++this.sequence;
  }

  ping() {
    const now = Date.now();

    // console.log(`${this.id}: ping`);
    this.socket.write(createPingPacket(now));
  }

  handlePong(data) {
    const now = Date.now();
    this.latency = (now - data.timestamp) / 2; // 왕복이니까
    // console.log(
    //   `Received pong from user ${this.id} at ${now} with latency ${this.latency}ms`,
    // );
  }

  // 추측항법을 사용하여 위치를 추정하는 메서드
  calculatePosition(latency, velocityX, velocityY) {
    // 세션 내 최고 레이턴시를 인자로 받는다.
    const timeDiff = latency / 1000; // 레이턴시를 초 단위로 계산
    const distanceX = velocityX * timeDiff;
    const distanceY = velocityY * timeDiff;

    // x, y 축에서 이동한 거리 계산
    return {
      x: this.x + distanceX,
      y: this.y + distanceY,
    };
  }
}

export default User;

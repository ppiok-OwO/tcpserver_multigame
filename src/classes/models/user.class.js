import { updateLastLocation } from '../../db/user/user.db.js';
import {
  getGameSession,
  removeUserInSession,
} from '../../session/game.session.js';
import { gameSessions, userSessions } from '../../session/sessions.js';
import { getUserBySocket, removeUser } from '../../session/user.session.js';
import { createPingPacket } from '../../utils/notification/game.notification.js';

class User {
  constructor(id, socket, playerId, x, y) {
    this.id = id;
    this.socket = socket;
    this.x = x ?? 0;
    this.y = y ?? 0;
    // this.sequence = 0;
    this.latency = 0;
    this.lastUpdateTime = Date.now();
    this.playerId = playerId;
    this.lastPong = Date.now();
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

  checkPong = async () => {
    const now = Date.now();
    if (now - this.lastPong > 10000) {
      console.log('클라이언트 연결이 종료되었습니다.');

      console.log(userSessions);
      console.log(gameSessions);

      // 플레이어의 마지막 위치 저장
      await updateLastLocation(this.x, this.y, this.id);

      const gameSession = getGameSession(this.gameId);

      // 세션에서 유저 삭제
      removeUser(this.socket);
      // 게임 세션에서 유저 삭제, 세션의 유저 배열이 빈 배열이면 세션도 삭제
      removeUserInSession(this.id, this.gameId);

      console.log('!!!!intervalManager: ', gameSession.intervalManager);
    }
  };

  // 추측항법을 사용하여 위치를 추정하는 메서드
  calculatePosition(latency, velocityX, velocityY) {
    const timeDiff = latency / 1000; // 레이턴시를 초 단위로 계산
    const speed = 3;
    const distanceX = speed * velocityX * timeDiff; // 속력(스칼라) * X축 속도(단위벡터) * timeDiff
    const distanceY = speed * velocityY * timeDiff; // 속력(스칼라) * Y축 속도(단위벡터) * timeDiff

    this.updatePosition(this.x + distanceX, this.y + distanceY);

    return { x: this.x, y: this.y };
  }
}

export default User;

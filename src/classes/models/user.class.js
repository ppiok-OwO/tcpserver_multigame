import { config } from '../../config/config.js';
import { updateLastGameId, updateLastLocation } from '../../db/user/user.db.js';
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

  ping() {
    const now = Date.now();
    this.socket.write(createPingPacket(now));
  }

  handlePong(data) {
    const now = Date.now();
    this.lastPong = now;
    this.latency = (now - data.timestamp) / 2; // 왕복이니까
  }

  checkPong = async () => {
    let now = Date.now();
    console.log('연결 췤!: ', now - this.lastPong);

    // 10초 이상 퐁이 오지 않으면 연결 종료
    if (now - this.lastPong > 10000) {
      console.log('클라이언트가 연결을 종료했습니다.');

      // 플레이어의 마지막 위치 저장
      await updateLastLocation(this.x, this.y, this.id);
      // 플레이어의 마지막 게임 세션 ID 저장
      await updateLastGameId(this.gameId, this.id);

      // 세션에서 유저 삭제
      removeUser(this.socket);
      // 게임 세션에서 유저 삭제, 세션의 유저 배열이 빈 배열이면 세션과 인터벌도 삭제
      removeUserInSession(this.id, this.gameId);

      console.log('유저 세션', userSessions);
      console.log('게임 세션', gameSessions);

      this.socket.destroy(); // 정상적으로 소켓 종료
    }
  };

  // 추측항법을 사용하여 위치를 추정하는 메서드
  calculatePosition(latency, velocityX, velocityY) {
    const timeDiff = latency / 1000; // 세션 내 최고 레이턴시를 초 단위로 계산
    const distanceX = config.ingame.speed * velocityX * timeDiff; // 속력(스칼라) * X축 속도(단위벡터) * timeDiff
    const distanceY = config.ingame.speed * velocityY * timeDiff; // 속력(스칼라) * Y축 속도(단위벡터) * timeDiff

    this.updatePosition(this.x + distanceX, this.y + distanceY);

    return { x: this.x, y: this.y };
  }

  // 클라이언트가 보낸 좌표를 서버가 가진 user의 좌표와 비교했을 때, 오차 범위 내인지 판정
  validatePosition(latency, x, y) {
    const timeDiff = latency / 1000; // 세션 내 최고 레이턴시를 초 단위로 계산
    const offset = Math.sqrt(Math.pow(x - this.x, 2) + Math.pow(y - this.y, 2));
    const offsetRange = config.ingame.speed * timeDiff + 3; // 충돌 시 밀려나기 때문에 3픽셀 정도 여유를 줌

    if (offset > offsetRange) return false;

    return true;
  }
}

export default User;

import { config } from '../config/config.js';
import { PACKET_TYPE, TOTAL_LENGTH } from '../constants/header.js';
import { getHandlerById } from '../handlers/index.js';
import { packetParser } from '../utils/parser/packetParser.js';
import { handleError } from '../utils/error/errorHandler.js';
import { getUserById, getUserBySocket } from '../session/user.session.js';
import { getProtoMessages } from '../init/loadProtos.js';
import CustomError from '../utils/error/custom.error.js';
import { ErrorCodes } from '../utils/error/errorCodes.js';
import initialHandler from '../handlers/user/initial.handler.js';
import updateLocationHandler from '../handlers/game/updateLocation.handler.js';
import { getGameSession } from '../session/game.session.js';
import { onCollisionHandler } from '../handlers/game/onCollision.handler.js';

// 데이터는 스트림을 통해 청크단위로 조금씩 전송받게 되는데 우리가 원하는 데이터가 들어올때까지 계속 대기하다가 원하는 데이터가 도착하면 처리하는 형태입니다.
export const onData = (socket) => async (data) => {
  // 기존 버퍼에 새로 수신된 데이터를 추가
  socket.buffer = Buffer.concat([socket.buffer, data]);

  // 패킷의 총 헤더 길이 (패킷 길이 정보 + 타입 정보)
  const totalHeaderLength =
    config.packet.totalLength + config.packet.typeLength;

  // 버퍼에 최소한 전체 헤더가 있을 때만 패킷을 처리
  while (socket.buffer.length >= totalHeaderLength) {
    // 1. 패킷 길이 정보 수신 (4바이트)
    const length = socket.buffer.readUInt32BE(0);

    // 2. 패킷 타입 정보 수신 (1바이트)
    const packetType = socket.buffer.readUInt8(config.packet.totalLength);

    // 3. 패킷 전체 길이 확인 후 데이터 수신
    // 버퍼의 길이가 패킷 길이 정보(length)보다 작으면 계속 데이터를 받아서 버퍼에 저장한다.
    // 그러다가 버퍼의 길이가 처음으로 length와 같아지면 조건문을 실행
    if (socket.buffer.length >= length) {
      // 패킷 데이터만 자르고 소켓의 버퍼를 비워준다.
      const packet = socket.buffer.slice(totalHeaderLength, length);
      socket.buffer = socket.buffer.slice(length);

      try {
        switch (packetType) {
          case PACKET_TYPE.PING:
            {
              const protoMessages = getProtoMessages();
              const Ping = protoMessages.common.Ping;
              const pingMessage = Ping.decode(packet);
              const user = getUserBySocket(socket);
              if (user) {
                await user.handlePong(pingMessage);
              }
            }
            break;
          case PACKET_TYPE.NORMAL:
            {
              const { handlerId, payload, userId } = packetParser(packet);
              // 핸들러ID를 통해 특정 핸들러 함수를 변수에 할당
              const handler = getHandlerById(handlerId);

              // 함수 호출
              await handler({
                socket,
                userId,
                payload,
              });
            }
            break;
          case PACKET_TYPE.LOCATION:
            {
              // 위치 동기화(브로드 캐스트)
              const { payload, userId } = packetParser(packet);
              updateLocationHandler({ socket, userId, payload });
            }
            break;
          // case PACKET_TYPE.ONCOLLISION: {
          //   const { payload, userId } = packetParser(packet);
          //   // 핸들러ID를 통해 특정 핸들러 함수를 변수에 할당

          //   // 함수 호출
          //   await onCollisionHandler({
          //     socket,
          //     userId,
          //     payload,
          //   });
          // }
        }
      } catch (error) {
        console.error('!!!!!!', error);
        handleError(socket, error);
      }
    } else {
      // 아직 전체 패킷이 도착하지 않음
      break;
    }
  }
};

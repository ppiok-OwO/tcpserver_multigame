import { config } from '../../config/config.js';
import { getProtoMessages } from '../../init/loadProtos.js';
import { PACKET_TYPE } from '../../constants/header.js';

// 패킷 헤더 만들어주는 함수
const makeNotification = (message, type) => {
  const packetLength = Buffer.alloc(config.packet.totalLength);
  packetLength.writeUint32BE(
    message.length + config.packet.typeLength + config.packet.totalLength,
    0,
  );

  // 패킷 타입 정보를 포함한 버퍼 생성
  const packetType = Buffer.alloc(config.packet.typeLength);
  packetType.writeUInt8(type, 0);

  // 길이 정보와 메시지를 함께 전송
  return Buffer.concat([packetLength, packetType, message]);
};

export const gameStartNotification = (gameId, timestamp) => {
  const protoMessages = getProtoMessages();
  const Start = protoMessages.gameNotification.Start;

  const payload = { gameId, timestamp };
  const message = Start.create(payload);
  const startPacket = Start.encode(message).finish();
  return makeNotification(startPacket, PACKET_TYPE.GAME_START);
};

export const createLocationPacket = (users) => {
  const protoMessages = getProtoMessages();
  const Location = protoMessages.gameNotification.LocationUpdate;

  const payload = { users };
  const message = Location.create(payload);
  const locationPacket = Location.encode(message).finish();
  return makeNotification(locationPacket, PACKET_TYPE.LOCATION);
};

export const createPingPacket = (timestamp) => {
  const protoMessages = getProtoMessages();
  // 네임스페이스가 ping인 프로토버퍼(스키마) 불러오기
  const ping = protoMessages.common.Ping;

  const payload = { timestamp };
  const message = ping.create(payload);
  const pingPacket = ping.encode(message).finish();
  return makeNotification(pingPacket, 0);
};

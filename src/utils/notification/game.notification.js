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

export const createLocationPacket = (users) => {
  const protoMessages = getProtoMessages();
  const Location = protoMessages.game.LocationUpdate;

  const payload = { users };
  const message = Location.create(payload);

  const locationPacket = Location.encode(message).finish();
  return makeNotification(locationPacket, PACKET_TYPE.BROADCAST);
};

export const initialPacket = (location) => {
  const protoMessages = getProtoMessages();
  const initialLocation = protoMessages.initial.InitialResponse;

  const payload = location;
  const message = initialLocation.create(payload);

  const InitialResponsePacket = initialLocation.encode(message).finish();
  return makeNotification(InitialResponsePacket, PACKET_TYPE.INIT);
};

export const targetLocationPacket = (location) => {
  const protoMessages = getProtoMessages();
  const Location = protoMessages.game.LocationUpdatePayload;

  const payload = location;
  // console.log('payload: ', payload);

  const message = Location.create(payload);
  // console.log('message: ', message);

  const locationPacket = Location.encode(message).finish();
  // console.log('locationPacket: ', locationPacket);

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

export const onCollisionPacket = (data) => {
  const protoMessages = getProtoMessages();
  // 네임스페이스가 ping인 프로토버퍼(스키마) 불러오기
  const collision = protoMessages.game.OnCollision;

  const payload = data;
  const message = collision.create(payload);
  const onCollisionPacket = collision.encode(message).finish();
  return makeNotification(onCollisionPacket, PACKET_TYPE.ONCOLLISION);
};

export const createMonsterPacket = (data) => {
  const protoMessages = getProtoMessages();
  // 네임스페이스가 ping인 프로토버퍼(스키마) 불러오기
  const monsters = protoMessages.game.CreateMonsterList;

  const payload = { monsters: data };
  const message = monsters.create(payload);
  const createMonsterPacket = monsters.encode(message).finish();
  return makeNotification(createMonsterPacket, PACKET_TYPE.CREATEMONSTER);
};

export const monsterMovePacket = (data) => {
  const protoMessages = getProtoMessages();
  // 네임스페이스가 ping인 프로토버퍼(스키마) 불러오기
  const locations = protoMessages.game.MonsterMove;

  const payload = { monsterLocations: data };
  const message = locations.create(payload);
  const monsterMovePacket = locations.encode(message).finish();
  return makeNotification(monsterMovePacket, PACKET_TYPE.MONSTERMOVE);
};

export const attackPacket = (data) => {
  const protoMessages = getProtoMessages();
  // 네임스페이스가 ping인 프로토버퍼(스키마) 불러오기
  const result = protoMessages.game.AttackResult;

  const payload = data;
  const message = result.create(payload);
  const attackPacket = result.encode(message).finish();
  return makeNotification(attackPacket, PACKET_TYPE.ATTACK);
};

export const damagedPacket = (data) => {
  const protoMessages = getProtoMessages();
  // 네임스페이스가 ping인 프로토버퍼(스키마) 불러오기
  const result = protoMessages.game.AttackResult;

  const payload = data;
  const message = result.create(payload);
  const damagedPacket = result.encode(message).finish();
  return makeNotification(damagedPacket, PACKET_TYPE.DAMAGED);
};

// export const gameStartNotification = (gameId, timestamp) => {
//   const protoMessages = getProtoMessages();
//   const Start = protoMessages.gameNotification.Start;

//   const payload = { gameId, timestamp };
//   const message = Start.create(payload);
//   const startPacket = Start.encode(message).finish();
//   return makeNotification(startPacket, PACKET_TYPE.GAME_START);
// };

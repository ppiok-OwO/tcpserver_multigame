export const TOTAL_LENGTH = 4; // 전체 길이를 나타내는 4바이트
export const PACKET_TYPE_LENGTH = 1; // 패킷타입을 나타내는 1바이트

export const PACKET_TYPE = {
  PING: 0,
  NORMAL: 1,
  BROADCAST: 2,
  LOCATION: 3,
  ONCOLLISION: 4,
  INIT: 5,
  CREATEMONSTER: 6,
  MONSTERMOVE: 7,
  ATTACK: 8,
  DAMAGED: 9,
};

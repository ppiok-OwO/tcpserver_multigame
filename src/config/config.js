// 모든 상수, 환경변수들을 config 객체를 통해 관리하겠다!
import { PORT, HOST, CLIENT_VERSION } from '../constants/env.js';
import { PACKET_TYPE_LENGTH, TOTAL_LENGTH } from '../constants/header.js';
import {
  DB1_NAME,
  DB1_USER,
  DB1_PASSWORD,
  DB1_HOST,
  DB1_PORT,
  DB2_NAME,
  DB2_USER,
  DB2_PASSWORD,
  DB2_HOST,
  DB2_PORT,
} from '../constants/env.js';

export const config = {
  server: {
    port: PORT,
    host: HOST,
  },
  client: {
    version: CLIENT_VERSION,
  },
  packet: {
    totalLength: TOTAL_LENGTH,
    typeLength: PACKET_TYPE_LENGTH,
  },
  databases: {
    GAME_DB: {
      name: DB1_NAME,
      user: DB1_USER,
      password: DB1_PASSWORD,
      host: DB1_HOST,
      port: DB1_PORT,
    },
    USER_DB: {
      name: DB2_NAME,
      user: DB2_USER,
      password: DB2_PASSWORD,
      host: DB2_HOST,
      port: DB2_PORT,
    },
    // 필요한 만큼 추가
  },
  gameSession: {
    MAX_PLAYERS: 4,
  },
  ingame: {
    offsetRange: 2, // 너무 작게 잡으면 플레이가 불가능하니까 재량껏 넉넉하게 하기
    speed: 3,
    interactionOffset: 4.5, // 너무 작게 잡으면 플레이가 불가능하니까 재량껏 넉넉하게 하기
    playerBaseHp: 100,
    playerBaseDmg: 50,
    playerBaseRange: 30,
    monsterBaseRange: 5,
    bulletSpeed: 20,
  },
};

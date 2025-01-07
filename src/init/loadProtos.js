import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import protobuf from 'protobufjs';
import { packetNames } from '../protobuf/packetNames.js';

// import.meta.url은 현재 모듈의 URL을 나타내는 문자열
// fileURLToPath는 URL 문자열을 파일 시스템의 경로로 변환

// 현재 파일(loadProtos.js)의 절대 경로 추출. 이 경로는 파일의 이름을 포함한 전체 경로
const __filename = fileURLToPath(import.meta.url);

// path.dirname()함수는 파일 경로에서 디렉토리 경로만 추출 (파일 이름을 제외한 디렉토리의 전체 경로)
const __dirname = path.dirname(__filename);
const protoDir = path.join(__dirname, '../protobuf');

// 주어진 디렉토리 내 모든 proto 파일을 재귀적으로 찾는 함수
const getAllProtoFiles = (dir, fileList = []) => {
  const files = fs.readdirSync(dir);

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllProtoFiles(filePath, fileList);
    } else if (path.extname(file) === '.proto') {
      fileList.push(filePath);
    }
  });

  return fileList;
};

// 모든 proto 파일 경로를 가져옴
const protoFiles = getAllProtoFiles(protoDir);

// 로드된 프로토 메시지들을 저장할 객체
const protoMessages = {};

// 모든 .proto 파일을 로드하여 프로토 메시지를 초기화합니다.
// Protobuf(.proto) 파일을 동적으로 읽고, 정의된 메시지를 JavaScript 객체로 사용할 수 있도록 로드하는 기능
export const loadProtos = async () => {
  try {
    const root = new protobuf.Root();

    // 비동기 병렬 처리로 프로토 파일 로드
    await Promise.all(protoFiles.map((file) => root.load(file)));

    // packetNames 에 정의된 패킷들을 등록
    for (const [namespace, types] of Object.entries(packetNames)) {
      console.log(namespace);
      console.log(types); // { Packet: 'common.CommonPacket' }

      protoMessages[namespace] = {};
      
      for (const [type, typeName] of Object.entries(types)) {
        protoMessages[namespace][type] = root.lookupType(typeName);
      }

      // root.lookupType("common.CommonPacket")이라는 메서드는 common.CommonPacket이라는 스키마를 가져오고, 데이터를 처리할 수 있는 도구를 제공한다.

      // 서버와 클라이언트는 스키마를 바탕으로 메시지를 작성해서 직렬화/역직렬화하여 주고 받는다

      // console.log(protoMessages);
    }

    console.log('Protobuf 파일이 로드되었습니다.');
  } catch (error) {
    console.error('Protobuf 파일 로드 중 오류가 발생했습니다:', error);
  }
};

// 로드된 프로토 메시지들의 얕은 복사본을 반환합니다.
export const getProtoMessages = () => {
  // console.log('protoMessages:', protoMessages); // 디버깅을 위해 추가
  return { ...protoMessages };
};

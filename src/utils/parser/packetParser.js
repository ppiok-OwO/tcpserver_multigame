import { getProtoTypeNameByHandlerId } from '../../handlers/index.js';
import { getProtoMessages } from '../../init/loadProtos.js';
import { config } from '../../config/config.js';
import CustomError from '../error/custom.error.js';
import { ErrorCodes } from '../error/errorCodes.js';

// 프로토 형식 -> js 객체 형식
// request를 파싱한다.
export const packetParser = (data) => {
  const protoMessages = getProtoMessages();

  // 공통 패킷 구조를 디코딩
  const Packet = protoMessages.common.CommonPacket;
  let packet;
  try {
    packet = Packet.decode(data);
    // Packet 스키마를 바탕으로 바이너리 데이터(data)를 디코딩하겠다.
    // 디코딩된 데이터는 Protobuf 스키마(Packet)에 정의된 필드와 값을 가진 JavaScript 객체로 변환된다.
  } catch (err) {
    console.error(err);
  }

  const handlerId = packet.handlerId;
  const userId = packet.userId;
  const clientVersion = packet.version;

  console.log('clientVersion:', clientVersion);

  // 여기서 문제가 있다. Protobuf의 bytes 타입은 디코딩되지 않는다.(int, string처럼 명확히 정의된 데이터만 디코딩이 된다. bytes는 어떤 데이터 형식인지 알 수 없는 필드. 주로 이미지, json 등이 이에 해당한다.)
  // 외부 모듈에서 실제 payload를 참조하려면 여기서 추가적인 디코딩 작업을 수행해줘야 한다.

  // clientVersion 검증
  if (clientVersion !== config.client.version) {
    throw new CustomError(
      ErrorCodes.CLIENT_VERSION_MISMATCH,
      '클라이언트 버전이 일치하지 않습니다.',
    );
  }

  // 핸들러 ID에 따라 적절한 payload 구조(스키마)를 반환받는다.
  const protoTypeName = getProtoTypeNameByHandlerId(handlerId);
  if (!protoTypeName) {
    throw new CustomError(
      ErrorCodes.UNKNOWN_HANDLER_ID,
      `알 수 없는 핸들러 ID: ${handlerId}`,
    );
  }

  // 스키마의 풀네임을 .으로 split해서 namespace와 type으로 각각 나누어 준다.
  const [namespace, type] = protoTypeName.split('.');
  const PayloadType = protoMessages[namespace][type];
  let payload;
  try {
    // payload의 스키마를 바탕으로 packet.payload의 데이터를 디코딩 해주겠다!
    payload = PayloadType.decode(packet.payload);
  } catch (error) {
    throw new CustomError(
      ErrorCodes.PACKET_STRUCTURE_MISMATCH,
      '패킷 구조가 일치하지 않습니다.',
    );
  }

  // 필드 검증 추가(디코딩할 때 이미 수행되는 작업이라 사실 필요 없다.)
  // 예를 들자면, payload 스키마가 InitialPacket인 경우 디코딩한 결과물이 deviceId에 string값이 부여된 형태가 아닐 때 에러가 발생하는 것.
  // 에러 핸들러를 만들었으므로 주석 처리
  // const errorMessage = PayloadType.verify(payload);
  // if (errorMessage) {
  //   console.error(`패킷 구조가 일치하지 않습니다: ${errorMessage}`);
  // }

  // 필드가 비어 있거나, 필수 필드가 누락된 경우 처리
  const expectedFields = Object.keys(PayloadType.fields);
  const actualFields = Object.keys(payload);
  const missingFields = expectedFields.filter(
    (field) => !actualFields.includes(field),
  );
  if (missingFields.length > 0) {
    throw new CustomError(
      ErrorCodes.MISSING_FIELDS,
      `필수 필드가 누락되었습니다: ${missingFields.join(', ')}`,
    );
  }

  return { handlerId, userId, payload };
};

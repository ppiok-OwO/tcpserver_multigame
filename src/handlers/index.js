import { HANDLER_IDS } from '../constants/handlerIds.js';
import initialHandler from './user/initial.handler.js';
import updateLocationHandler from './game/updateLocation.handler.js';
import CustomError from '../utils/error/custom.error.js';
import { ErrorCodes } from '../utils/error/errorCodes.js';
import { positionVelocityHandler } from './user/positionVelocity.handler.js';
import { disconnectHandler } from './game/disconnect.handler.js';

const handlers = {
  [HANDLER_IDS.INITIAL]: {
    handler: initialHandler,
    protoType: 'initial.InitialPayload',
  },
  [HANDLER_IDS.UPADATE_LOCATION]: {
    handler: updateLocationHandler,
    protoType: 'game.LocationUpdatePayload',
  },
  [HANDLER_IDS.POSITION_VELOCITY]: {
    handler: positionVelocityHandler,
    protoType: 'game.PositionVelocity',
  },
  [HANDLER_IDS.DISCONNECT]: {
    handler: disconnectHandler,
    protoType: 'game.Disconnect',
  },
};

export const getHandlerById = (handlerId) => {
  if (!handlers[handlerId]) {
    throw new CustomError(
      ErrorCodes.UNKNOWN_HANDLER_ID,
      `핸들러를 찾을 수 없습니다: ID ${handlerId}`,
    );
  }
  return handlers[handlerId].handler;
};

export const getProtoTypeNameByHandlerId = (handlerId) => {
  if (!handlers[handlerId]) {
    // packetParser 체크하고 있지만 그냥 추가합니다.
    throw new CustomError(
      ErrorCodes.UNKNOWN_HANDLER_ID,
      `핸들러를 찾을 수 없습니다: ID ${handlerId}`,
    );
  }
  return handlers[handlerId].protoType;
};

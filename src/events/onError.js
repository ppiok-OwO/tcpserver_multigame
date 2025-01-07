import { handleError } from '../utils/error/errorHandler.js';
import CustomError from '../utils/error/custom.error.js';
import { removeUser } from '../session/user.session.js';

export const onError = (socket) => (err) => {
  console.error('소켓 오류:', err);
  handleError(socket, new CustomError(500, `소켓 오류: ${err.message}`));
  // 세션에서 유저 삭제
  removeUser(socket);
};

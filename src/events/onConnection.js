import { onError } from './onError.js';
import { onData } from './onData.js';

export const onConnection = (socket) => {
  console.log(
    '클라이언트가 연결되었습니다:',
    socket.remoteAddress,
    socket.remotePort,
  );

  // 소켓 객체에 buffer 속성을 추가하여 각 클라이언트에 고유한 버퍼를 유지 => 각 클라이언트마다 고유한 버퍼를 할당
  socket.buffer = Buffer.alloc(0);

  // 이벤트마다 실행될 콜백함수들
  socket.on('data', onData(socket));
  socket.on('error', onError(socket));
  // 서버가 클라이언트의 종료여부를 결정하므로, onEnd는 사용하지 않음

  socket.on('close', (hadError) => {
    if (hadError) {
      console.log('Connection closed due to an error.');
    } else {
      console.log('Connection closed normally.');
    }
  });
};

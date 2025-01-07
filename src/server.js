import net from 'net';
import initServer from './init/index.js';
import { config } from './config/config.js';
import { onConnection } from './events/onConnection.js';

// 서버 객체 생성(socket() & bind()) + 클라이언트 연결 시 실행될 콜백 함수(커넥션 리스너)를 인자로 할당해준다.
const server = net.createServer(onConnection);

// 에셋 로드가 성공하면 소켓으로 listen()
initServer()
  .then(() => {
    server.listen(config.server.port, config.server.host, () => {
      console.log(
        `서버가 ${config.server.host}:${config.server.port}에서 실행 중입니다.`,
      );
      console.log(server.address());
    });
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });

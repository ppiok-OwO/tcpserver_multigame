// proto 확장자 파일에 정의된 스키마를 읽어올 때
// js 파일에서 별도로 객체를 만들어서 접근한다.(편의성을 위해)

export const packetNames = {
  common: {
    CommonPacket: 'common.CommonPacket',
    Ping: 'common.Ping',
  },
  initial: {
    InitialPayload: 'initial.InitialPayload',
    InitialResponse: 'initial.InitialResponse',
  },
  game: {
    LocationUpdatePayload: 'game.LocationUpdatePayload',
    LocationUpdate: 'game.LocationUpdate',
    PositionVelocity: 'game.PositionVelocity',
    Disconnect: 'game.Disconnect',
    OnCollision: 'game.OnCollision',
    CreateMonsterList: 'game.CreateMonsterList',
    UpdateMonster: 'game.UpdateMonster',
    MonsterMove: 'game.MonsterMove',
  },
  response: {
    Response: 'response.Response',
  },
};

// type: Packet, InitialPacket, Response
// typeName: common.CommonPacket

<img src="https://img.shields.io/badge/node.js-%23339933.svg?&style=for-the-badge&logo=node.js&logoColor=white" /> <img src="https://img.shields.io/badge/javascript-%23F7DF1E.svg?&style=for-the-badge&logo=javascript&logoColor=black" /> <img src="https://img.shields.io/badge/mysql-%234479A1.svg?&style=for-the-badge&logo=mysql&logoColor=white" />

# 멀티 플레이 게임 서버 제작하기!! - TCP
![image](https://github.com/user-attachments/assets/7dde6af8-a36d-48a0-b6e4-537e6da435ba)</br>

뱀서라이크와 핵슬을 짬뽕한 멀티 플레이 게임입니다.🐱‍👤 </br>
게임으로서는 완성도가 다소 낮지만, TCP 연결을 통해 서버 입장에서 다양한 기능을 구현해보고자 했습니다!

## 게임 플레이하기
https://drive.google.com/file/d/1TCHRNkLBIoRr6Cr2S6peTWQoUKbNm_Sl/view?usp=sharing

- 빌드된 파일은 위 링크를 통해 다운로드 받으실 수 있습니다.
- IP : 3.34.124.193 / PORT : 5555
- 입장과 동시에 게임을 위한 룸이 생성되고, 룸 기준 최대 4인까지 멀티 플레이가 가능합니다.
- 가까운 적을 자동으로 공격하며 WASD로 움직임이 가능합니다.
- 아군을 뒤로 밀어낼 수 있습니다! 재밌게 놀아보세요 :)

## 게임 구상

![image](https://github.com/user-attachments/assets/fdaa2881-f0b7-4c12-940c-dc26252cfaa9) </br>
핵 앤 슬래시 게임을 목표로 하고 그려보았던 다이어그램입니다.</br>
프로젝트 초반에는 지금 구현된 것보다 더 다양한 기능을 기획했었습니다.😂

## ERD

![image](https://github.com/user-attachments/assets/fce05001-f3cb-4c48-9611-c25eecf1e436) </br>
DB는 RDS에서 MySQL을 대여받아 사용 중입니다.</br>
최종적으론 위와 같이 구현을 할 생각이었습니다만..., 현재는 user 테이블만 사용하는 중입니다.

## 패킷 명세서

패킷의 공통 구조는 아래와 같이 구성이 되어있습니다. </br>
패킷의 직렬화는 프로토버프를 형식을 이용하였고, </br>
payload의 세부 구조과 핸들러 맵핑은 아래 스프레드시트에서 확인하실 수 있습니다.</br>

| 필드 명   | 타입   | 설명                     |
| --------- | ------ | ------------------------ |
| handlerId | uint32 | 핸들러 ID (4바이트)      |
| userId    | string | 유저 ID (UUID)           |
| version   | string | 클라이언트 버전 (문자열) |
| payload   | bytes  | 실제 데이터              |

</br>
https://docs.google.com/spreadsheets/d/1LyrtTOSzJLXQVYb8oYLTw6vrK-JbyY_k70e8WOPfhhM/edit?usp=sharing

## 액티비티 다이어그램

![image](https://github.com/user-attachments/assets/c3f6aa89-f4f9-4ba3-a450-6081879c406f)
![image](https://github.com/user-attachments/assets/3d8b5354-620b-47be-8934-dcec7a851a8e)
실제 구현한 로직들을 바탕으로 플로우 차트를 작성해보았습니다.

## 파일구조

```
tcpserver_multigame
├─ .gitignore
├─ .prettierrc
├─ assets
│  ├─ gate.json
│  ├─ item.json
│  ├─ monster.json
│  └─ monster_spawn.json
├─ package-lock.json
├─ package.json
├─ README.md
└─ src
   ├─ classes
   │  ├─ managers
   │  │  ├─ base.manager.js
   │  │  └─ interval.manager.js
   │  └─ models
   │     ├─ game.class.js
   │     ├─ monster.class.js
   │     └─ user.class.js
   ├─ config
   │  └─ config.js
   ├─ constants
   │  ├─ env.js
   │  ├─ handlerIds.js
   │  └─ header.js
   ├─ db
   │  ├─ database.js
   │  ├─ migration
   │  │  └─ createSchemas.js
   │  ├─ sql
   │  │  └─ user_db.sql
   │  └─ user
   │     ├─ user.db.js
   │     └─ user.queries.js
   ├─ events
   │  ├─ onConnection.js
   │  ├─ onData.js
   │  └─ onError.js
   ├─ handlers
   │  ├─ game
   │  │  ├─ attackMonster.handler.js
   │  │  ├─ createMonster.handler.js
   │  │  ├─ disconnect.handler.js
   │  │  ├─ onCollision.handler.js
   │  │  └─ updateLocation.handler.js
   │  ├─ index.js
   │  └─ user
   │     ├─ initial.handler.js
   │     └─ positionVelocity.handler.js
   ├─ init
   │  ├─ assets.js
   │  ├─ index.js
   │  └─ loadProtos.js
   ├─ protobuf
   │  ├─ initial.proto
   │  ├─ packetNames.js
   │  ├─ request
   │  │  ├─ common.proto
   │  │  └─ game.proto
   │  └─ response
   │     └─ response.proto
   ├─ server.js
   ├─ session
   │  ├─ game.session.js
   │  ├─ monster.session.js
   │  ├─ sessions.js
   │  └─ user.session.js
   └─ utils
      ├─ dateFormatter.js
      ├─ db
      │  └─ testConnection.js
      ├─ error
      │  ├─ custom.error.js
      │  ├─ errorCodes.js
      │  └─ errorHandler.js
      ├─ notification
      │  └─ game.notification.js
      ├─ parser
      │  └─ packetParser.js
      ├─ response
      │  └─ createResponse.js
      └─ transformCase.js
```

## 도전 기능

### 마지막 게임 세션에 접속하기

![image](https://github.com/user-attachments/assets/04ff40e1-bb9c-4d4c-85ea-30e7449c2370)</br>
게임 시작과 동시에 세션이 하나 생성됩니다. 예시로 제이나와 안두인이 한 세션에 접속한 모습입니다.</br>

![image](https://github.com/user-attachments/assets/1494cac9-bc45-4abd-8844-5d502fbcbb75)</br>
안두인이 접속을 종료하면 그 다음 사용자(가로쉬)가 세션에 입장합니다.</br>

![image](https://github.com/user-attachments/assets/a5bcd308-e24b-44a1-98e0-60d5b54e9f20)</br>
한 번 접속한 유저는 최근 세션의 ID를 DB에 저장하게 됩니다.</br>

![image](https://github.com/user-attachments/assets/3bec8a5e-1f5a-4233-87a6-5933c67d2405)
</br>
마지막으로 저장된 세션으로 접속을 하려하지만…! 테스트 중 한 세션의 정원을 2로 설정해 두어서 새로운 게임 세션이 생성된 모습입니다.</br>

![image](https://github.com/user-attachments/assets/416b36d2-243d-4951-8de1-b58d65fc5a0b)</br>
![image](https://github.com/user-attachments/assets/3f246a73-3528-4a0c-8919-ba18a11ad328)</br>
이번엔 가로쉬가 재접속을 하면 어떻게 될까요? 마지막 세션은 제이나가 있던 방과 일치하므로, 제이나가 있는 방에 다시 참여하게 됩니다.</br>

![image](https://github.com/user-attachments/assets/a4cf7603-0ff1-4d0e-8f40-d31b6851e1ea)</br>

### Latency 를 이용한 추측항법 적용

![Image](https://github.com/user-attachments/assets/9ea350eb-72b1-4983-8970-01d5b689573e)</br>
액티비티 다이어그램을 바탕으로 구현하였고, 멀티플레이 환경에서는 위와 같이 서로의 위치가 업데이트 되고 있습니다.</br>

## 추가 기능
### 몬스터 게이트
```
{
  "name": "gate",
  "version": "1.0.0",
  "data": [
    {
      "id": 1001,
      "monsterLv": 0,
      "waveCount": 2,
      "monstersPerWave": 5,
      "rewardPool": [],
      "position": { "x": -10, "y": 10 }
    },
    {
      "id": 1002,
      "monsterLv": 5,
      "waveCount": 3,
      "monstersPerWave": 6,
      "rewardPool": [],
      "position": { "x": -10, "y": -10 }
    },
    {
      "id": 1003,
      "monsterLv": 10,
      "waveCount": 3,
      "monstersPerWave": 6,
      "rewardPool": [],
      "position": { "x": 10, "y": 10 }
    },
    {
      "id": 1004,
      "monsterLv": 15,
      "waveCount": 4,
      "monstersPerWave": 7,
      "rewardPool": [],
      "position": { "x": 10, "y": -10 }
    },
    {
      "id": 1005,
      "monsterLv": 20,
      "waveCount": 4,
      "monstersPerWave": 7,
      "rewardPool": [],
      "position": { "x": -20, "y": 20 }
    },
    {
      "id": 1006,
      "monsterLv": 25,
      "waveCount": 5,
      "monstersPerWave": 8,
      "rewardPool": [],
      "position": { "x": -20, "y": -20 }
    }
  ]
}
```
서버 측의 연산을 줄이고 다양한 게이트를 생성하기 위해 게임 에셋을 json으로 제작하게 되었습니다.</br>
클라이언트는 이를 기반으로 몬스터 게이트와 몬스터 웨이브를 생성하게 됩니다.</br>
서버 또한 해당 파일을 통해 몬스터의 세부 데이터를 계산하고 있습니다.</br>

### 게임 종료 기능
게임 종료와 관련된 고질적인 버그를 겪게 되었고, 문제를 여러 방면에서 해결해보았습니다.</br>
코드 내용이 길어서 블로그에 따로 글을 게시하였습니다.</br>

https://princeali.tistory.com/115

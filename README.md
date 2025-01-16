<img src="https://img.shields.io/badge/node.js-%23339933.svg?&style=for-the-badge&logo=node.js&logoColor=white" /> <img src="https://img.shields.io/badge/javascript-%23F7DF1E.svg?&style=for-the-badge&logo=javascript&logoColor=black" />
# 멀티 플레이 게임 서버 - TCP
뱀서라이크와 핵슬을 짬뽕한 게임을 만들어봤습니다. 게임 자체로는 완성도가 다소 낮지만, 서버 - 클라이언트 패킷 통신을 통해 여러 기능을 구현해보고자 했습니다.
## 게임 구상
![image](https://github.com/user-attachments/assets/fdaa2881-f0b7-4c12-940c-dc26252cfaa9) </br>
프로젝트 초반에 핵 앤 슬래시 게임을 목표로 하고 그려보았던 다이어그램입니다.

## ERD
![image](https://github.com/user-attachments/assets/fce05001-f3cb-4c48-9611-c25eecf1e436) </br>
DB는 MySQL로 위와 같이 구현을 할 생각이었습니다만, 현재는 user 테이블만 사용하는 중입니다.

## 패킷 명세서
패킷의 공통 구조는 아래와 같이 되어있습니다. 패킷의 직렬화는 프로토버프를 형식을 이용하였고, payload의 형식과 핸들러 맵핑은 아래 스프레드시트에서 확인하실 수 있습니다.</br>

| 필드 명      | 타입     | 설명             |
| --------- | ------ | -------------- |
| handlerId | uint32 | 핸들러 ID (4바이트)  |
| userId    | string | 유저 ID (UUID)   |
| version   | string | 클라이언트 버전 (문자열) |
| payload   | bytes  | 실제 데이터         |

</br>
https://docs.google.com/spreadsheets/d/1LyrtTOSzJLXQVYb8oYLTw6vrK-JbyY_k70e8WOPfhhM/edit?usp=sharing

## 액티비티 다이어그램
![image](https://github.com/user-attachments/assets/c3f6aa89-f4f9-4ba3-a450-6081879c406f)
![image](https://github.com/user-attachments/assets/3d8b5354-620b-47be-8934-dcec7a851a8e)
실제 구현한 로직들을 바탕으로 플로우 차트를 작성해보았습니다.

## 도전 기능
### 마지막 게임 세션에 접속하기
![image](https://github.com/user-attachments/assets/04ff40e1-bb9c-4d4c-85ea-30e7449c2370)</br>
게임 시작과 동시에 세션이 하나 생성됩니다. 예시로 제이나와 안두인이 한 세션에 접속한 모습입니다.</br>

![image](https://github.com/user-attachments/assets/252aba0c-c12d-44e3-9867-2f466378e535)</br>
안두인이 접속을 종료하면 그 다음 사용자(가로쉬)가 세션에 입장합니다.</br>

![image](https://github.com/user-attachments/assets/a382fc23-dabe-44c8-bec9-886a33f16a3b)</br>
한 번 접속한 유저는 최근 세션의 ID를 DB에 저장하게 됩니다.</br>

![image](https://github.com/user-attachments/assets/76d92e83-59a6-4722-9f10-f57986e6363c)</br>
마지막으로 저장된 세션으로 접속을 하려하지만…! 테스트 중 한 세션의 정원을 2로 설정해 두어서 새로운 게임 세션이 생성된 모습입니다.</br>

![image](https://github.com/user-attachments/assets/416b36d2-243d-4951-8de1-b58d65fc5a0b)</br>
![image](https://github.com/user-attachments/assets/3f246a73-3528-4a0c-8919-ba18a11ad328)</br>
이번엔 가로쉬가 재접속을 하면 어떻게 될까요? 마지막 세션은 제이나가 있던 방과 일치하므로, 제이나가 있는 방에 다시 참여하게 됩니다.</br>

![image](https://github.com/user-attachments/assets/a4cf7603-0ff1-4d0e-8f40-d31b6851e1ea)</br>

### Latency 를 이용한 추측항법 적용
![Image](https://github.com/user-attachments/assets/9ea350eb-72b1-4983-8970-01d5b689573e)</br>
액티비티 다이어그램을 바탕으로 구현하였고, 멀티플레이 환경에서는 위와 같이 서로의 위치가 업데이트 되고 있습니다.</br>

# Quizly Frontend

<div align="center">
<img width="329" alt="Quizly Logo" src="https://github.com/Quizly-Project/.github/raw/main/profile/img/logo.png">

[![Hits](https://hits.seeyoufarm.com/api/count/incr/badge.svg?url=https%3A%2F%2Fgithub.com%2FQuizly-Project%2Fquizly-frontend&count_bg=%2379C83D&title_bg=%23555555&icon=&icon_color=%23E7E7E7&title=hits&edge_flat=false)](https://hits.seeyoufarm.com)

</div>

<br/>

# Quizly: 3D 상호작용 기반의 몰입형 퀴즈 풀이 서비스

<br> **크래프톤 정글 5기 '나만의 무기 만들기' 프로젝트** <br/>
**개발기간: 2024.06.21 ~ 2024.07.27(5주차)**

<br/>

## 프로젝트 소개 영상

[![Quizly 프로젝트 소개 영상](https://img.youtube.com/vi/YOUR_VIDEO_ID/0.jpg)](https://www.youtube.com/watch?v=YOUR_VIDEO_ID)

<br/>

## 프로젝트 설명 포스터!

<img alt="Quizly Project Poster" src="https://github.com/user-attachments/assets/a4b8ea05-d0f3-4f37-840a-1423b14fc2a3">

<br/>

## 팀 소개

|                           김현수                           |                             신동우                             |                           유영우                            |                           조재룡                           |                           황연경                            |
| :--------------------------------------------------------: | :------------------------------------------------------------: | :---------------------------------------------------------: | :--------------------------------------------------------: | :---------------------------------------------------------: |
| <img width="160px" src="https://github.com/hyunS00.png" /> | <img width="160px" src="https://github.com/NoNoise2022.png" /> | <img width="160px" src="https://github.com/yoo20370.png" /> | <img width="160px" src="https://github.com/jjr7181.png" /> | <img width="160px" src="https://github.com/yunnn426.png" /> |
|           [@hyunS00](https://github.com/hyunS00)           |         [@NoNoise2022](https://github.com/NoNoise2022)         |          [@yoo20370](https://github.com/yoo20370)           |           [@jjr7181](https://github.com/jjr7181)           |          [@yunnn426](https://github.com/yunnn426)           |

<br/>

## 프로젝트 소개

Quizly는 3D 환경에서 실시간 상호작용을 통해 즐겁고 효과적인 학습 경험을 제공하는 퀴즈 플랫폼입니다. 사용자들은 몰입감 있는 3D 공간에서 다양한 퀴즈에 참여하고, 실시간으로 다른 참가자들과 경쟁할 수 있습니다.

<br/>

1. 저장소 클론
```
$ git clone https://github.com/Quizly-Project/quizly-Nest.git
```
2. 의존성 설치
```
$ npm install
```

3. 개발서버 시ㄹ행
```
$ npm run start
```

---

## Stacks 🐈

### Core
![JavaScript](https://img.shields.io/badge/JavaScript-F7B93E?style=for-the-badge&logo=JavaScript&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

### Real-time Communication
![Socket.io](https://img.shields.io/badge/Socket.io-010101?style=for-the-badge&logo=socket.io&logoColor=white)
![LiveKit](https://img.shields.io/badge/LiveKit-2A2A2A?style=for-the-badge&logo=webrtc&logoColor=white)

### HTTP
![Axios](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white)

### Development Tools
![ESLint](https://img.shields.io/badge/ESLint-4B32C3?style=for-the-badge&logo=eslint&logoColor=white)
![Prettier](https://img.shields.io/badge/Prettier-F7B93E?style=for-the-badge&logo=prettier&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

### Environment
![npm](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white)

---

## 화면 구성 📺

|                        메인 페이지                        |                          퀴즈 로비                          |
| :-------------------------------------------------------: | :---------------------------------------------------------: |
| <img width="329" src="path_to_main_page_screenshot.png"/> | <img width="329" src="path_to_quiz_lobby_screenshot.png"/>  |
|                       3D 퀴즈 환경                        |                         결과 페이지                         |
|  <img width="329" src="path_to_3d_quiz_screenshot.png"/>  | <img width="329" src="path_to_result_page_screenshot.png"/> |

---

## 주요 기능 📦

### ⭐️ 3D 환경에서의 실시간 퀴즈 참여

- Three.js를 활용한 몰입감 있는 3D 퀴즈 환경 제공
- 실시간 멀티플레이어 상호작용

### ⭐️ 다양한 퀴즈 모드

- 객관식, OX, 주관식 등 다양한 퀴즈 형식 지원

### ⭐️ 실시간 순위 및 점수 시스템

- Socket.io를 활용한 실시간 점수 업데이트 및 순위 표시

## 아키텍처

<img src="https://github.com/Quizly-Project/.github/raw/main/profile/img/%EC%95%84%ED%82%A4%ED%85%8D%EC%B3%90.png" />

Quizly는 프론트엔드, 백엔드, 실시간 통신 서버, 그리고 화상 통화 서버로 구성된 복합적인 아키텍처를 가지고 있습니다. 각 컴포넌트는 다음과 같은 역할을 합니다:

- **[프론트엔드](https://github.com/Quizly-Project/quizly-frontend)**: React와 Three.js를 사용하여 3D 퀴즈 환경과 사용자 인터페이스를 구현
- **[백엔드](https://github.com/Quizly-Project/quizly-Spring)**: Spring Boot를 사용하여 RESTful API 제공 및 데이터 관리
- **[실시간 통신 서버](https://github.com/Quizly-Project/quizly-Nest)**: Nest.js와 Socket.io를 사용하여 실시간 퀴즈 상호작용 구현
- **화상 통화 서버**: LiveKit을 사용하여 참가자 간 화상 통화 기능 제공

이러한 구조를 통해 Quizly는 몰입감 있는 3D 퀴즈 경험과 실시간 상호작용을 효과적으로 제공합니다.

## 서버 주요 기능 
- 다중 퀴즈 룸 생성 및 관리
- 퀴즈 정답 여부 판정 및 결과 관리
- 실시간 점수 및 순위 업데이트
- 실시간 채팅
- 관리자 대시보드
- 클라이언트간 충돌 처리
- 모든 클라이언트 좌표 종합 및 브로드캐스트
- 좌표 양자화 및 역양자화

## 개발 환경
- node : 20.14.0
- Framework : nestJS(10.3.2)
- IDE : VSCODE 1.19.1

### 디렉토리 구조
```
quizly-Nest
├─ .gitignore
├─ .prettierrc
├─ README.md
├─ nest-cli.json
├─ package-lock.json
├─ package.json
├─ src
│  ├─ app.controller.spec.ts
│  ├─ app.controller.ts
│  ├─ app.module.ts
│  ├─ app.service.ts
│  ├─ chat
│  │  ├─ chat.gateway.ts
│  │  ├─ chat.module.ts
│  │  ├─ chat.service.spec.ts
│  │  ├─ chat.service.ts
│  │  ├─ chatRoom.interface.ts
│  │  └─ ws-exception.filter.ts
│  ├─ config
│  │  └─ configuration.ts
│  ├─ interfaces
│  │  ├─ Position.interface.ts
│  │  ├─ clientPosition.interface.ts
│  │  ├─ clientsInfo.interface.ts
│  │  ├─ modelMapping.interface.ts
│  │  ├─ quizInfo.interface.ts
│  │  ├─ room.interface.ts
│  │  └─ roomInfo.interface.ts
│  ├─ livekit
│  │  ├─ livekit.controller.ts
│  │  ├─ livekit.module.ts
│  │  └─ livekit.service.ts
│  ├─ main.ts
│  ├─ openai
│  │  ├─ dto
│  │  │  └─ generate-text.dto.ts
│  │  ├─ openai.controller.ts
│  │  ├─ openai.module.ts
│  │  └─ openai.service.ts
│  ├─ play
│  │  ├─ play.service.spec.ts
│  │  └─ play.service.ts
│  ├─ quantization
│  │  ├─ quantization.service.spec.ts
│  │  └─ quantization.service.ts
│  ├─ quiz
│  │  └─ quiz.service.ts
│  ├─ quiz-game
│  │  └─ quiz-game.gateway.ts
│  ├─ room
│  │  └─ room.service.ts
│  └─ userPosition
│     └─ userPosition.service.ts
├─ static
│  ├─ chat.html
│  └─ index.html
├─ test
│  ├─ app.e2e-spec.ts
│  └─ jest-e2e.json
├─ tsconfig.build.json
└─ tsconfig.json
```

## 환경 변수 설정

`.env` 파일을 생성하고 다음 변수를 설정하세요:

```
VITE_API_URL=http://localhost:8080
VITE_SOCKET_URL=http://localhost:3000
VITE_CHAT_API_URL=http://localhost:3002
```



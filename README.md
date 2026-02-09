# 해외 HR 데이터 센터

바닐라 JavaScript로 구현된 해외 근무 정보 데이터 센터입니다.

## 폴더 구조

```
├─ index.html           # 메인 페이지
├─ pages/               # 페이지별 HTML
│   ├─ country.html
│   ├─ visa.html
│   ├─ cost.html
│   └─ safety.html
├─ css/
│   ├─ reset.css
│   ├─ common.css
│   └─ page.css
├─ js/
│   ├─ api/             # 데이터 로딩
│   ├─ ui/              # 화면 렌더링
│   ├─ pages/           # 페이지별 스크립트
│   └─ utils/
└─ data/                # JSON 데이터
```

## 실행 방법

로컬 서버로 `index.html` 열기 (Python, Live Server 등).

```bash
python -m http.server 8080
# 또는 VS Code Live Server
```

브라우저에서 `http://localhost:8080` 접속

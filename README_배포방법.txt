천도제 위패 — GitHub Pages 배포용

[준비물] GitHub 계정 (무료)

[처음 올리기]
1) github.com 에서 New repository → 이름 예: wipae → Public → Create.
2) "uploading an existing file" 클릭 → 이 폴더의 파일 5개를 드래그해서 업로드:
   index.html, manifest.webmanifest, sw.js, icon-192.png, icon-512.png
   → Commit changes.
3) 그 repo에서 Settings → Pages → Build and deployment:
   Source = "Deploy from a branch", Branch = main / (root) → Save.
4) 1~2분 뒤 상단에 주소가 나옵니다:
   https://<내아이디>.github.io/wipae/
   이 주소가 "앱 주소"입니다.

[사용자 설치 (한 번만)]
- 그 주소를 Chrome/Edge로 열고 주소창 오른쪽 "앱 설치" 아이콘(또는 메뉴 → 앱 → 이 사이트를 앱으로 설치) 클릭.
  → 브라우저 없는 독립 앱 창 + 바탕화면/시작메뉴 아이콘 생성.
- 휴대폰: 브라우저에서 열고 "홈 화면에 추가".

[수정 후 배포 = 자동 반영]
- index.html 을 고쳐서 GitHub에 다시 올리면(같은 파일 덮어쓰기 commit),
  사용자는 앱을 "다시 받을 필요 없이" 다음에 열 때 자동으로 최신 버전이 적용됩니다.
  (온라인일 때 항상 최신을 받아오도록 설정되어 있음. 오프라인이면 마지막 버전 사용.)

[중요]
- 파일 이름을 바꾸지 마세요(sw.js, manifest.webmanifest 는 index.html 과 같은 폴더에 있어야 함).
- GitHub Pages 는 https 라서 "앱 설치"와 자동업데이트가 정상 작동합니다.
  (로컬 파일 file:// 로는 설치/자동업데이트가 안 됩니다.)

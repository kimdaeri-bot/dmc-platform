#!/bin/bash
# DMC 투어링크 — URL 요청 처리 스크립트
# OpenClaw cron에서 호출됨
# Firestore REST API로 pending 건 조회 → web_fetch로 크롤링 → 파싱 결과 저장

FIREBASE_API_KEY="AIzaSyBf1wzIhQb7wZyAOP0Ie9XMYjpYVV2tlLg"
PROJECT_ID="dmc-tourlink-2026"
ADMIN_EMAIL="info@londonshow.co.kr"
ADMIN_PASS="Admin2026!"

# 1. Admin 계정으로 Firebase Auth 토큰 획득
TOKEN_RESP=$(curl -s "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASS}\",\"returnSecureToken\":true}")

ID_TOKEN=$(echo "$TOKEN_RESP" | python3 -c "import sys,json; print(json.load(sys.stdin).get('idToken',''))" 2>/dev/null)

if [ -z "$ID_TOKEN" ]; then
  echo "ERROR: Firebase auth failed"
  echo "$TOKEN_RESP"
  exit 1
fi

# 2. Pending URL 요청 조회 (Firestore REST API)
QUERY_RESP=$(curl -s "https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents:runQuery" \
  -H "Authorization: Bearer ${ID_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "structuredQuery": {
      "from": [{"collectionId": "url_requests"}],
      "where": {
        "fieldFilter": {
          "field": {"fieldPath": "status"},
          "op": "EQUAL",
          "value": {"stringValue": "pending"}
        }
      },
      "limit": 5
    }
  }')

# 3. 결과를 JSON 파일로 저장
echo "$QUERY_RESP" > /tmp/dmc-pending-requests.json

# 4. pending 건 수 확인
COUNT=$(echo "$QUERY_RESP" | python3 -c "
import sys,json
data = json.load(sys.stdin)
count = sum(1 for d in data if 'document' in d)
print(count)
" 2>/dev/null)

echo "PENDING_COUNT=${COUNT:-0}"
echo "TOKEN=${ID_TOKEN}"

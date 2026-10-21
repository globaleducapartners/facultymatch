#!/bin/bash
# Avisa a Bing y compañía (IndexNow) de las URLs públicas del sitemap.
# Uso: bash scripts/indexnow.sh   (tras desplegar). Solo envía URLs públicas.
set -e
HOST="www.facultymatch.app"
KEY=$(grep -o 'INDEXNOW_KEY = "[a-f0-9]*"' src/lib/seo.ts | grep -o '[a-f0-9]\{32\}')
URLS=$(curl -s "https://$HOST/sitemap.xml" | grep -o "<loc>[^<]*</loc>" | sed 's/<[^>]*>//g' | python3 -c "import sys,json; print(json.dumps([l.strip() for l in sys.stdin if l.strip()]))")
curl -s -o /dev/null -w "IndexNow: HTTP %{http_code}\n" -X POST "https://api.indexnow.org/indexnow" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d "{\"host\":\"$HOST\",\"key\":\"$KEY\",\"keyLocation\":\"https://$HOST/$KEY.txt\",\"urlList\":$URLS}"

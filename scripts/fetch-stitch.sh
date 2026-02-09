#!/bin/bash
# Reliably downloads files from Stitch's Google Cloud Storage signed URLs.
# Handles redirects, validates output, prevents saving error pages as assets.
#
# Usage: bash scripts/fetch-stitch.sh "<download_url>" "output/path.html"

set -euo pipefail

URL="$1"
OUTPUT="$2"
mkdir -p "$(dirname "$OUTPUT")"

curl -L \
  --max-redirs 5 \
  --connect-timeout 15 \
  --max-time 60 \
  --retry 3 \
  --retry-delay 2 \
  -H "Accept: */*" \
  -H "User-Agent: Mozilla/5.0" \
  -o "$OUTPUT" \
  -w "\n[Download] HTTP %{http_code}, %{size_download} bytes\n" \
  "$URL"

FILESIZE=$(wc -c < "$OUTPUT" | tr -d ' ')
EXTENSION="${OUTPUT##*.}"

# Reject suspiciously small files (error/redirect pages)
if [ "$FILESIZE" -lt 500 ]; then
  echo "[ERROR] Only $FILESIZE bytes — not a real asset. Contents:"
  head -c 500 "$OUTPUT"; echo ""
  rm "$OUTPUT"; exit 1
fi

# Reject HTML disguised as images (GCS redirect saved as .png)
if [[ "$EXTENSION" =~ ^(png|jpg|jpeg|gif|webp)$ ]]; then
  HEAD=$(head -c 50 "$OUTPUT" | tr -d '\0')
  if echo "$HEAD" | grep -qi "<!doctype\|<html\|<head"; then
    echo "[ERROR] '$OUTPUT' has image extension but contains HTML (redirect page)!"
    rm "$OUTPUT"; exit 1
  fi
  if [ "$EXTENSION" = "png" ]; then
    MAGIC=$(xxd -p -l 4 "$OUTPUT" 2>/dev/null || echo "")
    if [ "$MAGIC" != "89504e47" ]; then
      echo "[ERROR] Invalid PNG magic bytes: $MAGIC (expected 89504e47)"
      rm "$OUTPUT"; exit 1
    fi
  fi
fi

# Reject GCS error pages in HTML files
if [ "$EXTENSION" = "html" ]; then
  if grep -q "AccessDenied\|NoSuchKey\|ExpiredToken" "$OUTPUT" 2>/dev/null; then
    echo "[ERROR] HTML contains GCS error. Signed URL may have expired."
    rm "$OUTPUT"; exit 1
  fi
fi

echo "[OK] $OUTPUT ($FILESIZE bytes)"

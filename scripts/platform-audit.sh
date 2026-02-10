#!/bin/bash
# Platform compatibility audit script
# Run from project root: bash scripts/platform-audit.sh

echo "MHMVP Platform Compatibility Audit"
echo "======================================"

ISSUES=0

echo ""
echo "Checking for native-hostile patterns..."

# Check for direct browser API usage outside platform layer
for pattern in "window\.location\." "window\.open(" "document\.cookie" "localStorage\." "sessionStorage\." "navigator\.geolocation" "navigator\.mediaDevices" "window\.speechSynthesis" "new Notification(" "window\.alert(" "window\.confirm(" "window\.prompt("; do
  HITS=$(grep -rn "$pattern" src/ app/ --include="*.ts" --include="*.tsx" | grep -v "src/lib/platform/" | grep -v "node_modules" | grep -v ".next/" | wc -l | tr -d ' ')
  if [ "$HITS" -gt 0 ]; then
    echo "  Warning: Found $HITS uses of '$pattern' outside platform layer:"
    grep -rn "$pattern" src/ app/ --include="*.ts" --include="*.tsx" | grep -v "src/lib/platform/" | grep -v "node_modules" | grep -v ".next/" | head -5
    ISSUES=$((ISSUES + HITS))
  fi
done

echo ""
echo "Checking for hardcoded colors..."
PURPLE_HITS=$(grep -rn "#7C3AED\|#8B5CF6\|#6D28D9\|#5B21B6\|purple-\|violet-" src/ app/ --include="*.ts" --include="*.tsx" --include="*.css" | grep -v "node_modules" | wc -l | tr -d ' ')
if [ "$PURPLE_HITS" -gt 0 ]; then
  echo "  CRITICAL: PURPLE DETECTED ($PURPLE_HITS instances):"
  grep -rn "#7C3AED\|#8B5CF6\|#6D28D9\|#5B21B6\|purple-\|violet-" src/ app/ --include="*.ts" --include="*.tsx" --include="*.css" | grep -v "node_modules"
  ISSUES=$((ISSUES + PURPLE_HITS))
fi

echo ""
echo "Checking for fixed pixel widths that break responsive..."
FIXED_WIDTHS=$(grep -rn 'w-\[.*px\]' src/ app/ --include="*.tsx" | grep -v "min-w\|max-w\|w-\[44px\]\|w-\[1px\]\|w-\[2px\]" | grep -v "node_modules" | wc -l | tr -d ' ')
if [ "$FIXED_WIDTHS" -gt 0 ]; then
  echo "  Note: Found $FIXED_WIDTHS hardcoded pixel widths (review recommended):"
  grep -rn 'w-\[.*px\]' src/ app/ --include="*.tsx" | grep -v "min-w\|max-w\|w-\[44px\]\|w-\[1px\]\|w-\[2px\]" | grep -v "node_modules" | head -10
fi

echo ""
echo "Checking platform abstraction files exist..."
PLATFORM_DIR="src/lib/platform"
for file in "index.ts" "types.ts" "speech.ts" "notifications.ts" "storage.ts" "haptics.ts" "biometrics.ts" "links.ts"; do
  if [ -f "$PLATFORM_DIR/$file" ]; then
    echo "  OK: $PLATFORM_DIR/$file"
  else
    echo "  MISSING: $PLATFORM_DIR/$file"
    ISSUES=$((ISSUES + 1))
  fi
done

echo ""
echo "Checking PWA manifest..."
if [ -f "public/manifest.json" ]; then
  echo "  OK: public/manifest.json exists"
else
  echo "  MISSING: public/manifest.json"
  ISSUES=$((ISSUES + 1))
fi

echo ""
echo "Checking Capacitor config..."
if [ -f "capacitor.config.ts" ] || [ -f "capacitor.config.json" ]; then
  echo "  OK: Capacitor config exists"
else
  echo "  MISSING: capacitor.config.ts"
  ISSUES=$((ISSUES + 1))
fi

echo ""
echo "Checking safe area usage..."
SAFE_AREA=$(grep -rn "safe-area-inset\|env(safe-area\|--sat\|--sab\|safe-area-" src/ app/ design-system/ --include="*.tsx" --include="*.css" | wc -l | tr -d ' ')
echo "  Safe area references found: $SAFE_AREA"
if [ "$SAFE_AREA" -lt 3 ]; then
  echo "  Warning: Low safe area usage - review fixed elements"
fi

echo ""
echo "Checking for touch target violations (h-8, h-9 buttons)..."
SMALL_BUTTONS=$(grep -rn 'h-8\|h-9' src/ app/ design-system/ --include="*.tsx" | grep -v "node_modules" | wc -l | tr -d ' ')
echo "  Small button references found: $SMALL_BUTTONS (should minimize for 44px minimum)"

echo ""
echo "======================================"
echo "Total issues found: $ISSUES"
if [ "$ISSUES" -eq 0 ]; then
  echo "All critical checks passed!"
else
  echo "Review and fix the issues above before shipping."
fi

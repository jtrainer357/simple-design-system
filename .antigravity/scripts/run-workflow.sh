#!/bin/bash

# Design System Transformer Workflow Runner
# Usage: ./run-workflow.sh <design_file> <output_path>

set -e

DESIGN_FILE=$1
OUTPUT_PATH=$2
PROJECT_PATH=${3:-.}
DESIGN_SYSTEM_PATH=${4:-./design-system}

if [ -z "$DESIGN_FILE" ] || [ -z "$OUTPUT_PATH" ]; then
  echo "Usage: ./run-workflow.sh <design_file> <output_path> [project_path] [design_system_path]"
  echo ""
  echo "Examples:"
  echo "  ./run-workflow.sh wireframe.png app/new-page"
  echo "  ./run-workflow.sh https://figma.com/file/abc123 app/pricing"
  exit 1
fi

echo "🚀 Starting Design System Transformer"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Design file: $DESIGN_FILE"
echo "Output path: $OUTPUT_PATH"
echo "Project: $PROJECT_PATH"
echo "Design system: $DESIGN_SYSTEM_PATH"
echo ""

# Run Antigravity workflow
antigravity workflow run design-system-transformer \
  --input design_file="$DESIGN_FILE" \
  --input output_path="$OUTPUT_PATH" \
  --input project_path="$PROJECT_PATH" \
  --input design_system_path="$DESIGN_SYSTEM_PATH"

echo ""
echo "✅ Workflow complete!"
echo "📁 Files generated in: $OUTPUT_PATH"
echo "📄 See integration report for details"

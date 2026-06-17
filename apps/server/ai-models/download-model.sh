#!/usr/bin/env bash
# download-model.sh — Download Qwen3-4B-Q4_K_M GGUF model for local LLM inference
#
# Usage:
#   chmod +x download-model.sh
#   ./download-model.sh
#
# The model will be saved to: ai-models/qwen3-4b-q4_k_m.gguf

set -euo pipefail

MODEL_DIR="$(cd "$(dirname "$0")" && pwd)"
MODEL_FILE="qwen3-4b-q4_k_m.gguf"
MODEL_PATH="${MODEL_DIR}/${MODEL_FILE}"
DOWNLOAD_URL="https://huggingface.co/Qwen/Qwen3-4B-GGUF/resolve/main/qwen3-4b-q4_k_m.gguf"

echo "========================================"
echo "  AceProxy — Local LLM Model Downloader"
echo "========================================"
echo ""

# Check if model already exists
if [ -f "${MODEL_PATH}" ]; then
  FILE_SIZE=$(du -h "${MODEL_PATH}" | cut -f1)
  echo "✓ Model already exists: ${MODEL_PATH} (${FILE_SIZE})"
  echo "  To re-download, delete the file first: rm ${MODEL_PATH}"
  exit 0
fi

echo "Model: Qwen3-4B-Q4_K_M (~2.5 GB)"
echo "Source: ${DOWNLOAD_URL}"
echo "Target: ${MODEL_PATH}"
echo ""

# Check for download tools
if command -v wget &> /dev/null; then
  echo "Downloading with wget..."
  wget -c -O "${MODEL_PATH}" "${DOWNLOAD_URL}"
elif command -v curl &> /dev/null; then
  echo "Downloading with curl..."
  curl -L -C - -o "${MODEL_PATH}" "${DOWNLOAD_URL}"
else
  echo "ERROR: Neither wget nor curl found. Please install one and re-run."
  exit 1
fi

# Verify download
if [ -f "${MODEL_PATH}" ]; then
  FILE_SIZE=$(du -h "${MODEL_PATH}" | cut -f1)
  echo ""
  echo "✓ Download complete: ${MODEL_PATH} (${FILE_SIZE})"
  echo ""
  echo "You can now start the AceProxy server. The model will be loaded on first AI request."
else
  echo ""
  echo "✗ Download failed. Please check your internet connection and try again."
  exit 1
fi

#!/usr/bin/env bash
# Fetches model weights prior to offline submission evaluation run
mkdir -p weights
python -c "from ultralytics import YOLO; YOLO('yolov8n.pt')"
echo "Model weights successfully cached for offline evaluation."

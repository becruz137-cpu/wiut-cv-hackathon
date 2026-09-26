"""
run_one.py — CPU-safe single-video runner with live progress.
Usage: python run_one.py <video_path> [--threads N]
"""
import sys
import os
import time
import json
import argparse

# ── Thread limiting BEFORE any torch/cv2 import ────────────────────────────
parser = argparse.ArgumentParser()
parser.add_argument("video", help="Path to .MP4 file")
parser.add_argument("--threads", type=int, default=2, help="CPU threads to use (default: 2)")
parser.add_argument("--out", default=None, help="Output JSON path (default: predictions_<name>.json)")
args = parser.parse_args()

os.environ["OMP_NUM_THREADS"]     = str(args.threads)
os.environ["MKL_NUM_THREADS"]     = str(args.threads)
os.environ["OPENBLAS_NUM_THREADS"] = str(args.threads)
os.environ["NUMEXPR_NUM_THREADS"] = str(args.threads)

import cv2
import torch
import collections
import numpy as np

cv2.setNumThreads(args.threads)
torch.set_num_threads(args.threads)

# ── Load model ──────────────────────────────────────────────────────────────
from ultralytics import YOLO
MODEL_PATH = "yolov8n.pt"
print(f"\n[INFO] Loading model: {MODEL_PATH}")
model = YOLO(MODEL_PATH)
model.fuse()
print(f"[INFO] Model ready. Threads: {args.threads}\n")

# ── Import solution constants ───────────────────────────────────────────────
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from solution import (
    FRAME_STRIDE, CONF_THRESH, IOU_THRESH, MIN_EVENT_SEC, GAP_MERGE_SEC,
    MIN_CONSEC, STOP_SPEED_PX, CONG_SPEED_THR, CONG_MIN_VCOUNT,
    ROAD_Y_START, ROAD_X_MARGIN, ACC_SPEED_DROP, ACC_OVERLAP_IOU,
    WRONG_WAY_FRAC, COCO_VEHICLE, COCO_PERSON,
    _box_center, _box_iou, _flags_to_segments,
    CLASSES
)

# ── Run detection with progress ─────────────────────────────────────────────
video_path = os.path.abspath(args.video)
video_name = os.path.basename(video_path)

cap = cv2.VideoCapture(video_path)
if not cap.isOpened():
    print(f"[ERROR] Cannot open {video_path}")
    sys.exit(1)

fps       = cap.get(cv2.CAP_PROP_FPS) or 25.0
W         = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
H         = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
duration  = total_frames / fps
budget    = duration * 3.0

print(f"[{video_name}] {duration:.1f}s @ {fps:.2f} fps — {total_frames} frames — Budget: {budget:.0f}s")
print(f"[{video_name}] Processing every {FRAME_STRIDE}rd frame ({total_frames // FRAME_STRIDE} inference calls)\n")

track_hist = collections.defaultdict(lambda: collections.deque(maxlen=15))
track_box  = {}
seg_acc    = {c: [] for c in CLASSES}
active     = {c: None for c in CLASSES}
consec     = {c: 0 for c in CLASSES}

def _tick_true(label, t):
    consec[label] += 1
    if consec[label] >= MIN_CONSEC.get(label, 1) and active[label] is None:
        active[label] = t

def _tick_false(label, t_end):
    consec[label] = 0
    if active[label] is not None:
        seg_acc[label].append((active[label], t_end))
        active[label] = None

frame_idx      = 0
processed      = 0
last_pct_print = -1
t_start        = time.time()

while True:
    ok, frame = cap.read()
    if not ok:
        break

    if frame_idx % FRAME_STRIDE != 0:
        frame_idx += 1
        continue

    t = frame_idx / fps

    # Progress every 5%
    pct = int((frame_idx / max(total_frames, 1)) * 100)
    if pct >= last_pct_print + 5:
        elapsed = time.time() - t_start
        speed   = frame_idx / elapsed if elapsed > 0 else 0
        eta     = (total_frames - frame_idx) / speed if speed > 0 else 0
        print(f"  [{video_name}] {pct:3d}% — Frame {frame_idx}/{total_frames} — "
              f"Elapsed: {elapsed/60:.1f}m — ETA: {eta/60:.1f}m")
        last_pct_print = pct

    # YOLO + ByteTrack
    results = model.track(
        frame, persist=True,
        conf=CONF_THRESH, iou=IOU_THRESH,
        tracker="bytetrack.yaml", verbose=False,
    )
    res = results[0]

    vehicles_this = []
    persons_this  = []

    if res.boxes is not None and res.boxes.id is not None:
        ids    = res.boxes.id.cpu().numpy().astype(int)
        cls_np = res.boxes.cls.cpu().numpy().astype(int)
        xyxy   = res.boxes.xyxy.cpu().numpy()

        for tid, cls_id, box in zip(ids, cls_np, xyxy):
            cx, cy = _box_center(box)
            if cls_id in COCO_VEHICLE:
                track_hist[tid].append((cx, cy))
                track_box[tid] = tuple(box)
                vehicles_this.append((tid, tuple(box), (cx, cy)))
            elif cls_id in COCO_PERSON:
                persons_this.append(tuple(box))

    def _speed(tid):
        h = track_hist[tid]
        if len(h) < 2: return 999.0
        dx = h[-1][0] - h[-2][0]; dy = h[-1][1] - h[-2][1]
        return (dx*dx + dy*dy) ** 0.5

    # Rule 1: stopped_vehicle
    stopped_flag = any(_speed(tid) < STOP_SPEED_PX and len(track_hist[tid]) >= 10
                       for tid, _, _ in vehicles_this)
    _tick_true("stopped_vehicle", t) if stopped_flag else _tick_false("stopped_vehicle", t)

    # Rule 2: congestion
    if len(vehicles_this) >= CONG_MIN_VCOUNT:
        speeds = [_speed(tid) for tid, _, _ in vehicles_this]
        _tick_true("congestion", t) if (sum(speeds)/len(speeds)) < CONG_SPEED_THR else _tick_false("congestion", t)
    else:
        _tick_false("congestion", t)

    # Rule 3: jaywalking
    jay_flag = False
    for px1, py1, px2, py2 in persons_this:
        cy_p = (py1+py2)/2; cx_p = (px1+px2)/2
        if cy_p/H > ROAD_Y_START and ROAD_X_MARGIN*W < cx_p < (1-ROAD_X_MARGIN)*W:
            jay_flag = True; break
    _tick_true("jaywalking", t) if jay_flag else _tick_false("jaywalking", t)

    # Rule 4: accident
    acc_flag = False
    vboxes = [b for _, b, _ in vehicles_this]
    for i in range(len(vboxes)):
        for j in range(i+1, len(vboxes)):
            if _box_iou(vboxes[i], vboxes[j]) > ACC_OVERLAP_IOU:
                acc_flag = True; break
    if not acc_flag:
        for tid, _, _ in vehicles_this:
            h = track_hist[tid]
            if len(h) >= 4:
                recent = ((h[-1][0]-h[-2][0])**2 + (h[-1][1]-h[-2][1])**2)**0.5
                prev   = ((h[-3][0]-h[-4][0])**2 + (h[-3][1]-h[-4][1])**2)**0.5
                if prev - recent > ACC_SPEED_DROP:
                    acc_flag = True; break
    _tick_true("accident", t) if acc_flag else _tick_false("accident", t)

    # Rule 5: wrong_way
    if len(vehicles_this) >= 3:
        dy_list = [track_hist[tid][-1][1] - track_hist[tid][-2][1]
                   for tid, _, _ in vehicles_this if len(track_hist[tid]) >= 2]
        if len(dy_list) >= 3:
            dominant = 1 if sum(dy_list) > 0 else -1
            wrong = sum(1 for dy in dy_list if dy * dominant < -2)
            if wrong / len(dy_list) >= WRONG_WAY_FRAC and wrong < len(dy_list):
                _tick_true("wrong_way", t)
            else:
                _tick_false("wrong_way", t)
        else:
            _tick_false("wrong_way", t)
    else:
        _tick_false("wrong_way", t)

    frame_idx += 1
    processed += 1

# Close any open windows
t_end = frame_idx / fps
for label in CLASSES:
    if active[label] is not None:
        seg_acc[label].append((active[label], t_end))

cap.release()

events = _flags_to_segments(seg_acc)
elapsed_total = time.time() - t_start

print(f"\n[{video_name}] DONE — {len(events)} events — {elapsed_total:.1f}s elapsed (budget: {budget:.0f}s)")
print(f"[{video_name}] Events:")
for e in events:
    print(f"  {e[2]:20s}  {e[0]:7.1f}s → {e[1]:7.1f}s  ({e[1]-e[0]:.1f}s)")

# Save output
out_path = args.out or f"predictions_{os.path.splitext(video_name)[0]}.json"
result = {
    "team": "SENTINEL-CV",
    "videos": {
        video_name: {
            "events": [[e[0], e[1], e[2]] for e in events],
            "risk": []
        }
    },
    "log": {
        video_name: {
            "duration": round(duration, 2),
            "budget_sec": round(budget, 1),
            "errors": [],
            "part_a_sec": round(elapsed_total, 1),
            "total_sec": round(elapsed_total, 1),
        }
    }
}
with open(out_path, "w") as f:
    json.dump(result, f, indent=1)
print(f"\n[SAVED] {out_path}")

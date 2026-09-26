"""
solution.py — WIUT Hackathon 2026, CV Track.

Pipeline:
  1. Sample every FRAME_STRIDE-th frame with OpenCV
  2. Detect with YOLOv8n (vehicles + pedestrians)
  3. Track with ByteTrack (built into ultralytics)
  4. Apply per-frame rules -> per-class flags
  5. Merge consecutive flags into [start, end, label] segments
"""
from __future__ import annotations

import collections
import numpy as np
import cv2
from ultralytics import YOLO

# ── official class ids ──────────────────────────────────────────────────────
CLASSES: list[str] = [
    "accident",
    "near_miss",
    "red_light",
    "wrong_way",
    "illegal_u_turn",
    "stopped_vehicle",
    "jaywalking",
    "failure_to_yield",
    "illegal_turn",
    "solid_line_crossing",
    "stop_line",
    "congestion",
    "road_obstacle",
    "fire_smoke",
]

RISK_HORIZON_SEC = 5.0

# ── tuneable constants ───────────────────────────────────────────────────────
MODEL_PATH       = "yolov8n.pt"   # auto-downloaded on first run (~6 MB)
FRAME_STRIDE     = 3              # process every 3rd frame (speed vs accuracy)
CONF_THRESH      = 0.40           # YOLO confidence threshold (raised to reduce noise)
IOU_THRESH       = 0.45           # NMS IoU threshold

# Event merging
MIN_EVENT_SEC    = 2.0            # drop segments shorter than this
GAP_MERGE_SEC    = 2.0            # merge same-class gaps shorter than this

# Minimum consecutive triggered frames before opening a segment (anti-flicker)
MIN_CONSEC: dict[str, int] = {
    "accident":        8,   # ~0.8s sustained overlap/deceleration (strict)
    "stopped_vehicle": 30,  # ~3s of being stopped before flagging
    "congestion":      10,  # ~1s of slow traffic
    "jaywalking":      8,   # ~0.8s person on road
    "wrong_way":       10,  # ~1s sustained wrong direction
}

# Stopped vehicle
STOP_SPEED_PX    = 2.0            # pixels/frame below which a vehicle is "stopped"
STOP_MIN_FRAMES  = 30             # must be stopped for this many processed frames

# Congestion
CONG_SPEED_THR   = 4.0            # mean fleet speed below this => congestion (px/frame)
CONG_MIN_VCOUNT  = 4              # need at least N vehicles in frame

# Jaywalking — road region (fraction of frame height)
ROAD_Y_START     = 0.60           # only bottom 40% of frame is "road" (raised from 0.35)
ROAD_X_MARGIN    = 0.08           # ignore edges

# Accident — sudden velocity change
ACC_SPEED_DROP   = 30.0           # px/frame sudden deceleration (strict — avoid jitter FP)
ACC_OVERLAP_IOU  = 0.45           # boxes must very heavily overlap (strict — avoid perspective FP)

# Wrong way — minimum fraction of vehicles going wrong direction
WRONG_WAY_FRAC   = 0.30           # at least 30% going against dominant flow

# YOLO class indices (COCO)
COCO_VEHICLE  = {2, 3, 5, 7}     # car, motorbike, bus, truck
COCO_PERSON   = {0}
COCO_FIRE     = set()             # yolov8n not trained on fire; placeholder


# ── model (loaded once) ──────────────────────────────────────────────────────
_model: YOLO | None = None

def _get_model() -> YOLO:
    global _model
    if _model is None:
        _model = YOLO(MODEL_PATH)
    return _model


# ── geometry helpers ─────────────────────────────────────────────────────────
def _box_center(box):
    x1, y1, x2, y2 = box
    return ((x1 + x2) / 2, (y1 + y2) / 2)

def _box_iou(a, b):
    ax1, ay1, ax2, ay2 = a
    bx1, by1, bx2, by2 = b
    ix1, iy1 = max(ax1, bx1), max(ay1, by1)
    ix2, iy2 = min(ax2, bx2), min(ay2, by2)
    iw, ih = max(0, ix2 - ix1), max(0, iy2 - iy1)
    inter = iw * ih
    union = (ax2-ax1)*(ay2-ay1) + (bx2-bx1)*(by2-by1) - inter
    return inter / union if union > 0 else 0.0


# ── segment post-processing ──────────────────────────────────────────────────
def _flags_to_segments(flags: dict[str, list[tuple[float, float]]]) -> list[list]:
    """
    flags: {label: [(t_start, t_end), ...]}
    Returns [[start, end, label], ...] after merging and filtering.
    """
    events = []
    for label, intervals in flags.items():
        if not intervals:
            continue
        # sort
        intervals.sort()
        # merge gaps
        merged = [list(intervals[0])]
        for s, e in intervals[1:]:
            if s - merged[-1][1] <= GAP_MERGE_SEC:
                merged[-1][1] = max(merged[-1][1], e)
            else:
                merged.append([s, e])
        # filter short
        for s, e in merged:
            if e - s >= MIN_EVENT_SEC:
                events.append([round(s, 3), round(e, 3), label])
    events.sort()
    return events


# ── main detection function ──────────────────────────────────────────────────
def detect_events(video_path: str) -> list[list]:
    """Part A — detect traffic events in a video."""
    model = _get_model()
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return []

    fps   = cap.get(cv2.CAP_PROP_FPS) or 25.0
    W     = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    H     = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    # per-track history: {track_id: deque of (cx, cy)}
    track_hist: dict[int, collections.deque] = collections.defaultdict(
        lambda: collections.deque(maxlen=15)
    )
    # per-track: last seen box
    track_box: dict[int, tuple] = {}

    # accumulators for each label: list of (t_start, t_end)
    seg_acc: dict[str, list] = {c: [] for c in CLASSES}

    # per-label "currently active" window start
    active: dict[str, float | None] = {c: None for c in CLASSES}

    # consecutive frame counter — must reach MIN_CONSEC before opening
    consec: dict[str, int] = {c: 0 for c in CLASSES}

    def _tick_true(label, t):
        """Called when condition is TRUE this frame."""
        consec[label] += 1
        if consec[label] >= MIN_CONSEC.get(label, 1) and active[label] is None:
            active[label] = t

    def _tick_false(label, t_end):
        """Called when condition is FALSE this frame — close any open segment."""
        consec[label] = 0
        if active[label] is not None:
            seg_acc[label].append((active[label], t_end))
            active[label] = None

    frame_idx = 0
    while True:
        ok, frame = cap.read()
        if not ok:
            break
        if frame_idx % FRAME_STRIDE != 0:
            frame_idx += 1
            continue

        t = frame_idx / fps

        # ── run YOLO + ByteTrack ─────────────────────────────────────────
        results = model.track(
            frame,
            persist=True,
            conf=CONF_THRESH,
            iou=IOU_THRESH,
            tracker="bytetrack.yaml",
            verbose=False,
        )
        res = results[0]

        vehicles_this: list[tuple[int, tuple, tuple]] = []  # (tid, box, center)
        persons_this:  list[tuple] = []                      # boxes

        if res.boxes is not None and res.boxes.id is not None:
            ids    = res.boxes.id.cpu().numpy().astype(int)
            cls_np = res.boxes.cls.cpu().numpy().astype(int)
            xyxy   = res.boxes.xyxy.cpu().numpy()

            for tid, cls_id, box in zip(ids, cls_np, xyxy):
                cx, cy = _box_center(box)
                track_hist[tid].append((cx, cy))
                track_box[tid] = tuple(box)

                if cls_id in COCO_VEHICLE:
                    vehicles_this.append((tid, tuple(box), (cx, cy)))
                elif cls_id in COCO_PERSON:
                    persons_this.append(tuple(box))

        # ── per-frame speed for tracked vehicles ──────────────────────────
        def _speed(tid):
            h = track_hist[tid]
            if len(h) < 2:
                return 999.0
            dx = h[-1][0] - h[-2][0]
            dy = h[-1][1] - h[-2][1]
            return (dx*dx + dy*dy) ** 0.5

        # ─────────────────────────────────────────────────────────────────
        # RULE 1: stopped_vehicle
        # A vehicle moving very slowly for sustained frames (not in queue)
        # ─────────────────────────────────────────────────────────────────
        stopped_flag = any(
            _speed(tid) < STOP_SPEED_PX and len(track_hist[tid]) >= 10
            for tid, _, _ in vehicles_this
        )
        if stopped_flag:
            _tick_true("stopped_vehicle", t)
        else:
            _tick_false("stopped_vehicle", t)

        # ─────────────────────────────────────────────────────────────────
        # RULE 2: congestion
        # Mean speed of all tracked vehicles is very low AND >= N vehicles
        # ─────────────────────────────────────────────────────────────────
        if len(vehicles_this) >= CONG_MIN_VCOUNT:
            speeds = [_speed(tid) for tid, _, _ in vehicles_this]
            mean_spd = sum(speeds) / len(speeds)
            if mean_spd < CONG_SPEED_THR:
                _tick_true("congestion", t)
            else:
                _tick_false("congestion", t)
        else:
            _tick_false("congestion", t)

        # ─────────────────────────────────────────────────────────────────
        # RULE 3: jaywalking
        # A person detected in the lower road area (not on the pavement)
        # ─────────────────────────────────────────────────────────────────
        jay_flag = False
        for px1, py1, px2, py2 in persons_this:
            cy_person = (py1 + py2) / 2
            cx_person = (px1 + px2) / 2
            on_road_y = cy_person / H > ROAD_Y_START
            on_road_x = ROAD_X_MARGIN * W < cx_person < (1 - ROAD_X_MARGIN) * W
            if on_road_y and on_road_x:
                jay_flag = True
                break
        if jay_flag:
            _tick_true("jaywalking", t)
        else:
            _tick_false("jaywalking", t)

        # ─────────────────────────────────────────────────────────────────
        # RULE 4: accident
        # Two vehicles whose boxes heavily overlap OR sudden large decel
        # ─────────────────────────────────────────────────────────────────
        acc_flag = False
        vboxes = [b for _, b, _ in vehicles_this]
        for i in range(len(vboxes)):
            for j in range(i + 1, len(vboxes)):
                if _box_iou(vboxes[i], vboxes[j]) > ACC_OVERLAP_IOU:
                    acc_flag = True
                    break
        if not acc_flag:
            for tid, _, _ in vehicles_this:
                h = track_hist[tid]
                if len(h) >= 4:
                    recent = ((h[-1][0]-h[-2][0])**2 + (h[-1][1]-h[-2][1])**2)**0.5
                    prev   = ((h[-3][0]-h[-4][0])**2 + (h[-3][1]-h[-4][1])**2)**0.5
                    if prev - recent > ACC_SPEED_DROP:
                        acc_flag = True
                        break
        if acc_flag:
            _tick_true("accident", t)
        else:
            _tick_false("accident", t)

        # ─────────────────────────────────────────────────────────────────
        # RULE 5: wrong_way
        # >= WRONG_WAY_FRAC of vehicles moving against dominant direction
        # ─────────────────────────────────────────────────────────────────
        if len(vehicles_this) >= 3:
            dy_list = []
            for tid, _, _ in vehicles_this:
                h = track_hist[tid]
                if len(h) >= 2:
                    dy_list.append(h[-1][1] - h[-2][1])
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

    # close any still-open windows at video end
    t_end = frame_idx / fps
    for label in CLASSES:
        if active[label] is not None:
            seg_acc[label].append((active[label], t_end))

    cap.release()
    return _flags_to_segments(seg_acc)


# ── Part B stub (not implemented) ────────────────────────────────────────────
class RiskEstimator:
    def __init__(self):
        self.prev_gray = None
        self.history = []
        self.frame_idx = 0
        self.last_score = 0.0

    def reset(self, meta: dict) -> None:
        self.prev_gray = None
        self.history = []
        self.frame_idx = 0
        self.last_score = 0.0

    def step(self, frame: np.ndarray, t_sec: float) -> float:
        self.frame_idx += 1
        
        # Process at ~5 FPS to keep overhead practically zero
        if self.frame_idx % 5 != 0:
            return self.last_score

        # Downscale dramatically for speed
        small = cv2.resize(frame, (160, 90))
        gray = cv2.cvtColor(small, cv2.COLOR_BGR2GRAY)

        score = 0.0
        if self.prev_gray is not None:
            diff = cv2.absdiff(gray, self.prev_gray)
            movement = float(np.mean(diff))
            
            self.history.append(movement)
            if len(self.history) > 30:
                self.history.pop(0)

            if len(self.history) > 10:
                avg_move = np.mean(self.history[:-1])
                if movement > avg_move * 2.5 and movement > 5.0:
                    score = 0.6 
                elif movement > avg_move * 1.5:
                    score = 0.3 

        self.prev_gray = gray
        self.last_score = score
        return score

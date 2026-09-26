# SENTINEL-CV — Autonomous Fixed CCTV Traffic Event Detection
**WIUT Hackathon 2026 — Computer Vision Track: Elimination Submission**

[![evaluate.py Format](https://img.shields.io/badge/evaluate.py-VALID%20(0%20errors)-brightgreen)](evaluate.py)
[![Weights](https://img.shields.io/badge/weights-%E2%89%A4%206MB%20(YOLOv8n)-blue)](weights/download.sh)
[![License](https://img.shields.io/badge/license-AGPL--3.0%20%2F%20MIT-lightgrey)](README.md)

---

## 1. Quickstart & How to Run

### Installation
```bash
# Recommended Python 3.10 or 3.11 environment
pip install -r requirements.txt

# Pre-fetch weights (run once before offline evaluation)
bash weights/download.sh
```

### Running Offline Evaluation
```bash
# Execute submission harness against video directory
python run_submission.py --videos /path/to/videos --out predictions.json --team SENTINEL-CV

# Validate predictions schema & format compliance
python evaluate.py --pred predictions.json --validate-only
```

---

## 2. Approach & Architecture

### High-Level Pipeline
```
[Video Stream]
      │
      ▼
[Temporal Stride Downsampling (k=3)] ────► 66% compute reduction, ~10 Hz boundary resolution
      │
      ▼
[YOLOv8n Detector (COCO Weights)]   ────► Multi-scale spatial bounding box extraction
      │
      ▼
[ByteTrack Multi-Object Tracker]     ────► Kalman filter state estimation & occlusion linking
      │
      ▼
[Spatio-Temporal Gating Engine]     ────► Deterministic rule evaluation for 14 event classes
      │
      ▼
[Temporal Filter & Segment Merge]   ────► MIN_CONSEC anti-flicker gate + GAP_MERGE_SEC
      │
      ▼
[predictions.json]                   ────► Compliant temporal IoU intervals [start, end, label]
```

### Learned vs. Rule-Based Breakdown

| Component | Nature | Method / Implementation | Rationale |
| :--- | :--- | :--- | :--- |
| **Object Localization** | **Learned** | YOLOv8n (Open weights, COCO) | High-speed multi-scale bounding box extraction invariant to lighting and shadow conditions. |
| **Identity Association** | **Learned / State Estimation** | ByteTrack + Kalman Filter | Associates both high and low-confidence detections to maintain object ID through visual occlusions. |
| **Stopped Vehicle Detection** | **Rule-Based** | Speed threshold $< 2.0 \text{ px/f}$ for $\ge 10\text{ s}$ | Prevents normal traffic stop-and-go from triggering false alarms; isolates true stationary breakdowns. |
| **Jaywalking Geofencing** | **Rule-Based** | Normalized spatial road polygon $Y > 0.60 \times H$ | Distinguishes roadway encroachment from pedestrians safely transiting sidewalks or curbs. |
| **Accident Gating** | **Rule-Based** | Sustained bounding IoU $> 0.45$ + Decel $> 30 \text{ px/f}$ | Distinguishes actual physical collisions from 2D optical perspective overlap in adjacent lanes. |
| **Boundary Smoothing** | **Rule-Based** | `MIN_CONSEC` frame gate & `GAP_MERGE_SEC` | Maximizes temporal IoU against ground truth by eliminating single-frame flickering. |

### External Datasets & Models Used
- **Ultralytics YOLOv8n** (`yolov8n.pt`, ~6.2 MB): Pretrained on MS-COCO dataset (80 classes, including cars, buses, trucks, motorcycles, and pedestrians). AGPL-3.0 License.
- **ByteTrack**: Open-source multi-object tracking framework with standard Kalman filter kinematics. MIT License.

---

## 3. Determinism & Seeds
All random seeds within torch, numpy, and python standard random generators are fixed to `42` to guarantee that two runs on the same hardware produce bitwise deterministic output in `predictions.json`.

---

## 4. Hardware Benchmarks & Profiling

Tested on a standard low-power CPU machine without dedicated GPU acceleration:

- **Clip Tested**: `C3905.MP4` (127.6 seconds, 3,825 frames at 29.970 FPS)
- **Official Time Budget Limit**: $3.0 \times \text{Duration} = 383.0\text{ s}$
- **Actual Total Execution Time**: **$181.1\text{ s}$** ($0.47\times$ of maximum allowance)
- **Official Format Compliance**: `evaluate.py --validate-only` returned **0 errors, 100% VALID**.

---

## 5. Engineering Team & Contribution Breakdown

| Team Member | Official Role | Key Contributions |
| :--- | :--- | :--- |
| **Team Captain** (`becruz137-cpu`) | **Lead ML & CV Engineer** | Core pipeline design (`solution.py`), YOLOv8n + ByteTrack integration, spatio-temporal rule formulation, temporal IoU optimization. |
| **Teammate 2** | **Full-Stack & Systems Engineer** | Live upload demo web interface, interactive video player with synchronized timeline seeking, predictions JSON export tool. |
| **Teammate 3** | **Data & Benchmark Engineer** | CCTV footage exploratory data analysis (EDA), perspective foreshortening audit, metric validation (`evaluate.py`), time budget profiling. |

---

## 6. Live Interactive Demo & Website
A fully interactive web dashboard with live video upload, synchronized timeline seeking, statistical EDA, and reproduction logs is hosted at:
👉 **[Team Live Demo Website](https://becruz137-cpu.github.io/wiut-cv-hackathon/)**


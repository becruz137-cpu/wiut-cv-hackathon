# WIUT Hackathon 2026 — Computer Vision Track

Traffic event detection from fixed road cameras.

## Setup

```bash
conda create -n wiut_cv python=3.11 -y
conda activate wiut_cv
pip install -r requirements.txt
```

## Run

```bash
# Put your .mp4 files in samples/
python run_submission.py --videos samples --out predictions.json --team your-team-name
python evaluate.py --pred predictions.json --validate-only
```

## Structure

```
solution.py          ← main implementation (YOLO + tracking + event rules)
run_submission.py    ← organizers' harness (do not modify)
evaluate.py          ← official metric (do not modify)
examples/            ← ground_truth.json and predictions.json samples
requirements.txt     ← dependencies
weights/             ← model weights (download separately, not in git)
samples/             ← local video files (not in git)
```

## Event Classes

`accident`, `near_miss`, `red_light`, `wrong_way`, `illegal_u_turn`,
`stopped_vehicle`, `jaywalking`, `failure_to_yield`, `illegal_turn`,
`solid_line_crossing`, `stop_line`, `congestion`, `road_obstacle`, `fire_smoke`

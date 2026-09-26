import gradio as gr
import os
import json
import time
from solution import detect_events

def process_video(video_path):
    if video_path is None:
        return "Please upload a video."
    
    # Run our official part A solution
    start_time = time.time()
    events = detect_events(video_path)
    elapsed = time.time() - start_time
    
    # Format output identically to predictions.json
    filename = os.path.basename(video_path)
    result = {
        "team": "BITSTORM",
        "videos": {
            filename: {
                "events": events,
                "risk": []  # Part B omitted for web demo speed
            }
        },
        "log": {
            filename: {
                "demo_runtime_sec": round(elapsed, 1),
                "total_events": len(events)
            }
        }
    }
    
    return json.dumps(result, indent=2)

# Create Gradio interface
with gr.Blocks(title="BITSTORM CV Demo") as demo:
    gr.Markdown("# BITSTORM - Live Traffic Event Detection")
    gr.Markdown("Upload an MP4 clip to run our YOLOv8n + ByteTrack pipeline live. (Note: CPU inference may take up to 0.5x video length).")
    
    with gr.Row():
        with gr.Column():
            video_input = gr.Video(label="Upload Traffic CCTV (.mp4)")
            submit_btn = gr.Button("Analyze Video", variant="primary")
        
        with gr.Column():
            json_output = gr.Code(label="Extracted Events (JSON)", language="json")
            
    submit_btn.click(fn=process_video, inputs=video_input, outputs=json_output)

if __name__ == "__main__":
    demo.launch()

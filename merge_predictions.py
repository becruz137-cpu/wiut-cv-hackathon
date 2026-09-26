import json

merged = {'team': 'SENTINEL-CV', 'videos': {}, 'log': {}}

files = [
    'predictions_C3896.json',
    'predictions_C3897.json',
    'predictions_C3902.json',
    'predictions_samples.json',
]

for f in files:
    d = json.load(open(f))
    merged['videos'].update(d['videos'])
    if 'log' in d:
        merged['log'].update(d['log'])

with open('predictions_final.json', 'w') as out:
    json.dump(merged, out, indent=1)

total_events = sum(len(v['events']) for v in merged['videos'].values())
print('Videos:', list(merged['videos'].keys()))
print('Total events:', total_events)
print('Saved: predictions_final.json')

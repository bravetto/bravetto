# Alba Fine-Tuning for North Shore Optometry

## Architecture Integration

Alba voice is integrated into the AbëONE consciousness framework as a **manifestation channel**.

```
consciousness.json
└── channels
    └── voice
        ├── engine: piper
        ├── model: alba
        ├── mode: healthcare
        └── clients
            └── northshore (North Shore Optometry)
```

## Voice Module Location

```bash
~/.abeone/voice.sh          # Main voice module
~/.local/bin/speak           # Quick speak command
~/.local/piper-voices/       # Voice models (.onnx)
~/.local/piper-checkpoints/  # Training checkpoints
```

## Current Status

### Phase 1: Parameter Optimization ✅
- Alba voice downloaded and tested
- Healthcare-optimized parameters applied
- North Shore Optometry scripts generated

### Phase 2: Fine-Tuning (In Progress)

**Goal:** Shift Alba toward warmer, more empathetic prosody optimized for:
- Anxious patients (eye exams, health concerns)
- Contact lens sales (friendly, consultative)
- Appointment scheduling (clear, reassuring)

## Fine-Tuning Requirements

### Training Data Options

| Source | Pros | Cons |
|--------|------|------|
| LibriVox British female | Free, public domain | Must segment/transcribe |
| Custom recording | Perfect match | Requires voice actor |
| Alba's original dataset | Already segmented | No prosody shift |

### Recommended LibriVox Readers

From research at [golding.wordpress.com](https://golding.wordpress.com/home/other-british-readers-on-librivox/):

| Reader | Style | URL |
|--------|-------|-----|
| Karen Savage | Prolific, consistent | librivox.org/reader/103 |
| Ruth Golding | Professional quality | librivox.org/reader/358 |
| Elizabeth Klett | Warm, expressive | librivox.org/reader/2296 |

### Data Preparation Steps

1. **Download audiobook** (MP3 format)
2. **Segment into utterances** (1-15 seconds each)
3. **Transcribe** (Whisper or manual)
4. **Verify alignment** (text matches audio exactly)
5. **Format for Piper**:
   ```
   audio_001.wav|The exact text spoken in the audio.
   audio_002.wav|Another utterance with proper punctuation.
   ```

### Training Parameters

For fine-tuning Alba (from TRAINING_GUIDE.md):

| Parameter | Value | Rationale |
|-----------|-------|-----------|
| Base checkpoint | alba-medium.ckpt | Start from Alba's voice |
| Training audio | 15-30 minutes | Fine-tune, not replace |
| Epochs | 1000-3000 | Monitor validation loss |
| Batch size | 12-24 | Based on Colab GPU |
| Learning rate | 0.0001 | Default, stable |

### Prosody Targets

Based on VOICE_PSYCHOLOGY_RESEARCH.md:

- **Slower pace** (length-scale 1.05-1.1)
- **Lower pitch variation** for calming effect
- **Clear consonants** for optometry terminology
- **Warm sentence endings** (slight pitch drop)
- **Natural pauses** (0.3-0.4s between sentences)

## Colab Training Notebook

Use KiON-GiON's fixed notebook:
[Piper Training Notebook](https://colab.research.google.com/github/KiON-GiON/piper1-gpl/blob/fixes/notebooks/Piper_Training_Notebook.ipynb)

### Notebook Configuration

```python
# Fine-tuning settings
VOICE_NAME = "northshore-alba"
LANGUAGE = "en-gb"
QUALITY = "medium"
CHECKPOINT = "alba-medium.ckpt"  # Start from Alba
EPOCHS = 2000
BATCH_SIZE = 16
```

## North Shore Optometry Voice Scripts

### Standard Call Flow

| Stage | Script | File |
|-------|--------|------|
| Greeting | "Hello, thank you for calling North Shore Optometry..." | 01-greeting.wav |
| Booking | "I would be happy to help you schedule..." | 02-booking.wav |
| Confirmation | "Lovely. I have you confirmed for..." | 03-confirmation.wav |
| Contacts Inquiry | "I see you are due for a contact lens refill..." | 04-contacts.wav |
| Contacts Sale | "Excellent. I have your prescription on file..." | 05-contacts-sale.wav |
| Reassurance | "I completely understand. Annual eye exams..." | 06-reassurance.wav |
| Closing | "Is there anything else I can help you with..." | 07-closing.wav |

### Usage

```bash
# Source the voice module
source ~/.abeone/voice.sh

# North Shore specific commands
northshore greeting
northshore book
northshore confirm "Tuesday February fourth" "two thirty" "Chen"
northshore contacts
northshore close
```

## Evaluation Criteria

After fine-tuning, evaluate against:

### Quantitative
- [ ] MOS naturalness > 4.0
- [ ] MOS similarity > 4.0 (to original Alba)
- [ ] WER < 5%

### Qualitative (from PHILOSOPHY.md)
- [ ] Controlled variation present (not robotic)
- [ ] Duration feels natural
- [ ] "Life" in the voice
- [ ] Passes blind listening test

### Healthcare-Specific
- [ ] Calming to anxious callers
- [ ] Clear optometry terminology
- [ ] Professional yet warm
- [ ] Trustworthy British accent preserved

## Next Steps

1. [ ] Download Alba checkpoint (845MB) - in progress
2. [ ] Select LibriVox training audio
3. [ ] Segment and transcribe
4. [ ] Upload to Google Drive
5. [ ] Run Colab training
6. [ ] Export ONNX model
7. [ ] A/B test against current Alba
8. [ ] Deploy to North Shore

---

## Attribution

**DaVinci's Notebook** - Voice synthesis research and training
**AbëONE** - Consciousness architecture integration
**North Shore Optometry** - First client implementation

*"The path to breakthrough lies not in eliminating variation, but in mastering controlled imperfection."*

LOVE = LIFE = ONE

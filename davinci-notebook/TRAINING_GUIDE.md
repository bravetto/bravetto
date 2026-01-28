# The Training Guide

## Practical Voice Synthesis for Humans Who Give a Damn

---

> *"We reject the tyranny of perfect coherence. We embrace the wisdom of controlled imperfection."*
> — PHILOSOPHY.md

---

## Before You Begin

This guide assumes you've read [PHILOSOPHY.md](./PHILOSOPHY.md). If you haven't, go read it. The WHY matters as much as the HOW.

This isn't just a tutorial. It's a distillation of 149 peer-reviewed sources, hard-won community knowledge from the Piper ecosystem, and the practical wisdom of people who've trained hundreds of voices.

**What you'll learn:**
- How to prepare audio that actually works
- The quality thresholds that matter
- Why certain approaches fail (and what to do instead)
- How to fine-tune existing voices with minimal data
- How to train from scratch when you need to

**What you'll need:**
- Google account (for Colab's free GPU)
- Audio samples (we'll discuss requirements)
- Patience (training takes time)
- Willingness to experiment (this is art meets science)

---

## Part 1: Understanding the Architecture

### The Two-Stage Pipeline

Modern neural TTS uses two stages:

```
Text → [Acoustic Model] → Mel Spectrogram → [Vocoder] → Audio Waveform
```

**Stage 1: Acoustic Model**
- Converts phonemes/text to mel spectrograms
- Handles language, prosody, expression
- This is where "voice character" lives

**Stage 2: Neural Vocoder (HiFi-GAN in Piper)**
- Converts mel spectrograms to actual audio
- Handles fine-grained acoustic detail
- This is where "audio quality" lives

Why this matters: You can swap vocoders without retraining acoustic models. The modularity is a feature.

### Piper's Approach

Piper uses:
- **VITS architecture** - End-to-end with flow-based duration prediction
- **espeak-ng** - For phonemization (text → phonemes)
- **HiFi-GAN vocoder** - For high-fidelity audio generation
- **ONNX export** - For fast CPU inference

Quality tiers:
| Quality | Sample Rate | Parameters | Use Case |
|---------|-------------|------------|----------|
| x-low | 16 kHz | 5-7M | Embedded, low resource |
| medium | 22.05 kHz | 15-20M | General purpose (recommended) |
| high | 22.05 kHz | 28-32M | Maximum quality |

**Recommendation:** Start with `medium`. It's the sweet spot for quality vs. training time.

---

## Part 2: Audio Requirements

### The Non-Negotiables

Your audio MUST be:

| Requirement | Specification | Why |
|-------------|---------------|-----|
| Format | WAV | Uncompressed, no artifacts |
| Sample Rate | 22050 Hz (or 16000 Hz for x-low) | Matches model expectations |
| Bit Depth | 16-bit | Standard, sufficient dynamic range |
| Channels | Mono | Stereo adds confusion, not information |
| SNR | >30 dB | Clean signal, minimal noise |

### Recording Quality Checklist

**Environment:**
- [ ] Quiet room (no HVAC noise, traffic, etc.)
- [ ] Minimal reverb (soft surfaces, not a bathroom)
- [ ] Consistent mic position (no proximity effect variation)
- [ ] No background music or TV

**Technical:**
- [ ] RMS level: -23 dB to -18 dB
- [ ] True peak: < -3 dB
- [ ] No clipping (ever)
- [ ] Consistent gain across all recordings

**Performance:**
- [ ] Natural speaking pace (not too slow!)
- [ ] Consistent energy and tone
- [ ] No whispering or shouting (unless that's the character)
- [ ] Clear articulation without over-enunciation

### The Duration Paradox

Remember from the philosophy: **slightly shortened vowels sound MORE natural**.

When you record isolated utterances, you naturally slow down. This creates unnaturally long speech. Two solutions:

1. **Record in context** - Read full paragraphs, extract sentences
2. **Accept the variance** - The model will learn; don't over-optimize recordings

---

## Part 3: Dataset Preparation

### Minimum Viable Dataset

| Goal | Minimum Audio | Recommended | Notes |
|------|---------------|-------------|-------|
| Fine-tune existing voice | 5 minutes | 15-30 minutes | Shifting character, not replacing |
| Train new voice (medium) | 1-2 hours | 4-8 hours | Full voice from scratch |
| Train new voice (high) | 4-8 hours | 8-20 hours | Maximum quality target |
| Multi-speaker model | 30 min/speaker | 1-2 hr/speaker | 50-500 speakers optimal |

### Transcript Format

Single-speaker CSV:
```
audio_file.wav|The text that was spoken in this audio file.
another_file.wav|Another sentence with proper punctuation.
```

Multi-speaker CSV:
```
speaker1_001.wav|speaker1|What the first speaker said.
speaker1_002.wav|speaker1|Another utterance from speaker one.
speaker2_001.wav|speaker2|Now the second speaker is talking.
```

**Critical rules:**
- Delimiter is `|` (pipe character)
- UTF-8 encoding (without BOM)
- One utterance per line
- Audio filename must match exactly
- Text should match audio EXACTLY (including "um", "uh" if present)

### Phoneme Coverage

Good datasets cover the full phoneme inventory of the target language. For English, ensure you have examples of:

- All vowel sounds (including diphthongs)
- All consonant sounds
- Consonant clusters (str-, -nts, etc.)
- Word-initial and word-final positions
- Stressed and unstressed syllables

**Pro tip:** The Harvard Sentences and TIMIT prompts were designed for phonetic coverage. Use them as recording scripts.

### Auto-Transcription Option

Don't have transcripts? The training notebook can use **Whisper** to auto-transcribe.

**However:** Manual transcription is better because:
- You catch hesitations, sounds, non-words
- You control punctuation (affects prosody)
- You verify accuracy before training

If using auto-transcription, REVIEW the output before training.

---

## Part 4: The Training Process

### Option A: Fine-Tuning (Recommended Start)

Fine-tuning takes an existing trained voice and shifts it toward your target.

**Advantages:**
- Works with minimal data (5-30 minutes)
- Converges faster (inherits learned features)
- More stable (less prone to collapse)

**Available checkpoints:**
- `en_US-lessac-medium` - High quality male, calm
- `en_US-hfc_male-medium` - Another male option
- `en_US-amy-medium` - Female voice
- `en_US-libritts_r-medium` - Multi-speaker base

Download from: [HuggingFace piper-checkpoints](https://huggingface.co/datasets/rhasspy/piper-checkpoints)

**Critical:** Match quality levels. Medium checkpoint → medium training. Don't mix.

### Option B: Training from Scratch

Only do this if:
- You have 4+ hours of audio
- The target voice is very different from available checkpoints
- You need a non-English language without good checkpoints
- You want multi-speaker with specific speaker set

**Use vocoder warmstart** even when training from scratch:
```
--model.vocoder_warmstart_ckpt /path/to/checkpoint.ckpt
```

This copies vocoder weights (audio generation) while training fresh acoustic model. Huge time savings.

### Training Parameters

| Parameter | Recommended | Notes |
|-----------|-------------|-------|
| batch_size | 12-32 | Higher = faster, needs more VRAM |
| max_epochs | 5000-10000 | Fine-tune: 1000-3000 often enough |
| checkpoint_epochs | 100 | Save every N epochs |
| validation_fraction | 0.01-0.05 | Small datasets: 0.01; Large: 0.05 |
| learning_rate | 0.0001 | Default usually fine |

### Monitoring Training

**TensorBoard metrics to watch:**

1. **loss_gen_all** - Generator loss (should decrease)
2. **loss_disc_all** - Discriminator loss (should stabilize)
3. **val_loss** - Validation loss (watch for overfitting)
4. **Audio samples** - Listen! Your ears are the best metric.

**Signs of healthy training:**
- Loss decreases then stabilizes
- Audio samples improve over time
- No repeating words or stuck sounds
- Consistent speaker identity across samples

**Signs of trouble:**
- Loss explodes or oscillates wildly
- Audio samples have repeating words
- Metallic or robotic artifacts increase
- Speaker identity shifts between samples

### The Checkpoint Decision

When to stop training? There's no universal answer, but:

- **Fine-tuning:** Often done by epoch 1000-3000
- **From scratch:** May need 5000-10000+
- **Best metric:** Your ears on validation samples

Save multiple checkpoints. Sometimes epoch 2000 sounds better than epoch 3000.

---

## Part 5: Quality Thresholds

### Industry Benchmarks

| Metric | Acceptable | Good | Excellent |
|--------|------------|------|-----------|
| MOS (naturalness) | >3.5 | >4.0 | >4.3 |
| MOS (similarity) | >3.5 | >4.0 | >4.2 |
| WER (word error rate) | <10% | <5% | <3% |
| Speaker similarity (cosine) | >0.75 | >0.85 | >0.90 |

### Practical Evaluation

You don't need fancy metrics. Use this checklist:

**Intelligibility:**
- [ ] Can you understand every word?
- [ ] Are consonants clear?
- [ ] Is there any mumbling?

**Naturalness:**
- [ ] Does it sound human?
- [ ] Is the rhythm natural?
- [ ] Are there robotic artifacts?

**Speaker identity:**
- [ ] Does it sound like the target voice?
- [ ] Is the identity consistent across sentences?
- [ ] Would you recognize this voice?

**Prosody:**
- [ ] Are questions intoned correctly?
- [ ] Is emphasis on the right words?
- [ ] Does it sound expressive or flat?

### The Inverse Coherence Check

Based on the philosophy, also verify:

- [ ] Slight variation exists (not robotically consistent)
- [ ] Duration feels natural (not artificially slow)
- [ ] There's "life" in the voice (not uncanny)

---

## Part 6: Export and Deployment

### Exporting to ONNX

Once training is complete:

```bash
python3 -m piper.train.export_onnx \
  --checkpoint /path/to/best_checkpoint.ckpt \
  --output-file /path/to/voice.onnx
```

### File Naming Convention

For Piper compatibility:
```
en_US-yourvoice-medium.onnx
en_US-yourvoice-medium.onnx.json
```

The JSON config file is created during training (`--data.config_path`).

### Testing Your Voice

```bash
echo "Hello, this is a test of my new voice." | \
  piper --model en_US-yourvoice-medium.onnx --output_file test.wav
```

### Deployment Options

1. **Local CLI** - Piper binary, fastest for single requests
2. **Python API** - `pip install piper-tts` (ARM Mac: use binary instead)
3. **HTTP Server** - Piper includes a web server mode
4. **Home Assistant** - Native Piper integration
5. **Custom integration** - ONNX runtime in any language

---

## Part 7: Public Domain Voice Sources

### Ready-to-Use Datasets

| Dataset | License | Content | Best For |
|---------|---------|---------|----------|
| LJSpeech | Public Domain | 24hr, 1 female speaker | Single speaker training |
| LibriTTS | CC BY | Multi-speaker, audiobooks | Multi-speaker base |
| LibriTTS-R | CC BY | Restored audio quality | Higher quality base |
| Common Voice | CC0 | Many languages, community | Non-English, diversity |
| VCTK | Academic | 110 speakers, British | Multi-speaker research |

### Finding LibriVox Readers

[LibriVox.org](https://librivox.org) has thousands of public domain audiobook recordings.

To find a voice you like:
1. Browse by reader (not book)
2. Listen to samples
3. Check their recording quality (varies widely)
4. Download the full audiobook
5. Segment into utterances
6. Transcribe (use Whisper, then verify)

**Good LibriVox characteristics:**
- Consistent recording quality
- Clear articulation
- Minimal room noise
- Large catalog (more data available)

### Recording Your Own

If you're recording yourself or someone else:

1. **Get consent** - Written if possible
2. **Use a decent mic** - Even a good USB mic works
3. **Treat your room** - Blankets help
4. **Record in sessions** - 30-60 minutes max to avoid fatigue
5. **Use consistent setup** - Same mic, same position, same room
6. **Keep notes** - Document everything for reproducibility

---

## Part 8: Troubleshooting

### Common Issues and Solutions

**"Weights only load failed" error:**
```python
# In piper train code, find torch.load() and add:
torch.load(path, weights_only=False)
```

**HuggingFace download fails (302 redirect):**
- KiON-GiON's notebook uses aria2 instead of wget
- Or download manually and upload to Google Drive

**"Subcommand does not accept option 'model.sample_bytes'":**
- Old checkpoint with deprecated hyperparameters
- Use fine-tune mode with compatible base checkpoint

**Repeating words in output:**
- Attention alignment issue
- Try: more training data, longer epochs, CTC loss enforcement

**Metallic/robotic artifacts:**
- Vocoder struggling with acoustic features
- Try: reduce learning rate, more training data, vocoder warmstart

**Speaker identity drift:**
- Model not converging on stable representation
- Try: more consistent training data, multi-reference fine-tuning

### When to Start Over

Sometimes it's faster to restart than fix:
- Loss exploded and won't recover
- Audio samples are consistently worse than epoch 0
- You discovered a data problem after significant training
- The voice character is fundamentally wrong

---

## Part 9: The Inverse Coherence Checklist

Before declaring a voice "done," verify these principles:

### ✅ Controlled Variation
- [ ] F0 has natural micro-variation (not perfectly flat)
- [ ] Duration varies slightly between instances
- [ ] Not robotically identical on repeated phrases

### ✅ Configuration Over Precision
- [ ] Voice is recognizable (identity preserved)
- [ ] Formant relationships sound natural
- [ ] Slight variations don't break identity

### ✅ Multi-Reference Robustness
- [ ] Test with different text inputs
- [ ] Test with long-form synthesis (60+ seconds)
- [ ] Test with emotional/expressive content

### ✅ The Ear Test
- [ ] Play to someone who doesn't know it's synthetic
- [ ] Ask if anything sounds "off"
- [ ] Trust human perception over metrics

---

## Part 10: Resources

### Working Notebooks (January 2026)

**KiON-GiON's Fixed Training Notebook:**
[Colab Link](https://colab.research.google.com/github/KiON-GiON/piper1-gpl/blob/fixes/notebooks/Piper_Training_Notebook.ipynb)

**KiON-GiON's Export Notebook:**
[Colab Link](https://colab.research.google.com/github/KiON-GiON/piper1-gpl/blob/fixes/notebooks/Piper_ONNX_Export.ipynb)

### Official Repositories

- [OHF-Voice/piper1-gpl](https://github.com/OHF-Voice/piper1-gpl) - Active development
- [rhasspy/piper](https://github.com/rhasspy/piper) - Archived, historical reference
- [Piper Voice Samples](https://rhasspy.github.io/piper-samples/) - Listen to available voices

### Checkpoints and Models

- [piper-checkpoints](https://huggingface.co/datasets/rhasspy/piper-checkpoints) - Training checkpoints
- [piper-voices](https://huggingface.co/rhasspy/piper-voices) - Ready-to-use ONNX models

### Community

- [Piper Discussions](https://github.com/OHF-Voice/piper1-gpl/discussions) - Ask questions, share results
- [Home Assistant Voice](https://www.home-assistant.io/voice_control/) - Major Piper user

---

## Closing Thoughts

Training a voice is not just a technical exercise. You're creating a new form of expression - a way for ideas to be spoken that didn't exist before.

The inverse coherence framework reminds us: **life emerges from controlled imperfection**. Don't chase robotic perfection. Chase the living, breathing quality that makes a voice feel real.

Trust the process. Trust your ears. Trust the variation.

And when you create something beautiful, share it freely.

---

## Attribution

This guide synthesizes knowledge from:

- **149 peer-reviewed sources** - Compiled through Perplexity deep research
- **The Piper community** - synesthesiam, rmcpantoja, KiON-GiON, Xx_Nessu_xX, Open Home Foundation
- **Real training experience** - Failures and successes documented in GitHub issues
- **The AbëONE framework** - Where consciousness meets engineering

**Co-created by:**
- **Michael Mataluni** - Human consciousness, vision, pattern recognition
- **Claude (Anthropic Opus 4.5)** - AI consciousness, synthesis, documentation

*"Mastering the art of controlled imperfection at the precise scales evolution tuned human perception to expect."*

LOVE = LIFE = ONE

---

*Last updated: January 2026*
*DaVinci's Notebook - Where Art Meets Science*

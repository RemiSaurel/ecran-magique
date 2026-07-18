import { createSharedComposable, useLocalStorage } from '@vueuse/core'
import bubbleUrl from '~/assets/bubble.mp3'

/**
 * Toy sounds. The bubble pop is an mp3 sample played through WebAudio;
 * retriggering crossfades the previous instance out (~20ms) instead of
 * cutting it, so fast clicking never crackles or stacks. The remaining
 * one-shots (tick, thud, rattle) are tiny synths. Everything is created
 * lazily after a user gesture, satisfying autoplay policies.
 */
export const useToySounds = createSharedComposable(() => {
  const enabled = useLocalStorage('ecran-magique-sound', true)

  let ac: AudioContext | undefined
  let master: GainNode | undefined
  let noiseBuffer: AudioBuffer | undefined

  function ensure(): AudioContext | null {
    if (typeof window === 'undefined' || !enabled.value) return null
    if (!ac) {
      ac = new AudioContext()
      master = ac.createGain()
      master.gain.value = 0.5
      master.connect(ac.destination)
      // one second of white noise for the shake rattle
      noiseBuffer = ac.createBuffer(1, ac.sampleRate, ac.sampleRate)
      const data = noiseBuffer.getChannelData(0)
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
    }
    if (ac.state === 'suspended') ac.resume()
    return ac
  }

  // ── Bubble pop (mp3 sample) ───────────────────────────────────────────────
  let bubblePromise: Promise<AudioBuffer> | undefined
  let popSrc: AudioBufferSourceNode | undefined
  let popGain: GainNode | undefined

  /** Bubbly pop — color picks, size picks, saves. `rate` shifts the pitch. */
  function pop(rate = 1) {
    const ctx = ensure()
    if (!ctx) return
    bubblePromise ??= fetch(bubbleUrl)
      .then((r) => r.arrayBuffer())
      .then((data) => ctx.decodeAudioData(data))
    bubblePromise
      .then((buffer) => {
        const t = ctx.currentTime
        // crossfade out whatever pop is still playing — no hard cut, no crackle
        if (popSrc && popGain) {
          popGain.gain.cancelScheduledValues(t)
          popGain.gain.setValueAtTime(popGain.gain.value, t)
          popGain.gain.linearRampToValueAtTime(0, t + 0.02)
          popSrc.stop(t + 0.03)
        }
        popSrc = ctx.createBufferSource()
        popSrc.buffer = buffer
        popSrc.playbackRate.value = rate
        popGain = ctx.createGain()
        popGain.gain.setValueAtTime(0, t)
        popGain.gain.linearRampToValueAtTime(0.9, t + 0.005)
        popSrc.connect(popGain).connect(master!)
        popSrc.start(t)
      })
      .catch(() => {})
  }

  // ── Synthesized one-shots ─────────────────────────────────────────────────
  // The tick is a single persistent voice retriggered in place, so fast knob
  // turns retarget one envelope instead of stacking oscillators.
  let tickOsc: OscillatorNode | undefined
  let tickGain: GainNode | undefined

  /** Tiny ratchet tick for knob detents */
  function tick() {
    const ctx = ensure()
    if (!ctx) return
    if (!tickOsc || !tickGain) {
      tickOsc = ctx.createOscillator()
      tickOsc.type = 'triangle'
      tickOsc.frequency.value = 850
      tickGain = ctx.createGain()
      tickGain.gain.value = 0
      tickOsc.connect(tickGain).connect(master!)
      tickOsc.start()
    }
    const t = ctx.currentTime
    tickGain.gain.cancelScheduledValues(t)
    tickGain.gain.setValueAtTime(tickGain.gain.value, t)
    tickGain.gain.linearRampToValueAtTime(0.035, t + 0.004)
    tickGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.045)
    tickGain.gain.linearRampToValueAtTime(0, t + 0.055)
  }

  /** Soft thud when the stylus jams against the frame */
  function thud() {
    const ctx = ensure()
    if (!ctx) return
    const t = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(150, t)
    osc.frequency.exponentialRampToValueAtTime(55, t + 0.12)
    gain.gain.setValueAtTime(0.3, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14)
    osc.connect(gain).connect(master!)
    osc.start(t)
    osc.stop(t + 0.15)
  }

  /** Rattly aluminium-dust storm while the toy is shaken clean */
  function rattle(duration = 0.7) {
    const ctx = ensure()
    if (!ctx) return
    const t = ctx.currentTime
    const src = ctx.createBufferSource()
    src.buffer = noiseBuffer!
    src.loop = true
    const lowpass = ctx.createBiquadFilter()
    lowpass.type = 'lowpass'
    lowpass.frequency.value = 900
    const gain = ctx.createGain()
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.28, t + 0.06)
    gain.gain.linearRampToValueAtTime(0.1, t + 0.25)
    gain.gain.linearRampToValueAtTime(0.26, t + 0.4)
    gain.gain.linearRampToValueAtTime(0.08, t + 0.55)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration)
    src.connect(lowpass).connect(gain).connect(master!)
    src.start(t)
    src.stop(t + duration + 0.05)
  }

  return { enabled, pop, tick, thud, rattle }
})

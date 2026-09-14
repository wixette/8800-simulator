# Kill the Bit

The classic Altair 8800 game, written by Dean McDaniel in May 1975. A
single lit bit rotates across the upper address LEDs and you kill it by
flipping the sense switch underneath at the right moment.

The program is [kill-the-bit.asm](kill-the-bit.asm). The original
listing is at <https://altairclone.com/downloads/killbits.pdf>.

The game exposed a real bug in this simulator, since fixed: it has no
output instruction at all, and depends on a hardware side effect of the
machine that the simulator did not model. That story is in
[../docs/kill_the_bit.md](../docs/kill_the_bit.md).

## How to run it

### Quick way (Debugger tab)

1. Open `index.html` and switch the machine ON.
2. Open the *Debugger* tab and load this with *LOAD DATA*:
   ```
   21 00 00 16 80 01 0e 00 1a 1a 1a 1a 09 d2 08 00 db ff aa 0f 57 c3 08 00
   ```
3. Make sure all 16 address switches are down, go back to the
   *Simulator* tab, click RESET, then RUN.

### Authentic way (front panel switches)

With the machine ON, deposit the program in octal: set A7-A0 to the
first value `041`, click DEPOSIT, then enter each following value and
click DEPOSIT NEXT.

```
000: 041 000 000 026 200 001 016 000
010: 032 032 032 032 011 322 010 000
020: 333 377 252 017 127 303 010 000
```

Then lower all switches, click RESET, and RUN.

## Playing

A single lit bit rotates across the upper eight address LEDs (A15-A8).
Kill it by flipping the sense switch (S15-S8) directly under the lit
LED at the right moment, then flipping it straight back down. If you
miss, the XOR turns another bit on. You win when all the upper LEDs are
dark.

`LXI B,000EH` at address 0005H sets the speed: a higher value makes the
bit rotate faster.

### Why you must flip the switch back down

The game loop runs `IN 0FFH; XRA D; RRC` roughly every 0.23 s, and the
XOR does not *test* your switch. It unconditionally *flips* the display
bit at every position where a switch is up, on every pass. The first
pass kills the lit bit, but if the switch is still up on the next pass
it flips that now dark position back on, injecting a fresh bit, and the
rotation smears the new bits across the row. Leave a switch up for a
couple of seconds and the display fills with lit bits.

This is the game's intended punishment mechanic, not a simulator bug,
which is why the original 1975 listing warns: *"Quickly toggle the
switch, don't leave the switch in the up position."* To count as a
kill, the switch has to go up and back down within a single pass.

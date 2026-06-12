# Kill the Bit (GitHub issue #1)

## The issue

[Issue #1](https://github.com/wixette/8800-simulator/issues/1) reports
that *Kill the Bit* — the classic Altair 8800 game written by Dean
McDaniel in 1975 — does not work in the simulator: while the program
runs, no address or data LED lights up and the sense switches appear
to do nothing. Reference listing: <https://altairclone.com/downloads/killbits.pdf>.

```
        ; Kill the Bit game by Dean McDaniel, May 15, 1975
        ;
        ; Object: Kill the rotating bit. If you miss the lit bit,
        ; another bit turns on, leaving two bits to destroy. Quickly
        ; toggle the switch, don't leave the switch in the up position.
        ; Before starting, make sure all the switches are in the down
        ; position.
0000            org     0
0000 210000     lxi     h,0     ;initialize counter
0003 1680       mvi     d,080h  ;set up initial display bit
0005 010E00     lxi     b,0eh   ;higher value = faster
0008 1A    beg: ldax    d       ;display bit pattern on
0009 1A         ldax    d       ;...upper 8 address lights
000A 1A         ldax    d
000B 1A         ldax    d
000C 09         dad     b       ;increment display counter
000D D20800     jnc     beg
0010 DBFF       in      0ffh    ;input data from sense switches
0012 AA         xra     d       ;exclusive or with A
0013 0F         rrc             ;rotate display right one bit
0014 57         mov     d,a     ;move data to display reg
0015 C30800     jmp     beg     ;repeat sequence
0018            end
```

## Root cause

The game's display depends on a hardware side effect of the real
Altair 8800: every memory access puts its address on the address bus,
and the front panel address LEDs mirror the bus. `LDAX D` reads memory
at the address held in the DE register pair, so while the tight
`ldax d` loop runs, register D (the "display byte" holding the lit
bit) appears on the upper 8 address LEDs (A15–A8). The program toggles
no output port at all — the LEDs *are* its display.

The simulator did not model the address bus. `Sim8800.step()` in
`js/sim8800.js` refreshed the address LEDs only from the program
counter. Since the whole program lives below address `0018h`, the high
byte of PC is always zero, so A15–A8 stayed dark and the game was
invisible. (The input half of the game was never broken: `IN 0FFh`
correctly reads the high 8 address switches.)

## The workaround suggested in the issue thread

A commenter (XujieSi) suggested patching the LED refresh to
`cpu.pc | cpu.d * 256`, i.e. always OR register D onto the upper
address LEDs. That makes Kill the Bit visible, but it corrupts the
address display of every other program (any program running above
address `00FFh`, or simply using D for data, would light bogus address
LEDs). The commenter noted the systematic fix is to check whether the
current instruction is actually `ldax d`.

## The fix

`Sim8800.step()` now executes the batch of cycles one instruction at a
time and watches the opcode about to run. When `LDAX B` (`0Ah`) or
`LDAX D` (`1Ah`) executes, the address it reads (the BC/DE register
pair) is shown on the address LEDs at the end of the batch — emulating
the address bus side effect the game depends on. For any other
program, the LEDs show PC exactly as before.

In addition, the clock ticker now computes each batch from the wall
time elapsed since the previous tick instead of a fixed 1 ms quantum.
Browsers clamp nested `setTimeout` to ~4 ms, which made the "1 MHz"
CPU effectively run at ~250 kHz, so the bit crawled four times slower
than on real hardware. With the fix the game plays at its authentic
speed (the bit advances roughly every 0.23 s).

All other panel features (EXAMINE / DEPOSIT / RESET / single step,
port I/O, the debugger dumps, both `index.html` and `text-mode.html`)
are unchanged, and are now covered by unit tests in `tests/`
(`npm test`, requires Node.js 18+; no dependencies).

## How to run Kill the Bit

### Quick way (Debugger tab)

1. Open `index.html`, switch the machine ON.
2. Open the *Debugger* tab and load this hex string with *LOAD DATA*:
   ```
   21 00 00 16 80 01 0E 00 1A 1A 1A 1A 09 D2 08 00 DB FF AA 0F 57 C3 08 00
   ```
3. Make sure all 16 address switches are down, go back to the
   *Simulator* tab, click *RESET*, then *RUN*.

### Authentic way (front panel switches)

With the machine ON, deposit the program in octal: set A7–A0 to the
first value `041`, click *DEPOSIT*, then enter each following value
and click *DEPOSIT NEXT*:

```
000: 041 000 000 026 200 001 016 000
010: 032 032 032 032 011 322 010 000
020: 333 377 252 017 127 303 010 000
```

Then lower all switches, click *RESET*, and *RUN*.

### Playing

A single lit bit rotates across the upper 8 address LEDs (A15–A8).
Kill it by flipping the sense switch (S15–S8) directly under the lit
LED at the right moment — then flip it back down. If you miss, the
XOR turns another bit on. You win when all upper LEDs are dark.
`lxi b,0eh` at address `0005` sets the speed: a higher value makes the
bit rotate faster.

**Why you must flip the switch back down quickly:** the game loop runs
`IN 0FFh; XRA D; RRC` roughly every 0.23 s, and the XOR does not
"test" your switch — it unconditionally *flips* the display bit at
every position where a switch is up, on every pass. The first pass
kills the lit bit, but if the switch is still up on the next pass it
flips that (now dark) position back on, injecting a fresh bit, and the
rotation smears the new bits across the row. Leave a switch up for a
couple of seconds and the display fills with lit bits — this is the
game's intended punishment mechanic, not a simulator bug, which is why
the original 1975 listing warns: *"Quickly toggle the switch, don't
leave the switch in the up position."* To count as a kill, the switch
must go up and back down within a single loop pass.

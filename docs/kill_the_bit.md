# Kill the Bit (GitHub issue #1)

## The issue

[Issue #1](https://github.com/wixette/8800-simulator/issues/1) reports
that *Kill the Bit* — the classic Altair 8800 game written by Dean
McDaniel in 1975 — does not work in the simulator: while the program
runs, no address or data LED lights up and the sense switches appear
to do nothing. Reference listing: <https://altairclone.com/downloads/killbits.pdf>.

The program itself is [../examples/kill-the-bit.asm](../examples/kill-the-bit.asm).

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

## Running it

The program, how to load it and how to play are in
[../examples/kill-the-bit.md](../examples/kill-the-bit.md).

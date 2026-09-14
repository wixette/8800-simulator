# Example programs

Small 8080 programs to try on the simulator, and the golden set the
tests run against. Each one is a listing in this directory: a header
saying what it does and how to run it, then one line per instruction
carrying its address, its bytes and its source.

| Program | Size | What it does |
| --- | --- | --- |
| [adder.asm](adder.asm) | 14 B | Adds the bytes at 0080H and 0081H, sum at 0082H |
| [pattern-shift.asm](pattern-shift.asm) | 8 B | Rotates 8CH across the data LEDs |
| [io-echo.asm](io-echo.asm) | 7 B | Echoes the sense switches to the data LEDs |
| [bouncing-light.asm](bouncing-light.asm) | 59 B | A dark bit bounces across the data LEDs, speed set by the switches |
| [kill-the-bit.asm](kill-the-bit.asm) | 24 B | The 1975 game by Dean McDaniel ([how to play](kill-the-bit.md)) |

## Loading a program

The quick way is the *Debugger* tab. Switch the machine ON, paste the
program's bytes into *LOAD DATA*, which loads them from address 0000H,
then go back to the *Simulator* tab and click RESET and RUN.

```
adder           3a 80 00 47 3a 81 00 80 32 82 00 c3 00 00
pattern-shift   3e 8c d3 ff 0f c3 02 00
io-echo         db ff d3 ff c3 00 00
kill-the-bit    21 00 00 16 80 01 0e 00 1a 1a 1a 1a 09 d2 08 00 db ff aa 0f 57 c3 08 00
bouncing-light  0e ff 16 01 7a fe 80 ca 0f 00 fe 01 c2 12 00 79 2f 4f 79 fe 00 c2 1e 00 7a 17 57 c3 21 00 7a 1f 57 7a 2f d3 ff db ff 3c 06 02 1e ff 1d c2 2c 00 05 c2 2a 00 3d c2 28 00 c3 04 00
```

The authentic way is the front panel, in octal, the way the original
manual has it. Set A7-A0 to the first value, click DEPOSIT, then enter
each following value and click DEPOSIT NEXT. The adder, for example:

```
000: 072 200 000 107 072 201 000 200
010: 062 202 000 303 000 000
```

Then lower all the switches, click RESET, and RUN.

Every program here loops forever rather than halting, which is normal
for front panel work: click STOP when you have seen enough, and use
EXAMINE to read memory afterwards.

### Worked example: 1 + 2 with the adder

1. Load the adder and RESET.
2. Set A7-A0 to `10 000 000` (0080H) and click EXAMINE.
3. Set A7-A0 to `00 000 001` and click DEPOSIT.
4. Set A7-A0 to `00 000 010` and click DEPOSIT NEXT.
5. RESET, RUN, wait a moment, STOP.
6. Set A7-A0 to `10 000 010` (0082H) and click EXAMINE. The data LEDs
   show `00 000 011`, which is 3.

## The 256 byte limit

The simulated machine has 256 bytes of memory, as the Altair 8800 did
in its base configuration. Every program here has to fit below 0100H,
data included, which is why they are all small. It also means the
address LEDs above A7 stay dark for ordinary programs; Kill the Bit
lights them only through the address bus trick described in its own
listing.

## Adding a program

Write a listing next to the others and the tests pick it up with no
further wiring. The format is:

```
;;; name: Short title
;;; desc: One or two lines on what it does.
;;;
;;; Anything else worth saying: how to run it, what to expect.

0000  3e 8c      MVI A,08CH       ; a comment
0002  d3 ff      OUT 0FFH
```

Address, bytes, source, and an optional `LABEL:` before the source.
The bytes in that listing are the program: nothing else keeps a copy,
so there is nothing to keep in sync.

`npm test` then checks, for every listing here, that each line's bytes
really disassemble to the source written beside them, that the
addresses run straight through memory, and that the program stays
inside its own code when it runs. Add a test to
[../tests/examples.test.js](../tests/examples.test.js) for what your
program is actually supposed to do.

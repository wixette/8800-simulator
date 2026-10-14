# Example programs

Small 8080 programs to try on the simulator, and the golden set the
tests run against. Each one is 8080 source in this directory: a header
saying what it does and how to run it, then the program, in the
language of Intel's 1975 *8080 Assembly Language Programming Manual*.

The simulator offers every one of them twice, from the same file. The
*Load* menu's examples assemble it out of sight and load its bytes,
ready to run. The **Assembler** tab's *Examples* menu puts its source
in the editor, to read, change and assemble yourself. 4K BASIC, the
one program that is not here, is only in the *Load* menu: it comes as
a binary, not as source.

They are listed in the order both menus offer them: first the programs
that speak through the front panel, then the ones that speak through
the teletype, each group from the simplest up.

| Program | Size | Watch | What it does | Shows |
| --- | --- | --- | --- | --- |
| [pattern-shift.asm](pattern-shift.asm) | 8 B | Panel | Rotates 8CH across the data lamps | `MVI`, `OUT`, `RRC` |
| [io-echo.asm](io-echo.asm) | 7 B | Panel | Echoes the sense switches to the data lamps | `IN`, `OUT`, a label, `JMP` |
| [adder.asm](adder.asm) | 14 B | Panel | Adds the bytes at 0080H and 0081H, sum at 0082H | Names for addresses (`EQU`) |
| [multiply.asm](multiply.asm) | 31 B | Panel | Multiplies the bytes at 0080H and 0081H, product at 0082H | Shifting and adding, 16-bit sums with `DAD` |
| [bouncing-light.asm](bouncing-light.asm) | 59 B | Panel | A dark bit bounces across the data lamps, speed set by the switches | Nested delay loops |
| [kill-the-bit.asm](kill-the-bit.asm) | 24 B | Panel | The 1975 game by Dean McDaniel ([how to play](kill-the-bit.md)) | A display made from the address bus |
| [macros.asm](macros.asm) | 37 B | Panel | A lamp walks across the data lamps | Macros (`MACRO`, `ENDM`): an argument, and labels local to each use |
| [tty-hello.asm](tty-hello.asm) | 36 B | Teletype | Prints `HELLO, WORLD!` and halts | A message in memory (`DB`), its length counted from `$` |
| [tty-ascii.asm](tty-ascii.asm) | 20 B | Teletype | Prints every printable ASCII character, then halts | Waiting for the serial board |
| [tty-echo.asm](tty-echo.asm) | 16 B | Teletype | Echoes what you type | Reading and writing the serial board |
| [tty-leds.asm](tty-leds.asm) | 18 B | Teletype | Echoes it, and shows its ASCII code on the data lamps | Two devices at once |
| [tty-subroutines.asm](tty-subroutines.asm) | 46 B | Teletype | Echoes what you type | Subroutines: `CALL`, `RET`, and the stack |
| [print-number.asm](print-number.asm) | 59 B | Teletype | Prints the byte at 0080H in decimal, then halts | Repeated subtraction, `PUSH` and `POP` |
| [guess-letter.asm](guess-letter.asm) | 218 B | Teletype | A guessing game, with HIGHER and LOWER | A whole program: messages, a counter, subroutines |

## Loading a program

The quick way is the *Load* menu: pick one from its examples, which
are grouped as in the table above.
The machine is switched on if it was off, the program is assembled and
loaded at 0000H and RESET is pressed for you; then click RUN on the
front panel, and watch whichever device the table above names. The
menu reads the same source files you are looking at, so what runs is
what is written here.

To see the source as it runs, open the **Assembler** tab instead,
choose the program from its *Examples* menu and click *Assemble*. The
line the program counter is on is marked while you SINGLE STEP.

Pasting works too, if you would rather see the bytes go in. Choose *Hex
Bytes…* in the same menu, paste a program's bytes into the box and
click *Load Data*, then RESET and RUN from the front panel. *Load Data* switches the
machine on if needed, but unlike the menu it does not clear memory or
press RESET - it deposits the bytes into the machine as it stands.

```
pattern-shift   3e 8c d3 ff 0f c3 02 00
io-echo         db ff d3 ff c3 00 00
adder           3a 80 00 47 3a 81 00 80 32 82 00 c3 00 00
multiply        3a 80 00 5f 16 00 3a 81 00 4f 21 00 00 06 08 29 79 17 4f d2 17 00 19 05 c2 0f 00 22 82 00 76
bouncing-light  0e ff 16 01 7a fe 80 ca 0f 00 fe 01 c2 12 00 79 2f 4f 79 fe 00 c2 1e 00 7a 17 57 c3 21 00 7a 1f 57 7a 2f d3 ff db ff 3c 06 02 1e ff 1d c2 2c 00 05 c2 2a 00 3d c2 28 00 c3 04 00
kill-the-bit    21 00 00 16 80 01 0e 00 1a 1a 1a 1a 09 d2 08 00 db ff aa 0f 57 c3 08 00
macros          06 80 78 d3 ff 11 00 30 1b 7a b3 c2 08 00 78 0f e6 7f 47 c2 02 00 78 d3 ff 11 ff ff 1b 7a b3 c2 1c 00 c3 00 00
tty-hello       21 15 00 06 0f db 00 e6 80 c2 05 00 7e d3 01 23 05 c2 05 00 76 48 45 4c 4c 4f 2c 20 57 4f 52 4c 44 21 0d 0a
tty-ascii       0e 20 db 00 e6 80 c2 02 00 79 d3 01 0c 79 fe 7f c2 02 00 76
tty-echo        db 00 e6 01 c2 00 00 db 01 e6 7f d3 01 c3 00 00
tty-leds        db 00 e6 01 c2 00 00 db 01 e6 7f d3 ff d3 01 c3 00 00
tty-subroutines 31 00 01 cd 16 00 cd 22 00 fe 0d c2 03 00 3e 0a cd 22 00 c3 03 00 db 00 e6 01 c2 16 00 db 01 e6 7f c9 f5 db 00 e6 80 c2 23 00 f1 d3 01 c9
print-number    31 00 01 3a 80 00 06 64 cd 20 00 06 0a cd 20 00 c6 30 cd 2f 00 3e 0d cd 2f 00 3e 0a cd 2f 00 76 0e 2f 0c 90 d2 22 00 80 f5 79 cd 2f 00 f1 c9 f5 db 00 e6 80 c2 30 00 f1 d3 01 c9
guess-letter    31 ff 00 21 87 00 cd 65 00 04 db 00 e6 01 c2 09 00 db 01 78 fe 1a da 1e 00 d6 1a c3 14 00 c6 41 47 16 00 21 b0 00 cd 65 00 cd 70 00 4f cd 7c 00 14 79 b8 ca 48 00 da 3f 00 21 bd 00 c3 42 00 21 b5 00 cd 65 00 c3 23 00 21 c4 00 cd 65 00 7a fe 0a da 56 00 3e 09 c6 30 4f cd 7c 00 21 d0 00 cd 65 00 c3 00 00 7e b7 c8 4f cd 7c 00 23 c3 65 00 db 00 e6 01 c2 70 00 db 01 e6 7f c9 db 00 e6 80 c2 7c 00 79 d3 01 c9 0d 0a 47 55 45 53 53 20 4d 59 20 4c 45 54 54 45 52 20 41 2d 5a 2e 20 41 4e 59 20 4b 45 59 20 53 54 41 52 54 53 2e 0d 0a 00 0d 0a 3f 20 00 20 48 49 47 48 45 52 00 20 4c 4f 57 45 52 00 20 47 4f 54 20 49 54 20 49 4e 20 00 20 54 52 49 45 53 2e 0d 0a 00
```

The authentic way is the front panel, in octal, the way the original
manual has it. Set A7-A0 to the first value, click DEPOSIT, then enter
each following value and click DEPOSIT NEXT. The adder, for example:

```
000: 072 200 000 107 072 201 000 200
010: 062 202 000 303 000 000
```

Then lower all the switches, click RESET, and RUN.

Most of the front panel programs loop forever rather than halting,
which is normal for front panel work: click STOP when you have seen
enough, and use EXAMINE to read memory afterwards. `multiply`,
`tty-hello`, `tty-ascii` and `print-number` halt once they are done -
the machine stops on its own and the WAIT lamp comes on, which is the
panel saying the program finished rather than went quiet. The other
teletype programs wait for keys.

### Worked example: 1 + 2 with the adder

1. Load the adder and RESET.
2. Set A7-A0 to `10 000 000` (0080H) and click EXAMINE.
3. Set A7-A0 to `00 000 001` and click DEPOSIT.
4. Set A7-A0 to `00 000 010` and click DEPOSIT NEXT.
5. RESET, RUN, wait a moment, STOP.
6. Set A7-A0 to `10 000 010` (0082H) and click EXAMINE. The data lamps
   show `00 000 011`, which is 3.

## The 256 byte limit

The simulated machine starts with 256 bytes of memory, as the Altair
8800 did in its base configuration, and every program here fits in it -
below 0100H, data and stack included - so none of them needs a memory
board installed. It also means the address lamps above A7 stay dark for
ordinary programs; Kill the Bit lights them only through the address
bus trick described in its own source.

4 KB and 8 KB can be installed from the *Memory* menu; that is for
running 4K BASIC, not for these.

## Adding a program

Write the source next to the others and the tests pick it up. It
starts with a header:

```
;;; name: Short title
;;; desc: One line on what it does.
;;; device: panel
;
; Anything else worth saying: how to run it, what to expect.

START:  MVI     A,8CH           ; a comment
        OUT     0FFH
        ...
        END
```

`device` is `panel` or `teletype`: whichever the program speaks
through, so the simulator can say where to watch it. The program is
assembled at 0000H unless an `ORG` says otherwise. The hex block above
is the only other copy of its bytes, and the tests check it matches.

To offer it in the simulator's menus, add its name to `panel.EXAMPLES`
in [../js/panel.js](../js/panel.js), in its place in the order; both
the *Load* menu and the Assembler's *Examples* menu read that list.

`npm test` then checks, for every program here, that it assembles
without an error, that it fits in 256 bytes, that it says where to
watch it, and that both menus offer it. Add a test to
[../tests/examples.test.js](../tests/examples.test.js) for what your
program is actually supposed to do.

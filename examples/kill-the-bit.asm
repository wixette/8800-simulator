;;; name: Kill the Bit
;;; desc: The classic Altair 8800 game by Dean McDaniel, 1975. A bit
;;;   rotates across the upper address LEDs and you kill it with the
;;;   sense switch underneath.
;;; device: panel
;;;
;;; See kill-the-bit.md for how to load it, how to play, and why you
;;; have to flip the switch straight back down. The original listing is
;;; at https://altairclone.com/downloads/killbits.pdf and the simulator
;;; bug this game exposed is written up in doc/kill_the_bit.md.
;;;
;;; The game has no output instruction at all. Its display is a side
;;; effect of the real machine: every memory read puts its address on
;;; the address bus, and the panel LEDs mirror the bus. LDAX D reads at
;;; the address in DE, so the four LDAX D in the loop hold register D,
;;; the bit pattern, on the upper address LEDs A15-A8.

0000  21 00 00   LXI H,0000H      ; clear the counter
0003  16 80      MVI D,080H       ; the bit to kill, at A15
0005  01 0e 00   LXI B,000EH      ; speed; a higher value is faster

0008  1a    BEG: LDAX D           ; hold D on the upper address LEDs
0009  1a         LDAX D
000a  1a         LDAX D
000b  1a         LDAX D
000c  09         DAD B            ; count up
000d  d2 08 00   JNC BEG          ; until it carries

0010  db ff      IN 0FFH          ; read the sense switches
0012  aa         XRA D            ; flip every bit a raised switch marks
0013  0f         RRC              ; rotate the display one place right
0014  57         MOV D,A
0015  c3 08 00   JMP BEG

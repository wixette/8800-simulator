;;; name: Bouncing light
;;; desc: Walks a single dark bit back and forth across the data LEDs,
;;;   at a speed set by the sense switches.
;;;
;;; Load at 0000H, RESET, then RUN. One dark LED travels from D1 up to
;;; D7, turns around, travels back down to D1, and repeats. The display
;;; is inverted on purpose: the program keeps one bit set in D and
;;; writes the complement, so seven LEDs stay lit and the gap is what
;;; you follow.
;;;
;;; The sense switches set the speed. With A15-A8 all down the bit
;;; moves at its fastest; raising them lengthens the delay loop, and
;;; the more switches you raise the slower it crawls.
;;;
;;; Register C is the direction flag, 00H to move left and FFH to move
;;; right. It is complemented at each end of the row, which is what
;;; makes the bit bounce rather than wrap around.

0000  0e ff      MVI C,0FFH       ; direction: start moving right
0002  16 01      MVI D,001H       ; the lit bit, at one end of the row

                                  ; turn around at either end
0004  7a         MOV A,D
0005  fe 80      CPI 080H         ; at the top end?
0007  ca 0f 00   JZ 000FH
000a  fe 01      CPI 001H         ; at the bottom end?
000c  c2 12 00   JNZ 0012H
000f  79         MOV A,C          ; flip the direction flag
0010  2f         CMA
0011  4f         MOV C,A

                                  ; move the bit one place
0012  79         MOV A,C
0013  fe 00      CPI 000H
0015  c2 1e 00   JNZ 001EH
0018  7a         MOV A,D          ; direction 00H: move left
0019  17         RAL
001a  57         MOV D,A
001b  c3 21 00   JMP 0021H
001e  7a         MOV A,D          ; direction FFH: move right
001f  1f         RAR
0020  57         MOV D,A

                                  ; show it, then wait
0021  7a         MOV A,D
0022  2f         CMA              ; invert: one dark bit on a lit row
0023  d3 ff      OUT 0FFH
0025  db ff      IN 0FFH          ; sense switches set the delay
0027  3c         INR A
0028  06 02      MVI B,002H
002a  1e ff      MVI E,0FFH
002c  1d         DCR E
002d  c2 2c 00   JNZ 002CH
0030  05         DCR B
0031  c2 2a 00   JNZ 002AH
0034  3d         DCR A
0035  c2 28 00   JNZ 0028H
0038  c3 04 00   JMP 0004H        ; next step

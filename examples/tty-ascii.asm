;;; name: ASCII table
;;; desc: Prints every printable ASCII character, 20H to 7EH, then
;;;   halts.
;;;
;;; Load at 0000H, RESET, then RUN, and watch the Teletype tab. The
;;; output is 95 characters wide and the carriage is only 72, so it
;;; wraps once - which is the paper running out of width, not a bug.
;;;
;;; Unlike tty-echo this one waits on bit 7 of the status port instead
;;; of bit 0: bit 7 going to zero is the board saying the previous
;;; character has gone and it can take another.

0000  0e 20      MVI C,020H       ; the first printable character
0002  db 00      IN 000H          ; SIO status
0004  e6 80      ANI 080H         ; bit 7 = 0 means the printer is ready
0006  c2 02 00   JNZ 0002H        ; still busy, wait
0009  79         MOV A,C
000a  d3 01      OUT 001H         ; print it
000c  0c         INR C            ; on to the next code
000d  79         MOV A,C
000e  fe 7f      CPI 07FH         ; past the last printable one?
0010  c2 02 00   JNZ 0002H        ; no, keep going
0013  76         HLT

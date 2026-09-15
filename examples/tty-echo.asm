;;; name: Teletype echo
;;; desc: Reads a character from the teletype and prints it straight
;;;   back, the smallest program that uses the serial board.
;;; device: teletype
;;;
;;; Load at 0000H, RESET, then RUN, and type on the Teletype tab. Every
;;; key you press appears on the paper because this program put it
;;; there - nothing echoes by itself.
;;;
;;; The 88-SIO board answers two ports: 00H is its status and 01H its
;;; data. The status bits are active low, so bit 0 going to zero is the
;;; board saying a character has arrived.

0000  db 00      IN 000H          ; SIO status
0002  e6 01      ANI 001H         ; bit 0 = 0 means a character is waiting
0004  c2 00 00   JNZ 0000H        ; nothing yet, keep asking
0007  db 01      IN 001H          ; take the character
0009  e6 7f      ANI 07FH         ; the teletype is a seven bit machine
000b  d3 01      OUT 001H         ; print it
000d  c3 00 00   JMP 0000H        ; and wait for the next one

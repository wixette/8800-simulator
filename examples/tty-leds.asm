;;; name: Teletype echo with LEDs
;;; desc: Echoes what you type and shows the character's ASCII code in
;;;   binary on the data LEDs at the same time.
;;; device: teletype
;;;
;;; Load at 0000H, RESET, then RUN, and type on the Teletype tab. Press
;;; A and the LED repeater on that tab reads 01000001 - the letter A is
;;; 41H, and there it is in binary. Press B and the lowest lamp moves.
;;;
;;; It is tty-echo with one instruction added: the same character goes
;;; to port FFH, which drives the data LEDs, before it goes to the
;;; teletype.

0000  db 00      IN 000H          ; SIO status
0002  e6 01      ANI 001H         ; bit 0 = 0 means a character is waiting
0004  c2 00 00   JNZ 0000H        ; nothing yet, keep asking
0007  db 01      IN 001H          ; take the character
0009  e6 7f      ANI 07FH         ; the teletype is a seven bit machine
000b  d3 ff      OUT 0FFH         ; its ASCII code, in binary, on the LEDs
000d  d3 01      OUT 001H         ; and printed on the paper
000f  c3 00 00   JMP 0000H        ; wait for the next one

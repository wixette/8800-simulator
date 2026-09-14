;;; name: Teletype hello
;;; desc: Prints HELLO, WORLD! on the teletype and halts. A message in
;;;   memory, walked a byte at a time.
;;;
;;; Load at 0000H, RESET, then RUN, and look at the Teletype tab.
;;;
;;; HL points at the message and walks forward; a zero byte ends it.
;;; Every character waits for bit 7 of the status port to go low, which
;;; is the board saying the printer has finished with the last one. On
;;; a real ASR-33 at ten characters a second that wait is most of the
;;; program's running time.

0000  21 17 00   LXI H,0017H      ; the message
0003  7e         MOV A,M          ; the next character
0004  b7         ORA A            ; a zero byte ends it
0005  ca 16 00   JZ 0016H
0008  db 00      IN 000H          ; SIO status
000a  e6 80      ANI 080H         ; bit 7 = 0 means the printer is ready
000c  c2 08 00   JNZ 0008H        ; still busy, wait
000f  7e         MOV A,M
0010  d3 01      OUT 001H         ; print it
0012  23         INX H            ; on to the next character
0013  c3 03 00   JMP 0003H
0016  76         HLT
0017  48 45 4c 4c 4f 2c 20 57 4f 52 4c 44 21   DB 'HELLO, WORLD!'
0024  0d 0a      DB 00DH,00AH     ; carriage return, line feed
0026  00         DB 000H          ; end of message

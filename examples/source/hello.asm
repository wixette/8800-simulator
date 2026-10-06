;;; name: Hello, world
;;; desc: Prints a greeting on the Teletype, then halts.
;;; device: teletype
;
; A message in memory, and a loop that prints it through the 88-SIO
; serial board. The message's length is counted by the assembler, from
; $, so the loop needs no zero byte to know where to stop.
;
; RUN, and watch the Teletype.

STATUS  EQU     00H             ; 88-SIO status: bit 7 is 0 when it can print
DATA    EQU     01H             ; 88-SIO data

START:  LXI     H,MSG           ; HL points at the message
        MVI     B,MSGLEN        ; B counts the characters left
NEXT:   IN      STATUS
        ANI     80H             ; ready to print?
        JNZ     NEXT            ; not yet
        MOV     A,M             ; the next character
        OUT     DATA            ; print it
        INX     H
        DCR     B
        JNZ     NEXT            ; until none are left
        HLT

MSG:    DB      'HELLO, WORLD!', 0DH, 0AH
MSGLEN  EQU     $-MSG           ; the message's length

        END

;;; name: Teletype echo
;;; desc: Reads a character from the Teletype and prints it straight back, the smallest program that uses the serial board.
;;; device: teletype
;
; RUN, and type on the Teletype. Every key you press appears on the
; paper because this program put it there - nothing echoes by itself.
;
; The 88-SIO board answers two ports: 00H is its status and 01H its
; data. The status bits are active low, so bit 0 going to zero is the
; board saying a character has arrived.

STATUS  EQU     00H             ; 88-SIO status
DATA    EQU     01H             ; 88-SIO data

WAIT:   IN      STATUS
        ANI     01H             ; bit 0 = 0 means a character is waiting
        JNZ     WAIT            ; nothing yet, keep asking
        IN      DATA            ; take the character
        ANI     7FH             ; the Teletype is a seven bit machine
        OUT     DATA            ; print it
        JMP     WAIT            ; and wait for the next one

        END

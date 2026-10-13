;;; name: Print a number
;;; desc: Prints the byte at 0080H in decimal on the Teletype, three digits, then halts.
;;; device: teletype
;
; Turning a byte into decimal digits: how many hundreds fit, then how
; many tens, and what is left is the units. "How many fit" is counted
; by subtracting until it goes below zero, then adding the last one
; back. PUSH and POP keep a value safe across a CALL.
;
; DEPOSIT a number at 0080H, RUN, and watch the Teletype.

STATUS  EQU     00H             ; 88-SIO status
DATA    EQU     01H             ; 88-SIO data
VALUE   EQU     80H             ; the number to print

START:  LXI     SP,100H
        LDA     VALUE
        MVI     B,100
        CALL    DIGIT           ; the hundreds
        MVI     B,10
        CALL    DIGIT           ; the tens
        ADI     '0'             ; what is left is the units
        CALL    PUTCH
        MVI     A,0DH           ; a new line
        CALL    PUTCH
        MVI     A,0AH
        CALL    PUTCH
        HLT

; DIGIT: prints how many times B goes into A, and leaves the remainder.
DIGIT:  MVI     C,'0'-1
COUNT:  INR     C               ; one more...
        SUB     B
        JNC     COUNT           ; ...while there was enough to take B away
        ADD     B               ; one too many: put it back
        PUSH    PSW             ; keep the remainder
        MOV     A,C
        CALL    PUTCH           ; print the digit
        POP     PSW
        RET

; PUTCH: prints the character in A.
PUTCH:  PUSH    PSW
WAIT:   IN      STATUS
        ANI     80H
        JNZ     WAIT
        POP     PSW
        OUT     DATA
        RET

        END

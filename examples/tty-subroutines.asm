;;; name: Echo, with subroutines
;;; desc: Echoes what you type, through a subroutine for each direction.
;;; device: teletype
;
; Two subroutines: GETCH waits for a key, and PUTCH prints a character.
; CALL puts the address to come back to on the stack, and RET takes it
; off, so the stack needs a place in memory: SP starts at the top.
;
; RUN, open the Teletype and type. RETURN starts a new line.

STATUS  EQU     00H             ; 88-SIO status
DATA    EQU     01H             ; 88-SIO data
STACK   EQU     100H            ; the stack grows down from here

START:  LXI     SP,STACK
LOOP:   CALL    GETCH           ; wait for a key
        CALL    PUTCH           ; and print it
        CPI     0DH             ; a carriage return?
        JNZ     LOOP
        MVI     A,0AH           ; then a line feed after it
        CALL    PUTCH
        JMP     LOOP

; GETCH: waits for a key, and returns it in A.
GETCH:  IN      STATUS
        ANI     01H             ; bit 0 is 0 when a key is waiting
        JNZ     GETCH
        IN      DATA
        ANI     7FH             ; the Teletype sends seven bits
        RET

; PUTCH: prints the character in A, and leaves A as it was.
PUTCH:  PUSH    PSW             ; keep A and the flags
WAIT:   IN      STATUS
        ANI     80H             ; bit 7 is 0 when it can print
        JNZ     WAIT
        POP     PSW
        OUT     DATA
        RET

        END

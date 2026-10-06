;;; name: Add two numbers
;;; desc: Adds the bytes at 0080H and 0081H, and stores the sum at 0082H.
;;; device: panel
;
; The program the Altair's Operator's Manual has you toggle in by hand,
; written with names for its addresses instead of the numbers. It makes
; exactly the bytes of the hand-toggled version.
;
; DEPOSIT two numbers at 0080H and 0081H, RUN, STOP, then EXAMINE 0082H.

FIRST   EQU     80H             ; the first number
SECOND  EQU     FIRST+1         ; the second, the byte after it
SUM     EQU     FIRST+2         ; and where the sum goes

START:  LDA     FIRST           ; A = the first number
        MOV     B,A             ; keep it in B
        LDA     SECOND          ; A = the second
        ADD     B               ; A = A + B
        STA     SUM             ; store the sum
        JMP     START           ; and do it all again

        END

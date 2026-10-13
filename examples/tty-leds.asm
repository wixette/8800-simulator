;;; name: Teletype echo with LEDs
;;; desc: Echoes what you type and shows the character's ASCII code in binary on the data LEDs at the same time.
;;; device: teletype
;
; RUN, and type on the Teletype. Press A and the data LEDs read
; 01000001 - the letter A is 41H, and there it is in binary. Press B and
; the lowest lamp moves.
;
; It is Teletype echo with one instruction added: the same character
; goes to port FFH, which drives the data LEDs, before it goes to the
; Teletype.

STATUS  EQU     00H             ; 88-SIO status
DATA    EQU     01H             ; 88-SIO data
PANEL   EQU     0FFH            ; the data LEDs

WAIT:   IN      STATUS
        ANI     01H             ; bit 0 = 0 means a character is waiting
        JNZ     WAIT            ; nothing yet, keep asking
        IN      DATA            ; take the character
        ANI     7FH             ; the Teletype is a seven bit machine
        OUT     PANEL           ; its ASCII code, in binary, on the LEDs
        OUT     DATA            ; and printed on the paper
        JMP     WAIT            ; wait for the next one

        END

;;; name: ASCII table
;;; desc: Prints every printable ASCII character, 20H to 7EH, then halts.
;;; device: teletype
;
; RUN, and watch the Teletype. The output is 95 characters wide and the
; carriage is only 72, so it wraps once - which is the paper running out
; of width, not a bug.
;
; Unlike Teletype echo this one waits on bit 7 of the status port
; instead of bit 0: bit 7 going to zero is the board saying the previous
; character has gone and it can take another.

STATUS  EQU     00H             ; 88-SIO status
DATA    EQU     01H             ; 88-SIO data

        MVI     C,' '           ; the first printable character, 20H
WAIT:   IN      STATUS
        ANI     80H             ; bit 7 = 0 means the printer is ready
        JNZ     WAIT            ; still busy, wait
        MOV     A,C
        OUT     DATA            ; print it
        INR     C               ; on to the next code
        MOV     A,C
        CPI     7FH             ; past the last printable one?
        JNZ     WAIT            ; no, keep going
        HLT

        END

;;; name: Macros
;;; desc: A lamp walks across the data lamps, in a program built from three macros.
;;; device: panel
;
; Chapter 3 of Intel's manual: a macro names a group of instructions,
; and each use of it is replaced by them. SHRT is the manual's own
; first macro. SHOW takes a register as its argument. DELAY is used
; twice, and each use gets a LOOP label of its own.
;
; RUN, and watch the data lamps.

PANEL   EQU     0FFH            ; the front panel's port

; SHRT: shifts A right one place, a zero coming in at the top.
SHRT    MACRO
        RRC
        ANI     7FH
        ENDM

; SHOW: lights the data lamps with a register.
SHOW    MACRO   R
        MOV     A,R
        OUT     PANEL
        ENDM

; DELAY: counts DE down from COUNT, to give the eye time.
DELAY   MACRO   COUNT
        LXI     D,COUNT
LOOP:   DCX     D
        MOV     A,D
        ORA     E
        JNZ     LOOP            ; LOOP is this use's own
        ENDM

START:  MVI     B,80H           ; one lamp, at the left
NEXT:   SHOW    B
        DELAY   3000H
        MOV     A,B
        SHRT                    ; one place to the right
        MOV     B,A
        JNZ     NEXT            ; until it falls off the end
        SHOW    B               ; all dark...
        DELAY   0FFFFH          ; ...for a moment
        JMP     START

        END

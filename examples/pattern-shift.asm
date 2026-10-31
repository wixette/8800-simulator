;;; name: Pattern shift
;;; desc: Writes 8CH to the data lamps and rotates it right forever.
;;; device: panel
;
; RUN: the data lamps (D7-D0) show the bit pattern 10001100 sliding one
; place to the right on every pass, wrapping around from D0 back to D7.
;
; The simulator runs at 2 MHz, so the rotation is far too fast to
; follow lamp by lamp; the row reads as a shimmer. Click STOP to freeze
; it and the lamps hold whichever rotation the last OUT wrote.
;
; SINGLE STEP does not show it. The data lamps carry whatever is on
; the data bus, which between steps is the next instruction byte:
; stepping the loop shows D3H, 0FH, C3H over and over, the opcodes
; of OUT, RRC and JMP. The rotating value is in the accumulator, so
; watch A in the Debugger's CPU dump instead.

PANEL   EQU     0FFH            ; port 0FFH drives the data lamps

        MVI     A,8CH           ; the pattern to display
SHOW:   OUT     PANEL
        RRC                     ; rotate A right one bit
        JMP     SHOW            ; display it again

        END

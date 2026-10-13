;;; name: Bouncing light
;;; desc: Walks a single dark bit back and forth across the data LEDs, at a speed set by the sense switches.
;;; device: panel
;
; RUN: one dark LED travels from D1 up to D7, turns around, travels
; back down to D1, and repeats. The display is inverted on purpose: the
; program keeps one bit set in D and writes the complement, so seven
; LEDs stay lit and the gap is what you follow.
;
; The sense switches set the speed. With A15-A8 all down the bit moves
; at its fastest; raising them lengthens the delay loop, and the more
; switches you raise the slower it crawls.
;
; Register C is the direction flag, 00H to move left and FFH to move
; right. It is complemented at each end of the row, which is what makes
; the bit bounce rather than wrap around.

PANEL   EQU     0FFH            ; the data LEDs, and the sense switches

        MVI     C,0FFH          ; direction: start moving right
        MVI     D,01H           ; the lit bit, at one end of the row

; Turn around at either end.
STEP:   MOV     A,D
        CPI     80H             ; at the top end?
        JZ      TURN
        CPI     01H             ; at the bottom end?
        JNZ     MOVE
TURN:   MOV     A,C             ; flip the direction flag
        CMA
        MOV     C,A

; Move the bit one place.
MOVE:   MOV     A,C
        CPI     0
        JNZ     RIGHT
        MOV     A,D             ; direction 00H: move left
        RAL
        MOV     D,A
        JMP     SHOW
RIGHT:  MOV     A,D             ; direction FFH: move right
        RAR
        MOV     D,A

; Show it, then wait.
SHOW:   MOV     A,D
        CMA                     ; invert: one dark bit on a lit row
        OUT     PANEL
        IN      PANEL           ; the sense switches set the delay
        INR     A
WAIT:   MVI     B,02H
WAITB:  MVI     E,0FFH
WAITE:  DCR     E
        JNZ     WAITE
        DCR     B
        JNZ     WAITB
        DCR     A
        JNZ     WAIT
        JMP     STEP            ; the next step

        END

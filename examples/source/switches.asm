;;; name: Switches to lamps
;;; desc: Copies the sense switches, A15-A8, to the data lamps, for ever.
;;; device: panel
;
; The smallest program worth running: read a port, write a port, go
; round again. Port 0FFH is the front panel itself - reading it gives
; the upper eight address switches, the sense switches, and writing it
; lights the data lamps D7-D0.
;
; RUN, then flip A15-A8: the data lamps follow them.

PANEL   EQU     0FFH            ; the front panel's port

LOOP:   IN      PANEL           ; read the sense switches...
        OUT     PANEL           ; ...and show them on the data lamps
        JMP     LOOP            ; and again, for ever

        END

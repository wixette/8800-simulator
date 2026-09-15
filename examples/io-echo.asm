;;; name: I/O echo
;;; desc: Reads the sense switches and echoes them to the data LEDs,
;;;   the shortest program that shows panel input and output together.
;;; device: panel
;;;
;;; Load at 0000H, RESET, then RUN. Flip any of the sense switches
;;; (A15-A8, the upper eight) and the matching data LED follows it
;;; immediately.
;;;
;;; Port FFH is the front panel: reading it returns the upper eight
;;; address switches, writing it lights the data LEDs.

0000  db ff      IN 0FFH          ; A <- sense switches A15-A8
0002  d3 ff      OUT 0FFH         ; data LEDs <- A
0004  c3 00 00   JMP 0000H        ; forever

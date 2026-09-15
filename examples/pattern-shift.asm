;;; name: Pattern shift
;;; desc: Writes 8CH to the data LEDs and rotates it right forever, so
;;;   the pattern walks across the display.
;;;
;;; Load at 0000H, RESET, then RUN. The data LEDs (D7-D0) show the bit
;;; pattern 10001100 sliding one place to the right on every pass,
;;; wrapping around from D0 back to D7.
;;;
;;; The simulator runs at 2 MHz, so the rotation is far too fast to
;;; follow LED by LED; the row reads as a shimmer. Use SINGLE STEP to
;;; watch it move one rotation at a time.

0000  3e 8c      MVI A,08CH       ; the pattern to display
0002  d3 ff      OUT 0FFH         ; port FFH drives the data LEDs
0004  0f         RRC              ; rotate A right one bit
0005  c3 02 00   JMP 0002H        ; display it again

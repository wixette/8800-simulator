;;; name: Simple adder
;;; desc: Adds the two bytes held at 0080H and 0081H and stores the sum
;;;   at 0082H, then starts over.
;;;
;;; Load the program at 0000H, then deposit the two numbers to add at
;;; 0080H and 0081H. RESET and RUN, stop after a moment, then EXAMINE
;;; 0082H to read the sum off the data LEDs. The worked example in the
;;; README uses 1 + 2 = 3.
;;;
;;; The program loops forever, so it recomputes the sum continuously:
;;; deposit new operands while it runs and the answer at 0082H follows.

0000  3a 80 00   LDA 0080H        ; A <- first operand
0003  47         MOV B,A          ; keep it in B
0004  3a 81 00   LDA 0081H        ; A <- second operand
0007  80         ADD B            ; A <- A + B
0008  32 82 00   STA 0082H        ; store the sum
000b  c3 00 00   JMP 0000H        ; and again

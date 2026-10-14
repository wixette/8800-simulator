;;; name: Multiply
;;; desc: Multiplies the bytes at 0080H and 0081H by shifting and adding, and stores the 16-bit product at 0082H.
;;; device: panel
;
; The 8080 cannot multiply, so this is done as on paper, in binary: for
; each bit of the multiplier, from the top, double the product so far,
; and if the bit is 1, add the multiplicand. Eight bits, eight rounds.
;
; DEPOSIT two numbers at 0080H and 0081H and RUN. When the machine
; halts, EXAMINE 0082H for the product's low byte and 0083H for its high.

X       EQU     80H             ; the multiplicand
Y       EQU     81H             ; the multiplier
PRODUCT EQU     82H             ; the product, two bytes, low first

START:  LDA     X
        MOV     E,A
        MVI     D,0             ; DE = the multiplicand, widened to 16 bits
        LDA     Y
        MOV     C,A             ; C = the multiplier
        LXI     H,0             ; HL = the product so far
        MVI     B,8             ; eight bits to go
ROUND:  DAD     H               ; double the product
        MOV     A,C
        RAL                     ; the multiplier's next bit, into carry
        MOV     C,A
        JNC     SKIP            ; a 0: nothing to add
        DAD     D               ; a 1: add the multiplicand
SKIP:   DCR     B
        JNZ     ROUND
        SHLD    PRODUCT         ; store the product, low byte first
        HLT

        END

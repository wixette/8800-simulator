;;; name: Guess my letter
;;; desc: Picks a letter, says higher or lower, and counts your tries.
;;; device: teletype
;
; RUN, and play on the Teletype. It asks for a key to start, then
; prompts with "?" until you find the letter. Twenty-six letters fall
; to five guesses if you always halve what is left: start at M, and let
; HIGHER and LOWER throw away half the alphabet each time.
;
; The machine has no clock and no random number generator, so it
; borrows the only unpredictable thing available: it counts, very
; fast, for as long as it takes you to press a key. Where that
; counter happens to be is the letter. It is how home computers
; seeded their games for years afterwards.
;
; 218 bytes, so it fits the 256-byte machine with the stack at 0FFH
; and thirty-odd bytes to spare.

STATUS  EQU     00H             ; 88-SIO status
DATA    EQU     01H             ; 88-SIO data
STACK   EQU     0FFH            ; above the program and its messages

START:  LXI     SP,STACK
        LXI     H,TITLE
        CALL    PRINT
SEED:   INR     B               ; count while nobody is typing...
        IN      STATUS
        ANI     01H             ; bit 0 is 0 when a key is waiting
        JNZ     SEED            ; ...the only randomness it has
        IN      DATA            ; eat the key that started us
        MOV     A,B
MOD26:  CPI     26              ; B modulo 26, the slow and obvious way
        JC      PICK
        SUI     26
        JMP     MOD26
PICK:   ADI     'A'             ; so the target is a letter
        MOV     B,A             ; B holds it for the rest of the game
        MVI     D,00H           ; D counts the guesses

; One guess: read it, echo it, and say which way to go.
ROUND:  LXI     H,GUESS
        CALL    PRINT
        CALL    GETCH
        MOV     C,A
        CALL    PUTCH           ; nothing echoes by itself
        INR     D
        MOV     A,C
        CMP     B
        JZ      GOTIT
        JC      SAYHI           ; guessed low, so the letter is higher
        LXI     H,LOWER
        JMP     SAY
SAYHI:  LXI     H,HIGHER
SAY:    CALL    PRINT
        JMP     ROUND

; Found: say how many tries it took, and start again.
GOTIT:  LXI     H,WIN
        CALL    PRINT
        MOV     A,D
        CPI     10              ; ten guesses or more all print as nine
        JC      DIGIT
        MVI     A,9
DIGIT:  ADI     '0'             ; making it a printable digit
        MOV     C,A
        CALL    PUTCH
        LXI     H,TRIES
        CALL    PRINT
        JMP     START           ; another letter, another game

; PRINT: prints the string at HL, up to its 00H.
PRINT:  MOV     A,M
        ORA     A
        RZ
        MOV     C,A
        CALL    PUTCH
        INX     H
        JMP     PRINT

; GETCH: waits for a key, and returns it in A.
GETCH:  IN      STATUS
        ANI     01H             ; bit 0 is 0 when a key is waiting
        JNZ     GETCH
        IN      DATA
        ANI     7FH             ; the Teletype sends seven bits
        RET

; PUTCH: prints the character in C.
PUTCH:  IN      STATUS
        ANI     80H             ; bit 7 is 0 when it can print
        JNZ     PUTCH
        MOV     A,C
        OUT     DATA
        RET

; The messages, each ending in 00H.
TITLE:  DB      0DH,0AH
        DB      'GUESS MY LETTER A-Z.'
        DB      ' ANY KEY STARTS.'
        DB      0DH,0AH,00H
GUESS:  DB      0DH,0AH,'? ',00H
HIGHER: DB      ' HIGHER',00H
LOWER:  DB      ' LOWER',00H
WIN:    DB      ' GOT IT IN ',00H
TRIES:  DB      ' TRIES.',0DH,0AH,00H

        END

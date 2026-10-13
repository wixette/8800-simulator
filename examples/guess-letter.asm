;;; name: Guess my letter
;;; desc: The machine picks a letter and tells you whether yours is higher or lower, counting how many tries it takes you.
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
; 218 bytes, so it fits the 256 byte machine with the stack at 00FFH
; and thirty-odd bytes to spare.

START:  LXI     SP,00FFH        ; a stack, above the program and its messages
        LXI     H,TITLE
        CALL    PRINT
SEED:   INR     B               ; count while nobody is typing...
        IN      000H
        ANI     001H
        JNZ     SEED            ; ...which is the only randomness this machine has
        IN      001H            ; eat the key that started us
        MOV     A,B
MOD26:  CPI     01AH            ; B modulo 26, the slow and obvious way
        JC      MODDONE
        SUI     01AH
        JMP     MOD26
MODDONE: ADI     041H            ; 'A', so the target is a letter
        MOV     B,A             ; B holds it for the rest of the game
        MVI     D,000H          ; D counts the guesses
ROUND:  LXI     H,GUESS
        CALL    PRINT
        CALL    GETCHAR
        MOV     C,A
        CALL    PUTCHAR         ; nothing echoes by itself
        INR     D
        MOV     A,C
        CMP     B
        JZ      GOTIT
        JC      SAYHIGH         ; guessed low, so the letter is higher
        LXI     H,LOWER
        JMP     SAY
SAYHIGH: LXI     H,HIGHER
SAY:    CALL    PRINT
        JMP     ROUND
GOTIT:  LXI     H,WIN
        CALL    PRINT
        MOV     A,D
        CPI     00AH            ; ten guesses or more all print as nine
        JC      DIGIT
        MVI     A,009H
DIGIT:  ADI     030H            ; '0', making it a printable digit
        MOV     C,A
        CALL    PUTCHAR
        LXI     H,TRIES
        CALL    PRINT
        JMP     START           ; another letter, another game
PRINT:  MOV     A,M             ; prints the string at HL, up to its 00H
        ORA     A
        RZ
        MOV     C,A
        CALL    PUTCHAR
        INX     H
        JMP     PRINT
GETCHAR: IN      000H            ; waits for a character from the SIO
        ANI     001H
        JNZ     GETCHAR
        IN      001H
        ANI     07FH
        RET
PUTCHAR: IN      000H            ; sends the character in C
        ANI     080H
        JNZ     PUTCHAR
        MOV     A,C
        OUT     001H
        RET
TITLE:  DB      00DH,00AH
        DB      'GUESS MY LETTER A-Z.'
        DB      ' ANY KEY STARTS.'
        DB      00DH,00AH,000H
GUESS:  DB      00DH,00AH,'? ',000H
HIGHER: DB      ' HIGHER',000H
LOWER:  DB      ' LOWER',000H
WIN:    DB      ' GOT IT IN ',000H
TRIES:  DB      ' TRIES.',00DH,00AH,000H

        END

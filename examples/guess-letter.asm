;;; name: Guess my letter
;;; desc: The machine picks a letter and tells you whether yours is
;;;   higher or lower, counting how many tries it takes you.
;;; device: teletype
;;;
;;; Load at 0000H, RESET, then RUN, and play on the Teletype tab. It
;;; asks for a key to start, then prompts with "?" until you find the
;;; letter. Twenty-six letters fall to five guesses if you always
;;; halve what is left: start at M, and let HIGHER and LOWER throw away
;;; half the alphabet each time.
;;;
;;; The machine has no clock and no random number generator, so it
;;; borrows the only unpredictable thing available: it counts, very
;;; fast, for as long as it takes you to press a key. Where that
;;; counter happens to be is the letter. It is how home computers
;;; seeded their games for years afterwards.
;;;
;;; 218 bytes, so it fits the 256 byte machine with the stack at 00FFH
;;; and thirty-odd bytes to spare.

0000  31 ff 00   START:   LXI SP,00FFH               ; a stack, above the program and its messages
0003  21 87 00            LXI H,TITLE
0006  cd 65 00            CALL PRINT
0009  04         SEED:    INR B                      ; count while nobody is typing...
000a  db 00               IN 000H
000c  e6 01               ANI 001H
000e  c2 09 00            JNZ SEED                   ; ...which is the only randomness this machine has
0011  db 01               IN 001H                    ; eat the key that started us
0013  78                  MOV A,B
0014  fe 1a      MOD:     CPI 01AH                   ; B modulo 26, the slow and obvious way
0016  da 1e 00            JC MODDONE
0019  d6 1a               SUI 01AH
001b  c3 14 00            JMP MOD
001e  c6 41      MODDONE: ADI 041H                   ; 'A', so the target is a letter
0020  47                  MOV B,A                    ; B holds it for the rest of the game
0021  16 00               MVI D,000H                 ; D counts the guesses
0023  21 b0 00   ROUND:   LXI H,GUESS
0026  cd 65 00            CALL PRINT
0029  cd 70 00            CALL GETCHAR
002c  4f                  MOV C,A
002d  cd 7c 00            CALL PUTCHAR               ; nothing echoes by itself
0030  14                  INR D
0031  79                  MOV A,C
0032  b8                  CMP B
0033  ca 48 00            JZ GOTIT
0036  da 3f 00            JC SAYHIGH                 ; guessed low, so the letter is higher
0039  21 bd 00            LXI H,LOWER
003c  c3 42 00            JMP SAY
003f  21 b5 00   SAYHIGH: LXI H,HIGHER
0042  cd 65 00   SAY:     CALL PRINT
0045  c3 23 00            JMP ROUND
0048  21 c4 00   GOTIT:   LXI H,WIN
004b  cd 65 00            CALL PRINT
004e  7a                  MOV A,D
004f  fe 0a               CPI 00AH                   ; ten guesses or more all print as nine
0051  da 56 00            JC DIGIT
0054  3e 09               MVI A,009H
0056  c6 30      DIGIT:   ADI 030H                   ; '0', making it a printable digit
0058  4f                  MOV C,A
0059  cd 7c 00            CALL PUTCHAR
005c  21 d0 00            LXI H,TRIES
005f  cd 65 00            CALL PRINT
0062  c3 00 00            JMP START                  ; another letter, another game
0065  7e         PRINT:   MOV A,M                    ; prints the string at HL, up to its 00H
0066  b7                  ORA A
0067  c8                  RZ
0068  4f                  MOV C,A
0069  cd 7c 00            CALL PUTCHAR
006c  23                  INX H
006d  c3 65 00            JMP PRINT
0070  db 00      GETCHAR: IN 000H                    ; waits for a character from the SIO
0072  e6 01               ANI 001H
0074  c2 70 00            JNZ GETCHAR
0077  db 01               IN 001H
0079  e6 7f               ANI 07FH
007b  c9                  RET
007c  db 00      PUTCHAR: IN 000H                    ; sends the character in C
007e  e6 80               ANI 080H
0080  c2 7c 00            JNZ PUTCHAR
0083  79                  MOV A,C
0084  d3 01               OUT 001H
0086  c9                  RET
0087  0d 0a                                                    TITLE: DB 00DH,00AH
0089  47 55 45 53 53 20 4d 59 20 4c 45 54 54 45 52 20 41 2d 5a 2e DB 'GUESS MY LETTER A-Z.'
009d  20 41 4e 59 20 4b 45 59 20 53 54 41 52 54 53 2e          DB ' ANY KEY STARTS.'
00ad  0d 0a 00                                                 DB 00DH,00AH,000H
00b0  0d 0a 3f 20 00                                           GUESS: DB 00DH,00AH,'? ',000H
00b5  20 48 49 47 48 45 52 00                                  HIGHER: DB ' HIGHER',000H
00bd  20 4c 4f 57 45 52 00                                     LOWER: DB ' LOWER',000H
00c4  20 47 4f 54 20 49 54 20 49 4e 20 00                      WIN: DB ' GOT IT IN ',000H
00d0  20 54 52 49 45 53 2e 0d 0a 00                            TRIES: DB ' TRIES.',00DH,00AH,000H

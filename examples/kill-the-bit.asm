;;; name: Kill the Bit
;;; desc: The classic Altair 8800 game by Dean McDaniel, 1975. A bit rotates across the upper address LEDs and you kill it with the sense switch underneath.
;;; device: panel
;
; See kill-the-bit.md for how to play, and why you have to flip the
; switch straight back down. The original listing is at
; https://altairclone.com/downloads/killbits.pdf and the simulator bug
; this game exposed is written up in docs/kill-the-bit.md.
;
; The game has no output instruction at all. Its display is a side
; effect of the real machine: every memory read puts its address on the
; address bus, and the panel LEDs mirror the bus. LDAX D reads at the
; address in DE, so the four LDAX D in the loop hold register D, the bit
; pattern, on the upper address LEDs A15-A8.

        LXI     H,0             ; clear the counter
        MVI     D,80H           ; the bit to kill, at A15
        LXI     B,0EH           ; speed; a higher value is faster

BEG:    LDAX    D               ; hold D on the upper address LEDs
        LDAX    D
        LDAX    D
        LDAX    D
        DAD     B               ; count up
        JNC     BEG             ; until it carries

        IN      0FFH            ; read the sense switches
        XRA     D               ; flip every bit a raised switch marks
        RRC                     ; rotate the display one place right
        MOV     D,A
        JMP     BEG

        END

# Assembler examples

Programs written as 8080 source, for the simulator's **Assembler**
tab: choose one from its **Examples** menu, then **Assemble**. Each
shows a little more of Intel's language, as its 1975 *8080 Assembly
Language Programming Manual* defines it.

They are also part of the golden set the tests run: each must
assemble without an error, and do what its header says.

| Program | Watch | Shows |
| --- | --- | --- |
| [switches.asm](switches.asm) | Panel | The smallest program: `IN`, `OUT`, a label, `JMP` |
| [adder.asm](adder.asm) | Panel | The Operator's Manual's first program, with names for its addresses (`EQU`) |
| [hello.asm](hello.asm) | Teletype | A message in memory (`DB`), a loop, its length counted from `$` |
| [echo.asm](echo.asm) | Teletype | Subroutines: `CALL`, `RET`, and the stack |
| [multiply.asm](multiply.asm) | Panel | Multiplying by shifting and adding, 16-bit sums with `DAD` |
| [print-number.asm](print-number.asm) | Teletype | Decimal digits by repeated subtraction, `PUSH` and `POP` |
| [macros.asm](macros.asm) | Panel | Macros (`MACRO`, `ENDM`): an argument, and labels local to each use |

The programs in the folder above are listings, with their bytes beside
the source; these are source only, and the assembler makes the bytes.

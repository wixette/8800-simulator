# Hex dump of tiny 8080 programs.

Each program can be loaded into the simulator via the
loadDataAsHexString() interface or the "LOAD DATA" input box.

The HEX bytes in the strings are the binary sequence of 8080 machine
instructions.

## Simple adder

Adds the two values stored at 0080H and 0081H, then writes the result
to 0082H.

```
3a 80 00 47 3a 81 00 80 32 82 00 c3 00 00
```

## Pattern shift

Keep right shifting the value of register A.

```
3e 8c d3 ff 0f c3 02 00
```

## I/O test

Echos IN to OUT. Reads from SENSE SW. switches, then outputs the
value.

```
db ff d3 ff c3 00 00
```

## More I/O test

```
0e ff 16 01 7a fe 80 ca 0f 00 fe 01 c2 12 00 79 2f 4f 79 fe 00 c2 1e 00 7a 17 57 c3 21 00 7a 1f 57 7a 2f d3 ff db ff 3c 06 02 1e ff 1d c2 2c 00 05 c2 2a 00 3d c2 28 00 c3 04 00
```

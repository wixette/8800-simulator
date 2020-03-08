# Altair 8800 simulator.

A JavaScript simulator to demonstrate the front panel operations of Altair 8800.

## Usage

Simply open index.html in browser, or copy the entire dir to your web server's root dir.

The simulator UI supports English and Chinese for now. In a desktop browser, you may use mouse to toggle or click the switches on the panel directly.

<img src="https://raw.githubusercontent.com/wixette/8800-simulator/master/design/sim-panel.png" width="960">

There is a DEBUG tab where you can check the internal status of the simulated 8080 CPU, or the contents of the simulator's memory.

<img src="https://raw.githubusercontent.com/wixette/8800-simulator/master/design/sim-debug.png" width="960">

The simulator works fine with modern mobile browsers, except that it is a bit challenging to touch a single switch on the panel on a mobile screen. Although, the helper switch buttons below the panel can be used as an alternative solution.

<img src="https://raw.githubusercontent.com/wixette/8800-simulator/master/design/sim-mobile.png" width="480">

## References

 * [Wikipedia: Altair 8800](https://en.wikipedia.org/wiki/Altair_8800)
 * [Wikipedia: Intel 8080 CPU](https://en.wikipedia.org/wiki/Intel_8080)
 * [Intel 8080 instruction set](http://www.classiccmp.org/dunfield/r/8080.txt)
 * [Original Altair 8800 manuals](https://altairclone.com/altair_manuals.html)
 * [Altair 8800 Operator's Manual](https://altairclone.com/downloads/manuals/Altair%208800%20Operator's%20Manual.pdf)
 * [Intel 8080 Assembly Language Programming Manual](http://www.classiccmp.org/dunfield/r/8080asm.pdf)
 * [Another Altair 8800 simulator](https://s2js.com/altair/)

## Acknowledgements

I use (https://github.com/maly/8080js) to execute Intel 8080 instruments.

The Quick Tutoral in the simulator UI refers to an example program got from the original [Altair 8800 Operator's Manual](https://altairclone.com/downloads/manuals/Altair%208800%20Operator's%20Manual.pdf).

The interaction design took [another Altair 8800 simulator](https://s2js.com/altair/) as a reference.

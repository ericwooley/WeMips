var test_string = "Label: Instruction $s1, $s2, $s3\n\
Label:Instruction $s1, $s2, $s3\n\
Instruction $s1, $s2, $s3\n\
Instruction $s1, 16\n\
JAL Lable\n\
J Lable\n\
LW $s1, 16( $sp )\n\
ADDI $s1, $s2, 16\n\
ADD $s1, $s2, $s3 #testing it out\n\
ADD $s1, $s2, $s3 # testing it out\n\
# This is just a comment\n\
Bad code that doesn't work cause it's written in english";
// console.log("Input:");
// console.log(test_string);
var ME = new mips_emulator({debug: false});
var stack = new Stack({debug: true});
// ME.setCode(test_string);

// function isValidLine(string) {
// 	var line = new mips_line(string);
// 	return !line.error;
// }

module("Parsing");

test("General", function() {
	ok(ME.isValidLine("ADD $t0, $t1, $t2"), "ADD should have 3 registers as arguments.");
	ok(!ME.isValidLine("ADD $t0, $t1, 515"), "ADD should not be able to have an immediate as last argument.");
	ok(!ME.isValidLine("ADDI $t0, $t1, $t2"));
	ok(ME.isValidLine("ADDI $t0, $t1, 515"));
	ok(ME.isValidLine("ADDI $t0, $t1, -515"), "Immediates can be negative.");
	ok(ME.isValidLine("ADDI $t0, $t1, +515"), "Immediates can have plus sign.");
	ok(!ME.isValidLine("ADDI $t0, $t1, 1.5"), "Immediates must be integers.");
	// TODO: ADDI $t0, $t1, -  515
	// TODO: ADDI $t0, $t1,  +  515
	ok(!ME.isValidLine("ADD $z0, $t1, $t2"), "z0 is not a valid register.");
	ok(ME.isValidLine("adD $t0, $t1, $t2"), "instruction case doesn't matter.");
	ok(!ME.isValidLine("ADD $T0, $t1, $t2"), "register case DOES matter.");
	ok(!ME.isValidLine("FOO $t0, $t1, $t2"), "foo is not a valid instruction.");

	ok(ME.isValidLine("  "), "We can have whitespace lines.");
	ok(!ME.isValidLine("This is an english statement"), "We cannot have english phrases.");
});

test("Comments", function() {
	ok(ME.isValidLine("ADD $t0, $t1, $t2#comment here"), "we can have attached comments.");
	ok(ME.isValidLine("# Hello there"), "we can have single line comments.");
	ok(ME.isValidLine("mylabel: ADD $t0, $t1, $t2 # comment here"), "we can have labels and comments.");
});

test("Labels", function() {
	ok(ME.isValidLine("loop:"), "we can have single line labels.");
	ok(ME.isValidLine(" loop  :"), "A label can have whitespace between the text and the colon");
	ok(!ME.isValidLine("loop start:"), "A label cannot have more than one word");
	ok(ME.isValidLine("mylabel:ADD $t0, $t1, $t2"), "we can have attached labels.");
});

test("Set/Get Registers", function(){
    ME.setRegister('$t0', 10);
    equal( ME.getRegister('$t0'), 10);
    ME.setRegister('$s0', 10);
    equal(ME.getRegister('$s0'), 10);
    ME.setRegister('$a0', 10);
    equal(ME.getRegister('$a0'), 10);
});


module("Execution", {
	setup: function() {
		// fill up some of the registers with predictable, usable data
		ME.setRegister('t0', 10);
		ME.setRegister('t1', 11);
		ME.setRegister('$t2', 12);
		ME.setRegister('$t3', 13);
		ME.setRegister('$t4', 14);
	}
});



test("ADD", function() {
	ME.runLine("ADD $t0, $t1, $t2");
	equal(ME.getRegister('$t0'), 23, "11 + 12 = 23.");
	equal(ME.getRegister('$t1'), 11, "None of the other register's values should change.");
	equal(ME.getRegister('$t2'), 12, "None of the other register's values should change.");
});

test("ADDI", function() {
	ME.runLine("ADDI $t1, $t0, 505");
	equal(ME.getRegister('$t1'), 515, "10 + 505 = 515");
	ME.runLine("ADDI $t0, $t1, 2");
	equal(ME.getRegister('$t0'), 517, "515 + 2 = 517");
});

module("API");

test("OnChange called", function() {
	var onChangeCalled = false;
	ME.onChange('$t0', function() { onChangeCalled = true; });
	
	ok(!onChangeCalled, "Didn't change anything, so it should still be false.");
	ME.runLine("ADDI $t0, $t1, 2");
	ok(onChangeCalled, "On change should be called when t0 is changed.");

	// reset handler
	ME.onChange('$t0', null);
	onChangeCalled = false;
	ME.runLine("ADDI $t0, $t1, 2");
	ok(!onChangeCalled, "Should have removed the on change handler.");	
});

module("LIBRARY");

test("Signed/Unsigned conversions", function() {
	equal(Stack.signedNumberToUnsignedNumber(-128, 8), 128, "(1000 0000)");
	equal(Stack.signedNumberToUnsignedNumber(-1, 8), 255, "(1111 1111)");
	equal(Stack.signedNumberToUnsignedNumber(-2, 8), 254, "(1111 1110)");
	equal(Stack.signedNumberToUnsignedNumber(127, 8), 127, "(0111 1111)");
	equal(Stack.signedNumberToUnsignedNumber(255, 8), 255, "(1111 1111)");
	equal(Stack.signedNumberToUnsignedNumber(3, 8), 3, "(0000 0011)");
	equal(Stack.signedNumberToUnsignedNumber(-1), Math.pow(2, 32) - 1, "11111111111111111111111111111111");

	equal(Stack.unsignedNumberToSignedNumber(3, 8), 3, "(0000 0011)");
	equal(Stack.unsignedNumberToSignedNumber(255, 8), -1, "(1111 1111)");
	equal(Stack.unsignedNumberToSignedNumber(254, 8), -2, "(1111 1110)");
	equal(Stack.unsignedNumberToSignedNumber(Math.pow(2, 32) - 1), -1, "11111111111111111111111111111111");
});

test("Binary Methods", function() {
	equal(Stack.numberToBinaryString(-1),  "11111111111111111111111111111111");
	equal(Stack.numberToBinaryString(0),   "00000000000000000000000000000000");
	equal(Stack.numberToBinaryString(1),   "00000000000000000000000000000001");
	equal(Stack.numberToBinaryString(33),  "00000000000000000000000000100001");
	equal(Stack.numberToBinaryString(-33), "11111111111111111111111111011111");
	equal(Stack.numberToBinaryString(255), "00000000000000000000000011111111");
	equal(Stack.numberToBinaryString(256), "00000000000000000000000100000000");
	equal(Stack.numberToBinaryString(257), "00000000000000000000000100000001");
	equal(Stack.numberToBinaryString(Math.pow(2, 31) - 1), "01111111111111111111111111111111");
	equal(Stack.numberToBinaryString(Math.pow(2, 32) - 1), "11111111111111111111111111111111");

	equal(Stack.binaryStringToUnsignedNumber("11111111111111111111111111111111"), Math.pow(2, 32) - 1);
	equal(Stack.binaryStringToUnsignedNumber("00000000000000000000000000000000"), 0);
	equal(Stack.binaryStringToUnsignedNumber("00000000000000000000000000000011"), 3);
	equal(Stack.binaryStringToUnsignedNumber("11"), 3, "We can ommit leading zeros.");
	equal(Stack.binaryStringToUnsignedNumber("00000000000000000000000000100001"), 33);

	equal(Stack.binaryStringToNumber("00000000000000000000000000000001"), 1);
	equal(Stack.binaryStringToNumber("11111111111111111111111111111111"), -1);
	equal(Stack.binaryStringToNumber("11111111111111111111111111011111"), -33);
	equal(Stack.binaryStringToNumber("00000000000000000000000000100001"), 33);
	equal(Stack.binaryStringToNumber("11"), -1, "The string length is used to determine the power of two.");
	equal(Stack.binaryStringToNumber("011"), 3, "Same as above.");
	equal(Stack.binaryStringToNumber("10"), -2);
});


var stack = new Stack();
var stackPointer = stack.pointerToBottomOfStack();

module("STACK", {
	setup: function() {
		stack.reset();
		stackPointer = stack.pointerToBottomOfStack();
	}
});

test("Save/load strings to stack", function(){
	stackPointer -= 1;
	stack.setByte(stackPointer, Stack.stringToNumber('A'));
	stackPointer -= 1;
	stack.setByte(stackPointer, Stack.stringToNumber('B'));
	equal(Stack.numberToString(stack.getHalfword(stackPointer)), 'BA');
	stackPointer -= 4;
	stack.setByte(stackPointer + 0, Stack.stringToNumber('a'));
	stack.setByte(stackPointer + 1, Stack.stringToNumber('b'));
	stack.setByte(stackPointer + 2, Stack.stringToNumber('c'));
	stack.setByte(stackPointer + 3, Stack.stringToNumber('d'));
	equal(Stack.numberToString(stack.getWord(stackPointer)), 'abcd');
	stackPointer -= 4;
	stack.setWord(stackPointer, Stack.stringToNumber('wxyz'));
	equal(Stack.numberToString(stack.getWord(stackPointer)), 'wxyz');
});

test("Save/load integers to stack", function() {
	function checkNumber(number) {
		stackPointer -= 4;
		stack.setWord(stackPointer, number);
		equal(stack.getWord(stackPointer), number);
	}
	stackPointer -= 1;

	stack.setByte(stackPointer, 0);
	equal(stack.getByte(stackPointer), 0);
	stack.setByte(stackPointer, 20);
	equal(stack.getByte(stackPointer), 20);
	stack.setByte(stackPointer, -1);
	equal(stack.getByte(stackPointer), -1);
	equal(stack.getUnsignedByte(stackPointer), 255);
	stack.setByte(stackPointer, 255);
	equal(stack.getByte(stackPointer), -1);
	equal(stack.getUnsignedByte(stackPointer), 255);

	checkNumber(0);
	checkNumber(1);
	checkNumber(255);
	checkNumber(257);
	checkNumber(Math.pow(2, 31) - 1);


	// try moving the stack pointer forward
	stackPointer -= 4;
	stack.setWord(stackPointer, 123);
	stackPointer -= 4;
	stack.setWord(stackPointer, 345);
	stackPointer += 4;
	equal(stack.getWord(stackPointer), 123, "Moving the stack pointer forward should access the previous value which was stored.");

	// read individual bytes: stores 257 as [0, 0, 1, 1] = 256 * 1 + 1 * 1 = 257
	stackPointer -= 4;
	stack.setWord(stackPointer, 257);
	equal(stack.getByte(stackPointer + 0), 0, "[00000000] 00000000  00000001  00000001");
	equal(stack.getByte(stackPointer + 1), 0, " 00000000 [00000000] 00000001  00000001");
	equal(stack.getByte(stackPointer + 2), 1, " 00000000  00000000 [00000001] 00000001");
	equal(stack.getByte(stackPointer + 3), 1, " 00000000  00000000  00000001 [00000001]");

	stackPointer -= 4;
	stack.setWord(stackPointer, 128);
	equal(stack.getWord(stackPointer), 128, 			"[00000000  00000000  00000000  10000000]");
	equal(stack.getHalfword(stackPointer + 0), 0, 		"[00000000  00000000] 00000000  10000000 ");
	equal(stack.getHalfword(stackPointer + 1), 0, 		" 00000000 [00000000  00000000] 10000000 ");
	equal(stack.getHalfword(stackPointer + 2), 128, 	" 00000000  00000000 [00000000  10000000]");
	equal(stack.getByte(stackPointer + 0), 0, 			"[00000000] 00000000  00000000  10000000 ");
	equal(stack.getByte(stackPointer + 1), 0, 			" 00000000 [00000000] 00000000  10000000 ");
	equal(stack.getByte(stackPointer + 2), 0, 			" 00000000  00000000 [00000000] 10000000 ");
	equal(stack.getByte(stackPointer + 3), -128, 		" 00000000  00000000  00000000 [10000000]");
	equal(stack.getUnsignedByte(stackPointer + 3), 128, " 00000000  00000000  00000000 [10000000]");

	stackPointer -= 1;
	throws(function() { stack.setByte(stackPointer, -129); }, StackError, "Out of range.");
	stack.setByte(stackPointer, -128);
	stack.setByte(stackPointer, 0);
	stack.setByte(stackPointer, 127);
	stack.setByte(stackPointer, 255);
	throws(function() { stack.setByte(stackPointer, 256); }, StackError, "Out of range.");
});

test("Addresses", function() {
	throws(function() { stack.getByte(stackPointer); }, StackError, "Accessing the top of the stack should throw an error.");
	ok(stack.getByte(0), "Accessing address 0 is valid.");
	throws(function() { stack.getByte(-1); }, StackError, "Accessing anything below 0 is invalid.");
	throws(function() { stack.getByte(stackPointer + 20); }, StackError, "Accessing anything above the top of the stack should throw an error.");

	var stack2 = new Stack({baseAddress: 100});
	stackPointer = stack2.pointerToBottomOfStack();
	stackPointer -= 1;
	equal(stackPointer, 99, "99 should be the first accessible address.");
	stack2.setByte(stackPointer, 123);
	equal(stack2.getByte(stackPointer), 123);
});

var ME = new mipsEmulator({debug: false});
var stack = new Stack({debug: true});

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
	// use our own stack, since we don't want to deal with random addresses that the official stack gets, nor the extremely high values it might start at (e.g. if it starts at 10000 and we access address 0, it is going to create 10000 elements for us.)
	var stack = new Stack({baseAddress: 100});
	stackPointer = stack.pointerToBottomOfStack();

	throws(function() { stack.getByte(stackPointer); }, StackError, "Accessing the top of the stack should throw an error.");
	stack.getByte(0); // "Accessing address 0 is valid.";
	throws(function() { stack.getByte(-1); }, StackError, "Accessing anything below 0 is invalid.");
	throws(function() { stack.getByte(stackPointer + 20); }, StackError, "Accessing anything above the top of the stack should throw an error.");

	stackPointer -= 1;
	equal(stackPointer, 99, "99 should be the first accessible address.");
	stack.setByte(stackPointer, 123);
	equal(stack.getByte(stackPointer), 123);
});

module("Parsing");

test("General", function() {
	ok(ME.isValidLine("ADD $t0, $t1, $t2"), "ADD should have 3 registers as arguments.");
	ok(!ME.isValidLine("ADD $t0, $t1, 515"), "ADD should not be able to have an immediate as last argument.");
	ok(!ME.isValidLine("ADDI $t0, $t1, $t2"));
	ok(ME.isValidLine("ADDI $t0, $t1, 515"));
	ok(!ME.isValidLine("ADD $t0, $t1, $t2, $t3"), "Adding extra params should not be allowed.");
	ok(!ME.isValidLine("J label1, label2"), "Adding extra params should not be allowed.");
	ok(ME.isValidLine("ADDI $t0, $t1, -515"), "Immediates can be negative.");
	ok(ME.isValidLine("ADDI $t0, $t1, +515"), "Immediates can have plus sign.");
	ok(!ME.isValidLine("ADDI $t0, $t1, 1.5"), "Immediates must be integers.");
	ok(ME.isValidLine("ADDI $t0, $t1, -  515"), "Spaces are allowed between the minus sign and the number.");
	ok(ME.isValidLine("ADDI $t0, $t1, +  515"), "Spaces are allowed between the plus sign and the number.");
	ok(!ME.isValidLine("ADD $z0, $t1, $t2"), "z0 is not a valid register.");
	ok(ME.isValidLine("adD $t0, $t1, $t2"), "instruction case doesn't matter.");
	ok(!ME.isValidLine("ADD $T0, $t1, $t2"), "register case DOES matter.");
	ok(!ME.isValidLine("FOO $t0, $t1, $t2"), "foo is not a valid instruction.");
	ok(ME.isValidLine("JAL label"));
	ok(ME.isValidLine("J label"));
	ok(ME.isValidLine("LW $s1, 16( $sp )"), "spaces allowed between parens");

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

module("Registers");

test("Set/Get Registers", function(){
    ME.setRegisterVal('$t0', 10);
    equal(ME.getRegisterVal('$t0'), 10);
    ME.setRegisterVal('$s0', 10);
    equal(ME.getRegisterVal('$s0'), 10);
    ME.setRegisterVal('$a0', 10);
    equal(ME.getRegisterVal('$a0'), 10);
});

test("Readonly registers", function() {
	throws(function() { ME.setRegisterVal('$zero', 5) }, RegisterError, "Cannot write to zero register.");
});

module("Execution", {
	setup: function() {
		// fill up some of the registers with predictable, usable data, and reset the emulator's state
		ME = new mipsEmulator({debug: false});
		ME.setRegisterVal('$t0', 10);
		ME.setRegisterVal('$t1', 11);
		ME.setRegisterVal('$t2', 12);
		ME.setRegisterVal('$t3', 13);
		ME.setRegisterVal('$t4', 14);
	}
});


test("ADD", function() {
	ME.runLine("ADD $t0, $t1, $t2");
	equal(ME.getRegisterVal('$t0'), 23, "11 + 12 = 23.");
	equal(ME.getRegisterVal('$t1'), 11, "None of the other register's values should change.");
	equal(ME.getRegisterVal('$t2'), 12, "None of the other register's values should change.");

	throws(function() { ME.runLine("ADD $zero, $zero, $zero"); });
});

test("ADDI", function() {
	ME.runLine("ADDI $t1, $t0, 505");
	equal(ME.getRegisterVal('$t1'), 515, "10 + 505 = 515");
	ME.runLine("ADDI $t0, $t1, 2");
	equal(ME.getRegisterVal('$t0'), 517, "515 + 2 = 517");

	throws(function() { ME.runLine("ADDI $zero, $zero, 0"); });
});

test("LB, LBU, SB", function() {
	ME.runLine("ADDI $sp, $sp, -1");
	ME.runLine("SB $t2, 0($sp)");
	ME.runLine("LB $t5, 0($sp)");
	equal(ME.getRegisterVal('$t5'), 12, "$t2's initial value was 12.");

	ME.runLine("ADDI $t5, $zero, 255");
	ME.runLine("SB $t5, 0($sp)");
	ME.runLine("LB $t5, 0($sp)");
	equal(ME.getRegisterVal('$t5'), -1, "255 as signed is -1.");
	ME.runLine("LBU $t5, 0($sp)");
	equal(ME.getRegisterVal('$t5'), 255, "255 as unsigned is 255.");
});

test("J", function() {
	ME.runLines([
		"ADDI $t2, $t2, 1",
		"J end",
		"ADDI $t2, $zero, 5",
		"end:"
	]);
	equal(ME.getRegisterVal('$t2'), 13, "The line which sets $t2 to 5 should have been skipped.");

	throws(function() {
		ME.runLines([
			"J end"
		]);
	}, JumpError, "There is no end label. Ensure that it doesn't take the end label from a previous run.");

	throws(function() {
		ME.runLines([
			"J foo"
		]);
	}, JumpError, "There is no foo label.");


	// TODO: detect infinite loops, and either raise an error, or ask the user if they want to contiune (e.g. "foo: J foo")

	ME.runLines([
		"ADDI $t2, $zero, 100",
		"J foo1",
		"ADDI $t2, $zero, 200",
		"J end",
		"foo2: ",
		"  ADDI $t2, $t2, 1",
		"  J end",
		"foo1:",
		"  ADDI $t2, $t2, 1",
		"  J foo2",
		"end:"
	]);
	equal(ME.getRegisterVal('$t2'), 102);
});

test("BEQ", function() {
	throws(function() {
		ME.runLines([
			"BEQ $t0, $t0, foo"
		]);
	}, JumpError, "There is no foo label.");

	ME.runLines([
		"ADDI $t9, $zero, 6 # stop at the 6th iteration",
		"ADDI $t0, $zero, 0 # loop index",
		"ADDI $t1, $zero, 1",
		"ADDI $t2, $zero, 1",
		"continue:#---------",
		"BEQ $t0, $t9, break",
		"ADDI $t3, $t2, 0 	# store t2's old value temporarily",
		"ADD $t2, $t2, $t1 	# t2 = t2 + t1",
		"ADDI $t1, $t3, 0 	# t1 = old t2",
		"ADDI $t0, $t0, 1 	# i++",
		"J continue",
		"#------------",
		"break:"
	]);
	// index:     0, 1, 2, 3, 4,  5,  6
	// number: 1, 1, 2, 3, 5, 8, 13, 21
	equal(ME.getRegisterVal('$t2'), 21, "Fibonnaci's 6th number is 21.");
});

test("BNE", function() {
	throws(function() {
		ME.runLines([
			"BNE $t0, $t1, foo"
		]);
	}, JumpError, "There is no foo label.");

	ME.runLines([
		"ADDI $t9, $zero, 6 # stop at the 6th iteration",
		"ADDI $t0, $zero, 0 # loop index",
		"ADDI $t1, $zero, 1",
		"ADDI $t2, $zero, 1",
		"continue:#---------",
		"BNE $t0, $t9, loop_body",
		"J break",
		"loop_body:",
		"ADDI $t3, $t2, 0 	# store t2's old value temporarily",
		"ADD $t2, $t2, $t1 	# t2 = t2 + t1",
		"ADDI $t1, $t3, 0 	# t1 = old t2",
		"ADDI $t0, $t0, 1 	# i++",
		"J continue",
		"#------------",
		"break:"
	]);
	// index:     0, 1, 2, 3, 4,  5,  6
	// number: 1, 1, 2, 3, 5, 8, 13, 21
	equal(ME.getRegisterVal('$t2'), 21, "Fibonnaci's 6th number is 21.");
});

module("Examples");

test("additionDoublerExample", function() {
	var example = additionDoublerExample();
	ME.runLines(example);
	equal(ME.getRegisterVal('$s0'), 2);
	equal(ME.getRegisterVal('$s1'), 4);
	equal(ME.getRegisterVal('$s2'), 8);
	equal(ME.getRegisterVal('$s3'), 16);
	equal(ME.getRegisterVal('$s4'), 32);
	equal(ME.getRegisterVal('$s5'), 64);
	equal(ME.getRegisterVal('$s6'), 128);
	equal(ME.getRegisterVal('$s7'), 256);
	equal(ME.getRegisterVal('$t0'), 512);
	equal(ME.getRegisterVal('$t1'), 1024);
	equal(ME.getRegisterVal('$t2'), 2048);
	equal(ME.getRegisterVal('$t3'), 4096);
	equal(ME.getRegisterVal('$t4'), 8192);
	equal(ME.getRegisterVal('$t5'), 16384);
	equal(ME.getRegisterVal('$t6'), 32768);
	equal(ME.getRegisterVal('$t7'), 65536);
	equal(ME.getRegisterVal('$t8'), 131072);
	equal(ME.getRegisterVal('$t9'), 262144);
	equal(ME.getRegisterVal('$a0'), 524288);
	equal(ME.getRegisterVal('$a1'), 1048576);
	equal(ME.getRegisterVal('$a2'), 2097152);
	equal(ME.getRegisterVal('$a3'), 4194304);
	equal(ME.getRegisterVal('$v0'), 8388608);
	equal(ME.getRegisterVal('$v1'), 16777216);
});

// TODO: add tests for the rest of the examples

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

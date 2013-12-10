var ME = new MipsEmulator({debug: false});
var stack = new Stack({debug: true});

module("Library");

test("Exception handling", function() {
	expect(1);
	try {
		throw new StackError('foo');
	} catch (e) {
		ok(e instanceof StackError, "Must be able to capture stack errors in the setDataAtAddress method of the stack.");
	}
});

test("Number to string", function() {
	equal(MIPS.numberToString(0), '');
	equal(MIPS.numberToString(0, false), '');
	equal(MIPS.numberToString(0, true), '\0');
	equal(MIPS.numberToString(65), 'A');
	equal(MIPS.numberToString(4276803), 'ABC', 'Each letter is stored in a successive byte ((65 << 16) + (66 << 8) + (67)).');
});

test("Signed/Unsigned conversions", function() {
	equal(MIPS.signedNumberToUnsignedNumber(-128, 8), 128, "(1000 0000)");
	equal(MIPS.signedNumberToUnsignedNumber(-1, 8), 255, "(1111 1111)");
	equal(MIPS.signedNumberToUnsignedNumber(-2, 8), 254, "(1111 1110)");
	equal(MIPS.signedNumberToUnsignedNumber(127, 8), 127, "(0111 1111)");
	equal(MIPS.signedNumberToUnsignedNumber(255, 8), 255, "(1111 1111)");
	equal(MIPS.signedNumberToUnsignedNumber(3, 8), 3, "(0000 0011)");
	equal(MIPS.signedNumberToUnsignedNumber(-1), Math.pow(2, 32) - 1, "11111111111111111111111111111111");

	equal(MIPS.unsignedNumberToSignedNumber(3, 8), 3, "(0000 0011)");
	equal(MIPS.unsignedNumberToSignedNumber(255, 8), -1, "(1111 1111)");
	equal(MIPS.unsignedNumberToSignedNumber(254, 8), -2, "(1111 1110)");
	equal(MIPS.unsignedNumberToSignedNumber(Math.pow(2, 32) - 1), -1, "11111111111111111111111111111111");
});

test("Signed overflow math", function() {
	var result;

	resetFlags();
	result = MIPS.signedAddition(-128, 256, 8);
	equal(result.overflowFlag, true);
	equal(result.result, -128, "256 wraps to same value.");

	resetFlags();
	result = MIPS.signedAddition(-128, 512, 8);
	equal(result.overflowFlag, true);
	equal(result.result, -128, "512 wraps to same value.");

	resetFlags();
	result = MIPS.signedAddition(-128, -256, 8);
	equal(result.overflowFlag, true);
	equal(result.result, -128, "-256 wraps to same value.");

	resetFlags();
	result = MIPS.signedAddition(-128, -512, 8);
	equal(result.overflowFlag, true);
	equal(result.result, -128, "-512 wraps to same value.");

	resetFlags();
	result = MIPS.signedAddition(-128, -257, 8);
	equal(result.overflowFlag, true);
	equal(result.result, 127, "Should subtract one.");

	resetFlags();
	result = MIPS.signedAddition(-128, 255, 8);
	equal(result.overflowFlag, false);
	equal(result.result, 127, "Should not overflow.");

	resetFlags();
	result = MIPS.signedAddition(-128, 5, 8);
	equal(result.overflowFlag, false);
	equal(result.result, -123, "Normal add.");

	resetFlags();
	result = MIPS.signedAddition(-128, -256 -256 -2, 8);
	equal(result.overflowFlag, true);
	equal(result.result, 126, "Should wrap twice.");
});

test("Unsigned carry flag math", function() {
	var result;

	resetFlags();
	result = MIPS.unsignedAddition(0, 256, 8);
	equal(result.carryFlag, true);
	equal(result.result, 0, "256 wraps to same value.");

	resetFlags();
	result = MIPS.unsignedAddition(0, 512, 8);
	equal(result.carryFlag, true);
	equal(result.result, 0, "512 wraps to same value.");

	resetFlags();
	result = MIPS.unsignedAddition(0, -512, 8);
	equal(result.carryFlag, true);
	equal(result.result, 0, "-512 wraps to same value.");

	resetFlags();
	result = MIPS.unsignedAddition(0, 200, 8);
	equal(result.carryFlag, false);
	equal(result.result, 200, "Normal math");

	resetFlags();
	result = MIPS.unsignedAddition(0, 513, 8);
	equal(result.carryFlag, true);
	equal(result.result, 1);

	resetFlags();
	result = MIPS.unsignedAddition(0, -3, 8);
	equal(result.carryFlag, true);
	equal(result.result, 253);

	resetFlags();
	result = MIPS.unsignedAddition(0, -256 -3, 8);
	equal(result.carryFlag, true);
	equal(result.result, 253);
});

test("Binary Methods", function() {
	equal(MIPS.numberToBinaryString(-1),  "11111111111111111111111111111111");
	equal(MIPS.numberToBinaryString(-1, 4),  "1111");
	equal(MIPS.numberToBinaryString(-1, 8, 2),  "11 11 11 11", "Block size specified.");
	equal(MIPS.numberToBinaryString(0),   "00000000000000000000000000000000");
	equal(MIPS.numberToBinaryString(1),   "00000000000000000000000000000001");
	equal(MIPS.numberToBinaryString(33),  "00000000000000000000000000100001");
	equal(MIPS.numberToBinaryString(-33), "11111111111111111111111111011111");
	equal(MIPS.numberToBinaryString(255), "00000000000000000000000011111111");
	equal(MIPS.numberToBinaryString(256), "00000000000000000000000100000000");
	equal(MIPS.numberToBinaryString(257), "00000000000000000000000100000001");
	equal(MIPS.numberToBinaryString(Math.pow(2, 31) - 1), "01111111111111111111111111111111");
	equal(MIPS.numberToBinaryString(Math.pow(2, 32) - 1), "11111111111111111111111111111111");

	equal(MIPS.binaryStringToUnsignedNumber("11111111111111111111111111111111"), Math.pow(2, 32) - 1);
	equal(MIPS.binaryStringToUnsignedNumber("1111111 1111111111  11111111111 1111"), Math.pow(2, 32) - 1, "Spaces are allowed.");
	equal(MIPS.binaryStringToUnsignedNumber("00000000000000000000000000000000"), 0);
	equal(MIPS.binaryStringToUnsignedNumber("00000000000000000000000000000011"), 3);
	equal(MIPS.binaryStringToUnsignedNumber("11"), 3, "We can ommit leading zeros.");
	equal(MIPS.binaryStringToUnsignedNumber("00000000000000000000000000100001"), 33);

	equal(MIPS.binaryStringToNumber("00000000000000000000000000000001"), 1);
	equal(MIPS.binaryStringToNumber("11111111111111111111111111111111"), -1);
	equal(MIPS.binaryStringToNumber("1111111111 11111 11111 111   111111111"), -1, "spaces are allowed.");
	equal(MIPS.binaryStringToNumber("11111111111111111111111111011111"), -33);
	equal(MIPS.binaryStringToNumber("11111111 11111111 11111111 10000000"), -128);
	equal(MIPS.binaryStringToNumber("11111111 11111111 10000000 10000000"), -32640);
	equal(MIPS.binaryStringToNumber("00000000000000000000000000100001"), 33);
	equal(MIPS.binaryStringToNumber("11"), -1, "The string length is used to determine the power of two.");
	equal(MIPS.binaryStringToNumber("011"), 3, "Same as above.");
	equal(MIPS.binaryStringToNumber("10"), -2);
});


var stack = new Stack();
var stackPointer = stack.pointerToBottomOfStack();

module("Stack", {
	setup: function() {
		stack.reset();
		stackPointer = stack.pointerToBottomOfStack();
	}
});

test("Save/load strings to stack", function(){
	stackPointer -= 1;
	stack.setByte(stackPointer, MIPS.stringToNumber('A'));
	stackPointer -= 1;
	stack.setByte(stackPointer, MIPS.stringToNumber('B'));
	equal(MIPS.numberToString(stack.getHalfword(stackPointer)), 'BA');
	stackPointer -= 4;
	stack.setByte(stackPointer + 0, MIPS.stringToNumber('a'));
	stack.setByte(stackPointer + 1, MIPS.stringToNumber('b'));
	stack.setByte(stackPointer + 2, MIPS.stringToNumber('c'));
	stack.setByte(stackPointer + 3, MIPS.stringToNumber('d'));
	equal(MIPS.numberToString(stack.getWord(stackPointer)), 'abcd');
	stackPointer -= 4;
	stack.setWord(stackPointer, MIPS.stringToNumber('wxyz'));
	equal(MIPS.numberToString(stack.getWord(stackPointer)), 'wxyz');
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
	stack.setByte(stackPointer, 257);
	equal(stack.getByte(stackPointer), 1, "Should save only the bottom 8 bits.");
	throws(function() { stack.setByte(stackPointer, Math.pow(2, 32)); }, StackError, "Out of range.");

	var twoToThe24 = 16777216;
	var twoToThe23 = 8388608;
	var twoToThe15 = 32768;
	var twoToThe7 = 128;
	var value = twoToThe23 + twoToThe15 + twoToThe7;
	stackPointer -= 4;
	stack.setWord(stackPointer, value);
	equal(stack.getWord(stackPointer), value, 					"[00000000  10000000  10000000  10000000]");

	equal(stack.getHalfword(stackPointer), 128,			 		"[00000000  10000000] 10000000  10000000 --> 00000000 00000000 00000000 10000000");
	equal(stack.getUnsignedHalfword(stackPointer), 128, 		"[00000000  10000000] 10000000  10000000 --> 00000000 00000000 00000000 10000000");
	equal(stack.getHalfword(stackPointer + 1), -32640, 			" 00000000 [10000000  10000000] 10000000 --> 11111111 11111111 10000000 10000000");
	equal(stack.getUnsignedHalfword(stackPointer + 1), 32896, 	" 00000000 [10000000  10000000] 10000000 --> 00000000 00000000 10000000 10000000");

	value = twoToThe24 + twoToThe23 + twoToThe15 + twoToThe7;
	stack.setWord(stackPointer, value);

	equal(stack.getByte(stackPointer), 1, 						"[00000001] 10000000  10000000  10000000 --> 00000000 00000000 00000000 00000001");
	equal(stack.getUnsignedByte(stackPointer), 1, 				"[00000001] 10000000  10000000  10000000 --> 00000000 00000000 00000000 00000001");
	equal(stack.getByte(stackPointer + 1), -128, 				" 00000001 [10000000] 10000000  10000000 --> 11111111 11111111 11111111 10000000");
	equal(stack.getUnsignedByte(stackPointer + 1), 128, 		" 00000001 [10000000] 10000000  10000000 --> 00000000 00000000 00000000 10000000");
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
	ok(!ME.isValidLine("foobar"), "single word, invalid command (previous failure)");
	ok(!ME.isValidLine("!=@!="), "random symbols");
	ok(ME.isValidLine("syscall"));
	ok(!ME.isValidLine("syscall foo"), "Syscall takes no params");
	ok(!ME.isValidLine("ADD t0, $t1, $t2"), "Must not omit the $ symbols.");

	ok(ME.isValidLine("  "), "We can have whitespace lines.");
	ok(ME.isValidLine(""), "We can have blank lines.");
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

test("Unsigned/Signed Register Values", function() {
	ME.setRegisterVal('$t0', MIPS.maxUnsignedValue(ME.BITS_PER_REGISTER));
	ME.setRegisterVal('$t0', MIPS.maxSignedValue(ME.BITS_PER_REGISTER));
	ME.setRegisterVal('$t0', MIPS.minUnsignedValue(ME.BITS_PER_REGISTER));
	ME.setRegisterVal('$t0', MIPS.minSignedValue(ME.BITS_PER_REGISTER));
	throws(function() { ME.setRegisterVal('$t0', MIPS.maxUnsignedValue(ME.BITS_PER_REGISTER) + 1) }, RegisterError, "Cannot set a register's value to higher than 32 bits.");
	throws(function() { ME.setRegisterVal('$t0', MIPS.minSignedValue(ME.BITS_PER_REGISTER) - 1) }, RegisterError, "Cannot set a register's value to lower than 32 bits.");
});

test("Readonly registers", function() {
	throws(function() { ME.setRegisterVal('$zero', 5) }, RegisterError, "Cannot write to zero register.");
});


var overflowFlag = false;
var carryFlag = false;
function resetFlags() {
	overflowFlag = false;
	carryFlag = false;
}

module("Execution", {
	setup: function() {
		// fill up some of the registers with predictable, usable data, and reset the emulator's state
		ME = new MipsEmulator({debug: false});
		ME.setRegisterVal('$t0', 10);
		ME.setRegisterVal('$t1', 11);
		ME.setRegisterVal('$t2', 12);
		ME.setRegisterVal('$t3', 13);
		ME.setRegisterVal('$t4', 14);

		ME.onSetOverflowFlag = function() { overflowFlag = true; };
		ME.onSetCarryFlag = function() { carryFlag = true; };

		resetFlags();
	}
});


test("ADD", function() {
	ME.runLine("ADD $t0, $t1, $t2");
	equal(ME.getRegisterVal('$t0'), 23, "11 + 12 = 23.");
	equal(ME.getRegisterVal('$t1'), 11, "None of the other register's values should change.");
	equal(ME.getRegisterVal('$t2'), 12, "None of the other register's values should change.");

	throws(function() { ME.runLine("ADD $zero, $zero, $zero"); });

	// ensure the overflow flag is set
	ME.runLine("ADDI $t0, $zero, 1");
	ME.runLine("ADDI $t1, $zero, -3");
	ME.runLine("SLL $t0, $t0, 31 # $t0 stores min signed int");
	resetFlags();
	ME.runLine("ADD $t0, $t0, $t1");
	equal(overflowFlag, true);
	equal(carryFlag, false);
	equal(ME.getRegisterVal('$t0'), MIPS.maxSignedValue(ME.BITS_PER_REGISTER) - 2);
});

test("ADDI", function() {
	ME.runLine("ADDI $t1, $t0, 505");
	equal(ME.getRegisterVal('$t1'), 515, "10 + 505 = 515");
	ME.runLine("ADDI $t0, $t1, 2");
	equal(ME.getRegisterVal('$t0'), 517, "515 + 2 = 517");

	throws(function() { ME.runLine("ADDI $zero, $zero, 0"); });

	// TODO: throw better errors? ParseError?
	throws(function() { ME.runLine("ADDI $t0, $t0, 999999999999999"); }, "Immediate is out of range (2^16 is about 64,000).");
	throws(function() { ME.runLine("ADDI $t0, $t0, -9999999"); }, "Immediate is out of range (2^16 is about 64,000).");
	throws(function() { ME.runLine("ADDI $t0, $t0, 32768"); }, "Immediate is out of range (2^15 = 32768).");
	ME.runLine("ADDI $t0, $t0, 32767"); // max value
	ME.runLine("ADDI $t0, $t0, -32768"); // min value
	ME.runLine("ADDI $t0, $t0, 0"); // valid value
	throws(function() { ME.runLine("ADDI $t0, $t0, -32769"); }, "Immediate is out of range (2^15 = 32768).");


	// ensure the overflow flag is set
	ME.runLine("ADDI $t0, $zero, 1");
	ME.runLine("SLL $t0, $t0, 31 # $t0 stores min signed int");
	resetFlags();
	ME.runLine("ADDI $t0, $t0, -3");
	equal(overflowFlag, true);
	equal(carryFlag, false);
	equal(ME.getRegisterVal('$t0'), MIPS.maxSignedValue(ME.BITS_PER_REGISTER) - 2);
});

test("SLL", function() {
	ME.runLine("ADDI $t1, $zero, 1");
	ME.runLine("SLL $t1, $t1, 5");
	equal(ME.getRegisterVal('$t1'), 32, "2^5 = 32");
});

test("SUBU", function() {
	ME.runLine("ADDI $t1, $zero, 19");
	ME.runLine("ADDI $t2, $zero, 9");
	ME.runLine("SUBU $t3, $t1, $t2");
	equal(ME.getRegisterVal('$t3'), 10, "19-9 = 10");
});

test("ADDU", function() {
	// 0 (min unsigned int)
	// 2^4 = 16
	// 2^5 = 32
	// 2^15 = 32768
	// 2^16 = 65536
	// -2^31 = -2147483648 (min signed int)
	// 2^31 = 2147483648
	// 2^31 - 1 = 2147483647 (max signed int)
	// 2^32 = 4294967296
	// 2^32 - 1 = 4294967295 (max unsigned int)

	// t1 will have 1
	// t2 will have 2147483647 (max signed int)
	// t3 will have 4294967295 or -1 (max unsigned int)
	// t4 will have 2
	// t5 will have -2147483648 or 2147483648 (min unsigned int)
	ME.runLine("ADDI $t1, $zero, 1");
	ME.runLine("SLL $t2, $t1, 31 	# $t2 = 2147483648");
	ME.runLine("SUBU $t2, $t2, $t1 	# $t2 = 2147483647 (max signed int)");
	ME.runLine("ADDI $t3, $zero, -1");
	ME.runLine("ADDI $t4, $zero, 2");
	ME.runLine("SLL $t5, $t1, 31 	# $t5 = -2147483648 or 2147483648 (min signed int)");
	assert(ME.getRegisterVal('$t2') === MIPS.maxSignedValue(ME.BITS_PER_REGISTER));

	resetFlags();
	ME.runLine("ADDI $t0, $t5, -2");
	equal(ME.getRegisterVal('$t0'), MIPS.maxSignedValue(ME.BITS_PER_REGISTER) - 1);
	equal(carryFlag, false);
	equal(overflowFlag, true);

	resetFlags();
	ME.runLine("ADD $t0, $t1, $t2");
	equal(overflowFlag, true, "Adding one would cause the number to become negative.");
	equal(carryFlag, false);
	equal(ME.getRegisterVal('$t0'), -2147483648, "Signed addition will overflow.");
	equal(ME.getRegisterUnsignedVal('$t0'), 2147483648, "Unsigned addition will not overflow.");

	// TODO: the difference between these two is that one sets a CPU flag and the other doesn't, this means we probably need an onSetFlag event.

	resetFlags();
	ME.runLine("ADDU $t0, $t1, $t2");
	equal(carryFlag, false);
	equal(overflowFlag, false);
	equal(ME.getRegisterVal('$t0'), -2147483648, "Signed addition will overflow.");
	equal(ME.getRegisterUnsignedVal('$t0'), 2147483648, "Unsigned addition will not overflow.");


	resetFlags();
	ME.runLine("ADD $t0, $t1, $t3 		# -1 + 1 = 0");
	equal(carryFlag, false);
	equal(overflowFlag, false);
	equal(ME.getRegisterVal('$t0'), 0);
	equal(ME.getRegisterUnsignedVal('$t0'), 0);

	resetFlags();
	ME.runLine("ADDU $t0, $t1, $t3		# (2^32 - 1) + 1 = 2^32 or 0");
	equal(carryFlag, true);
	equal(overflowFlag, false);
	equal(ME.getRegisterVal('$t0'), 0);
	equal(ME.getRegisterUnsignedVal('$t0'), 0);
});

test("ADDIU", function() {
	ok(!ME.isValidLine('ADDIU $t0, $t0, $t0'), "Must have an immediate.");

	ME.runLine("ADDI $t1, $zero, 1");
	ME.runLine("SLL $t2, $t1, 31 	# $t2 = 2147483648");
	ME.runLine("SUBU $t2, $t2, $t1 	# $t2 = 2147483647 (max signed int)");

	resetFlags();
	ME.runLine("ADDIU $t0, $t2, 1");
	equal(overflowFlag, false, "Adding one would cause the number to become negative.");
	equal(carryFlag, false);
	equal(ME.getRegisterVal('$t0'), -2147483648, "Signed addition will overflow.");
	equal(ME.getRegisterUnsignedVal('$t0'), 2147483648, "Unsigned addition will not overflow.");
});

test("LB, LBU, SB", function() {
	var ME2 = new MipsEmulator({ baseStackAddress: MIPS.maxUnsignedValue(ME.BITS_PER_REGISTER - 1) }); // TODO: don't need the -1 here
	equal(ME2.stack.pointerToBottomOfStack(), MIPS.maxUnsignedValue(ME.BITS_PER_REGISTER - 1), 'Ensure the stack is actually at the max value.');
	// make sure that accessing high addresses causes no problems (i.e. that we are using unsigned, rather than signed values.)
	ME2.runLine("ADDI $t5, $zero, 120");
	ME2.runLine("SB $t5, -1($fp)");
	ME2.runLine("LB $t5, -2($fp)");
	ME2.runLine("LBU $t5, -2($fp)");

	// TODO: move these tests elsewhere
	ME2.runLine("ADDIU $sp, $sp, -10");
	ME2.runLine("SB $t5, 0($sp)"); // should not cause any problems
	// ME2.runLine("ADDI $sp, $sp, -100");
	// throws(function() { ME2.runLine('SB $t5, 0($sp)'); }, StackError, "When the stack address starts high, you should never use addi, use addiu instead.");


	// saving a byte should take the bottom 8 bits
	ME.runLine("ADDI $t5, $zero, 257");
	ME.runLine("SB $t5, -1($fp)");
	ME.runLine("LB $t5, -1($fp)");
	equal(ME.getRegisterVal('$t5'), 1, "Should have stored the bottom 8 bits.");


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

	// loading should sign extend or zero extend
	ME.runLine('ADDI $sp, $sp, -4');
	ME.runLine('ADDI $t5, $zero, 511'); // 511 is 256 + 255 -- 00000000 00000000 00000001 11111111
	ME.runLine('SW $t5, 0($sp)'); // 00000000 00000000 00000001 11111111 is now stored at top of stack
	ME.runLine('LB $t5, 3($sp)'); // 00000000 00000000 00000001 [11111111] load this byte
	equal(ME.getRegisterVal('$t5'), -1, 'LB should sign extend.');
	ME.runLine('LBU $t5, 3($sp)'); // 00000000 00000000 00000001 [11111111] load this byte
	equal(ME.getRegisterVal('$t5'), 255, 'LBU should zero extend.');
	ME.runLine('LB $t5, 2($sp)'); // 00000000 00000000 [00000001] 11111111 load this byte
	equal(ME.getRegisterVal('$t5'), 1, 'LB should sign extend.');
	ME.runLine('LBU $t5, 2($sp)'); // 00000000 00000000 [00000001] 11111111 load this byte
	equal(ME.getRegisterVal('$t5'), 1, 'LBU should zero extend.');
});

test("J", function() {
	ME.runLines([
		"ADDI $t2, $zero, 1",
		"J end",
		"ADDI $t2, $zero, 5",
		"end:"
	]);
	equal(ME.getRegisterVal('$t2'), 1, "The line which sets $t2 to 5 should have been skipped.");

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

test("LUI", function(){
	ME.runLines([
	"ADDI $t0, $zero, 10",
	"LUI $t0, 10"
	]);
	equal(ME.getRegisterVal('$t0'), 655360, "1010 (10) shifted 16 digits to the left (10100000000000000000) is 655360");

	ME.runLine("LUI $t0, -1");
	equal(ME.getRegisterVal('$t0'), -65536, "1111 1111 1111 1111 0000 0000 0000 0000");

	ME.runLine("LUI $t0, 65535");
	equal(ME.getRegisterVal('$t0'), -65536, "1111 1111 1111 1111 0000 0000 0000 0000");

	ME.runLine("LUI $t0, 1");
	equal(ME.getRegisterVal('$t0'), 65536, "0000 0000 0000 0001 0000 0000 0000 0000");
});
test("AND", function(){
	ME.runLines([
		"ADDI $s0, $zero, 1",
		"AND $t0, $zero, $s0",
		"ADDI $s0, $zero, 1",
		"AND $t1, $s0, $s0"
	]);
	equal(ME.getRegisterVal("$t0"), 0, "0 & 1 is 1");
	equal(ME.getRegisterVal("$t1"), 1, "1 & 1 is 1");
});

test("ANDI", function(){
	ME.runLines([
		"ADDI $s0, $zero, 0",
		"ANDI $s0, $s0, 1",
		"ADDI $s1, $zero, 1",
		"ANDI $s1, $s1, 1"
	]);
	equal(ME.getRegisterVal("$s0"), 0, "0 & 1 is 1");
	equal(ME.getRegisterVal("$s1"), 1, "1 & 1 is 1");
});

var output = '';
function resetOutput() {
	output = '';
}
var input = '';
module("Syscalls", {
	setup: function() {
		ME = new MipsEmulator({
			onOutput: function(message) {
				output = message;
			},
			onInput: function(message) {
				return input;
			}
		});
		resetOutput();
	}
});

test("Print Integer", function() {
	ME.runLine('ADDI $t0, $zero, 123');
	ME.runLine('ADDI $a0, $t0, 0');
	ME.runLine('ADDI $v0, $zero, 1 # print integer');
	resetOutput();
	ME.runLine('syscall');
	equal(output, 123, "Normal print integer.");

	ME.runLine('ADDI $a0, $zero, -1');
	ME.runLine('ADDI $v0, $zero, 1 # print integer');
	resetOutput();
	ME.runLine('syscall');
	equal(output, -1, "Should print values as signed. (1111 1111 1111 1111 1111 1111 1111 1111)");

	ME.runLine('LUI $a0, 32768 # store 10000... in the register');
	ME.runLine('ADDI $v0, $zero, 1 # print integer');
	resetOutput();
	ME.runLine('syscall');
	equal(output, -2147483648, "Should print values as signed. (1000 0000 0000 0000 0000 0000 0000 0000)");
});

test("Read Integer", function() {
	input = 523;
	ME.runLine('ADDI $v0, $zero, 5 # read integer');
	ME.runLine('syscall');
	equal(ME.getRegisterVal('$v0'), 523, 'Input is stored in $v0.');

	input = -2147483649;
	ME.runLine('ADDI $v0, $zero, 5 # read integer');
	throws(function() { ME.runLine('syscall'); }, SyscallError, 'Value is too low.');

	input = 2147483648;
	ME.runLine('ADDI $v0, $zero, 5 # read integer');
	ME.runLine('syscall');
	equal(ME.getRegisterUnsignedVal('$v0'), input);

	input = 4294967296;
	ME.runLine('ADDI $v0, $zero, 5 # read integer');
	throws(function() { ME.runLine('syscall'); }, SyscallError, 'Value is too high.');
});

test('Read string', function() {
	function verifyStackChars(stackPointerReg, expectedString) {
		for (var i = 0; i < expectedString.length; i++) {
			var expectedChar = expectedString[i];
		};
	}
	var MSYS = mipsSyscalls(ME);
	var expectedStackString;

	input = 'Hello';
	expectedStackString = 'Hello\0\0\0\0\0';
	ME.runLines([
		'# get user input and save to stack',
		'ADDI $t0, $zero, 10   # max chars to read',
		'SUBU $sp, $sp, $t0',
		'ADDI $a0, $sp, 0',
		'ADD $a1, $zero, $t0',
		'ADDI $v0, $zero, 8 # read string',
		'syscall'
	]);
	equal(ME.getRegisterVal('$v0'), input.length);
	equal(expectedStackString.length, 10, 'Ensure the length works as expected.');
	equal(MSYS.getStringAtAddress(ME.getRegisterUnsignedVal('$a0'), expectedStackString.length), expectedStackString);
	equal(MSYS.getStringAtAddress(ME.getRegisterUnsignedVal('$a0')), input);

	input = 'HelloHelloHello';
	expectedStackString = 'HelloHell\0';
	ME.runLines([
		'# get user input and save to stack',
		'ADDI $t0, $zero, 10   # max chars to read',
		'SUBU $sp, $sp, $t0',
		'ADDI $a0, $sp, 0',
		'ADD $a1, $zero, $t0',
		'ADDI $v0, $zero, 8 # read string',
		'syscall'
	]);
	equal(ME.getRegisterVal('$v0'), 9, "Long strings are chopped.");
	equal(MSYS.getStringAtAddress(ME.getRegisterUnsignedVal('$a0'), expectedStackString.length), expectedStackString);
	equal(MSYS.getStringAtAddress(ME.getRegisterUnsignedVal('$a0')), input.substring(0, 9));

	input = '';
	expectedStackString = '\0\0\0\0\0\0\0\0\0\0';
	ME.runLines([
		'# get user input and save to stack',
		'ADDI $t0, $zero, 10   # max chars to read',
		'SUBU $sp, $sp, $t0',
		'ADDI $a0, $sp, 0',
		'ADD $a1, $zero, $t0',
		'ADDI $v0, $zero, 8 # read string',
		'syscall'
	]);
	equal(ME.getRegisterVal('$v0'), 0, "Null string.");
	equal(MSYS.getStringAtAddress(ME.getRegisterUnsignedVal('$a0'), expectedStackString.length), expectedStackString);
	equal(MSYS.getStringAtAddress(ME.getRegisterUnsignedVal('$a0')), input);

});

test('Read/write string', function() {
	input = 'Hello';
	resetOutput();
	ME.runLines([
		'# get user input and save to stack',
		'ADDI $t0, $zero, 10   # max chars to read',
		'SUBU $sp, $sp, $t0',
		'ADDI $a0, $sp, 0',
		'ADD $a1, $zero, $t0',
		'ADDI $v0, $zero, 8 # read string',
		'syscall',
		'',
		'# read stack and output',
		'ADDI $a0, $sp, 0',
		'ADDI $v0, $zero, 4 # print string',
		'syscall'
	]);
	equal(output, input, "Should be able to write hello to stack and read it from the stack.");
});


module("Examples", {
	setup: function() {
		ME = new MipsEmulator({
			onOutput: function(message) {
				output = message;
			}
		});
		resetOutput();
	}
});

test("additionDoublerExample", function() {
	var example = examples.additionDoublerExample();
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

test("helloWorldExample", function() {
	var example = examples.helloWorld();
	equal(output, '');
	ME.runLines(example);
	equal(output, 'Hello world!');
});

// TODO: add this test (e.g. input 2012 and expect it to return 'Your age is: 1').
// test("interactive", function() {
// 	var example = examples.helloWorld();
// 	equal(output, '');
// 	ME.runLines(example);
// 	equal(output, 'Hello world!');
// });

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

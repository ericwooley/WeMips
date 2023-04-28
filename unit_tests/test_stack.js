var stack = new BigEndianAccess(new Stack());
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
	throws(function() { stack.setByte(stackPointer, 257); }, StackError, "Out of range.");
	throws(function() { stack.setByte(stackPointer, Math.pow(2, 32)); }, StackError, "Out of range.");
	stack.setByte(stackPointer, -128);
	stack.setByte(stackPointer, 0);
	stack.setByte(stackPointer, 127);
	stack.setByte(stackPointer, 255);

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
	var stack = new BigEndianAccess(new Stack({baseAddress: 100}));
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

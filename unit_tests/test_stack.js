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
	throws(function() { stack.setByte(stackPointer, -129); }, MemoryError, "Out of range.");
	throws(function() { stack.setByte(stackPointer, 257); }, MemoryError, "Out of range.");
	throws(function() { stack.setByte(stackPointer, Math.pow(2, 32)); }, MemoryError, "Out of range.");
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
	var stack = new Stack({baseAddress: 100});
	stackPointer = stack.pointerToBottomOfStack();

	throws(function() { stack.getByteAtAddress(stackPointer); }, MemoryError, "Accessing the top of the stack should throw an error.");
	stack.getByteAtAddress(0); // "Accessing address 0 is valid.";
	throws(function() { stack.getByteAtAddress(-1); }, MemoryError, "Accessing anything below 0 is invalid.");
	throws(function() { stack.getByteAtAddress(stackPointer + 20); }, MemoryError, "Accessing anything above the top of the stack should throw an error.");

	stackPointer -= 1;
	equal(stackPointer, 99, "99 should be the first accessible address.");
	stack.setByteAtAddress(stackPointer, 123);
	equal(stack.getByteAtAddress(stackPointer), 123);
});

test("Heap", function() {
	var heap = new Heap({baseAddress: 100});
	equal(heap.size, 0, "Heap should be empty at the beginning");
	throws(function() { heap.getByteAtAddress(heap.getMaxValidAddress())}, MemoryError, "Accessing the top of the heap should throw an error.");
	throws(function() { heap.getByteAtAddress(heap.getMinValidAddress()-1)}, MemoryError, "Accessing anything below the start of the heap should throw an error.");
	heap.adjustSize(4);
	equal(heap.size, 4);
	heap.setByteAtAddress(heap.getBaseAddress(), 102);
	equal(heap.getByteAtAddress(heap.getBaseAddress()), 102);
	throws(function() { heap.getByteAtAddress(heap.getBaseAddress()+4)}, MemoryError, "Accessing the top of the heap should throw an error.");
	heap.adjustSize(4);
	equal(heap.size, 8);
	heap.setByteAtAddress(heap.getBaseAddress()+4, 103);
	equal(heap.getByteAtAddress(heap.getBaseAddress()), 102);
	equal(heap.getByteAtAddress(heap.getBaseAddress()+4), 103);
	heap.adjustSize(-4);
	equal(heap.size, 4);
});

test("Combined Memory", function() {
	var heap1 = new Heap({baseAddress: 100});
	var heap2 = new Heap({baseAddress: 200});
	var memory = new CombinedMemory([heap1, heap2]);
	heap1.adjustSize(16);
	heap2.adjustSize(16);
	throws(function() { memory.getByteAtAddress(216); } , MemoryError, "No memory should be available at this address");
	memory.setByteAtAddress(100, 10);
	equal(heap1.getByteAtAddress(100), 10);
	memory.setByteAtAddress(100, 20);
	equal(heap1.getByteAtAddress(100), 20);
	memory.setByteAtAddress(200, 30);
	equal(heap1.getByteAtAddress(100), 20);
	equal(heap2.getByteAtAddress(200), 30);
	memory.setByteAtAddress(200, 40);
	equal(heap1.getByteAtAddress(100), 20);
	equal(heap2.getByteAtAddress(200), 40);
	memory.reset();
});
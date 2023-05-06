module("Library");

test("Exception handling", function() {
	expect(1);
	try {
		throw new MemoryError('foo');
	} catch (e) {
		ok(e instanceof MemoryError, "Must be able to capture stack errors in the setDataAtAddress method of the stack.");
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

var ME = new MipsEmulator({debug: false});

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

test("Immediate values", function() {
	ME.runLines([
		"ADDI $t0, $zero, -0b1000",
		"ADDI $t1, $zero, 0xa1",
		"ADDI $t2, $zero, 0XAb",
		"ADDI $t3, $zero, +0770",
		"ADDI $t4, $zero, 123",
		"ADDI $t5, $zero, 0"
	]);
	equal(ME.getRegisterVal('$t0'), -0b1000);
	equal(ME.getRegisterVal('$t1'), 0xa1);
	equal(ME.getRegisterVal('$t2'), 0xab);
	equal(ME.getRegisterVal('$t3'), 0770);
	equal(ME.getRegisterVal('$t4'), 123);
	equal(ME.getRegisterVal('$t5'), 0);
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

test("SLLV", function() {
	ME.runLine("ADDI $t1, $zero, 1");
	ME.runLine("ADDI $t2, $zero, 5");
	ME.runLine("SLLV $t1, $t1, $t2");
	equal(ME.getRegisterVal('$t1'), 32, "1<<5 = 32");
});

test("SRL", function() {
	ME.runLine("ADDI $t1, $zero, 5");
	ME.runLine("SRL $t1, $t1, 2");
	equal(ME.getRegisterVal('$t1'), 1, "5>>2 = 1");
});

test("SRLV", function() {
	ME.runLine("ADDI $t1, $zero, -5");
	ME.runLine("ADDI $t2, $zero, 2");
	ME.runLine("SRLV $t1, $t1, $t2");
	equal(ME.getRegisterVal('$t1'), 1073741822, "-5>>>2 = 1073741822");
});

test("SRA", function() {
	ME.runLine("ADDI $t1, $zero, -5");
	ME.runLine("SRA $t1, $t1, 2");
	equal(ME.getRegisterVal('$t1'), -2, "-5>>2 = -2");
});

test("SRAV", function() {
	ME.runLine("ADDI $t1, $zero, -5");
	ME.runLine("ADDI $t2, $zero, 2");
	ME.runLine("SRAV $t1, $t1, $t2");
	equal(ME.getRegisterVal('$t1'), -2, "-5>>2 = -2");
});

test("SUB", function() {
	ME.runLine("ADDI $t1, $zero, 9");
	ME.runLine("ADDI $t2, $zero, 19");
	ME.runLine("SUB $t3, $t1, $t2");
	equal(ME.getRegisterVal('$t3'), -10, "9-19 = -10");
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

test('MULT', function() {
	ME.setRegisterVal('$t0', 0x40000001);
	ME.setRegisterVal('$t1', 0x40000000)
	ME.runLines([
		"MULT $t0, $t1"
	]);
	equal(ME.getRegisterVal('hi'), 0x10000000);
	equal(ME.getRegisterVal('lo'), 0x40000000);

	ME.setRegisterVal('$t0', -0x40000001);
	ME.setRegisterVal('$t1',  0x40000000)
	ME.runLines([
		"MULT $t0, $t1"
	]);
	equal(ME.getRegisterVal('hi'), -0x10000001);
	equal(ME.getRegisterVal('lo'), -0x40000000);
});

test('MULTU', function() {
	ME.setRegisterVal('$t0', 0x40000001);
	ME.setRegisterVal('$t1', 0x40000000)
	ME.runLines([
		"MULTU $t0, $t1"
	]);
	equal(ME.getRegisterVal('hi'), 0x10000000);
	equal(ME.getRegisterVal('lo'), 0x40000000);

	ME.setRegisterVal('$t0', 0xBFFFFFFF);
	ME.setRegisterVal('$t1', 0x40000000)
	ME.runLines([
		"MULTU $t0, $t1"
	]);
	equal(ME.getRegisterUnsignedVal('hi'), 0x2FFFFFFF);
	equal(ME.getRegisterUnsignedVal('lo'), 0xC0000000);
});

test('DIV', function() {
	ME.setRegisterVal('$t0', -0x80000000);
	ME.setRegisterVal('$t1', 1)
	ME.runLines([
		"DIV $t0, $t1"
	]);
	equal(ME.getRegisterVal('lo'), -0x80000000);
	equal(ME.getRegisterVal('hi'), 0);

	ME.setRegisterVal('$t0', 123);
	ME.setRegisterVal('$t1', 21)
	ME.runLines([
		"DIV $t0, $t1"
	]);
	equal(ME.getRegisterVal('lo'), 5);
	equal(ME.getRegisterVal('hi'), 18);

	ME.setRegisterVal('$t0', -123);
	ME.setRegisterVal('$t1', 21)
	ME.runLines([
		"DIV $t0, $t1"
	]);
	equal(ME.getRegisterVal('lo'), -5);
	equal(ME.getRegisterVal('hi'), -18);

	ME.setRegisterVal('$t0', 123);
	ME.setRegisterVal('$t1', -21)
	ME.runLines([
		"DIV $t0, $t1"
	]);
	equal(ME.getRegisterVal('lo'), -5);
	equal(ME.getRegisterVal('hi'), 18);
});

test('DIVU', function() {
	ME.setRegisterVal('$t0', 0x80000000);
	ME.setRegisterVal('$t1', 1)
	ME.runLines([
		"DIVU $t0, $t1"
	]);
	equal(ME.getRegisterUnsignedVal('lo'), 0x80000000);
	equal(ME.getRegisterUnsignedVal('hi'), 0);

	ME.setRegisterVal('$t0', 0x80000000);
	ME.setRegisterVal('$t1', 21);
	ME.runLines([
		"DIVU $t0, $t1"
	]);
	equal(ME.getRegisterUnsignedVal('lo'), 102261126);
	equal(ME.getRegisterUnsignedVal('hi'), 2);
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
	ME2.runLine("ADDI $sp, $sp, -10");
	ME2.runLine("SB $t5, 0($sp)"); // should not cause any problems
	// ME2.runLine("ADDI $sp, $sp, -100");
	// throws(function() { ME2.runLine('SB $t5, 0($sp)'); }, MemoryError, "When the stack address starts high, you should never use addi, use addiu instead.");


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

test('SLT', function() {
	ME.runLines([
		"ADDI $t1, $zero, -1",
		"SLT $t2, $t1, $zero",
		"SLT $t3, $zero, $t1",
		"SLT $t4, $zero, $zero"
	]);
	equal(ME.getRegisterVal('$t2'), 1, '(-1<0)==1');
	equal(ME.getRegisterVal('$t3'), 0, '(0<-1)==0');
	equal(ME.getRegisterVal('$t4'), 0, '(0<0)==0');
});

test('SLTI', function() {
	ME.runLines([
		"ADDI $t1, $zero, -1",
		"SLTI $t2, $t1, 0",
		"SLTI $t3, $zero, -1",
		"SLTI $t4, $zero, 0"
	]);
	equal(ME.getRegisterVal('$t2'), 1, '(-1<0)==1');
	equal(ME.getRegisterVal('$t3'), 0, '(0<-1)==0');
	equal(ME.getRegisterVal('$t4'), 0, '(0<0)==0');
});

test('SLTU', function() {
	ME.runLines([
		"ADDI $t1, $zero, -1",
		"SLTU $t2, $t1, $zero",
		"SLTU $t3, $zero, $t1",
		"SLTU $t4, $zero, $zero"
	]);
	equal(ME.getRegisterVal('$t2'), 0, '(2^32-1<0)==0');
	equal(ME.getRegisterVal('$t3'), 1, '(0<2^32-1)==1');
	equal(ME.getRegisterVal('$t4'), 0, '(0<0)==0');
});

test('SLTIU', function() {
	ME.runLines([
		"ADDI $t1, $zero, -1",
		"SLTIU $t2, $t1, 0",
		"SLTIU $t3, $zero, 65535",
		"SLTIU $t4, $zero, 0"
	]);
	equal(ME.getRegisterVal('$t2'), 0, '(2^32-1<0)==0');
	equal(ME.getRegisterVal('$t3'), 1, '(0<65535)==1');
	equal(ME.getRegisterVal('$t4'), 0, '(0<0)==0');
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

test("JAL, JR", function() {
	throws(function() {
		ME.runLines([
			"JAL foo"
		]);
	}, JumpError, "There is no foo label.");

	ME.runLines([
		"ADDI $t0, $zero, 1",
		"JAL sub",
		"ADDI $t0, $t0, 1",
		"J end",
		"sub: ADDI $t0, $t0, 1",
		"JR $ra",
		"end:"
	]);
	equal(ME.getRegisterVal('$t0'), 3);
});

test("JALR", function() {
	ME.runLines([
		"ADDI $t0, $zero, 1",
		"ADDI $t1, $zero, 6",
		"JALR $ra, $t1",
		"ADDI $t0, $t0, 1",
		"J end",
		"ADDI $t0, $t0, 1",
		"JR $ra",
		"end:"
	]);
	equal(ME.getRegisterVal('$t0'), 3);
});

test("LW, SW", function() {
	ME.runLines([
		"ADDI $sp, $sp, -4",
		"ADDI $t1, $zero, 2",
		"ADDI $t3, $t1, 1",
		"LUI $t0, 65535",
		"SW $t0, 0($sp)",
		"LW $t1, 0($sp)",
		"ADDI $t2, $t0, 1",
		"SW $t2, 0($sp)",
		"LW $t3, 0($sp)"
	]);
	equal(ME.getRegisterVal('$t1'), -65536);
	equal(ME.getRegisterVal('$t3'), -65535);
});

test("LH", function() {
	ME.runLines([
		"ADDI $sp, $sp, -4",
		"LUI $t0, 1025",
		"ADDI $t0, $t0, -4096",
		"SW $t0, 0($sp)",
		"LH $t1, 0($sp)",
		"LH $t2, 2($sp)"
	]);
	equal(ME.getRegisterVal('$t1'), 1024);
	equal(ME.getRegisterVal('$t2'), -4096);
});

test("LHU", function() {
	ME.runLines([
		"ADDI $sp, $sp, -4",
		"LUI $t0, 1025",
		"ADDI $t0, $t0, -32768",
		"SW $t0, 0($sp)",
		"LHU $t1, 0($sp)",
		"LHU $t2, 2($sp)"
	]);
	equal(ME.getRegisterVal('$t1'), 1024);
	equal(ME.getRegisterVal('$t2'), 32768);
});

test("SH", function() {
	ME.runLines([
		"ADDI $sp, $sp, -4",
		"ADDI $t0, $zero, 1024",
		"ADDI $t1, $zero, 4096",
		"SH $t0, 0($sp)",
		"SH $t1, 2($sp)",
		"LW $t2, 0($sp)",
	]);
	equal(ME.getRegisterVal('$t2'), 1024*65536+4096);
});

test("LWL", function() {
	ME.runLines([
		"ADDI $sp, $sp, -4",
		"LUI $t0, 4660",            /* 0x1234 */
		"ADDIU $t0, $t0, 22136",    /* 0x5678 */
		"SW $t0, 0($sp)",
		"LWL $t0, 0($sp)",
		"LWL $t1, 1($sp)",
		"LWL $t2, 2($sp)",
		"LWL $t3, 3($sp)"
	]);
	equal(ME.getRegisterVal('$t0') & 0xFFFFFFFF, 0x12345678);
	equal(ME.getRegisterVal('$t1') & 0xFFFFFF00, 0x34567800);
	equal(ME.getRegisterVal('$t2') & 0xFFFF0000, 0x56780000);
	equal(ME.getRegisterVal('$t3') & 0xFF000000, 0x78000000);
});

test("LWR", function() {
	ME.runLines([
		"ADDI $sp, $sp, -4",
		"LUI $t0, 4660",            /* 0x1234 */
		"ADDIU $t0, $t0, 22136",    /* 0x5678 */
		"SW $t0, 0($sp)",
		"LWR $t0, 0($sp)",
		"LWR $t1, 1($sp)",
		"LWR $t2, 2($sp)",
		"LWR $t3, 3($sp)"
	]);
	equal(ME.getRegisterVal('$t0') & 0xFF, 0x12);
	equal(ME.getRegisterVal('$t1') & 0xFFFF, 0x1234);
	equal(ME.getRegisterVal('$t2') & 0xFFFFFF, 0x123456);
	equal(ME.getRegisterVal('$t3') & 0xFFFFFFFF, 0x12345678);
});

test("SWL", function() {
	ME.runLines([
		"ADDI $sp, $sp, -20",
		"LUI $t0, 4660",            /* 0x1234 */
		"ADDIU $t0, $t0, 22136",    /* 0x5678 */
		"SWL $t0, 0($sp)",
		"SWL $t0, 5($sp)",
		"SWL $t0, 10($sp)",
		"SWL $t0, 15($sp)",
		"LW $t0, 0($sp)",
		"LW $t1, 4($sp)",
		"LW $t2, 8($sp)",
		"LW $t3, 12($sp)"
	]);
	equal(ME.getRegisterVal('$t0') & 0xFFFFFFFF, 0x12345678);
	equal(ME.getRegisterVal('$t1') & 0xFFFFFF, 0x123456);
	equal(ME.getRegisterVal('$t2') & 0xFFFF, 0x1234);
	equal(ME.getRegisterVal('$t3') & 0xFF, 0x12);
});

test("SWR", function() {
	ME.runLines([
		"ADDI $sp, $sp, -20",
		"LUI $t0, 4660",            /* 0x1234 */
		"ADDIU $t0, $t0, 22136",    /* 0x5678 */
		"SWR $t0, 0($sp)",
		"SWR $t0, 5($sp)",
		"SWR $t0, 10($sp)",
		"SWR $t0, 15($sp)",
		"LW $t0, 0($sp)",
		"LW $t1, 4($sp)",
		"LW $t2, 8($sp)",
		"LW $t3, 12($sp)"
	]);
	equal(ME.getRegisterVal('$t0') & 0xFF000000, 0x78000000);
	equal(ME.getRegisterVal('$t1') & 0xFFFF0000, 0x56780000);
	equal(ME.getRegisterVal('$t2') & 0xFFFFFF00, 0x34567800);
	equal(ME.getRegisterVal('$t3') & 0xFFFFFFFF, 0x12345678);
});

test("B", function() {
	throws(function() {
		ME.runLines([
			"B foo"
		]);
	}, JumpError, "There is no foo label.");

	ME.runLines([
		"ADDI $t9, $zero, 6 # stop at the 6th iteration",
		"ADDI $t0, $zero, 0 # loop index",
		"ADDI $t1, $zero, 1",
		"ADDI $t2, $zero, 1",
		"continue:#---------",
		"BNE $t0, $t9, loop_body",
		"B break",
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

test("BGE", function() {
	throws(function() {
		ME.runLines([
			"BGE $t0, $t0, foo"
		]);
	}, JumpError, "There is no foo label.");

	ME.runLines([
		"ADDI $t9, $zero, 6 # stop at the 6th iteration",
		"ADDI $t0, $zero, 0 # loop index",
		"ADDI $t1, $zero, 1",
		"ADDI $t2, $zero, 1",
		"continue:#---------",
		"BGE $t0, $t9, break",
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
	
test("BGEU", function() {
	throws(function() {
		ME.runLines([
			"BGEU $zero, $zero, foo"
		]);
	}, JumpError, "There is no foo label.");

	ME.runLines([
		"ADDIU $t0, $zero, 0xF000",
		"ADDI $t1, $zero, 1",
		"BGEU $t1, $t0, skip1    # jump not taken",
		"ADDI $t1, $t1, 1",
		"skip1:",
		"BGEU $t0, $t0, skip2    # jump taken",
		"ADDI $t1, $t1, 1",
		"skip2:"
	]);
	equal(ME.getRegisterUnsignedVal('$t1'), 2);
});
	
test("BGT", function() {
	throws(function() {
		ME.runLines([
			"ADDI $t0, $zero, 1",
			"BGT $t0, $zero, foo"
		]);
	}, JumpError, "There is no foo label.");

	ME.runLines([
		"ADDI $t9, $zero, 6 # stop at the 6th iteration",
		"ADDI $t0, $zero, 0 # loop index",
		"ADDI $t1, $zero, 1",
		"ADDI $t2, $zero, 1",
		"continue:#---------",
		"BGT $t9, $t0, loop_body",
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
	
test("BGTU", function() {
	throws(function() {
		ME.runLines([
			"ADDI $t0, $zero, 1",
			"BGTU $t0, $zero, foo"
		]);
	}, JumpError, "There is no foo label.");

	ME.runLines([
		"ADDIU $t0, $zero, 0xF000",
		"ADDI $t1, $zero, 1",
		"BGTU $t1, $t0, skip    # jump not taken",
		"ADDI $t1, $t1, 1",
		"skip:"
	]);
	equal(ME.getRegisterUnsignedVal('$t1'), 2);
});

test("BLE", function() {
	throws(function() {
		ME.runLines([
			"BLE $t0, $t0, foo"
		]);
	}, JumpError, "There is no foo label.");

	ME.runLines([
		"ADDI $t9, $zero, 6 # stop at the 6th iteration",
		"ADDI $t0, $zero, 0 # loop index",
		"ADDI $t1, $zero, 1",
		"ADDI $t2, $zero, 1",
		"continue:#---------",
		"BLE $t9, $t0, break",
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
	
test("BLEU", function() {
	throws(function() {
		ME.runLines([
			"BLEU $zero, $zero, foo"
		]);
	}, JumpError, "There is no foo label.");

	ME.runLines([
		"ADDIU $t0, $zero, 0xF000",
		"ADDI $t1, $zero, 1",
		"BLEU $t0, $t1, skip1    # jump not taken",
		"ADDI $t1, $t1, 1",
		"skip1:",
		"BLEU $t0, $t0, skip2    # jump taken",
		"ADDI $t1, $t1, 1",
		"skip2:"
	]);
	equal(ME.getRegisterUnsignedVal('$t1'), 2);
});

test("BLT", function() {
	throws(function() {
		ME.runLines([
			"ADDI $t0, $zero, 1",
			"BLT $zero, $t0, foo"
		]);
	}, JumpError, "There is no foo label.");

	ME.runLines([
		"ADDI $t9, $zero, 6 # stop at the 6th iteration",
		"ADDI $t0, $zero, 0 # loop index",
		"ADDI $t1, $zero, 1",
		"ADDI $t2, $zero, 1",
		"continue:#---------",
		"BLT $t0, $t9, loop_body",
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
	
test("BLTU", function() {
	throws(function() {
		ME.runLines([
			"ADDI $t0, $zero, 1",
			"BLTU $zero, $t0, foo"
		]);
	}, JumpError, "There is no foo label.");

	ME.runLines([
		"ADDIU $t0, $zero, 0xF000",
		"ADDI $t1, $zero, 1",
		"BLTU $t0, $t1, skip    # jump not taken",
		"ADDI $t1, $t1, 1",
		"skip:"
	]);
	equal(ME.getRegisterUnsignedVal('$t1'), 2);
});

test("BEQZ", function() {
	throws(function() {
		ME.runLines([
			"BEQZ $zero, foo"
		]);
	}, JumpError, "There is no foo label.");

	ME.runLines([
		"ADDI $t9, $zero, 6 # stop at the 6th iteration",
		"ADDI $t0, $zero, 0 # loop index",
		"ADDI $t1, $zero, 1",
		"ADDI $t2, $zero, 1",
		"continue:#---------",
		"SUB $t4, $t9, $t0",
		"BEQZ $t4, break",
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

test("BNEZ", function() {
	throws(function() {
		ME.runLines([
			"ADDI $t0, $zero, 1",
			"BNEZ $t0, foo"
		]);
	}, JumpError, "There is no foo label.");

	ME.runLines([
		"ADDI $t9, $zero, 6 # stop at the 6th iteration",
		"ADDI $t0, $zero, 0 # loop index",
		"ADDI $t1, $zero, 1",
		"ADDI $t2, $zero, 1",
		"continue:#---------",
		"SUB $t4, $t0, $t9",
		"BNEZ $t4, loop_body",
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

test("BGEZ", function() {
	throws(function() {
		ME.runLines([
			"BGEZ $zero, foo"
		]);
	}, JumpError, "There is no foo label.");

	ME.runLines([
		"ADDI $t9, $zero, 6 # stop at the 6th iteration",
		"ADDI $t0, $zero, 0 # loop index",
		"ADDI $t1, $zero, 1",
		"ADDI $t2, $zero, 1",
		"continue:#---------",
		"SUB $t4, $t0, $t9",
		"BGEZ $t4, break",
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

test("BGEZAL", function() {
	throws(function() {
		ME.runLines([
			"ADDI $t0, $zero, 1",
			"BGEZAL $t0, foo",
		]);
	}, JumpError, "There is no foo label.");

	ME.runLines([
		"ADDI $t0, $zero, 1",
		"BGEZAL $t0, tgt",
		"tgt:"
	]);
	equal(ME.getRegisterVal('$ra'), 3);
});

test("BGTZ", function() {
	throws(function() {
		ME.runLines([
			"ADDI $t0, $zero, 1",
			"BGTZ $t0, foo"
		]);
	}, JumpError, "There is no foo label.");

	ME.runLines([
		"ADDI $t9, $zero, 6 # stop at the 6th iteration",
		"ADDI $t0, $zero, 0 # loop index",
		"ADDI $t1, $zero, 1",
		"ADDI $t2, $zero, 1",
		"continue:#---------",
		"SUB $t4, $t9, $t0",
		"BGTZ $t4, loop_body",
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

test("BLEZ", function() {
	throws(function() {
		ME.runLines([
			"BLEZ $zero, foo"
		]);
	}, JumpError, "There is no foo label.");

	ME.runLines([
		"ADDI $t9, $zero, 6 # stop at the 6th iteration",
		"ADDI $t0, $zero, 0 # loop index",
		"ADDI $t1, $zero, 1",
		"ADDI $t2, $zero, 1",
		"continue:#---------",
		"SUB $t4, $t9, $t0",
		"BLEZ $t4, break",
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

test("BLTZ", function() {
	throws(function() {
		ME.runLines([
			"ADDI $t0, $zero, 1",
			"SUB $t0, $zero, $t0",
			"BLTZ $t0, foo"
		]);
	}, JumpError, "There is no foo label.");

	ME.runLines([
		"ADDI $t9, $zero, 6 # stop at the 6th iteration",
		"ADDI $t0, $zero, 0 # loop index",
		"ADDI $t1, $zero, 1",
		"ADDI $t2, $zero, 1",
		"continue:#---------",
		"SUB $t4, $t0, $t9",
		"BLTZ $t4, loop_body",
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

test("BLTZAL", function() {
	throws(function() {
			ME.runLines([
					"ADDI $t0, $zero, -1",
					"BLTZAL $t0, foo"     
			]);
	}, JumpError, "There is no foo label.");

	ME.runLines([
			"ADDI $t0, $zero, -1",
			"BLTZAL $t0, tgt",
			"tgt:"
	]);
	equal(ME.getRegisterVal('$ra'), 3);
});

test("MTHI", function() {
	ME.setRegisterVal('lo', 222);
	ME.setRegisterVal('hi', 222);
	ME.setRegisterVal('$t0', 15);
	ME.runLine("MTHI $t0");
	equal(ME.getRegisterVal('hi'), 15);
});

test("MTLO", function() {
	ME.setRegisterVal('lo', 222);
	ME.setRegisterVal('hi', 222);
	ME.setRegisterVal('$t0', 15);
	ME.runLine("MTLO $t0");
	equal(ME.getRegisterVal('lo'), 15);
});

test("MFHI", function() {
	ME.setRegisterVal('lo', 222);
	ME.setRegisterVal('hi', 223);
	ME.setRegisterVal('$t0', 15);
	ME.runLine("MFHI $t0");
	equal(ME.getRegisterVal('$t0'), 223);
});

test("MFLO", function() {
	ME.setRegisterVal('lo', 222);
	ME.setRegisterVal('hi', 223);
	ME.setRegisterVal('$t0', 15);
	ME.runLine("MFLO $t0");
	equal(ME.getRegisterVal('$t0'), 222);
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
		"AND $t0, $zero, $zero",
		"AND $t1, $zero, $s0",
		"AND $t2, $s0, $zero",
		"AND $t3, $s0, $s0",
	]);
	equal(ME.getRegisterVal("$t0"), 0, "0 & 0 is 0");
	equal(ME.getRegisterVal("$t1"), 0, "0 & 1 is 0");
	equal(ME.getRegisterVal("$t2"), 0, "1 & 0 is 0");
	equal(ME.getRegisterVal("$t3"), 1, "1 & 1 is 1");
});

test("ANDI", function(){
	ME.runLines([
		"ADDI $s0, $zero, 1",
		"ANDI $t0, $zero, 0",
		"ANDI $t1, $zero, 1",
		"ANDI $t2, $s0, 0",
		"ANDI $t3, $s0, 1",
	]);
	equal(ME.getRegisterVal("$t0"), 0, "0 & 0 is 0");
	equal(ME.getRegisterVal("$t1"), 0, "0 & 1 is 0");
	equal(ME.getRegisterVal("$t2"), 0, "1 & 0 is 0");
	equal(ME.getRegisterVal("$t3"), 1, "1 & 1 is 1");
});

test("NOR", function(){
	ME.runLines([
		"ADDI $s0, $zero, 1",
		"NOR $t0, $zero, $zero",
		"NOR $t1, $zero, $s0",
		"NOR $t2, $s0, $zero",
		"NOR $t3, $s0, $s0",
	]);
	equal(ME.getRegisterVal("$t0"), -1, "~(0 | 0) is -1");
	equal(ME.getRegisterVal("$t1"), -2, "~(0 | 1) is -2");
	equal(ME.getRegisterVal("$t2"), -2, "~(1 | 0) is -2");
	equal(ME.getRegisterVal("$t3"), -2, "~(1 | 1) is -2");
});

test("OR", function(){
	ME.runLines([
		"ADDI $s0, $zero, 1",
		"OR $t0, $zero, $zero",
		"OR $t1, $zero, $s0",
		"OR $t2, $s0, $zero",
		"OR $t3, $s0, $s0",
	]);
	equal(ME.getRegisterVal("$t0"), 0, "0 | 0 is 0");
	equal(ME.getRegisterVal("$t1"), 1, "0 | 1 is 1");
	equal(ME.getRegisterVal("$t2"), 1, "1 | 0 is 1");
	equal(ME.getRegisterVal("$t3"), 1, "1 | 1 is 1");
});

test("ORI", function(){
	ME.runLines([
		"ADDI $s0, $zero, 1",
		"ORI $t0, $zero, 0",
		"ORI $t1, $zero, 1",
		"ORI $t2, $s0, 0",
		"ORI $t3, $s0, 1",
	]);
	equal(ME.getRegisterVal("$t0"), 0, "0 | 0 is 0");
	equal(ME.getRegisterVal("$t1"), 1, "0 | 1 is 1");
	equal(ME.getRegisterVal("$t2"), 1, "1 | 0 is 1");
	equal(ME.getRegisterVal("$t3"), 1, "1 | 1 is 1");
});

test("XOR", function(){
	ME.runLines([
		"ADDI $s0, $zero, 1",
		"XOR $t0, $zero, $zero",
		"XOR $t1, $zero, $s0",
		"XOR $t2, $s0, $zero",
		"XOR $t3, $s0, $s0",
	]);
	equal(ME.getRegisterVal("$t0"), 0, "0 ^ 0 is 0");
	equal(ME.getRegisterVal("$t1"), 1, "0 ^ 1 is 1");
	equal(ME.getRegisterVal("$t2"), 1, "1 ^ 0 is 1");
	equal(ME.getRegisterVal("$t3"), 0, "1 ^ 1 is 0");
});

test("XORI", function(){
	ME.runLines([
		"ADDI $s0, $zero, 1",
		"XORI $t0, $zero, 0",
		"XORI $t1, $zero, 1",
		"XORI $t2, $s0, 0",
		"XORI $t3, $s0, 1",
	]);
	equal(ME.getRegisterVal("$t0"), 0, "0 ^ 0 is 0");
	equal(ME.getRegisterVal("$t1"), 1, "0 ^ 1 is 1");
	equal(ME.getRegisterVal("$t2"), 1, "1 ^ 0 is 1");
	equal(ME.getRegisterVal("$t3"), 0, "1 ^ 1 is 0");
});

test("Pipeline Emulation", function() {
	ME.setPipelineEmulationEnabled(true);
	ME.runLines([
		"ADDI $t0, $zero, 10",
		"JAL test",
		"ADDI $t0, $zero, 1",
		"j end",
		"ADDI $t0, $t0, 1",
		"test:",
		"addi $t0, $t0, 1",
		"jr $ra",
		"addi $t0, $t0, 2",
		"end:"
	]);
	equal(ME.getRegisterVal("$t0"), 5);
	ME.setPipelineEmulationEnabled(false);
});
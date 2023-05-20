var ME = new MipsEmulator({debug: false});
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

test('Allocate Heap Memory', function() {
	var oldHeapEnd = ME.heap.getMaxValidAddress();
	ME.runLines([
		"ADDI $v0, $zero, 9 # allocate heap memory",
		"ADDI $a0, $zero, 100",
		"SYSCALL"
	]);
	var newHeapEnd = ME.heap.getMaxValidAddress();
	var memoryStart = ME.getRegisterUnsignedVal('$v0');
	equal(memoryStart, oldHeapEnd, "New area should start at old heap end");
	equal(newHeapEnd, oldHeapEnd+100, "Heap end should have moved by 100 bytes");
});
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

module("STACK");

test("move pointer", function(){
    ok(stack.get_stack_pointer() ===  0, "The stack should initialize to 0");
    stack.move_pointer(32);
    stack.set_word(10);
    ok(stack.get_word(), 10, "The stack should be set to 10" );
    stack.move_pointer(-32);
    ok(stack.get_word() === 0, "After moving back to position zero, the stack pointer should be 0");
    ok(stack.get_word_at(32), 10, "The stack should grab 10 from 32 bits ahead of it.");
    stack.move_pointer(64); // Move it to an uninitialized location
    ok(typeof stack.get_word() == "number", "This should be an uninitialized portion on the stack, so garbage should be returned");
});

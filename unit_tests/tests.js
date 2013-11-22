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
console.log("Input:");
console.log(test_string);
ME.setCode(test_string);

function isValidLine(string) {
	var line = new mips_line(string);
	return !line.error;
}

module("Parsing");

test("General", function() {
	ok(isValidLine("ADD $t0, $t1, $t2"), "ADD should have 3 registers as arguments.");
	ok(!isValidLine("ADD $t0, $t1, 515"), "ADD should not be able to have an immediate as last argument.");
	ok(!isValidLine("ADDI $t0, $t1, $t2"));
	ok(isValidLine("ADDI $t0, $t1, 515"));
	ok(isValidLine("ADDI $t0, $t1, -515"), "Immediates can be negative.");
	ok(isValidLine("ADDI $t0, $t1, +515"), "Immediates can have plus sign.");
	ok(!isValidLine("ADDI $t0, $t1, 1.5"), "Immediates must be integers.");
	// TODO: ADDI $t0, $t1, -  515
	// TODO: ADDI $t0, $t1,  +  515
	ok(!isValidLine("ADD $z0, $t1, $t2"), "z0 is not a valid register.");
	ok(isValidLine("adD $t0, $t1, $t2"), "instruction case doesn't matter.");
	ok(!isValidLine("ADD $T0, $t1, $t2"), "register case DOES matter.");
	ok(!isValidLine("FOO $t0, $t1, $t2"), "foo is not a valid instruction.");
	
	ok(isValidLine("  "), "We can have whitespace lines.");
	ok(!isValidLine("This is an english statement"), "We cannot have english phrases.");
});

test("Comments", function() {
	ok(isValidLine("ADD $t0, $t1, $t2#comment here"), "we can have attached comments.");
	ok(isValidLine("# Hello there"), "we can have single line comments.");
	ok(isValidLine("mylabel: ADD $t0, $t1, $t2 # comment here"), "we can have labels and comments.");
});

test("Labels", function() {
	ok(isValidLine("loop:"), "we can have single line labels.");
	ok(isValidLine(" loop  :"), "A label can have whitespace between the text and the colon");
	ok(!isValidLine("loop start:"), "A label cannot have more than one word");
	ok(isValidLine("mylabel:ADD $t0, $t1, $t2"), "we can have attached labels.");
});

module("Execution", {
	setup: function() {
		// fill up some of the registers with predictable data
		ME.registers['t0'] = 0;
		ME.registers['t1'] = 1;
		ME.registers['t2'] = 2;
		ME.registers['t3'] = 3;
		ME.registers['t4'] = 4;
	}
});

test("ADD", function() {
	ME.runLine("ADD $t0, $t1, $t2");
	equal(ME.registers['t0'], 3, "1 + 2 should be 3.");
	equal(ME.registers['t1'], 1, "None of the other register's values should change.");
	equal(ME.registers['t2'], 2, "None of the other register's values should change.");
});

test("ADDI", function() {
	ME.runLine("ADDI $t1, $t0, 505");
	equal(ME.registers['t1'], 505, "0 + 505 = 505");
	ME.runLine("ADDI $t0, $t1, 2");
	equal(ME.registers['t0'], 507, "505 + 2 = 507");
});

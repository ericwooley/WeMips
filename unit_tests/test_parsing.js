var ME = new MipsEmulator({debug: false});

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

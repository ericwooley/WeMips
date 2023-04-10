var ME = new MipsEmulator({debug: false});

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

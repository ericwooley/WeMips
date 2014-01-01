function createRegisters(registerDataArray) {
	assert(typeof registerDataArray === "array");

	var registers = {};
	for (var i = 0; i < registerDataArray.length; i++) {
		var registerData = registerDataArray[i];

		var register = {};
		register.index = i;
		register.value = registerData.value !== "undefined" ? registerData.value :
		assert(typeof registerData.name !== "undefined");
		registers.push(register);
	};

	return registers;
};

var mipsRegisters = cretaeRegisters([
	{ name: "$zero", value: 0, readonly: true, userdata: { preserved: true } },
	{ name: "$at", readonly: true },
	{ name: "$v0", readonly: true },
	{ name: "$v1" },
	{ name: "$a0" },
	{ name: "$a1" },
	{ name: "$a2" },
	{ name: "$a3" },
	{ name: "$t0" },
	{ name: "$t1" },
	{ name: "$t2" },
	{ name: "$t3" },
	{ name: "$t4" },
	{ name: "$t5" },
	{ name: "$t6" },
	{ name: "$t7" },
	{ name: "$t8" },
	{ name: "$s0", userdata: { preserved: true } },
	{ name: "$s1", userdata: { preserved: true } },
	{ name: "$s2", userdata: { preserved: true } },
	{ name: "$s3", userdata: { preserved: true } },
	{ name: "$s4", userdata: { preserved: true } },
	{ name: "$s5", userdata: { preserved: true } },
	{ name: "$s6", userdata: { preserved: true } },
	{ name: "$s7", userdata: { preserved: true } },
	{ name: "$t8" },
	{ name: "$t9" },
	{ name: "$k0", readonly: true },
	{ name: "$k1", readonly: true },
	{ name: "$gp", readonly: true, userdata: { preserved: true } },
	{ name: "$sp", userdata: { preserved: true } },
	{ name: "$fp", userdata: { preserved: true } },
	{ name: "$ra", readonly: true, userdata: { preserved: true } },
]);
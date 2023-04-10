var ME = new MipsEmulator({debug: false});
var output = '';
module("Examples", {
	setup: function() {
		ME = new MipsEmulator({
			onOutput: function(message) {
				output = message;
			}
		});
		resetOutput();
	}
});

test("additionDoublerExample", function() {
	var example = examples.additionDoublerExample();
	ME.runLines(example);
	equal(ME.getRegisterVal('$s0'), 2);
	equal(ME.getRegisterVal('$s1'), 4);
	equal(ME.getRegisterVal('$s2'), 8);
	equal(ME.getRegisterVal('$s3'), 16);
	equal(ME.getRegisterVal('$s4'), 32);
	equal(ME.getRegisterVal('$s5'), 64);
	equal(ME.getRegisterVal('$s6'), 128);
	equal(ME.getRegisterVal('$s7'), 256);
	equal(ME.getRegisterVal('$t0'), 512);
	equal(ME.getRegisterVal('$t1'), 1024);
	equal(ME.getRegisterVal('$t2'), 2048);
	equal(ME.getRegisterVal('$t3'), 4096);
	equal(ME.getRegisterVal('$t4'), 8192);
	equal(ME.getRegisterVal('$t5'), 16384);
	equal(ME.getRegisterVal('$t6'), 32768);
	equal(ME.getRegisterVal('$t7'), 65536);
	equal(ME.getRegisterVal('$t8'), 131072);
	equal(ME.getRegisterVal('$t9'), 262144);
	equal(ME.getRegisterVal('$a0'), 524288);
	equal(ME.getRegisterVal('$a1'), 1048576);
	equal(ME.getRegisterVal('$a2'), 2097152);
	equal(ME.getRegisterVal('$a3'), 4194304);
	equal(ME.getRegisterVal('$v0'), 8388608);
	equal(ME.getRegisterVal('$v1'), 16777216);
});

test("helloWorldExample", function() {
	var example = examples.helloWorld();
	equal(output, '');
	ME.runLines(example);
	equal(output, 'Hello world!');
});

// TODO: add this test (e.g. input 2012 and expect it to return 'Your age is: 1').
// test("interactive", function() {
// 	var example = examples.helloWorld();
// 	equal(output, '');
// 	ME.runLines(example);
// 	equal(output, 'Hello world!');
// });

// 'TODO': add tests for the rest of the examples

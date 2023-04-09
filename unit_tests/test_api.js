var ME = new MipsEmulator({debug: false});
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

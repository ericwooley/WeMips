var test_string = "Label: Instruction $s1, $s2, $s3\n\
Label:Instruction $s1, $s2, $s3\n\
Instruction $s1, $s2, $s3\n\
Instruction $s1, 16";
console.log("Input:");
console.log(test_string);
var me = mips_emulator();
me.setCode(test_string);
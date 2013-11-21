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
var me = mips_emulator();
me.setCode(test_string);
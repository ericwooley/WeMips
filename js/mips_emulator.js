var ME = new mips_emulator();

function mips_emulator(){
    ret = {};
    registers = {};

    readwriteRegs = [
        's0', 's1', 's2', 's3', 's4', 's5', 's6', 's7',
        't0', 't1', 't2', 't3', 't4', 't5', 't6', 't7', 't8', 't9',
        'v0', 'v1',
        'a0', 'a1', 'a2', 'a3'
    ];
    readonlyRegs = [
        'zero', 'at',
        'k0', 'k1',
        'gp', 'sp', 'fp', 'ra'
    ];
    ret.allRegNames = readwriteRegs.concat(readonlyRegs);

    // Initialize the register values
    for (var i = 0; i < ret.allRegNames.length; i++) {
        registers[ret.allRegNames[i]] = {
            val: Math.floor((Math.random()*1000)), // Set the initial register data to garbage
            onChange: null
        };
    };
    registers.zero.val = 0;

    // Register getters and setters
    // allows us to verify/modify when someone wants to access the regester
    ret.getRegister = function(reg){
        return registers[reg].val;
    };
    ret.setRegister = function(reg, value){
        // TODO: ensure the register name does not exist in readonlyRegs (or better yet, ensure it exists in the readwriteRegs)
        if(registers[reg].onChange) registers[reg].onChange();
        return registers[reg].val = value;
    };

    // Allows you to set a function that is called when this varaible is changed.
    ret.onChange = function(reg, func){
        registers[reg].onChange = func;
    };

    // Object that will contain analyzed code information
    var mips_code = {
        code:[null], // Initialize with null in the 0 place, to make line numbers line up.
        labels: {}
    };
    // Set the code that is to be run
    ret.setCode = function(mc){
        // Rformat regex (for 3 register ops): (\w*(\w*\d*)):\s*(\w+)(\s*\$\w[\d\w]){3}
        console.log("Analyzing...");
        $.each(mc.split('\n'), function(index, val){
            var line = new mips_line(val);
            console.log(JSON.stringify(line));
            mips_code.code.push(line);
        });
    };
    ret.runLine = function(string) {
        var line = new mips_line(string);
        line.run();
    };

    return ret;
}
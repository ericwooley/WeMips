var ME = new mips_emulator();

function mips_emulator(){
    
    ret = {};
    registers = {};
    // Set the initial register data to garbage
    function register_init(){
        return Math.floor((Math.random()*1000));
    };

    registers.s0 = register_init(); 
    registers.s1 = register_init(); 
    registers.s2 = register_init(); 
    registers.s3 = register_init(); 
    registers.s4 = register_init(); 
    registers.s5 = register_init(); 
    registers.s6 = register_init(); 
    registers.s7 = register_init(); 

    registers.t0 = register_init(); 
    registers.t1 = register_init(); 
    registers.t2 = register_init(); 
    registers.t3 = register_init(); 
    registers.t4 = register_init(); 
    registers.t5 = register_init(); 
    registers.t6 = register_init(); 
    registers.t7 = register_init(); 
    registers.t8 = register_init();
    registers.t9 = register_init(); 

    registers.v0 = register_init(); 
    registers.v1 = register_init(); 

    registers.a0 = register_init(); 
    registers.a1 = register_init();
    registers.a2 = register_init();
    registers.a3 = register_init();

    // Register getters and setters
    // allows us to verify/modify when someone wants to access the regester
    ret.getRegister = function(reg){
        return registers[reg].val;
    };
    ret.setRegister = function(reg, value){
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
    ret.registers = registers;
    ret.runLine = function(string) {
        var line = new mips_line(string);
        line.run();
    };

    return ret;
}
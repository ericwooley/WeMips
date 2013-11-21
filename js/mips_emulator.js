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
        code:[null],
        labels: {}
    };
    // Set the code that is to be run
    ret.setCode = function(mc){
        // Rformat regex (for 3 register ops): (\w*(\w*\d*)):\s*(\w+)(\s*\$\w[\d\w]){3}
        console.log("Analyzing...");
        $.each(mc.split('\n'), function(index, val){
            console.log("--> "+val);
            var regex = /^\s*((\w*(\w*\d*)):)?\s*(\w+)\s+(\$?\w[\w\d]*),?\s*(\$?[\d\w]*),?\s*(\$?[\d\w]*)/;
            var ar = val.match(regex);
            // when matched the array contains the following
            // ----> [0] The instruction
            // ----> [1] The lable with the : included
            // ----> [2] The lable without the :
            // ----> [3] This one is always blank, i think
            // ----> [4] The instruction
            // ----> [5] register 1
            // ----> [6] register 2 or immediate
            // ----> [7] register 3 or blank (blank implies that register 2 should be immediate)
            // if ar is null, that means the regex didn't match
            if(ar){
                // TODO: save each piece of info in this array
                for(var i = 0; i < ar.length; i++){
                    console.log("----> ["+i+"] " + ar[i]);
                }
            } else {
                // TODO: check for special cases, like jump, that don't fit into the standard pattern
                console.log("----> No matches or perhaps a comment");
            }
            mips_code.code.push(val);
        });
    };

    return ret;
}
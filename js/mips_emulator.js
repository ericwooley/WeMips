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
            line = {} // Object that will save information about this line of code.
            console.log("--> "+val);
            var regex = /^\s*(?:(\w+)\s*:\s*)?(?:(\w+)\s+([^#]+))?(?:#\s*(.*))?$/;
            var ar = val.match(regex);
            // when matched the array contains the following
            // ----> [0] The entire line
            // ----> [1] The label without the ':'
            // ----> [2] The instruction (e.g. 'ADD', 'LW', etc.)
            // ----> [3] The arguments (e.g. '$rd, $rs, $rt'), this should be trimmed
            // ----> [4] The comment without the '#', this should be trimmed
            // if ar is null, that means the regex didn't match

            if(ar){
                // if we have a label, save it to the hashtable and save it to line
                if(ar[1] && ar[1].length > 0){
                    line['label'] = ar[1];
                    mips_code.labels[ar[1]] = line;
                }

                // If we got variables back
                if(ar[3]){
                    // Split the args by `,`
                    line['args'] = ar[3].split(',');

                    // Trim the varaibles
                    for(var i = 0; i < line['args'].length; i++){
                       line['args'][i] = $.trim(line['args'][i]);
                    }
                }

                // The instruction for this code;
                line['instruction'] = $.trim(ar[2]);

                // If the line has an instruction, we should not ignore it. otherwise it may be a comment or blank
                if(line['instruction'] && line['instruction'].length > 0) line['ignore'] = false;

                // The comment, obviously
                line['comment'] = $.trim(ar[4]);

            // In the else case, the regex didn't match, possible error?
            } else {
                // TODO: check for special cases
                line['error'] = "Error parsing line: "+ (index+1);
                console.log("----> No matches");
            }

            // Fill in any thing we may have missed with defaults
            _.defaults(line, {args: [], instruction: null, ignore: true, comment: '', label: null, error: null});

            console.log(JSON.stringify(line));
            mips_code.code.push(line);
        });
    };

    return ret;
}
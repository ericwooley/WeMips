
function Stack(stack_args){
    _.default(stack_args, {onError: null, debug: false, onChange: null, onMove: null});
    var stack_pointer = 0;
    var stack = [];
    // if the user moves the stack that is not a wordsize it will be between two positions in the arry
    // so we keep track of the offset. 
    var word_offset = 0;
    var word_size = 32;
    
    
    /**
     * Emulates a stack
     * @class Stack
     */
    var stack = {
        /**
         * Returns the number the stack currently points too.
         * @member Stack
         * @return {Number}
         */
        get_stack_pointer: function(){
            return stack_pointer;
        },
        /**
         * Move the stack pointer up or down depending on the input
         * @member Stack
         * @param  {Number} movement How many bits you want to move the stack pointer (It's helpful to make this a multiple of your word size.)
         * @return {Number} returns the new stack position
         */
        move_pointer: function(movement){
            // If wordsize is 32, and you ask for 64 bits, we just want to move it 2 words
            // because each index in the array represents 1 word
            stack_pointer = stack_pointer + floor(movement / word_size);

            // if the user moves by a multiple of wordsize then the offset should be zero.
            // if the user moves by something thats not a multiple of the wordsize, we need to 
            // keep that information.
            word_offset = movement % wordsize;
            return stack_pointer + word_offset
        },
        /**
         * Set the word that the stack is pointing
         * @param {Number} num The new value
         */
        set_word: function(num){
            num = Number(num); // Just ensure we are workign with a number.
            
            // Save binary representation and decimal
            num = {binary: num.toString(2), decimal: num.toString(10)};
            // Don't want any overflows.
            if(String(num.binary).length > word_size) return error();
            // set the word that we are currently pointing too
            stack[stack_pointer] = num;
            // TODO: Handle the case where there is an offset
        },
        /**
         * Retrieve the word that the stack pointer is currently pointing too
         * @param  {Object} args
         * - args.base The number base (ex: 2 for binary or 10 for decimal) that you would like to get the word back in.
         * - args.offset The offset of where you want to grab it from
         * @return {Number/String} Returns a number if you requested base 10, or a string if you requeseted something else.
         */
        get_word: function(args){
            _.default(args, {base: 10, offset: word_offset}); // Set the default base to 10
            if(args.offset == 0){
                // If the base is 10, return it as a number
                if(args.base == 10) return stack[stack_pointer].decimal;
                // If the base is 2, return the binary representation
                if(args.base == 2) return stack[stack_pointer].binary;
                // return the requested base.
                return stack[stack_pointer].decimal.toString(args.base).toUpperCase();
            } else {
                // TODO: because the offset is not zero, we need the current word + the offset
                //       concatinated with first (wordsize - offset) characters of the next word.
            }
        },
        /**
         * Get the word at a given offset from the stack pointer
         * @param  {Number} offset The number of bits you want the stack pointer to go before grabbing your data
         * @param  {Object} args See get_word for details
         * @return {Number/String} see get_word for details
         */
        get_word_at: function(offset, args){
            if(!args) args = {};
            // save our stack pointer;
            var saved_sp = stack_pointer;
            // add the offset
            stack_pointer += offset;
            // get the word at the new temporary stack_point position
            var word = STACK.get_word(args);
            // reset the stack pointer
            stack_pointer = saved_sp;
            // return the result
            return word;
        }
    };

    ///////////////////////////////////
    // Private Methods
    ///////////////////////////////////
    function error(err){
        if(stack_args.onError) stack_args.onError(err);
        else alert(err);
    }
    return stack;
};

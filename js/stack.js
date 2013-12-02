function StackError(message) {
    this.name = StackError.exceptionName();
    this.message = message;
}
StackError.exceptionName = function() {
    return 'Stack Error';
}
StackError.prototype.toString = function() {
    return '{0}: {1}'.format(StackError.exceptionName(), this.message);
}

function Stack(options) {
    options = options || {};
    _.defaults(options, {
        /**
         * Function to call when the stack changes. (e.g. onChange(indexNumber))
         * @member Stack
         * @type {Function}
         */
        onChange: null,
        /**
         * Function to call when the stack gets new elements. (e.g. onAdd(indexNumber))
         * @member Stack
         * @type {Function}
         */
        onAdd: null,
        baseAddress: Math.floor((Math.random()*999999)) + 10000
    });

    // Private memebers

    var that = this; // see http://javascript.crockford.com/private.html

    // The stack will be implemented as a single array where each
    // element will store a single byte (e.g. a number between 0 and 255).
    var data = [];

    function getByteAtAddress(address) {
        return data[indexForAddress(address)];
    }
    function setByteAtAddress(address, byte) {
        assert(typeof byte === "number");
        assert(0 <= byte && byte <= 255);
        data[indexForAddress(address)] = byte;
        if (options.onChange) options.onChange(address, byte);
    }
    function indexForAddress(address) {
        // get the index into the data array which corresponds to a specific address
        assert(typeof address == "number");
        var minValidAddress = 0;
        var maxValidAddress = that.pointerToBottomOfStack() - 1;
        if (address < minValidAddress || maxValidAddress < address) {
            throw new StackError('Invalid stack address ({0}). Valid stack addresses are between {1} and {2}.'.format(address, minValidAddress, maxValidAddress));
        }

        // Conversion to index:
        // 1. Assume a base address of 100.
        // 2. The first accessible address is 99, which will be stored in 0.
        // 3. The next accessible address is 98, which will be stored in 1.
        var index = (options.baseAddress - 1) - address;

        // ensure this index is accessible
        var numElementsToAdd = index - data.length + 1;
        for (var i = 0; i < numElementsToAdd; i++) {
            var randomNumFrom0to255 = Math.floor((Math.random()*256));
            data.push(randomNumFrom0to255);
            if (options.onAdd) options.onAdd(data.length - 1);
        }
        return index;
    }

    // Public variables

    this.MIN_BYTE_VALUE = 0;
    this.MAX_BYTE_VALUE = 255;
    this.BITS_PER_BYTE = 8;
    this.BYTES_PER_BYTE = 1;
    this.BYTES_PER_HALFWORD = 2;
    this.BYTES_PER_WORD = 4;

    // Privileged methods

    this.getDataAtAddress = function (address, byteCount, asUnsigned) {
        asUnsigned = asUnsigned || false;
        var result = 0;
        for (var i = 0; i < byteCount; i++) {
            var value = getByteAtAddress(address + i);
            assert(this.MIN_BYTE_VALUE <= value && value <= this.MAX_BYTE_VALUE);
            result = result << this.BITS_PER_BYTE;
            result += value;
        };
        if (asUnsigned) {
            return result;
        } else {
            return MIPS.unsignedNumberToSignedNumber(result, byteCount * this.BITS_PER_BYTE);
        }
    };
    this.setDataAtAddress = function(address, byteCount, data) {
        assert(typeof data === "number", "Only numbers supported for now.");
        if (data < 0) {
            try {
                data = MIPS.signedNumberToUnsignedNumber(data, byteCount * this.BITS_PER_BYTE);
            } catch (e) {
                if (e instanceof MipsError) {
                    throw new StackError(e.message);
                } else {
                    throw e;
                }
            }
        }
        var minValidValue = 0;
        var maxValidValue = (Math.pow(256, byteCount) - 1);
        if (data < minValidValue || maxValidValue < data) {
            throw new StackError('Unable to store out-of-range value ({0}). Valid values are {1} through {2}.'.format(data, minValidValue, maxValidValue));
        };
        for (var i = byteCount - 1; i >= 0; i--) {
            var rightMostByte = data & this.MAX_BYTE_VALUE;
            setByteAtAddress(address + i, rightMostByte);
            data = data >> this.BITS_PER_BYTE;
        };
    };
    this.reset = function() {
        data = [];
    };
    this.pointerToBottomOfStack = function () {
        // the initial value of the stack pointer. before you read or write to it, you must decrement the stack pointer.
        return options.baseAddress;
    };
}

// Public functions

Stack.prototype.getByte = function (pointer) {
    return this.getDataAtAddress(pointer, this.BYTES_PER_BYTE);
};

Stack.prototype.getUnsignedByte = function (pointer) {
    return this.getDataAtAddress(pointer, this.BYTES_PER_BYTE, true);
};

Stack.prototype.getHalfword = function (pointer) {
    return this.getDataAtAddress(pointer, this.BYTES_PER_HALFWORD);
};

Stack.prototype.getUnsignedHalfword = function (pointer) {
    return this.getDataAtAddress(pointer, this.BYTES_PER_HALFWORD, true);
};

Stack.prototype.getWord = function (pointer) {
    return this.getDataAtAddress(pointer, this.BYTES_PER_WORD);
};

Stack.prototype.getUnsignedWord = function (pointer) {
    return this.getDataAtAddress(pointer, this.BYTES_PER_WORD, true);
};

Stack.prototype.setByte = function (pointer, data) {
    this.setDataAtAddress(pointer, this.BYTES_PER_BYTE, data);
};

Stack.prototype.setHalfword = function (pointer, data) {
    this.setDataAtAddress(pointer, this.BYTES_PER_HALFWORD, data);
};

Stack.prototype.setWord = function (pointer, data) {
    this.setDataAtAddress(pointer, this.BYTES_PER_WORD, data);
};

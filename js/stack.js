function Stack(options) {
    options = options || {};
    _.defaults(options, {
        /**
         * Method to call on error, should accept 1 string argument, which contains the error
         * @member Stack
         * @type {Function}
         */
        onError: null, // TODO: use this somewhere?
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
        onAdd: null
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
        if (options.onChange) options.onChange(address);
    }
    function indexForAddress(address) {
        // get the index into the data array which corresponds to a specific address
        assert(typeof address == "number");
        assert(address < that.pointerToBottomOfStack(), "We are never allowed to access an address above the initial stack address.");

        var index = -address; // e.g. -1 is stored at address 1

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

    this.BYTES_PER_BYTE = 1;
    this.BYTES_PER_HALFWORD = 2;
    this.BYTES_PER_WORD = 4;

    // Privileged methods

    this.getDataAtAddress = function (address, byteCount) {
        var result = 0;
        for (var i = 0; i < byteCount; i++) {
            var value = getByteAtAddress(address + i);
            assert(0 <= value && value <= 255);
            result = result << 8;
            result += value;
        };
        return result;
    };
    this.setDataAtAddress = function(address, byteCount, data) {
        assert(typeof data === "number", "Only number supported for now.");
        assert(0 <= data && data <= (Math.pow(256, byteCount) - 1));
        for (var i = byteCount - 1; i >= 0; i--) {
            var rightMostByte = data & 255;
            setByteAtAddress(address + i, rightMostByte);
            data = data >> 8;
        };
    };
}

// Public functions

Stack.prototype.getByte = function (pointer) {
    return this.getDataAtAddress(pointer, this.BYTES_PER_BYTE);
};

Stack.prototype.getHalfword = function (pointer) {
    return this.getDataAtAddress(pointer, this.BYTES_PER_HALFWORD);
};

Stack.prototype.setByte = function (pointer, data) {
    this.setDataAtAddress(pointer, this.BYTES_PER_BYTE, data);
};

Stack.prototype.setHalfword = function (pointer, data) {
    this.setDataAtAddress(pointer, this.BYTES_PER_HALFWORD, data);
};

Stack.prototype.pointerToBottomOfStack = function () {
    // the initial value of the stack. before you read or write to it, you must decrement the stack pointer.
    return 1;
};

// Public Helper functions

Stack.stringToNumber = function (string) {
    assert(typeof string === "string");
    var number = 0;
    for (var i = 0; i < string.length; i++) {
        number = number << 8;
        number += string.charCodeAt(i);
    };
    return number;
};

Stack.numberToString = function (number) {
    assert(typeof number === "number");
    var string = '';
    while (0 < number) {
        string = String.fromCharCode(number & 255) + string;
        number = number >> 8;
    }
    return string;
};


// TODO: move this elsewhere
function assert(condition, message) {
    if (!condition) {
        throw message || "Assertion failed";
    }
}
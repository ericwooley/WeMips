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
        if (options.onChange) options.onChange(address);
    }
    function indexForAddress(address) {
        // get the index into the data array which corresponds to a specific address
        assert(typeof address == "number");
        assert(0 <= address && address < that.pointerToBottomOfStack(), "We are never allowed to access an address above the initial stack address.");

        // Conversion to index:
        // 1. Assume a base address of 100.
        // 2. The first accessible address is 99, which will be stored in 0.
        // 3. The next accessible address is 98, which will be stored in 1.
        var index = (that.baseAddress - 1) - address;

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

    this.baseAddress = options.baseAddress;
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
            return Stack.unsignedNumberToSignedNumber(result, byteCount * this.BITS_PER_BYTE);
        }
    };
    this.setDataAtAddress = function(address, byteCount, data) {
        assert(typeof data === "number", "Only numbers supported for now.");
        if (data < 0) {
            data = Stack.signedNumberToUnsignedNumber(data, byteCount * this.BITS_PER_BYTE);
        }
        assert(0 <= data && data <= (Math.pow(256, byteCount) - 1), "Out of range.");
        for (var i = byteCount - 1; i >= 0; i--) {
            var rightMostByte = data & this.MAX_BYTE_VALUE;
            setByteAtAddress(address + i, rightMostByte);
            data = data >> this.BITS_PER_BYTE;
        };
    };
    this.reset = function() {
        data = [];
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

Stack.prototype.pointerToBottomOfStack = function () {
    // the initial value of the stack. before you read or write to it, you must decrement the stack pointer.
    return this.baseAddress;
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

Stack.numberToBinaryString = function (number, bits/*=32*/) {
    // returns a binary representation of a string.
    assert(typeof number === "number");

    bits = bits || 32;
    assert(typeof bits === "number");

    if (number < 0) {
        // convert to the corresponding unsigned number (e.g. when we are using single bytes, then -2 would correspond to 254, since the two are represented the same in binary)
        number = Math.pow(2, bits) + number;
    }

    var result = number.toString(2);
    var zeroPadding = (new Array(bits - result.length + 1)).join('0');
    return zeroPadding + result;
}

Stack.binaryStringToNumber = function (binaryString) {
    assert(typeof binaryString == "string");

    var unsignedNumber = Stack.binaryStringToUnsignedNumber(binaryString);
    if (binaryString[0] === "0") {
        // this is a positive number
        return unsignedNumber;
    }

    assert(binaryString[0] === "1", "This should be a negative number.");
    return Stack.unsignedNumberToSignedNumber(unsignedNumber, binaryString.length); // unsignedNumber - Math.pow(2, binaryString.length);
}

Stack.binaryStringToUnsignedNumber = function (binaryString) {
    assert(typeof binaryString == "string");
    return parseInt(binaryString, 2);
}

Stack.unsignedNumberToSignedNumber = function (number, bits/*=32*/) {
    assert(typeof number === "number");
    bits = bits || 32;
    assert(typeof bits === "number");
    assert(0 <= number && number < Math.pow(2, bits), "Out of range.");
    if (number < Math.pow(2, bits - 1)) {
        // e.g. f(3, 8) -> 3, since 0000 0011 in signed and unsigned is always 3
        return number;
    };

    // e.g. f(255, 8) -> -1, since -1 and 255 (1111 1111) represent the same value in binary
    // e.g. f(254, 8) -> -2, since they represent the same number in binary (1111 1110)
    return number - Math.pow(2, bits);
}


Stack.signedNumberToUnsignedNumber = function (number, bits/*=32*/) {
    // e.g. f(-128, 8) -> 128 (1000 0000)
    // e.g. f(-1, 8) -> 255   (1111 1111)
    // e.g. f(-2, 8) -> 254   (1111 1110)
    // e.g. f(127, 8) -> 127  (0111 1111)
    // e.g. f(255, 8) -> 255  (1111 1111)
    // e.g. f(3, 8) -> 3      (0000 0011)
    assert(typeof number === "number");
    bits = bits || 32;
    assert(typeof bits === "number");
    assert(-Math.pow(2, bits-1) <= number && number < Math.pow(2, bits), "Out of range.");

    if (0 <= number) {
        return number;
    }

    // negative number
    return number + Math.pow(2, bits);
}

// TODO: move this elsewhere
function assert(condition, message) {
    if (!condition) {
        throw message || "Assertion failed";
    }
}
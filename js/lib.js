function MipsError(message) {
    this.name = 'MipsError';
    this.message = message;
}

// from http://stackoverflow.com/questions/979975/how-to-get-the-value-from-url-parameter
// Could be improved on.
function getURLParameters()
{
    var sURL = window.document.URL.toString();
    var params = {};
    if (sURL.indexOf("?") > 0)
    {
        var arrParams = sURL.split("?");
        var arrURLParams = arrParams[1].split("&");
        for (var i=0;i<arrURLParams.length;i++)
        {
            var sParam =  arrURLParams[i].split("=");
            if (sParam[1] != "")
                params[sParam[0]] = unescape(sParam[1]);
            else
                params[sParam[0]] = null;
        }
    }
    params['baseURL'] = sURL.split('?')[0];
    return params;

}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message) || new Error("Assertion failed");
    }
}

String.prototype.format = function() {
    // 'Added {0} by {1} to your collection'.format(title, artist)
    // http://stackoverflow.com/a/2648463
    var s = this,
        i = arguments.length;

    while (i--) {
        s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), arguments[i]);
    }
    return s;
};

// Public Helper functions

var MIPS = {};

MIPS.stringToNumber = function (string) {
    assert(typeof string === "string");
    var number = 0;
    for (var i = 0; i < string.length; i++) {
        number = number << 8;
        number += string.charCodeAt(i);
    };
    return number;
};

MIPS.numberToString = function (number, returnNullOnZero) {
    assert(typeof number === "number");
    returnNullOnZero = typeof returnNullOnZero === 'undefined' ? false : returnNullOnZero;
    assert(typeof returnNullOnZero === 'boolean');

    if (returnNullOnZero && number === 0) {
        return '\0';
    }

    var string = '';
    while (0 < number) {
        string = String.fromCharCode(number & 255) + string;
        number = number >> 8;
    }
    return string;
};

MIPS.numberToBinaryString = function (number, bits/*=32*/, blockSize) {
    // returns a binary representation of a string.
    assert(typeof number === "number");

    bits = bits || 32;
    assert(typeof bits === "number");
    blockSizeDefined = typeof blockSize !== undefined;

    if (number < 0) {
        // convert to the corresponding unsigned number (e.g. when we are using single bytes, then -2 would correspond to 254, since the two are represented the same in binary)
        number = Math.pow(2, bits) + number;
    }

    var result = number.toString(2);
    var zeroPadding = (new Array(bits - result.length + 1)).join('0');
    result = zeroPadding + result;

    if (blockSizeDefined) {
        var resultWithSpaces = '';
        for (var i = 0; i < result.length; i++) {
            resultWithSpaces += result[i];
            if (((i+1) % blockSize === 0) && ((i+1) !== result.length)) {
                resultWithSpaces += ' ';
            }
        }
        result = resultWithSpaces;
    }

    return result;
};

MIPS.binaryStringToNumber = function (binaryString) {
    assert(typeof binaryString == "string");
    binaryString = binaryString.replace(/\s+/g, '');

    var unsignedNumber = MIPS.binaryStringToUnsignedNumber(binaryString);
    if (binaryString[0] === "0") {
        // this is a positive number
        return unsignedNumber;
    }

    assert(binaryString[0] === "1", "This should be a negative number.");
    return MIPS.unsignedNumberToSignedNumber(unsignedNumber, binaryString.length); // unsignedNumber - Math.pow(2, binaryString.length);
};

MIPS.binaryStringToUnsignedNumber = function (binaryString) {
    assert(typeof binaryString == "string");
    binaryString = binaryString.replace(/\s+/g, '');
    return parseInt(binaryString, 2);
};

MIPS.unsignedNumberToSignedNumber = function (number, bits/*=32*/) {
    assert(typeof number === "number");
    bits = bits || 32;
    assert(typeof bits === "number");

    var minValidValue = MIPS.minSignedValue(bits);
    var maxValidValue = MIPS.maxUnsignedValue(bits);
    if (number < minValidValue || maxValidValue < number) {
        throw new MipsError("Out of range value ({0}) for conversion of unsigned to signed number. The value must be between {1} and {2}.".format(number, minValidValue, maxValidValue));
    };

    if (number < Math.pow(2, bits - 1)) {
        // e.g. f(3, 8) -> 3, since 0000 0011 in signed and unsigned is always 3
        return number;
    };

    // e.g. f(255, 8) -> -1, since -1 and 255 (1111 1111) represent the same value in binary
    // e.g. f(254, 8) -> -2, since they represent the same number in binary (1111 1110)
    return number - Math.pow(2, bits);
};

MIPS.signedNumberToUnsignedNumber = function (number, bits/*=32*/) {
    // e.g. f(-128, 8) -> 128 (1000 0000)
    // e.g. f(-1, 8) -> 255   (1111 1111)
    // e.g. f(-2, 8) -> 254   (1111 1110)
    // e.g. f(127, 8) -> 127  (0111 1111)
    // e.g. f(255, 8) -> 255  (1111 1111)
    // e.g. f(3, 8) -> 3      (0000 0011)
    assert(typeof number === "number");
    bits = bits || 32;
    assert(typeof bits === "number");
    var minValidValue = MIPS.minSignedValue(bits);
    var maxValidValue = MIPS.maxUnsignedValue(bits);
    if (number < minValidValue || maxValidValue < number) {
        throw new MipsError("Out of range value ({0}) for conversion of signed to unsigned number. The value must be between {1} and {2}.".format(number, minValidValue, maxValidValue));
    };

    if (0 <= number) {
        // already an unsigned number
        return number;
    }

    // negative number
    return number + Math.pow(2, bits);
};

MIPS.minSignedValue = function(bits) {
    return -Math.pow(2, bits-1);
};
MIPS.minUnsignedValue = function(bits) {
    return 0;
};
MIPS.maxSignedValue = function(bits) {
    return Math.pow(2, bits-1) - 1;
};
MIPS.maxUnsignedValue = function(bits) {
    return Math.pow(2, bits) - 1;
};

MIPS.signedAddition = function(value1, value2, bits) {
    var result = value1 + value2;
    var overflowFlag = false;
    var carryFlag = false;
    if (result < MIPS.minSignedValue(bits)) {
        // e.g. -128 - 1 would cause underflow
        overflowFlag = true;
        // -128 (1000 0000)
        // -129 (0111 1111) should become 127
        // -130 (0111 1110) should become 126

        // e.g. -128 + -300 = -428
        result = MIPS.minSignedValue(bits) - result; // e.g. convert -428 to 300
        result = result % (MIPS.maxSignedValue(bits) + 1); // e.g. convert 300 to 44
        if (result === 0)
            result = MIPS.minSignedValue(bits);
        else
            result = MIPS.maxSignedValue(bits) - (result - 1); // e.g. convert 44 to 128 - 44 = 84
    } else if (MIPS.maxSignedValue(bits) < result) {
        overflowFlag = true;

        // e.g. 127 + 1 would cause overflow
        // e.g. 127 + 300
        result = result + (-MIPS.minSignedValue(bits)); // e.g. convert 427 to 555
        result = result % (MIPS.maxUnsignedValue(bits) + 1); // e.g. convert 555 to 43
        result = result + MIPS.minSignedValue(bits); // e.g. convert 43 to -85
    }

    return {
        result: result,
        overflowFlag: overflowFlag,
        carryFlag: carryFlag
    };
};

MIPS.unsignedAddition = function(value1, value2, bits) {
    var result = value1 + value2;
    var overflowFlag = false;
    var carryFlag = false;
    if (result < MIPS.minUnsignedValue(bits)) {
        // e.g. 0 - 1, this would caues underflow
        carryFlag = true;

        result = MIPS.minUnsignedValue(bits) - result;
        result = result % (MIPS.maxUnsignedValue(bits) + 1);
        if (result === 0)
            result = MIPS.minUnsignedValue(bits);
        else
            result = MIPS.maxUnsignedValue(bits) - (result - 1);
    } else if (MIPS.maxUnsignedValue(bits) < result) {
        carryFlag = true;

        result = result % (MIPS.maxUnsignedValue(bits) + 1);
    }

    return {
        result: result,
        overflowFlag: overflowFlag,
        carryFlag: carryFlag
    };
};

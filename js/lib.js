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
    return params;

}

function assert(condition, message) {
    if (!condition) {
        throw message || "Assertion failed";
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

MIPS.numberToString = function (number) {
    assert(typeof number === "number");
    var string = '';
    while (0 < number) {
        string = String.fromCharCode(number & 255) + string;
        number = number >> 8;
    }
    return string;
};

MIPS.numberToBinaryString = function (number, bits/*=32*/) {
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

MIPS.binaryStringToNumber = function (binaryString) {
    assert(typeof binaryString == "string");

    var unsignedNumber = MIPS.binaryStringToUnsignedNumber(binaryString);
    if (binaryString[0] === "0") {
        // this is a positive number
        return unsignedNumber;
    }

    assert(binaryString[0] === "1", "This should be a negative number.");
    return MIPS.unsignedNumberToSignedNumber(unsignedNumber, binaryString.length); // unsignedNumber - Math.pow(2, binaryString.length);
}

MIPS.binaryStringToUnsignedNumber = function (binaryString) {
    assert(typeof binaryString == "string");
    return parseInt(binaryString, 2);
}

MIPS.unsignedNumberToSignedNumber = function (number, bits/*=32*/) {
    assert(typeof number === "number");
    bits = bits || 32;
    assert(typeof bits === "number");

    var minValidValue = -Math.pow(2, bits-1);
    var maxValidValue = Math.pow(2, bits) - 1;
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
}

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
    var minValidValue = -Math.pow(2, bits-1);
    var maxValidValue = Math.pow(2, bits) - 1;
    if (number < minValidValue || maxValidValue < number) {
        throw new MipsError("Out of range value ({0}) for conversion of signed to unsigned number. The value must be between {1} and {2}.".format(number, minValidValue, maxValidValue));
    };

    if (0 <= number) {
        // already an unsigned number
        return number;
    }

    // negative number
    return number + Math.pow(2, bits);
}
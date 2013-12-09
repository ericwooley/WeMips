function SyscallError(message) {
	this.name = 'SyscallError';
	this.message = message;
}

function mipsSyscalls(ME) {
	function getInputStringAndSaveToStack(message, maxCharCount, stackSaveAddress, status) {
		// Note: maxCharCount referst to actual character count, so 'cat' is 3, not 4.

		var input = ME.getInput(message);
		if (maxCharCount < input.length) {
			input = input.substring(0, maxCharCount); // ignore strings that are too long
			if (status)
				status.tooLong = true;
		}

		for (var i = 0; i <= maxCharCount; i++) {
			// null terminate the rest of the addresses
			var byte = (i < input.length) ? input.charCodeAt(i) : 0;
			ME.stack.setByte(stackSaveAddress + i, byte);
		}

		return input;
	}

	var MSYS = {
		execute: function() {
			var $v0Value = ME.getRegisterVal('$v0');
			var syscallMethod = syscalls[$v0Value];
			if (typeof syscallMethod === 'undefined') {
				throw new SyscallError("No valid syscall for $v0's value of {0}.".format($v0Value));
			}

			syscallMethod.execute();
		},
		getStringAtAddress: function(address, length) {
			assert(typeof address === 'number');
			length = (typeof length === 'undefined') ? -1 : length;

			// when length is -1, then stop once you reach a null byte
			var stopOnceNullReached = length === -1;
			var stopOnceLengthReached = !stopOnceNullReached;

			var string = '';
			while (true) {
				if (stopOnceLengthReached && string.length === length) {
					break;
				}

				var byte =  ME.stack.getByte(address);
				if (stopOnceNullReached && byte === 0) {
					break;
				}
				var char = MIPS.numberToString(byte, true);
				string += char;
				address++;
			}
			return string;
		}
	};

	var syscalls = { // key is the $v0 op code
		'1': {
			description: 'Print Integer',
			execute: function() {
				var integer = ME.getRegisterVal('$a0');
				ME.output(integer);
			}
		},
		'4': {
			description: 'Print String',
			execute: function() {
				var stackPointer = ME.getRegisterUnsignedVal('$a0');
				var string = MSYS.getStringAtAddress(stackPointer);
				ME.output(string);
			}
		},
		'5': {
			description: 'Read Integer',
			execute: function() {
				var minValue = MIPS.minSignedValue(ME.BITS_PER_REGISTER);
				var maxValue = MIPS.maxUnsignedValue(ME.BITS_PER_REGISTER);
				var input = ME.getInput('Enter a number from {0} to {1}'.format(minValue, maxValue));
				var number = parseInt(input, 10);
				if (number < minValue || maxValue < number) {
					throw new SyscallError('Invalid input number: {0}'.format(number));
				}
				ME.setRegisterVal('$v0', number);
			}
		},
		'8': {
			description: 'Read String',
			execute: function() {
				var addressOfInputBuffer = ME.getRegisterUnsignedVal('$a0');
				var maxCharCount = ME.getRegisterUnsignedVal('$a1') - 1;

				var input = getInputStringAndSaveToStack('Enter a string (max length is {0} char(s))'.format(maxCharCount), maxCharCount, addressOfInputBuffer);

				ME.setRegisterVal('$v0', input.length);
			}
		},
		'50': {
			description: 'Confirm dialog',
			execute: function() {
				var stackPointer = ME.getRegisterUnsignedVal('$a0');
				var message = MSYS.getStringAtAddress(stackPointer);

				var result = ME.mipsConfirm(message);
				ME.setRegisterVal('$a0', result ? 0 : 1);
			}
		},
		'51': {
			description: 'Input dialog int',
			execute: function() {
				var stackPointer = ME.getRegisterUnsignedVal('$a0');
				var message = MSYS.getStringAtAddress(stackPointer);

				var minValue = MIPS.minSignedValue(ME.BITS_PER_REGISTER);
				var maxValue = MIPS.maxUnsignedValue(ME.BITS_PER_REGISTER);


				var result = ME.getInput(message);
				var number = parseInt(result, 10);
				var unableToParse = isNaN(number);
				var status;

				if (result === null) {
					// cancel was chosen
					status = -2;
				} else if (result === '') {
					// OK was chosen, but no data was input into the field
					status = -3;
				} else if (unableToParse) {
					// input data cannot be correctly parsed
					status = -1;
				} else if (number < minValue || maxValue < number) {
					status = -1;
					// TODO: output that the value was out of range?
				} else {
					// valid input
					status = 0;
					ME.setRegisterVal('$a0', number);
				}
				ME.setRegisterVal('$a1', status);
			}
		},
		'54': {
			description: 'Input dialog string',
			execute: function() {
				var stackPointer = ME.getRegisterUnsignedVal('$a0');
				var message = MSYS.getStringAtAddress(stackPointer);

				var addressOfInputBuffer = ME.getRegisterUnsignedVal('$a1');
				var maxCharCount = ME.getRegisterUnsignedVal('$a2') - 1;

				var inputStatus = { tooLong: false };
				var result = getInputStringAndSaveToStack(message, maxCharCount, addressOfInputBuffer, inputStatus);
				var status;

				// TODO: for -2 and -3, it isn't supposed to change the input buffer
				if (result === null) {
					// cancel was chosen
					status = -2;
				} else if (result === '') {
					// OK was chosen, but no data was input into the field
					status = -3;
				} else if (inputStatus.tooLong) {
					// length of the input string exceeded the specified maximum.
					status = -4;
				} else {
					// valid input
					status = 0;
				}
				ME.setRegisterVal('$a1', status);
			}
		},
		'55': {
			description: 'Alert',
			execute: function() {
				var stackPointer = ME.getRegisterUnsignedVal('$a0');
				var string = MSYS.getStringAtAddress(stackPointer);
				ME.mipsAlert(string);
			}
		},
		'56': {
			description: 'Alert int',
			execute: function() {
				var stackPointer = ME.getRegisterUnsignedVal('$a0');
				var string = MSYS.getStringAtAddress(stackPointer);
				var number = ME.getRegisterUnsignedVal('$a1');
				ME.alert(string + number);
			}
		},
		'59': {
			description: 'Alert string',
			execute: function() {
				var stackPointer = ME.getRegisterUnsignedVal('$a0');
				var string1 = MSYS.getStringAtAddress(stackPointer);
				stackPointer = ME.getRegisterUnsignedVal('$a1');
				var string2 = MSYS.getStringAtAddress(stackPointer);

				ME.alert(string1 + string2);
			}
		},
		'60': {
			description: 'Generate save string in stack code',
			execute: function() {
				var stackPointer = ME.getRegisterUnsignedVal('$a0');
				var string = MSYS.getStringAtAddress(stackPointer);
				var result = '';
				var STACK_POINTER_REG = '$t8';
				var CHAR_TEMP_REG = '$t9';

				result += "# Store '" + string + "' at the top of the stack\n";
				result += "addiu $sp, $sp, -" + (string.length + 1) + "\n";

				for (var i = 0; i < string.length; i++) {
					var char = string[i];
					var charCode = string.charCodeAt(i);
					result += "addi " + CHAR_TEMP_REG + ", $zero, " + charCode + " # '" + char + "'\n";
					result += "sb " + CHAR_TEMP_REG +", " + i + "($sp)\n";
					//result += "addi " + STACK_POINTER_REG + ", " + STACK_POINTER_REG + ", 1\n";
				};
				result += "sb $zero, " + string.length + "($sp) # '\\0' \n";
				ME.output(result);
			}
		},
		'61': {
			description: 'Binary -> Decimal',
			execute: function() {
				var stackPointer = ME.getRegisterUnsignedVal('$a0');
				var string = MSYS.getStringAtAddress(stackPointer);

				var signedValue = MIPS.binaryStringToNumber(string);
				var unsignedValue = MIPS.binaryStringToUnsignedNumber(string);

				var result;
				if (signedValue !== unsignedValue) {
					result = '{0} in decimal is {1} or {2}.'.format(string, signedValue, unsignedValue);
				} else {
					result = '{0} in decimal is {1}.'.format(string, signedValue);
				}

				ME.output(result);
			}
		},
		'62': {
			description: 'Decimal -> Binary',
			execute: function() {
				var signedNumber = ME.getRegisterVal('$a0');
				var charCount = ME.getRegisterVal('$a1');

				var unsignedNumber = MIPS.signedNumberToUnsignedNumber(signedNumber, charCount);
				var binaryString = MIPS.numberToBinaryString(signedNumber, charCount);

				var result;
				if (signedNumber !== unsignedNumber) {
					result = '{0} (or {1}) in binary is {2}.'.format(signedNumber, unsignedNumber, binaryString);
				} else {
					result = '{0} in binary is {1}.'.format(signedNumber, binaryString);
				}

				ME.output(result);
			}
		}
	};

	return MSYS;
}
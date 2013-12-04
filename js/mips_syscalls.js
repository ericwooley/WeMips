function SyscallError(message) {
	this.name = 'SyscallError';
	this.message = message;
}

function mipsSyscalls(ME) {
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

				var input = ME.getInput('Enter a string (max length is {0} char(s))'.format(maxCharCount));
				if (maxCharCount < input.length)
					input = input.substring(0, maxCharCount); // ignore strings that are too long

				for (var i = 0; i <= maxCharCount; i++) {
					// null terminate the rest of the addresses
					var byte = (i < input.length) ? input.charCodeAt(i) : 0;
					ME.stack.setByte(addressOfInputBuffer + i, byte);
				}
				ME.setRegisterVal('$v0', input.length);
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
				result += "addi $sp, $sp, -" + (string.length + 1) + "\n";

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
		}
	};

	return MSYS;
}
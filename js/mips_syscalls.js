function SyscallError(message) {
	this.name = 'SyscallError';
	this.message = message;
}

function mipsSyscalls(ME) {
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
				var string = '';
				while (true) {
					var byte =  ME.stack.getByte(stackPointer);
					if (byte === 0) {
						break;
					}
					var char = MIPS.numberToString(byte);
					string += char;
					stackPointer++;
				}
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
					input.substring(0, maxCharCount); // ignore strings that are too long

				for (var i = 0; i <= maxCharCount; i++) {
					// null terminate the rest of the addresses
					var byte = (i < input.length) ? input.charCodeAt(i) : 0;
					ME.stack.setByte(addressOfInputBuffer + i, byte);
				}
			}
		}
	};

	return {
		execute: function() {
			var $v0Value = ME.getRegisterVal('$v0');
			var syscallMethod = syscalls[$v0Value];
			if (typeof syscallMethod === 'undefined') {
				throw new SyscallError("No valid syscall for $v0's value of {0}.".format($v0Value));
			}

			syscallMethod.execute();
		}
	};
}
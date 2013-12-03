function SyscallError(message) {
	this.name = 'SyscallError';
	this.message = message;
}

function mipsSyscalls(ME) {
	var syscalls = { // key is the $v0 op code
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
				ME.log(string);
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
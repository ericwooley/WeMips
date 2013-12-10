<body class="c25"><p class="c1"><span>Eric Wooley, Ortal Yahdav</span></p><p class="c5 c1"><span></span></p><p class="c1 title"><a name="h.35wewdid5fia"></a><span>WeMIPS Documentation (MIPS Emulator)</span></p><p class="c5 c1"><span></span></p><p class="c21 c1"><span class="c2"><a class="c7" href="#h.rsu9q4vkwm40">Installation Guide</a></span></p><p class="c21 c1"><span class="c2"><a class="c7" href="#h.ye4dhod52eub">Available MIPS Instructions</a></span></p><p class="c21 c1"><span class="c2"><a class="c7" href="#h.muilw39vqa42">Available MIPS Syscalls</a></span></p><p class="c1 c21"><span class="c2"><a class="c7" href="#h.mjw4rmie1hrl">User&#39;s Guide</a></span></p><p class="c4 c1"><span class="c2"><a class="c7" href="#h.nkpo0qdlt6pk">Running A Program</a></span></p><p class="c4 c1"><span class="c2"><a class="c7" href="#h.pepcyf380cso">Features</a></span></p><p class="c1 c17"><span class="c2"><a class="c7" href="#h.tehglim0uo52">Go to line number</a></span></p><p class="c1 c17"><span class="c2"><a class="c7" href="#h.pgz50cglii7">Demos</a></span></p><p class="c1 c17"><span class="c2"><a class="c7" href="#h.yw97n2lkwbjo">Auto switch register/stack/log tabs</a></span></p><p class="c1 c17"><span class="c2"><a class="c7" href="#h.q5hqvyasmyap">Show stack byte as number/ascii/binary</a></span></p><p class="c1 c17"><span class="c2"><a class="c7" href="#h.vhp6uhppx4mw">View registers</a></span></p><p class="c1 c17"><span class="c2"><a class="c7" href="#h.g6wc8q5eu06m">Modify register value</a></span></p><p class="c21 c1"><span class="c2"><a class="c7" href="#h.9v5m8l9m4seh">Other Notes</a></span></p><p class="c4 c1"><span class="c2"><a class="c7" href="#h.6uqxvrqa4n42">Stack</a></span></p><p class="c5 c1"><span></span></p><h1 class="c1"><a name="h.rsu9q4vkwm40"></a><span>Installation Guide</span></h1><ol class="c9 lst-kix_5l16laijtj3y-0 start" start="1"><li><a href="http://wemips.herokuapp.com" target="_blank">View Online</a> or continue to step 2</li><li class="c4 c20 c1"><span>Clone WeMips somewhere on your computer.</span></li><li class="c4 c20 c1"><span>Drag and drop the top-most </span><span class="c16">Wemips.html</span><span>&nbsp;file onto Google Chrome.</span></li><li class="c4 c20 c1"><span>You can now use WeMIPS!</span></li></ol><h1 class="c1"><a name="h.ye4dhod52eub"></a><span>Available MIPS Instructions</span></h1><p class="c1"><span>Mips Arithmetic Instructions</span></p><ul class="c9 lst-kix_fx3vk7hj0nsy-0 start"><li class="c4 c20 c1"><span>ADD, ADDI, ADDU, ADDIU, </span><span class="c15">SUB</span><span>, SUBU, LUI.</span></li></ul><p class="c5 c1"><span></span></p><p class="c1"><span>Mips Logical Instructions</span></p><ul class="c9 lst-kix_r5nf5veonwz6-0 start"><li class="c4 c20 c1"><span>AND, ANDI, </span><span class="c15">NOR</span><span>, </span><span class="c15">OR</span><span>, </span><span class="c15">ORI</span><span>, SLL, </span><span class="c15">SRL</span><span>.</span></li></ul><p class="c5 c1"><span></span></p><p class="c1"><span>Mips Branch and Jump Instructions</span></p><ul class="c9 lst-kix_1wmw3o7kw8o4-0 start"><li class="c4 c20 c1"><span>BEQ, BNE, J, </span><span class="c15">JAL</span><span>, </span><span class="c15">JR</span><span>.</span></li></ul><p class="c5 c1"><span></span></p><p class="c1"><span>Mips Memory Access Instructions</span></p><ul class="c9 lst-kix_qs234h2t1tqy-0 start"><li class="c4 c1 c20"><span class="c15">LW, SW, LH, LHU, </span><span>SH, LB, LBU, SB.</span></li></ul><p class="c5 c1"><span></span></p><p class="c1"><span>Mips Comparison Instructions</span></p><ul class="c9 lst-kix_9td3mcttkhhs-0 start"><li class="c4 c20 c1"><span class="c15">SLT, SLTI, SLTU, SLTIU</span><span>.</span></li></ul><p class="c5 c1"><span></span></p><p class="c1"><span class="c16">Note:</span><span>&nbsp;Instructions marked in </span><span class="c15">red are experimental</span><span>. These instructions should work, but haven&#39;t been thoroughly tested,</span></p><h1 class="c1"><a name="h.muilw39vqa42"></a><span>Available MIPS Syscalls</span></h1><p class="c1"><span>The syscalls supported are similar to the ones which the MARS emulator uses: </span><span class="c2"><a class="c7" href="http://courses.missouristate.edu/kenvollmar/mars/help/syscallhelp.html">http://courses.missouristate.edu/kenvollmar/mars/help/syscallhelp.html</a></span></p><p class="c5 c1"><span></span></p><a href="#" name="6487d72a959a28d9564e83e2f61db5b7d83aefa0"></a><a href="#" name="0"></a><table cellpadding="0" cellspacing="0" class="c24"><tbody><tr><td class="c6"><p class="c1 c13 c14"><span class="c16">Description</span></p></td><td class="c10"><p class="c14 c1 c13"><span class="c16">$v0 code</span></p></td><td class="c12"><p class="c14 c1 c13"><span class="c16">Arguments</span></p></td><td class="c11"><p class="c3 c1"><span class="c16">Return Value</span></p></td></tr><tr class="c0"><td class="c6"><p class="c3 c1"><span>Print Integer</span></p></td><td class="c10"><p class="c3 c1"><span>1</span></p></td><td class="c12"><p class="c3 c1"><span>$a0 = integer to print</span></p></td><td class="c11"><p class="c3 c5 c1"><span class="c8"></span></p></td></tr><tr><td class="c6"><p class="c14 c1 c13"><span>Print String</span></p></td><td class="c10"><p class="c14 c1 c13"><span>4</span></p></td><td class="c12"><p class="c14 c1 c13"><span>$a0 = stack address of null-terminated string to print to console</span></p></td><td class="c11"><p class="c3 c5 c1"><span class="c8"></span></p></td></tr><tr class="c0"><td class="c6"><p class="c3 c1"><span>Read Integer</span></p></td><td class="c10"><p class="c3 c1"><span>5</span></p></td><td class="c12"><p class="c3 c5 c1"><span class="c8"></span></p></td><td class="c11"><p class="c3 c1"><span>$v0 = contains integer read</span></p></td></tr><tr class="c0"><td class="c6"><p class="c3 c1"><span>Read String</span></p></td><td class="c10"><p class="c3 c1"><span>8</span></p></td><td class="c12"><p class="c3 c1"><span>$a0 = address of input buffer</span></p><p class="c3 c1"><span>$a1 = maximum number of characters to read (this will be one less than the allowed string since it needs space for the null terminator)</span></p></td><td class="c11"><p class="c3 c1"><span>$v0 = contains the length of the input string</span></p></td></tr><tr class="c0"><td class="c6"><p class="c3 c1"><span>Confirm Dialog</span></p></td><td class="c10"><p class="c1 c3"><span>50</span></p></td><td class="c12"><p class="c3 c1"><span>$a0 = address of null-terminated string that is the message to user</span></p></td><td class="c11"><p class="c3 c1"><span>$a0 contains value of user-chosen option</span></p><p class="c3 c1"><span>0: OK</span></p><p class="c3 c1"><span>1: Cancel</span></p></td></tr><tr class="c0"><td class="c6"><p class="c3 c1"><span>Input Dialog Int</span></p></td><td class="c10"><p class="c3 c1"><span>51</span></p></td><td class="c12"><p class="c1 c13"><span>$a0 = address of null-terminated string that is the message to user</span></p><p class="c5 c1 c13"><span></span></p></td><td class="c11"><p class="c3 c1"><span>$a0 contains int read</span></p><p class="c3 c1"><span>$a1 contains status value</span></p><p class="c3 c1"><span>0: OK status</span></p><p class="c3 c1"><span>-1: input data cannot be correctly parsed</span></p><p class="c3 c1"><span>-2: Cancel was chosen</span></p><p class="c3 c1"><span>-3: OK was chosen but no data had been input into field</span></p></td></tr><tr class="c0"><td class="c6"><p class="c3 c1"><span>Input Dialog String</span></p></td><td class="c10"><p class="c3 c1"><span>54</span></p></td><td class="c12"><p class="c3 c1"><span>$a0 = address of null-terminated string that is the message to user</span></p><p class="c3 c1"><span>$a1 = address of input buffer</span></p><p class="c3 c1"><span>$a2 = maximum number of characters to read</span></p></td><td class="c11"><p class="c3 c1"><span>$a1 contains status value</span></p><p class="c3 c1"><span>0: OK status. Buffer contains the input string.</span></p><p class="c3 c1"><span>-2: Cancel was chosen. </span><span class="c19">No change to buffer. </span></p><p class="c3 c1"><span>-3: OK was chosen but no data had been input into field. </span><span class="c19">No change to buffer.</span></p><p class="c3 c1"><span>-4: length of the input string exceeded the specified maximum. Buffer contains the maximum allowable input string plus a terminating null.</span></p></td></tr><tr class="c0"><td class="c6"><p class="c3 c1"><span>Alert</span></p></td><td class="c10"><p class="c3 c1"><span>55</span></p></td><td class="c12"><p class="c3 c1"><span>$a0 = address of null-terminated string that is the message to user</span></p></td><td class="c11"><p class="c3 c5 c1"><span class="c8"></span></p></td></tr><tr class="c0"><td class="c6"><p class="c3 c1"><span>Alert Int</span></p></td><td class="c10"><p class="c3 c1"><span>56</span></p></td><td class="c12"><p class="c3 c1"><span>$a0 = address of null-terminated string that is an information-type message to user</span></p><p class="c3 c1"><span>$a1 = int value to display in string form after the first string</span></p></td><td class="c11"><p class="c3 c5 c1"><span class="c8"></span></p></td></tr><tr class="c0"><td class="c6"><p class="c3 c1"><span>Alert String</span></p></td><td class="c10"><p class="c3 c1"><span>59</span></p></td><td class="c12"><p class="c3 c1"><span>$a0 = address of null-terminated string that is an information-type message to user</span></p><p class="c3 c1"><span>$a1 = address of null-terminated string to display after the first string</span></p></td><td class="c11"><p class="c3 c1 c5"><span class="c8"></span></p></td></tr><tr class="c0"><td class="c6"><p class="c3 c1"><span>Generate Save String Code</span></p></td><td class="c10"><p class="c3 c1"><span>60</span></p></td><td class="c12"><p class="c3 c1"><span>$a0 = stack address of null-terminated string to generate code for</span></p></td><td class="c11"><p class="c3 c5 c1"><span class="c8"></span></p></td></tr><tr class="c0"><td class="c6"><p class="c3 c1"><span>Binary -&gt; Decimal</span></p></td><td class="c10"><p class="c3 c1"><span>61</span></p></td><td class="c12"><p class="c3 c1"><span>$a0 = stack address of binary string</span></p></td><td class="c11"><p class="c3 c5 c1"><span></span></p></td></tr><tr class="c0"><td class="c6"><p class="c3 c1"><span>Decimal -&gt; Binary</span></p></td><td class="c10"><p class="c3 c1"><span>62</span></p></td><td class="c12"><p class="c3 c1"><span>$a0 = decimal number to convert</span></p><p class="c3 c1"><span>$a1 = number of chars to output</span></p><p class="c3 c1"><span>$a2 = size of each block to output</span></p></td><td class="c11"><p class="c3 c5 c1"><span class="c8"></span></p></td></tr></tbody></table><p class="c5 c1"><span></span></p><h1 class="c1"><a name="h.mjw4rmie1hrl"></a><span>User&#39;s Guide</span></h1><h2 class="c1"><a name="h.nkpo0qdlt6pk"></a><span>Running A Program</span></h2><p class="c1 c4"><span>There are 2 ways to process your code: </span><span class="c23">Stepping</span><span>, and </span><span class="c23">Running</span><span>.</span></p><p class="c4 c5 c1"><span></span></p><ul class="c9 lst-kix_wh8q5r6nlnkm-0 start"><li class="c4 c20 c1"><span>The first way is to &ldquo;step&rdquo; through 1 line at a time. This can be accomplished by clicking the step button. When you step through your code, you will see that the editor will highlight specific lines. These lines indicate which lines the emulator is processing. The last line the emulator successfully ran will be highlighted in green. The next line to be run will be highlighted in grey. If the emulator runs into a MIPS error, it will be highlighted in red. You will notice as you step through your program that the last register, or stack address changed, is also highlighted in green. See the Auto Switch feature for more details.</span></li><li class="c4 c20 c1"><span>The second way to process your code is to &ldquo;run&rdquo; it. This can be accomplished by clicking the run button. When you run your code, each line is successively run until your program is interrupted. Your program can be interrupted by errors, requests for input, or the completion of your code.</span></li></ul><p class="c5 c1"><span></span></p><h2 class="c1"><a name="h.pepcyf380cso"></a><span>Features</span></h2><h3 class="c1"><a name="h.tehglim0uo52"></a><span>Go to line number</span></h3><p class="c1"><img height="53" src="images/image04.png" width="180"></p><p class="c1"><span>You can type a line number and press Go to jump to a specific line of code. This will become the next line the mips engine will run.</span></p><p class="c5 c1"><span></span></p><h3 class="c1"><a name="h.pgz50cglii7"></a><span>Demos</span></h3><p class="c1"><img height="147" src="images/image05.png" width="548"></p><p class="c1"><span>Tap the Show/Hide Demos button to reveal the list of built-in demos. Tap a demo (e.g. Hello World) to replace the existing MIPS code with the predefined MIPS code for that demo. Then press run (or step) to watch it execute. Most of them are self explanatory, or have comments that explain how they work.</span></p><h3 class="c1"><a name="h.yw97n2lkwbjo"></a><span>Auto switch register/stack/log tabs</span></h3><p class="c1"><img height="94" src="images/image07.png" width="333"></p><p class="c1"><span>With this feature enabled, whenever a register (or stack) is modified, the tab will automatically switch the corresponding tab so that you can see the relevant change. In the case where multiple things are modified at once, the last change will take precedence.</span></p><h3 class="c1"><a name="h.q5hqvyasmyap"></a><span>Show stack byte as number/ascii/binary</span></h3><p class="c1"><span>Sometimes it is useful to see the actual bits that compose a byte, or to see the corresponding ASCII character that is stored in the stack. You can toggle between seeing any of these three values for a corresponding address in the stack.</span></p><h3 class="c1"><a name="h.vhp6uhppx4mw"></a><span>View registers</span></h3><p class="c1"><img height="140" src="images/image06.png" width="253"></p><p class="c1"><span>Up top we can toggle which registers are currently visible (S, T, A, or V registers). Underneath that, we can see a register&#39;s current value. Registers are initially populated with junk data until an instruction modifies them. In this screenshot, we can see that the $s0 register currently has the value 170. A register is composed of 32 bits, and can therefore hold 2</span><span class="c22">32</span><span>&nbsp;different values.</span></p><p class="c5 c1"><span></span></p><h3 class="c1"><a name="h.g6wc8q5eu06m"></a><span>Modify register value</span></h3><p class="c1"><img height="70" src="images/image03.png" width="166"></p><p class="c1"><span>You can click a register&#39;s value and overwrite its contents with whatever you want.</span></p><h1 class="c1"><a name="h.9v5m8l9m4seh"></a><span>Other Notes</span></h1><h2 class="c1"><a name="h.6uqxvrqa4n42"></a><span>Stack</span></h2><p class="c1"><span>The stack is byte-addressable, and is currently the only place to store anything of great length. Each time you start the emulator, the frame pointer will be initialized to a random address less than 2^32, in order to simulate the fact that when you first run your program, the frame pointer may be at any given value.</span></p><p class="c5 c1"><span></span></p><p class="c1"><img height="23" src="images/image01.png" width="25"></p><p class="c1"><span>The black arrow is used to show where $sp is currently pointing to.</span></p><p class="c5 c1"><span></span></p><p class="c1"><img height="96" src="images/image02.png" width="290"></p><p class="c1"><span>You can click </span><span class="c16">show relative address</span><span>, in order to show relative addresses from the frame pointer rather than having to look at large numbers.</span></p><p class="c1"><img height="370" src="images/image00.png" width="395"></p><p class="c1"><span>You can change a value in the stack by clicking it to edit it. You can also view it in several modes, as an integer, in binary, and it&rsquo;s ascii representation (&lsquo;None&rsquo; if no ascii character is available). Viewing the stack in a different mode doesn&rsquo;t mean you can&rsquo;t edit it. You can edit it in binary mode to save a binary representation, as you could with integers and ascii.</span></p></body></html>
Ext.data.JsonP.mips_emulator({"tagname":"class","name":"mips_emulator","autodetected":{},"files":[{"filename":"mips_emulator.js","href":"mips_emulator.html#mips_emulator"}],"members":[{"name":"current_line","tagname":"property","owner":"mips_emulator","id":"property-current_line","meta":{"private":true}},{"name":"parseMethods","tagname":"property","owner":"mips_emulator","id":"property-parseMethods","meta":{"private":true}},{"name":"readonlyRegs","tagname":"property","owner":"mips_emulator","id":"property-readonlyRegs","meta":{"private":true}},{"name":"readwriteRegs","tagname":"property","owner":"mips_emulator","id":"property-readwriteRegs","meta":{"private":true}},{"name":"registers","tagname":"property","owner":"mips_emulator","id":"property-registers","meta":{"private":true}},{"name":"runMethods","tagname":"property","owner":"mips_emulator","id":"property-runMethods","meta":{"private":true}},{"name":"create_register","tagname":"method","owner":"mips_emulator","id":"method-create_register","meta":{"private":true}},{"name":"getImmediate","tagname":"method","owner":"mips_emulator","id":"method-getImmediate","meta":{"private":true}},{"name":"getRegister","tagname":"method","owner":"mips_emulator","id":"method-getRegister","meta":{}},{"name":"isImmediate","tagname":"method","owner":"mips_emulator","id":"method-isImmediate","meta":{"private":true}},{"name":"isRegister","tagname":"method","owner":"mips_emulator","id":"method-isRegister","meta":{}},{"name":"isValidLine","tagname":"method","owner":"mips_emulator","id":"method-isValidLine","meta":{}},{"name":"mips_emulator","tagname":"method","owner":"mips_emulator","id":"method-mips_emulator","meta":{}},{"name":"mips_line","tagname":"method","owner":"mips_emulator","id":"method-mips_line","meta":{"private":true}},{"name":"onChange","tagname":"method","owner":"mips_emulator","id":"method-onChange","meta":{}},{"name":"runLine","tagname":"method","owner":"mips_emulator","id":"method-runLine","meta":{}},{"name":"run_line","tagname":"method","owner":"mips_emulator","id":"method-run_line","meta":{"private":true}},{"name":"setCode","tagname":"method","owner":"mips_emulator","id":"method-setCode","meta":{}},{"name":"setRegister","tagname":"method","owner":"mips_emulator","id":"method-setRegister","meta":{}}],"alternateClassNames":[],"aliases":{},"id":"class-mips_emulator","component":false,"superclasses":[],"subclasses":[],"mixedInto":[],"mixins":[],"parentMixins":[],"requires":[],"uses":[],"html":"<div><pre class=\"hierarchy\"><h4>Files</h4><div class='dependency'><a href='source/mips_emulator.html#mips_emulator' target='_blank'>mips_emulator.js</a></div></pre><div class='doc-contents'><p>Mips Emulation engine.</p>\n</div><div class='members'><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-property'>Properties</h3><div class='subsection'><div id='property-current_line' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='mips_emulator'>mips_emulator</span><br/><a href='source/mips_emulator.html#mips_emulator-property-current_line' target='_blank' class='view-source'>view source</a></div><a href='#!/api/mips_emulator-property-current_line' class='name expandable'>current_line</a> : <a href=\"#!/api/Number\" rel=\"Number\" class=\"docClass\">Number</a><span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'>The current line the mips emulator is looking at. ...</div><div class='long'><p>The current line the mips emulator is looking at.</p>\n<p>Defaults to: <code>0</code></p></div></div></div><div id='property-parseMethods' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='mips_emulator'>mips_emulator</span><br/><a href='source/mips_emulator.html#mips_emulator-property-parseMethods' target='_blank' class='view-source'>view source</a></div><a href='#!/api/mips_emulator-property-parseMethods' class='name expandable'>parseMethods</a> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'><p>Verifies that an operation can use these registers</p>\n</div><div class='long'><p>Verifies that an operation can use these registers</p>\n</div></div></div><div id='property-readonlyRegs' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='mips_emulator'>mips_emulator</span><br/><a href='source/mips_emulator.html#mips_emulator-property-readonlyRegs' target='_blank' class='view-source'>view source</a></div><a href='#!/api/mips_emulator-property-readonlyRegs' class='name expandable'>readonlyRegs</a> : <a href=\"#!/api/Array\" rel=\"Array\" class=\"docClass\">Array</a><span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'>Array of read only registers ...</div><div class='long'><p>Array of read only registers</p>\n<p>Defaults to: <code>[&#39;$zero&#39;, &#39;$at&#39;, &#39;$k0&#39;, &#39;$k1&#39;, &#39;$gp&#39;, &#39;$sp&#39;, &#39;$fp&#39;, &#39;$ra&#39;]</code></p></div></div></div><div id='property-readwriteRegs' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='mips_emulator'>mips_emulator</span><br/><a href='source/mips_emulator.html#mips_emulator-property-readwriteRegs' target='_blank' class='view-source'>view source</a></div><a href='#!/api/mips_emulator-property-readwriteRegs' class='name expandable'>readwriteRegs</a> : <a href=\"#!/api/Array\" rel=\"Array\" class=\"docClass\">Array</a><span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'>Array of read/write registers ...</div><div class='long'><p>Array of read/write registers</p>\n<p>Defaults to: <code>[&#39;$s0&#39;, &#39;$s1&#39;, &#39;$s2&#39;, &#39;$s3&#39;, &#39;$s4&#39;, &#39;$s5&#39;, &#39;$s6&#39;, &#39;$s7&#39;, &#39;$t0&#39;, &#39;$t1&#39;, &#39;$t2&#39;, &#39;$t3&#39;, &#39;$t4&#39;, &#39;$t5&#39;, &#39;$t6&#39;, &#39;$t7&#39;, &#39;$t8&#39;, &#39;$t9&#39;, &#39;$v0&#39;, &#39;$v1&#39;, &#39;$a0&#39;, &#39;$a1&#39;, &#39;$a2&#39;, &#39;$a3&#39;]</code></p></div></div></div><div id='property-registers' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='mips_emulator'>mips_emulator</span><br/><a href='source/mips_emulator.html#mips_emulator-property-registers' target='_blank' class='view-source'>view source</a></div><a href='#!/api/mips_emulator-property-registers' class='name expandable'>registers</a> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'><p>Hash table of registers</p>\n</div><div class='long'><p>Hash table of registers</p>\n</div></div></div><div id='property-runMethods' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='mips_emulator'>mips_emulator</span><br/><a href='source/mips_emulator.html#mips_emulator-property-runMethods' target='_blank' class='view-source'>view source</a></div><a href='#!/api/mips_emulator-property-runMethods' class='name expandable'>runMethods</a> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'><p>Collection of methods to run the intended operations.</p>\n</div><div class='long'><p>Collection of methods to run the intended operations.</p>\n</div></div></div></div></div><div class='members-section'><div class='definedBy'>Defined By</div><h3 class='members-title icon-method'>Methods</h3><div class='subsection'><div id='method-create_register' class='member first-child not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='mips_emulator'>mips_emulator</span><br/><a href='source/mips_emulator.html#mips_emulator-method-create_register' target='_blank' class='view-source'>view source</a></div><a href='#!/api/mips_emulator-method-create_register' class='name expandable'>create_register</a>( <span class='pre'>reg</span> ) : <a href=\"#!/api/register\" rel=\"register\" class=\"docClass\">register</a><span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'>Create a default register ...</div><div class='long'><p>Create a default register</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>reg</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><div class='sub-desc'>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/register\" rel=\"register\" class=\"docClass\">register</a></span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-getImmediate' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='mips_emulator'>mips_emulator</span><br/><a href='source/mips_emulator.html#mips_emulator-method-getImmediate' target='_blank' class='view-source'>view source</a></div><a href='#!/api/mips_emulator-method-getImmediate' class='name expandable'>getImmediate</a>( <span class='pre'>arg</span> ) : <a href=\"#!/api/Number\" rel=\"Number\" class=\"docClass\">Number</a><span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'>check if argument is an immediate, parse, and return the results. ...</div><div class='long'><p>check if argument is an immediate, parse, and return the results.</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>arg</span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><div class='sub-desc'>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/Number\" rel=\"Number\" class=\"docClass\">Number</a></span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-getRegister' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='mips_emulator'>mips_emulator</span><br/><a href='source/mips_emulator.html#mips_emulator-method-getRegister' target='_blank' class='view-source'>view source</a></div><a href='#!/api/mips_emulator-method-getRegister' class='name expandable'>getRegister</a>( <span class='pre'>reg</span> ) : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><span class=\"signature\"></span></div><div class='description'><div class='short'>Returns a specified registers value ...</div><div class='long'><p>Returns a specified registers value</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>reg</span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><div class='sub-desc'>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a></span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-isImmediate' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='mips_emulator'>mips_emulator</span><br/><a href='source/mips_emulator.html#mips_emulator-method-isImmediate' target='_blank' class='view-source'>view source</a></div><a href='#!/api/mips_emulator-method-isImmediate' class='name expandable'>isImmediate</a>( <span class='pre'>arg</span> ) : <a href=\"#!/api/Boolean\" rel=\"Boolean\" class=\"docClass\">Boolean</a><span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'>Checks if a string matches as a number ...</div><div class='long'><p>Checks if a string matches as a number</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>arg</span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><div class='sub-desc'>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/Boolean\" rel=\"Boolean\" class=\"docClass\">Boolean</a></span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-isRegister' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='mips_emulator'>mips_emulator</span><br/><a href='source/mips_emulator.html#mips_emulator-method-isRegister' target='_blank' class='view-source'>view source</a></div><a href='#!/api/mips_emulator-method-isRegister' class='name expandable'>isRegister</a>( <span class='pre'>reg</span> ) : <a href=\"#!/api/Boolean\" rel=\"Boolean\" class=\"docClass\">Boolean</a><span class=\"signature\"></span></div><div class='description'><div class='short'>Checks if a register is a valid register ...</div><div class='long'><p>Checks if a register is a valid register</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>reg</span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><div class='sub-desc'>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/Boolean\" rel=\"Boolean\" class=\"docClass\">Boolean</a></span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-isValidLine' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='mips_emulator'>mips_emulator</span><br/><a href='source/mips_emulator.html#mips_emulator-method-isValidLine' target='_blank' class='view-source'>view source</a></div><a href='#!/api/mips_emulator-method-isValidLine' class='name expandable'>isValidLine</a>( <span class='pre'>line</span> ) : <a href=\"#!/api/Boolean\" rel=\"Boolean\" class=\"docClass\">Boolean</a><span class=\"signature\"></span></div><div class='description'><div class='short'>Checks if a string is a valid mips line ...</div><div class='long'><p>Checks if a string is a valid mips line</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>line</span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><div class='sub-desc'>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/Boolean\" rel=\"Boolean\" class=\"docClass\">Boolean</a></span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-mips_emulator' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='mips_emulator'>mips_emulator</span><br/><a href='source/mips_emulator.html#mips_emulator-method-mips_emulator' target='_blank' class='view-source'>view source</a></div><a href='#!/api/mips_emulator-method-mips_emulator' class='name expandable'>mips_emulator</a>( <span class='pre'>mips_args</span> ) : <a href=\"#!/api/mips_emulator\" rel=\"mips_emulator\" class=\"docClass\">mips_emulator</a><span class=\"signature\"></span></div><div class='description'><div class='short'>Mips emulator constructor ...</div><div class='long'><p>Mips emulator constructor</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>mips_args</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><div class='sub-desc'><p>Arguments to construct the mips emulater.</p>\n<ul><li><span class='pre'>starting_code</span> : <div class='sub-desc'><p>Set the default code for this emulator to run.</p>\n</div></li><li><span class='pre'>debug</span> : <div class='sub-desc'><p>If debug is set to true, the console will print debug statements</p>\n</div></li></ul></div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/mips_emulator\" rel=\"mips_emulator\" class=\"docClass\">mips_emulator</a></span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-mips_line' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='mips_emulator'>mips_emulator</span><br/><a href='source/mips_emulator.html#mips_emulator-method-mips_line' target='_blank' class='view-source'>view source</a></div><a href='#!/api/mips_emulator-method-mips_line' class='name expandable'>mips_line</a>( <span class='pre'>line</span> ) : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'>Turns a string into a mips line object which contains a mips line of code and metadata needed to run it ...</div><div class='long'><p>Turns a string into a mips line object which contains a mips line of code and metadata needed to run it</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>line</span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><div class='sub-desc'>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'><a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a></span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-onChange' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='mips_emulator'>mips_emulator</span><br/><a href='source/mips_emulator.html#mips_emulator-method-onChange' target='_blank' class='view-source'>view source</a></div><a href='#!/api/mips_emulator-method-onChange' class='name expandable'>onChange</a>( <span class='pre'>reg, func</span> ) : null<span class=\"signature\"></span></div><div class='description'><div class='short'>Set an Onchange function for a register ...</div><div class='long'><p>Set an Onchange function for a register</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>reg</span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><div class='sub-desc'>\n</div></li><li><span class='pre'>func</span> : <a href=\"#!/api/Function\" rel=\"Function\" class=\"docClass\">Function</a><div class='sub-desc'>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'>null</span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-runLine' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='mips_emulator'>mips_emulator</span><br/><a href='source/mips_emulator.html#mips_emulator-method-runLine' target='_blank' class='view-source'>view source</a></div><a href='#!/api/mips_emulator-method-runLine' class='name expandable'>runLine</a>( <span class='pre'>input_line</span> ) : null<span class=\"signature\"></span></div><div class='description'><div class='short'>Run an individual line ...</div><div class='long'><p>Run an individual line</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>input_line</span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><div class='sub-desc'>\n</div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'>null</span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-run_line' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='mips_emulator'>mips_emulator</span><br/><a href='source/mips_emulator.html#mips_emulator-method-run_line' target='_blank' class='view-source'>view source</a></div><a href='#!/api/mips_emulator-method-run_line' class='name expandable'>run_line</a>( <span class='pre'>line</span> ) : null<span class=\"signature\"><span class='private' >private</span></span></div><div class='description'><div class='short'>Run an individual line ...</div><div class='long'><p>Run an individual line</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>line</span> : <a href=\"#!/api/Object\" rel=\"Object\" class=\"docClass\">Object</a><div class='sub-desc'></div></li></ul><h3 class='pa'>Returns</h3><ul><li><span class='pre'>null</span><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-setCode' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='mips_emulator'>mips_emulator</span><br/><a href='source/mips_emulator.html#mips_emulator-method-setCode' target='_blank' class='view-source'>view source</a></div><a href='#!/api/mips_emulator-method-setCode' class='name expandable'>setCode</a>( <span class='pre'>mc</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>Set code to be emulated ...</div><div class='long'><p>Set code to be emulated</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>mc</span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><div class='sub-desc'>\n</div></li></ul></div></div></div><div id='method-setRegister' class='member  not-inherited'><a href='#' class='side expandable'><span>&nbsp;</span></a><div class='title'><div class='meta'><span class='defined-in' rel='mips_emulator'>mips_emulator</span><br/><a href='source/mips_emulator.html#mips_emulator-method-setRegister' target='_blank' class='view-source'>view source</a></div><a href='#!/api/mips_emulator-method-setRegister' class='name expandable'>setRegister</a>( <span class='pre'>reg, value</span> )<span class=\"signature\"></span></div><div class='description'><div class='short'>Set a register value, and call onChange function for that register ...</div><div class='long'><p>Set a register value, and call onChange function for that register</p>\n<h3 class=\"pa\">Parameters</h3><ul><li><span class='pre'>reg</span> : <a href=\"#!/api/String\" rel=\"String\" class=\"docClass\">String</a><div class='sub-desc'>\n</div></li><li><span class='pre'>value</span> : <a href=\"#!/api/Number\" rel=\"Number\" class=\"docClass\">Number</a><div class='sub-desc'>\n</div></li></ul></div></div></div></div></div></div></div>","meta":{}});
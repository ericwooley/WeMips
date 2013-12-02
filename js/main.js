// replace snake case with camel case
// _([a-zA-Z])([a-zA-Z]*)
// \U$1\L$2


$(document).ready(function(){
    setupTests();
    // If we ever host this, we can enable sharing this way,
    // as long as the code is short enough to fit in a url.
    var urlParams = getURLParameters();
    ///////////////////////////////////////////////////
    // Mips Emulator Setup
    ///////////////////////////////////////////////////
    var me = mipsEmulator({
        debug: true,
        /*
         * Changes the registers visual representation when the mips emulator changes its value
         * @param  {String} regName the register name
         * @param  {String/Number} value    The new value of the register
         * @return {null}
         */
        onRegisterChange: function(regName, value){
            var reg = $("#" + regName.replace('$', '') + " .regSpacer");
            $(".lastRegChanged").removeClass('lastRegChanged');
            reg.html(value);
            reg.addClass('lastRegChanged');
            // change to correct tab
            var regLetter = regName.replace('$', '').replace(/\s/, '').charAt(0);
            $('#registers a[href="#'+regLetter+'-registers"]').tab('show')
        },
        /*
         * runs when the emulator has pushed past the last line
         * @return {null}
         */
        onFinish: function(){
            alert("Emulation complete, returning to line 1");
            me.setLine(1);
            setHighlights({lineRan: lastLineNoRun, nextLine: me.getLineNumber()});
            running = false;
        },
        /*
         * This is run when *the users* program encounters a mips error.
         * @param  {String} message     The error message
         * @param  {Number} lineNumber Which line the error occured on
         * @return {null}
         */
        onError: function(message, lineNumber){
            if(!_.isNumber(lineNumber)) return false;
            editor.markText(
                {line: lineNumber-1, ch: 0},
                {line: lineNumber, ch: 0},
                {title: message, className: 'errorLine', clearOnEnter: true}
            );
        },
        onStackChange: addStackAddress,
        // Set the starting code to be the defualt in the editor.
        startingCode: $("#editor").val()
    });
    var running = false;
    // the active line, is the one whose results are being examined.
    var lastLineNoRun;
    var nextLine;

    ///////////////////////////////////////////////////
    // Code Mirror Setup
    ///////////////////////////////////////////////////

    // Code Mirror lines do not match with displayed line number
    // they start at zero and so are off by  -1
    var editor = CodeMirror.fromTextArea(
        document.getElementById("editor"),{
          lineNumbers: true,
          mode: "text/css",
          matchBrackets: true,
    });

    // When the editor changes, we need to mark it as invalid
    // so it will be reanalyzed upon a step or run
    editor.on('change', markEditorAsInvalid);

    // Keeps track of the last line we ran. To start with we want it
    // to be null becuase we have not run anything yet.
    var lastRunMarker;
    // Keeps track of the next line we will run, we want to set it to the
    // first valid line.
    var nextMarker = editor.markText(
        {line: me.getLineNumber()-1, ch: 0},
        {line: me.getLineNumber(), ch: 0},
        {title: "Next line to be run", className: 'nextLine'}
    );

    ///////////////////////////////////////////////////
    // Event Handlers setup
    ///////////////////////////////////////////////////
    $(".registers-container li").each(setupRegisters);
    $('.regSpacer').on('input', manualRegistryValidate);
    $('.regSpacer').on('blur', manualRegistryEditSave);
    $('#codeLoaders button').on('click', loadCustomCode);
    $("#step").click(step);
    $("#goToLineButton").on('click', setLine);
    $("#run").click(run);

    // Functions to respond to events.
    function setLine(){
        var newLine = $("#currentLineInput").val();
        // if(debug) console.log("Setting new line: "+ newLine);
        if(!_.isNumber(me.setLine(Number(newLine)))) console.error("Error setting line: " + newLine);
        // if(debug) console.log("nextLine"+ me.getLineNumber());
        setHighlights({lineRan: null, nextLine: me.getLineNumber()})
        return false;
    };
    function markEditorAsInvalid(){
        me.valid = false;
    };
    function step(){
        // if this code is no longer valid, reanalyze.
        if(!me.valid){
            try{
                mipsAnalyze();
            } catch(e){
                console.error(JSON.stringify(e));
            }
        }
        //try{
            lineResult = me.step();
            if(lineResult){
               setHighlights(lineResult);
            }
        //} catch(e){
            //console.error("Error on line: " + nextLine + " - " + JSON.stringify(e));
        //}
        
    };
    function loadCustomCode(e){
        if(!confirm("This will erase what is in the code editor, are you sure?")) return;
        var target = $(e.target);
        var loadTarget = target.attr('load');
        var newContent = $(loadTarget).html();
        newContent = newContent.replace(/^\s+|\s+$/g, '');
        //newContent = newContent.replace(/\n\s+/g, '\n');
        editor.setValue(newContent);
        mipsAnalyze();
        me.setLine(1);
        lastLineNoRun = null;
        setHighlights();
    };
    function manualRegistryEditSave(e){
        var newVal = $(e.target).html();
        var target =  $(e.target);
        var regName = target.attr("reg");
        me.setRegisterVal(regName, Number(newVal), false);
    };
    function manualRegistryValidate(e){
        var newVal = $(e.target).html();
        var target =  $(e.target);
        var regName = target.attr("reg");
        if(newVal.search(/[^-\d]/) >= 0){
            target.html(newVal.replace(/[\D\s]/g, ''));
            alert("You cannot enter in characters into registers");
        }
        if(newVal.length > 11){
            if(newVal.length == 12 && newVal.charAt(0) == '-'){
                return true;
            } else {
                target.html(newVal.substring(0, 11));
                alert("The 32 bit integers can only be 11 digits long.");
            }

        }

        return true;
    };
    function setHighlights(lines){
        lines = lines || {};
        lastLineNoRun = lines.lineRan || lastLineNoRun || null;
        nextLine = lines.nextLine || me.getLineNumber();
        // if(debug) console.log("Active line: " + lastLineNoRun);
        // if(debug) console.log("Next line: " + nextLine);
        $("#currentLineInput").val(nextLine);
        if(lastRunMarker) lastRunMarker.clear();
        if(lastLineNoRun)
            lastRunMarker = editor.markText(
                {line: lastLineNoRun-1, ch: 0},
                {line: lastLineNoRun, ch: 0},
                {title: "last line ran", className: 'lastLineNoRun', clearOnEnter: true}
            );
        if(nextMarker) nextMarker.clear();
        nextMarker = editor.markText(
            {line: nextLine-1, ch: 0},
            {line: nextLine, ch: 0},
            {title: "Next line to be run", className: 'nextLine', clearOnEnter: true}
        );

    };
    function setupRegisters(index){
        var reg = $(this);
        var regName = reg.attr('id');
        reg.html(
            "<b>"+regName +":</b> "
            + "<span class='regSpacer' reg='"+regName+"' id='"+regName+"-val' contenteditable='true'>"
            + me.getRegisterVal('$' + regName)
            + "</span>"
        );
    }
    function run(){
        // if this code is no longer valid, reanalyze.
        if(!me.valid){
            editor.save();
            me.setCode($("#editor").val());
            me.valid = true;
        }
        running = true;
        while(running) step();

    };
    function mipsAnalyze(){
        editor.save();
        me.setCode($("#editor").val());
        me.setLine(1);
        me.valid = true;
    };
    function getCodeAsString(){
        editor.save();
        return $("#editor").val();
    };
    function unsignInt(num){
        return (num << 31) >>> 0;
    };
    var stackLow = me.stack.pointerToBottomOfStack();
    var stackEnd = me.stack.pointerToBottomOfStack();
    function addStackAddress(address, val){
        $('#registers a[href="#stack-container-div"]').tab('show');
        console.log("address: " + address + "\nStackLow: " + stackLow + "\nVal: " + val );
        while(address <= stackLow){
            
            $("#stackRep").prepend(
                "<div id='stackEntry-" + stackLow + "' >"
                    + "<span id='stackAddr-"+stackLow+"'>"
                        + stackLow + ": "
                    + "</span>"
                    + "<span id='stackVal-"+stackLow+"'></span>"
                + "</div>"
            );
            stackLow--;
        }
        console.log("stack Change: " + address + " - " + val);
        $("#stackVal-"+address).html(val);
    };
    function setupTests(){
        // <div id='additionDoubler'></div>
        // <button type="button" load="#additionDoubler" class="btn btn-default">Addition Doubler</button>
        $.each(examples, function(index, func){
            index = index.replace('Example', '');
            indexNice = index.replace(/([A-Z])/g, " \$1");
            
            $("#exampleHolder").append(
                "<div id='"+index+"'>"
                + func().join('\n')
                + "</div>"
            );
            $("#codeLoaders").append(
                '<button type="button" load="#' + index + '" class="btn btn-default">' + indexNice + '</button>'
            );
        });
    };

});
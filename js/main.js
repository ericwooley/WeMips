// replace snake case with camel case
// _([a-zA-Z])([a-zA-Z]*)
// \U$1\L$2


$(document).ready(function(){
    setupTests();
    var autoSwitch = true;
    // If we ever host this, we can enable sharing this way,
    // as long as the code is short enough to fit in a url.
    var urlParams = getURLParameters();

    console.log("url params: " + JSON.stringify(urlParams));
    ///////////////////////////////////////////////////
    // Mips Emulator Setup
    ///////////////////////////////////////////////////

    var me = MipsEmulator({
        debug: false,
        /*
         * Changes the registers visual representation when the mips emulator changes its value
         * @param  {String} regName the register name
         * @param  {String/Number} value    The new value of the register
         * @return {null}
         */
        onRegisterChange: function(regName, value){
            if(regName == "$sp"){
                return setSP(value);
            }
            var reg = $("#" + regName.replace('$', '') + " .regSpacer");
            $(".lastRegChanged").removeClass('lastRegChanged');
            reg.html(value);
            reg.addClass('lastRegChanged');
            // change to correct tab
            var regLetter = regName.replace('$', '').replace(/\s/, '').charAt(0);
            if(autoSwitch) $('#registers a[href="#'+regLetter+'-registers"]').tab('show')
        },
        /*
         * runs when the emulator has pushed past the last line
         * @return {null}
         */
        onFinish: function(){
            addToLog('success', "Emulation complete, returning to line 1");
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
        onOutput: function(message) {
            addToLog('success', message);
        },
        onInput: function(message) {
            return window.prompt(message);
        },
        onConfirm: function(message) {
            return window.confirm(message);
        },
        onAlert: function(message) {
            window.alert(message);
        },
        onStackChange: addStackAddress,
        // Set the starting code to be the defualt in the editor.
        startingCode: $("#editor").val()
    });
    var running = false;
    // the active line, is the one whose results are being examined.
    var lastLineNoRun;
    var lastLineAttempted = 0;
    var nextLine;
    var linesOfCode = 0;

    ///////////////////////////////////////////////////
    // Code Mirror Setup
    ///////////////////////////////////////////////////

    // Code Mirror lines do not match with displayed line number
    // they start at zero and so are off by  -1
    var editor = CodeMirror.fromTextArea(
        document.getElementById("editor"),{
          lineNumbers: true,
          mode: "mips",
          matchBrackets: true,
    });
    // set code to be from url paramater if it is set
    if(urlParams['initialCode']){
        editor.setValue(decodeURIComponent(urlParams['initialCode']));
        update_linkEmbed();
    }

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
    $('.regSpacer').on('blur', manualRegistryEdit);
    $('#codeLoaders button').on('click', loadCustomCode);
    $("#step").click(step);
    $("#goToLineButton").on('click', setLine);
    $("#run").click(run);
    $("#optionShowRelative").change(switchAddressMode);
    $("#autoSwitch").change(function(e){autoSwitch = $(e.target).is(':checked');});
    $("#clearLog").on('click', function(){$("#log").html('')});
    $("#stackDisplayType").change(changeStackType);
    //$(".stackVal").on('blur', manualStackEdit); This has to be setup after the stack has been created

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
        update_linkEmbed();
        me.valid = false;
    };
    function update_linkEmbed(){
        editor.save();
        var linkToCode = "http://wemips.herokuapp.com/" + '?initialCode='+ encodeURIComponent($("#editor").val());
        $("#linkToCode").val(linkToCode);
        $("#embedCode").val('<iframe src="'+linkToCode+'" width="100%" height=600></iframe>');
    };
    update_linkEmbed();

    function step(){

        // if this code is no longer valid, reanalyze.
        if(!me.valid){
            try{
                mipsAnalyze();
            } catch(e){
                addToLog('error', e.message, 1);
            }
        }
        try{
            lastLineAttempted = me.getLineNumber();
            lineResult = me.step();
            if(lineResult){
                setHighlights(lineResult);

                //addToLog('info', "ran line successfully", lastLineAttempted);
            }

        } catch(e){
            addToLog('error', e.message, lastLineAttempted);
            running = false;
            //me.setLine(lastLineAttempted + 1);
            //setHighlights();
        }

    };
    function loadCustomCode(e){
        if(!confirm("This will erase what is in the code editor, are you sure?")) return;
        var target = $(e.target);
        var loadTarget = target.attr('load');
        var newContent = $(loadTarget).html();
        newContent = newContent.replace(/^\s+|\s+$/g, '');
        //newContent = newContent.replace(/\n\s+/g, '\n');
        editor.setValue(newContent);

        mipsAnalyze(true);
        me.setLine(1);
        lastLineNoRun = null;
        setHighlights();
    };

    function manualRegistryEdit(e){
        var newVal = $(e.target).html();
        var target =  $(e.target);
        var regName = target.attr("reg");
        newVal = parseInt(newVal);
        try{
            me.setRegisterVal(regName, newVal, false);
        } catch(e) {
            target.html(me.getRegisterVal(regName));
            addToLog('error', e);
        }
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
        var lineRanThisRun = 0;
        var notInfinite = false;

        if(linesOfCode < 10) LC = 10;
        else LC = linesOfCode;
        while(running){

            step();
            lineRanThisRun++;
            if(lineRanThisRun > 100 * LC && !notInfinite)
                if(confirm(
                    "Code has run "
                    + lineRanThisRun
                    + " lines, are you stuck in an infinite loop? (press OK to stop executing)"))
                    running = false;
                else
                    notInfinite = true;
        }

    };
    function mipsAnalyze(goBackToLineOne){
        editor.save();
        linesOfCode = editor.lineCount();
        me.setCode($("#editor").val());
        if(goBackToLineOne) me.setLine(1);
        me.valid = true;
    };
    function getCodeAsString(){
        editor.save();
        return $("#editor").val();
    };
    function unsignInt(num){
        return (num << 31) >>> 0;
    };
    function setSP(address){
        addStackAddress(address, '', false);
        $(".glyphicon-arrow-right").removeClass("glyphicon-arrow-right");
        $("#stackEntry-" + address + " .glyphicon").addClass("glyphicon-arrow-right lastRegChanged");
        if(autoSwitch) $('#registers a[href="#stack-container-div"]').tab('show');
            };
    var colorizeAddrBG = false;
    var stackDisplayMode = "integer";
    function addStackAddress(address, val, visualize){
        if(!val || val == '') val = me.stack.getByte(address);
        if(typeof visualize == 'undefined')
            visualize = true;
        showAddReal = '';
            showAddRelative = 'style="display: none"';
        if(showRelative){
            showAddReal = 'style="display: none"';
            showAddRelative = '';
        }
        while(address <= stackLow){
            var bgColorClass = '';
            var addressVal = me.stack.getByte(stackLow);
            var valRep = changeToStackRep(addressVal);
            if(colorizeAddrBG) bgColorClass = 'lightGreyBG';
            colorizeAddrBG = !colorizeAddrBG;
            $("#stackRep").prepend(
                "<div id='stackEntry-" + stackLow + "' >"
                + "<span class='glyphicon'></span>&nbsp"
                    + "<span class='"+bgColorClass+"'>"
                        + "<span class='stackAddrReal stackAddr' "+ showAddReal +" id='stackAddr-"+stackLow+"'>"
                            + stackLow + ": "
                        + "</span>"
                        + "<span class='stackAddrRelative stackAddr' "+ showAddRelative +" id='stackAddrRelative-"+stackLow+"'>"
                            + (stackLow - stackEnd) + ": "
                        + "</span>"
                        + "<span "
                            + "class='stackVal stackSpacer' "
                            + "id='stackVal-"+stackLow+"' "
                            + "address='"+stackLow+"' "
                            + "contenteditable='true' "
                            + "integer='"+addressVal+"' "
                            + "ascii='"+asChar(addressVal)+"' "
                            + "binary='"+asBin(addressVal)+"' "
                        + ">"
                            + valRep
                        +"</span>"
                        // + "<span class='regSpacer charBin' id='stackChar-"+stackLow+"'>"
                        //     + asChar(me.stack.getByte(stackLow))
                        // +"</span>"
                        // + "<span class='regSpacer charBin' id='stackBin-"+stackLow+"' style='display: none'>"
                        //     + asBin(me.stack.getByte(stackLow))
                        // +"</span>"
                    + "</span>"
                + "</div>"
            );
            $("#stackVal-"+stackLow).on('blur', manualStackEdit);
            stackLow--;
            
        }

        $("#stackVal-"+address).html(changeToStackRep(val));
        $("#stackVal-"+address).attr('binary', asBin(val));
        $("#stackVal-"+address).attr('integer', val);
        $("#stackVal-"+address).attr('ascii', asChar(val));

    
        if(visualize){
            if(autoSwitch) $('#registers a[href="#stack-container-div"]').tab('show');
            $(".lastRegChanged").removeClass('lastRegChanged');
            $("#stackVal-"+address).addClass('lastRegChanged');
        }
    };
    var stackLow = me.stack.pointerToBottomOfStack()-1;
    var stackEnd = me.stack.pointerToBottomOfStack();
    addStackAddress(stackLow, me.stack.getByte(stackLow), false);

    
    function changeStackType(e){
       stackDisplayMode = $("#stackDisplayType option:selected").html().toLowerCase();
       $(".stackVal").each(function(){
            console.log(stackDisplayMode + " - " + $(this).attr(stackDisplayMode));
            $(this).html($(this).attr(stackDisplayMode));
        });
    }; 
    function changeToStackRep(v){
        //console.log(stackDisplayMode);
        switch(stackDisplayMode) {
            case "integer":
                return v;
                break;
            case "ascii":
                return asChar(v);
                break;
            case "binary":
                return asBin(v);
                break;
        }
    }
    function manualStackEdit(e){
        var address = parseInt($(e.target).attr('address'));
        var newVal = $(e.target).html();
        switch(stackDisplayMode) {
            case "integer":
                break;
            case "ascii":
                newVal = newVal.charCodeAt(0);
                break;
            case "binary":
                newVal = Number(parseInt(newVal, 2));
                break;
        }
        if(typeof newVal != "Number") newVal = Number(newVal);
        me.stack.setByte(address, newVal);
        addStackAddress(address, newVal, false);
    };
    //setSP(stackEnd);
    function setupTests(){
        // <div id='additionDoubler'></div>
        // <button type="button" load="#additionDoubler" class="btn btn-default">Addition Doubler</button>
        $.each(examples, function(index, func){
            index = index.replace('Example', '');
            indexNice = index.replace(/([A-Z])/g, " \$1");
            indexNice = indexNice.charAt(0).toUpperCase() + indexNice.slice(1);;

            $("#exampleHolder").append(
                "<div id='"+index+"'>"
                + func().join('\n')
                + "</div>"
            );
            $("#codeLoaders").append(
                '<button type="button" load="#'
                + index + '" class="btn btn-default">'
                + indexNice + '</button>'
            );
        });
    };
    var showRelative;
    function switchAddressMode(e){
        showRelative = $(e.target).is(':checked');
        if(showRelative){
            $('.stackAddrRelative').show();
            $('.stackAddrReal').hide();
        } else {
            $('.stackAddrRelative').hide();
            $('.stackAddrReal').show();
        }
    }
    function asChar(num){
        if(typeof num != "Number") num = Number(parseInt(num));
        num = MIPS.signedNumberToUnsignedNumber(num, 8);
        if(!num)
            return '';
        if(num > 32 && num < 127)
            return String.fromCharCode(num);
        return '';
    }
    function asBin(num){
        if(typeof num != "Number") num = Number(num);
        return MIPS.numberToBinaryString(num, 8);
    }
    function addToLog(type, message, line_no){
        message = message.replace(/\n/g, "<br />");
        if(type == 'error') type = 'danger';
        if(line_no){
            message = "Line " + line_no + ": " + message;
            if(type == 'danger'){
                editor.markText(
                    {line: line_no-1, ch: 0},
                    {line: line_no, ch: 0},
                    {title: message, className: 'errorLine', clearOnEnter: true}
                );
            }
        }
        $("#log").prepend(
            '<div class="alert alert-'+type+'">'+message+'</div>'
        );
        if(autoSwitch) $('#registers a[href="#logWrapper"]').tab('show');

    }

});
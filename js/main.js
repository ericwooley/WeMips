$(document).ready(function(){

    // Code Mirror setup
    var me = mips_emulator({
        debug: true,
        onRegisterChange: function(reg_name, value){
            $("#" + reg_name.replace('$', '') + " .reg_spacer").html(value);
        }
    });
    // The next time we go to step or run, we need to reset the code from the text editor.
    me.valid = false; 
    var editor = CodeMirror.fromTextArea(
        document.getElementById("editor"),{
          lineNumbers: true,
          mode: "text/css",
          matchBrackets: true,
      //viewportMargin: 'Infinity'
    });
    editor.on('change', function(){
        
        me.valid = false;
    });

    // Mips emulator setup.
    $(".registers-container li").each(function(index){
        var reg = $(this);
        var reg_name = reg.attr('id');
        reg.html(
            "<b>"+reg_name +":</b> " 
            + "<span class='reg_spacer' id='"+reg_name+"-val' contenteditable='true'>"
            + me.getRegister(reg_name)
            + "</span>"
        );
    });
    $('.reg_spacer').on('input', function(e){
        var new_val = $(e.target).html();
        var target =  $(e.target);
        if(new_val.search(/[\D\s]/) >= 0){
            target.html(new_val.replace(/[\D\s]/g, ''));
            alert("You cannot enter in characters into registers");
        }
        if(new_val.length > 11){
            target.html(new_val.substring(0, 11));
            alert("The 32 bit integers can only be 11 digits long.");

        }
    });
    // Step throught emulator function
    var active_line;
    var next_line;
    var active_marker, next_marker;
    $("#step").click(function(){
        // if this code is no longer valid, reanalyze.
        if(!me.valid){
            editor.save();
            me.setCode($("#editor").val());
            me.valid = true;
        }

        line_result = me.step();
        if(line_result){
            active_line = line_result.line_ran;
            next_line = line_result.next_line;
            console.log("Active line: " + active_line);
            console.log("Next line: " + next_line);
            
            //$(".active_line").removeClass('active_line');
            //$(".next_line").removeClass('next_line');
            if(active_marker) active_marker.clear();
            active_marker = editor.markText(
                {line: active_line-1, ch: 0},
                {line: active_line, ch: 0},
                {title: "last line ran", className: 'active_line'}
            );
            if(next_marker) next_marker.clear();
            next_marker = editor.markText(
                {line: next_line-1, ch: 0},
                {line: next_line, ch: 0},
                {title: "Next line to be run", className: 'next_line'}
            );
        }
    });

    // Run code non-stop function
    $("#run").click(function(){
        // if this code is no longer valid, reanalyze.
        if(!me.valid){
            editor.save();
            me.setCode($("#editor").val());
            me.valid = true;
        } 
      // TODO: hook this up to a mips engine
      alert("Run Fucntion here");
    });

});


function setEndOfContenteditable(contentEditableElement)
{
    var range,selection;
    if(document.createRange)//Firefox, Chrome, Opera, Safari, IE 9+
    {
        range = document.createRange();//Create a range (a range is a like the selection but invisible)
        range.selectNodeContents(contentEditableElement);//Select the entire contents of the element with the range
        range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
        selection = window.getSelection();//get the selection object (allows you to change selection)
        selection.removeAllRanges();//remove any selections already made
        selection.addRange(range);//make the range you have just created the visible selection
    }
    else if(document.selection)//IE 8 and lower
    { 
        range = document.body.createTextRange();//Create a range (a range is a like the selection but invisible)
        range.moveToElementText(contentEditableElement);//Select the entire contents of the element with the range
        range.collapse(false);//collapse the range to the end point. false means collapse to end rather than the start
        range.select();//Select the range (make it the visible selection
    }
}
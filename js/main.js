$(document).ready(function(){

    // Code Mirror setup
    var me = mips_emulator({
        debug: true,
        onRegisterChange: function(reg_name, value){
            var reg = $("#" + reg_name.replace('$', '') + " .reg_spacer");
            $(".last_reg_changed").removeClass('last_reg_changed');
            reg.html(value);
            reg.addClass('last_reg_changed');
            // change to correct tab
            var reg_letter = reg_name.replace('$', '').replace(/\s/, '').charAt(0);
            $('#registers a[href="#'+reg_letter+'-registers"]').tab('show')
        },
        onFinish: function(){
            alert("Emulation complete, returning to line 1");
            me.setLine(1);
            set_highlights({line_ran: active_line, next_line: me.get_line_number()})
        },
        starting_code: $("#editor").val()
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
            + "<span class='reg_spacer' reg='"+reg_name+"' id='"+reg_name+"-val' contenteditable='true'>"
            + me.getRegister(reg_name)
            + "</span>"
        );
    });
    $('.reg_spacer').on('input', function(e){
        var new_val = $(e.target).html();
        var target =  $(e.target);
        var reg_name = target.attr("reg");
        if(new_val.search(/[\D\s]/) >= 0){
            target.html(new_val.replace(/[\D\s]/g, ''));
            alert("You cannot enter in characters into registers");
        }
        if(new_val.length > 11){
            target.html(new_val.substring(0, 11));
            alert("The 32 bit integers can only be 11 digits long.");
        }
        
        return true;
    });
    $('.reg_spacer').on('blur', function(e){
        var new_val = $(e.target).html();
        var target =  $(e.target);
        var reg_name = target.attr("reg");
        me.setRegister(reg_name, Number(new_val), false);
    });
    $('#code_loaders button').on('click', function(e){
        var target = $(e.target);
        var load_target = target.attr('load');
        var new_content = $(load_target).html();
        editor.setValue(new_content);
        me.valid = false;
    });
    // Step throught emulator function 
    $("#step").click(function(){
        // if this code is no longer valid, reanalyze.
        if(!me.valid){
            editor.save();
            me.setCode($("#editor").val());
            me.valid = true;
        }

        line_result = me.step();
        if(line_result){
           set_highlights(line_result);
        }
    });
    $("#go_to_line_button").on('click', function(){
        var new_line = $("#current_line_input").val();
        console.log("Setting new line: "+ new_line);
        me.setLine(Number(new_line));
        console.log("next_line"+ me.get_line_number());
        set_highlights({line_ran: null, next_line: me.get_line_number()})
        return false;
    });
    var active_line;
    var next_line;
    var active_marker
    var next_marker = editor.markText(
        {line: 0, ch: 0},
        {line: 1, ch: 0},
        {title: "Next line to be run", className: 'next_line'}
    );
    function set_highlights(lines){
        active_line = lines.line_ran;
        next_line = lines.next_line;
        console.log("Active line: " + active_line);
        console.log("Next line: " + next_line);
        $("#current_line_input").val(next_line);
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
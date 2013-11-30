$(document).ready(function(){

    ///////////////////////////////////////////////////
    // Mips Emulator Setup
    ///////////////////////////////////////////////////
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
    var active_line;
    var next_line;
    
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
    editor.on('change', mark_editor_as_invalid);
    
    // Keeps track of the last line we ran. To start with we want it
    // to be null becuase we have not run anything yet.
    var last_run_marker;
    // Keeps track of the next line we will run, we want to set it to the 
    // first valid line.
    var next_marker = editor.markText(
        {line: me.get_line_number()-1, ch: 0},
        {line: me.get_line_number(), ch: 0},
        {title: "Next line to be run", className: 'next_line'}
    );

    ///////////////////////////////////////////////////
    // Event Handlers setup
    ///////////////////////////////////////////////////
    $(".registers-container li").each(setup_registers);
    $('.reg_spacer').on('input', manual_registry_validate);
    $('.reg_spacer').on('blur', manual_registry_edit_save);
    $('#code_loaders button').on('click', load_custom_code);
    $("#step").click(step);
    $("#go_to_line_button").on('click', set_line);
    $("#run").click(run);

    // Functions to respond to events.
    function set_line(){
        var new_line = $("#current_line_input").val();
        console.log("Setting new line: "+ new_line);
        me.setLine(Number(new_line));
        console.log("next_line"+ me.get_line_number());
        set_highlights({line_ran: null, next_line: me.get_line_number()})
        return false;
    };
    function mark_editor_as_invalid(){
        me.valid = false;
    };
    function step(){
        // if this code is no longer valid, reanalyze.
        if(!me.valid){
            mips_analyze();
        }

        line_result = me.step();
        if(line_result){
           set_highlights(line_result);
        }
    };
    function load_custom_code(e){
        if(!confirm("This will erase what is in the code editor, are you sure?")) return;
        var target = $(e.target);
        var load_target = target.attr('load');
        var new_content = $(load_target).html();
        new_content = new_content.replace(/^\s+|\s+$/g, '');
        new_content = new_content.replace(/\n\s+/g, '\n');
        editor.setValue(new_content);
        mips_analyze();
        set_highlights();
    };
    function manual_registry_edit_save(e){
        var new_val = $(e.target).html();
        var target =  $(e.target);
        var reg_name = target.attr("reg");
        me.setRegister(reg_name, Number(new_val), false);
    };
    function manual_registry_validate(e){
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
    };
    function set_highlights(lines){
        lines = lines || {};
        active_line = lines.line_ran || null;
        next_line = lines.next_line || me.get_line_number();
        console.log("Active line: " + active_line);
        console.log("Next line: " + next_line);
        $("#current_line_input").val(next_line);
        //$(".active_line").removeClass('active_line');
        //$(".next_line").removeClass('next_line');
        if(last_run_marker) last_run_marker.clear();
        last_run_marker = editor.markText(
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

    };
    function setup_registers(index){
        var reg = $(this);
        var reg_name = reg.attr('id');
        reg.html(
            "<b>"+reg_name +":</b> " 
            + "<span class='reg_spacer' reg='"+reg_name+"' id='"+reg_name+"-val' contenteditable='true'>"
            + me.getRegister(reg_name)
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
        // TODO: hook this up to a mips engine
        alert("Run Fucntion here");
    };
    function mips_analyze(){
        editor.save();
        me.setCode($("#editor").val());
        me.valid = true;
    };
    function get_code_as_string(){
        editor.save();
        return $("#editor").val();
    };
});

$(document).ready(function(){
    var me = mips_emulator();
    // The next time we go to step or run, we need to reset the code from the text editor.
    me.outdated = true; 
    console.log("Editor value: "+$("#editor").val());
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
    $("#step").click(function(){
        // if this code is no longer valid, reanalyze.
        if(!me.valid){
            editor.save();
            me.setCode($("#editor").val());
            me.valid = true;
        } 
      // TODO: hook this up to a mips engine
      alert("Step through function here");
    });
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
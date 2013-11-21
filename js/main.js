$(document).ready(function(){
    var me = mips_emulator();
    console.log("Editor value: "+$("#editor").val());
    var editor = CodeMirror.fromTextArea(
        document.getElementById("editor"),{
          lineNumbers: true,
          mode: "text/css",
          matchBrackets: true,
      //viewportMargin: 'Infinity'
    });
    editor.on('blur', function(){
        alert('Analyzing code');
        me.setCode($("#editor").val());
    });
    $("#step").click(function(){
      // TODO: hook this up to a mips engine
      alert("Step through function here");
    });
    $("#run").click(function(){
      // TODO: hook this up to a mips engine
      alert("Run Fucntion here");
    });
});
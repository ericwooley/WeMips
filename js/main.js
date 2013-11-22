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

// TODO: these should probably be moved to a UI related file
function generateRegNames(prefix, startIndex, endIndex) {
    var result = [];
    for (var i = startIndex; i <= endIndex; i++) {
        result.push(prefix + i);
    }   
    return result;
}

function buildRegisterColumn(columns) {
    var result = [];
    for (var i = 0; i < columns.length; i++) {
        var column = columns[i];
        if (typeof column === 'string') {
            result.push(column);
        } else {
            // column is an array
            for (var j = 0; j < column.length; j++) {
                result.push(column[j]);
            };
        }
    };
    return result;
}

function buildRegistersTable() {
    // each column should have 8 registers. 0, 8, 16, 24
    var rows = [];
    rows.push(buildRegisterColumn([
        'zero', 
        'at',
        generateRegNames('v', 0, 1),
        generateRegNames('a', 0, 3), 
    ]));
    rows.push(buildRegisterColumn([
        generateRegNames('t', 0, 7)
    ]));
    rows.push(buildRegisterColumn([
        generateRegNames('s', 0, 7),
    ]));
    rows.push(buildRegisterColumn([
        generateRegNames('t', 8, 9), 
        generateRegNames('k', 0, 1),
        'gp',
        'sp',
        'fp',
        'ra'
    ]));

    // rows contains an array of arrays of strings
    $table = $('<table>');
    var rowLength = rows[0].length;
    for (var c = 0; c < rowLength; c++) {
        //var col = row[c]; // string
        $tr = $('<tr>');

        for (var r = 0; r < rows.length; r++) {
            var regName = rows[r][c]; // array
            $th = $('<th>');
            $th.text(regName);
            $th.appendTo($tr);

            $td = $('<td>');
            $td.text('0');
            $td.appendTo($tr);
        };

        $tr.appendTo($table);
    };
    $('#registers').empty();
    $table.appendTo('#registers');
}

buildRegistersTable();

CodeMirror.defineMode("mips", function() {
  function words(str) {
    var obj = {}, words = str.split(" ");
    for (var i = 0; i < words.length; ++i) obj[words[i]] = true;
    return obj;
  }
  var keywords = words("ADD ADDI ADDU ADDIU SUB SUBU LUI AND ANDI NOR OR ORI SLL SRL " +
                       "BEQ BNE J JAL JR LW SW LH LHU SH LB LBU SB SLT SLTI SLTU SLTIU SYSCALL");
  var atoms = words("$zero $at $v0 $v1 $a0 $a1 $a2 $a3 " +
                    "$t0 $t1 $t2 $t3 $t4 $t5 $t6 $t7 " +
                    "$s0 $s1 $s2 $s3 $s4 $s5 $s6 $s7 " +
                    "$t8 $t9 $k0 $k1 $gp $sp $fp $ra");


  var isOperatorChar = /[+\-*&%=<>!?|\/]/;

  function tokenBase(stream, state) {
    var startOfLine = stream.sol();
    var ch = stream.next();
    if (ch == "#") {
      stream.skipToEnd();
      return "comment";
    }
    // if (ch == "#" && state.startOfLine) {
    //   stream.skipToEnd();
    //   return "meta";
    // }
    // if (ch == '"' || ch == "'") {
    //   state.tokenize = tokenString(ch);
    //   return state.tokenize(stream, state);
    // }
    // if (ch == "(" && stream.eat("*")) {
    //   state.tokenize = tokenComment;
    //   return tokenComment(stream, state);
    // }
    if (/[\[\]{}\(\),;\:\.]/.test(ch)) {
      return null;
    }
    if (isOperatorChar.test(ch)) {
      stream.eatWhile(isOperatorChar);
      return "operator";
    }

    stream.eatWhile(/[\w\$_]/);
    var cur = stream.current();

    if (/^\d+\b$/.test(cur)) {
      return "number";
    }
    if (/^\d.+$/.test(cur)) {
      return null; // e.g. 2foo
    }

    if (startOfLine && /[A-Za-z_]\w*/.test(cur)) { // TODO: should also match those that are prefixed with white space
      if (stream.eat(":")) { // TODO: whitespace can come before the ":" symbol (e.g. "foo :" should match)
        // this is a label
        return "meta";
      }
    }

    if (keywords.propertyIsEnumerable(cur.toUpperCase())) return "keyword";
    if (atoms.propertyIsEnumerable(cur)) return "atom";
    return "variable";
  }

  // function tokenString(quote) {
  //   return function(stream, state) {
  //     var escaped = false, next, end = false;
  //     while ((next = stream.next()) != null) {
  //       if (next == quote && !escaped) {end = true; break;}
  //       escaped = !escaped && next == "\\";
  //     }
  //     if (end || !escaped) state.tokenize = null;
  //     return "string";
  //   };
  // }

  // function tokenComment(stream, state) {
  //   var maybeEnd = false, ch;
  //   while (ch = stream.next()) {
  //     if (ch == ")" && maybeEnd) {
  //       state.tokenize = null;
  //       break;
  //     }
  //     maybeEnd = (ch == "*");
  //   }
  //   return "comment";
  // }

  // Interface

  return {
    startState: function() {
      return {tokenize: null};
    },

    token: function(stream, state) {
      if (stream.eatSpace()) return null;
      var style = (state.tokenize || tokenBase)(stream, state);
      if (style == "comment" || style == "meta") return style;
      return style;
    },

    electricChars: "{}"
  };
});

CodeMirror.defineMIME("text/x-mips", "mips");
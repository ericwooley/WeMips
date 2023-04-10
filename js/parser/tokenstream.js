Parser.TokenStream = function(lexer) {
    this.lexer = lexer;
    this.token = undefined;

    this.peekToken = function() {
        if (this.token == undefined) {
            this.token = this.lexer.next();
        }
        return this.token;
    }

    this.checkNext = function(type) {
        let token = this.peekToken();
        return (token.type == type);
    }

    this.nextToken = function() {
        this.token = this.lexer.next();
        return this.token;
    }

    this.consume = function(type) {
        let token = this.peekToken();
        if (type && token.type != type) {
            throw new Parser.ParseError('Expected \''+type+'\', got \''+token.type+'\'', token);
        }
        this.nextToken();
        return token;
    }
}

Parser.tokenStreamFromString = function(input) {
    let lexer = new Parser.Lexer(input);
    return new Parser.TokenStream(lexer);
}

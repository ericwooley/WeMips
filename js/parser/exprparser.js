Parser.BinaryOperators = {}
Parser.BinaryOperators[Parser.Tokens.BitwiseOR] = {
    evaluate: function(left, right) { return left | right; },
    precedence: 13
}
Parser.BinaryOperators[Parser.Tokens.BitwiseXOR] = {
    evaluate: function(left, right) { return left ^ right; },
    precedence: 12
}
Parser.BinaryOperators[Parser.Tokens.BitwiseAND] = {
    evaluate: function(left, right) { return left & right; },
    precedence: 11
}
Parser.BinaryOperators[Parser.Tokens.LogicalShiftLeft] = {
    evaluate: function(left, right) { return left << right; },
    precedence: 7
}
Parser.BinaryOperators[Parser.Tokens.LogicalShiftRight] = {
    evaluate: function(left, right) { return left >>> right; },
    precedence: 7
}
Parser.BinaryOperators[Parser.Tokens.ArithmeticShiftRight] = {
    evaluate: function(left, right) { return left >> right; },
    precedence: 7
}
Parser.BinaryOperators[Parser.Tokens.Addition] = {
    evaluate: function(left, right) { return left + right; },
    precedence: 6
}
Parser.BinaryOperators[Parser.Tokens.Subtraction] = {
    evaluate: function(left, right) { return left - right; },
    precedence: 6
}
Parser.BinaryOperators[Parser.Tokens.Multiplication] = {
    evaluate: function(left, right) { return left * right; },
    precedence: 5
}
Parser.BinaryOperators[Parser.Tokens.Division] = {
    evaluate: function(left, right) { return Math.trunc(left / right); },
    precedence: 5
}
Parser.BinaryOperators[Parser.Tokens.Remainder] = {
    evaluate: function(left, right) { return left % right; },
    precedence: 5
}

Parser.UnaryOperators = {}
Parser.UnaryOperators[Parser.Tokens.Addition] = {
    evaluate: function(op) { return op; }
}
Parser.UnaryOperators[Parser.Tokens.Subtraction] = {
    evaluate: function(op) { return -op; }
}
Parser.UnaryOperators[Parser.Tokens.BitwiseNOT] = {
    evaluate: function(op) { return ~op; }
}

Parser.Builtins = {
    'lo16': {
        evaluate: function(op) { return op[0] & 65535; }
    },
    'hi16': {
        evaluate: function(op) { return (op[0] >>> 16) & 65535; }
    },
}

Parser.exprParserFromString = function(input) {
    let tokenStream = Parser.tokenStreamFromString(input);
    return new Parser.ExprParser(tokenStream);
}

Parser.ExprParser = function(tokenStream) {
    this.tokenStream = tokenStream;

    this.parsePrimaryExpression = function() {
        if (this.tokenStream.checkNext(Parser.Tokens.LParen)) {
            this.tokenStream.consume();
            let expr = this.parseExpression();
            this.tokenStream.consume(Parser.Tokens.RParen);
            return expr;
        } else {
            let number = this.tokenStream.consume(Parser.Tokens.Number);
            return number.value;
        }
    }

    this.parsePostfixExpression = function() {
        let token= this.tokenStream.peekToken();
        if (token.type == Parser.Tokens.Identifier) {
            if (token.value in Parser.Builtins) {
                let builtin = Parser.Builtins[token.value];
                this.tokenStream.consume();
                this.tokenStream.consume(Parser.Tokens.LParen);
                let params = [this.parseExpression()];
                while (this.tokenStream.checkNext(Parser.Tokens.Comma)) {
                    this.tokenStream.consume();
                    params.push(this.parseExpression());
                }
                this.tokenStream.consume(Parser.Tokens.RParen);
                return builtin.evaluate(params);
            } else {
                throw new Parser.ParseError('Unknown builtin function', token);
            }
        } else {
            return this.parsePrimaryExpression();
        }
    }

    this.parseUnaryOperator = function() {
        let operator = this.tokenStream.peekToken();
        if (operator.type in Parser.UnaryOperators) {
            this.tokenStream.consume();
            return Parser.UnaryOperators[operator.type];
        } else {
            return undefined;
        }
    }

    this.parseUnaryExpression = function() {
        let operator = this.parseUnaryOperator();
        if (operator) {
            let operand = this.parseUnaryExpression();
            return operator.evaluate(operand);
        } else {
            return this.parsePostfixExpression();
        }
    }

    this.parseBinaryOperator = function() {
        let operator = this.tokenStream.peekToken();
        if (operator.type in Parser.BinaryOperators) {
            this.tokenStream.consume();
            return Parser.BinaryOperators[operator.type];
        } else {
            return undefined;
        }
    }

    this.parseBinaryExpression = function() {
        let lhs = this.parseUnaryExpression();
        let leftOperator = this.parseBinaryOperator();
        if (leftOperator) {
            let rhs = this.parseUnaryExpression();
            let operands = [];
            let operators = [];
            let rightOperator = this.parseBinaryOperator();

            while (rightOperator) {
                if (rightOperator.precedence < leftOperator.precedence) {
                    /* Must evaluate the right side first => push */
                    operands.push(lhs);
                    operators.push(leftOperator);
                    lhs = rhs;
                } else {
                    /* No right side or left side has higher precedence => evaluate left side */
                    lhs = leftOperator.evaluate(lhs, rhs);
                }
                leftOperator = rightOperator;
                rhs = this.parseUnaryExpression();
                rightOperator = this.parseBinaryOperator();
            }

            /* Perform all the pending operations */
            while (leftOperator) {
                rhs = leftOperator.evaluate(lhs, rhs);
                lhs = operands.pop();
                leftOperator = operators.pop();
            }

            return rhs;
        } else {
            return lhs;
        }
    }

    this.parseExpression = function() {
        return this.parseBinaryExpression();
    }
}

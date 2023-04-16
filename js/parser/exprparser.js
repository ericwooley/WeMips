/** A dictionary of binary operator token types, their associated precedence and evaluation functions */
Parser.BinaryOperators = {}
Parser.BinaryOperators[Parser.TokenType.LogicalOR] = {
    evaluate: function(left, right) { return left || right; },
    precedence: 15
}
Parser.BinaryOperators[Parser.TokenType.LogicalAND] = {
    evaluate: function(left, right) { return left && right; },
    precedence: 14
}
Parser.BinaryOperators[Parser.TokenType.BitwiseOR] = {
    evaluate: function(left, right) { return left | right; },
    precedence: 13
}
Parser.BinaryOperators[Parser.TokenType.BitwiseXOR] = {
    evaluate: function(left, right) { return left ^ right; },
    precedence: 12
}
Parser.BinaryOperators[Parser.TokenType.BitwiseAND] = {
    evaluate: function(left, right) { return left & right; },
    precedence: 11
}
Parser.BinaryOperators[Parser.TokenType.Equals] = {
    evaluate: function(left, right) { return left == right; },
    precedence: 10
}
Parser.BinaryOperators[Parser.TokenType.NotEquals] = {
    evaluate: function(left, right) { return left != right; },
    precedence: 10
}
Parser.BinaryOperators[Parser.TokenType.LessThan] = {
    evaluate: function(left, right) { return left < right; },
    precedence: 9
}
Parser.BinaryOperators[Parser.TokenType.LessEqual] = {
    evaluate: function(left, right) { return left <= right; },
    precedence: 9
}
Parser.BinaryOperators[Parser.TokenType.GreaterThan] = {
    evaluate: function(left, right) { return left > right; },
    precedence: 9
}
Parser.BinaryOperators[Parser.TokenType.GreaterEqual] = {
    evaluate: function(left, right) { return left >= right; },
    precedence: 9
}
Parser.BinaryOperators[Parser.TokenType.LogicalShiftLeft] = {
    evaluate: function(left, right) { return left << right; },
    precedence: 7
}
Parser.BinaryOperators[Parser.TokenType.LogicalShiftRight] = {
    evaluate: function(left, right) { return left >>> right; },
    precedence: 7
}
Parser.BinaryOperators[Parser.TokenType.ArithmeticShiftRight] = {
    evaluate: function(left, right) { return left >> right; },
    precedence: 7
}
Parser.BinaryOperators[Parser.TokenType.Addition] = {
    evaluate: function(left, right) { return left + right; },
    precedence: 6
}
Parser.BinaryOperators[Parser.TokenType.Subtraction] = {
    evaluate: function(left, right) { return left - right; },
    precedence: 6
}
Parser.BinaryOperators[Parser.TokenType.Multiplication] = {
    evaluate: function(left, right) { return left * right; },
    precedence: 5
}
Parser.BinaryOperators[Parser.TokenType.Division] = {
    evaluate: function(left, right) { return Math.trunc(left / right); },
    precedence: 5
}
Parser.BinaryOperators[Parser.TokenType.Remainder] = {
    evaluate: function(left, right) { return left % right; },
    precedence: 5
}

/** A dictionary of unary operator token types and their evaluation functions */
Parser.UnaryOperators = {}
Parser.UnaryOperators[Parser.TokenType.Addition] = function(op) { return op; };
Parser.UnaryOperators[Parser.TokenType.Subtraction] = function(op) { return -op; };
Parser.UnaryOperators[Parser.TokenType.BitwiseNOT] = function(op) { return ~op; };

/** A dictionary of builtin function names and their evaluation functions */
Parser.Builtins = {
    'lo16': function(op) { return op[0] & 65535; },
    'hi16': function(op) { return (op[0] >>> 16) & 65535; }
}

/** Parser for (constant) expressions
 * @constructor
 * @param {Parser.TokenStream}  tokenStream The stream of tokens to parse
 */
Parser.ExprParser = function(tokenStream) {
    this.tokenStream = tokenStream;

    /** Parse a primary expression
     * A primary expression is a number literal or a parenthesized expression.
     * @returns {number} The value of the expression
     */
    this.parsePrimaryExpression = function() {
        if (this.tokenStream.checkNext(Parser.TokenType.LParen)) {
            this.tokenStream.consume();
            let expr = this.parseExpression();
            this.tokenStream.consume(Parser.TokenType.RParen);
            return expr;
        } else {
            let number = this.tokenStream.consume(Parser.TokenType.Number);
            return number.value;
        }
    }

    /** Parse a postfix expression
     * A postfix expression is a builtin function call or a primary expression.
     * @returns {number} The value of the expression
     */
    this.parsePostfixExpression = function() {
        let token= this.tokenStream.lookahead();
        if (token.type == Parser.TokenType.Identifier) {
            if (token.value in Parser.Builtins) {
                let builtinFunction = Parser.Builtins[token.value];
                this.tokenStream.consume();
                this.tokenStream.consume(Parser.TokenType.LParen);
                let params = [this.parseExpression()];
                while (this.tokenStream.checkNext(Parser.TokenType.Comma)) {
                    this.tokenStream.consume();
                    params.push(this.parseExpression());
                }
                this.tokenStream.consume(Parser.TokenType.RParen);
                return builtinFunction(params);
            } else {
                throw new Parser.ParseError('Unknown builtin function', token);
            }
        } else {
            return this.parsePrimaryExpression();
        }
    }

    /** Parse an optional unary operator
     * @returns {(function|undefined)} The function used to evaluate the operator,
     *          or undefined if no operator is present.
     */
    this.parseUnaryOperator = function() {
        let operator = this.tokenStream.lookahead();
        if (operator.type in Parser.UnaryOperators) {
            this.tokenStream.consume();
            return Parser.UnaryOperators[operator.type];
        } else {
            return undefined;
        }
    }

    /** Parse an unary expression
     * An unary expression is either a unary operator followed by an unary expression or a postfix expression.
     * @returns {number} The value of the expression
     */
    this.parseUnaryExpression = function() {
        let operator = this.parseUnaryOperator();
        if (operator) {
            let operand = this.parseUnaryExpression();
            return operator(operand);
        } else {
            return this.parsePostfixExpression();
        }
    }

    /** Parse an optional binary operator
     * @returns {(Object|undefined)} The description of the binary operator,
     *          or undefined if no operator is present.
     */
    this.parseBinaryOperator = function() {
        let operator = this.tokenStream.lookahead();
        if (operator.type in Parser.BinaryOperators) {
            this.tokenStream.consume();
            return Parser.BinaryOperators[operator.type];
        } else {
            return undefined;
        }
    }

    /** Parse a binary expression
     * A binary expression is either an unary expression or a binary expression followed by a binary operator and another binary expression.
     * 
     * Precedence of operations is taken into account.
     * 
     * @returns {number} The value of the expression
     */
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

    this.parseConditionalExpression = function() {
        let cond = this.parseBinaryExpression();
        if (this.tokenStream.checkNext(Parser.TokenType.QuestionMark)) {
            this.tokenStream.consume();
            let trueValue = this.parseExpression();
            this.tokenStream.consume(Parser.TokenType.Colon);
            let falseValue = this.parseConditionalExpression();
            return (cond?trueValue:falseValue);
        } else {
            return cond;
        }
    }

    /** Parse an expression
     * An expression is a binary expression.
     * 
     * This function is here to allow extension by other expression types.
     * Use this function instead of the more specific functions if you want to 
     * parse general expressions.
     * 
     * @returns {number} The value of the expression
     */
    this.parseExpression = function() {
        return this.parseConditionalExpression();
    }
}

/** Create an {@link Parser.ExprParser} from a string
 * @param {string}  input The string to parse
 * @returns {Parser.ExprParser} The expression parser for parsing the string
 */
Parser.exprParserFromString = function(input) {
    let tokenStream = Parser.tokenStreamFromString(input);
    return new Parser.ExprParser(tokenStream);
}

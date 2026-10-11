// VULN-3 (fixed): no more eval() on user-controlled input.
// We only accept simple arithmetic expressions (numbers, + - * / % and parentheses)
// and evaluate them with a small, safe recursive-descent parser instead of eval().

function safeEvaluate(expr) {
    // Whitelist: digits, whitespace, decimal point, parentheses and + - * / %
    if (!/^[0-9+\-*/%().\s]+$/.test(expr)) {
        throw new Error("Invalid characters in expression");
    }

    let pos = 0;

    function peek() {
        return expr[pos];
    }

    function skipWhitespace() {
        while (pos < expr.length && /\s/.test(expr[pos])) pos++;
    }

    function parseNumber() {
        skipWhitespace();
        const start = pos;
        while (pos < expr.length && /[0-9.]/.test(expr[pos])) pos++;
        if (start === pos) throw new Error("Expected number");
        const num = parseFloat(expr.slice(start, pos));
        if (Number.isNaN(num)) throw new Error("Invalid number");
        return num;
    }

    function parseFactor() {
        skipWhitespace();
        if (peek() === "(") {
            pos++; // consume '('
            const value = parseExpression();
            skipWhitespace();
            if (peek() !== ")") throw new Error("Expected closing parenthesis");
            pos++; // consume ')'
            return value;
        }
        if (peek() === "-") {
            pos++;
            return -parseFactor();
        }
        if (peek() === "+") {
            pos++;
            return parseFactor();
        }
        return parseNumber();
    }

    function parseTerm() {
        let value = parseFactor();
        skipWhitespace();
        while (peek() === "*" || peek() === "/" || peek() === "%") {
            const op = peek();
            pos++;
            const rhs = parseFactor();
            if (op === "*") value *= rhs;
            else if (op === "/") value /= rhs;
            else value %= rhs;
            skipWhitespace();
        }
        return value;
    }

    function parseExpression() {
        let value = parseTerm();
        skipWhitespace();
        while (peek() === "+" || peek() === "-") {
            const op = peek();
            pos++;
            const rhs = parseTerm();
            if (op === "+") value += rhs;
            else value -= rhs;
            skipWhitespace();
        }
        return value;
    }

    const result = parseExpression();
    skipWhitespace();
    if (pos !== expr.length) throw new Error("Unexpected trailing characters");
    return result;
}

export async function GET(req) {
    if (process.env.DEMO_UNSAFE !== "1") return new Response("Not Found", { status: 404 });
    const url = new URL(req.url);
    const expr = url.searchParams.get("expr") || "1+1";
    try {
        const result = safeEvaluate(expr);
        return Response.json({ result });
    } catch (e) {
        return Response.json({ error: "Invalid expression" }, { status: 400 });
    }
}

// VULN-3 (fixed): no more eval() on user-controlled input.
// A minimal, safe arithmetic expression evaluator is used instead.
// Only digits, decimal points, parentheses and + - * / % are allowed.

function safeEvaluate(expr) {
    // Reject anything that is not a pure arithmetic expression.
    if (typeof expr !== "string" || expr.length === 0 || expr.length > 200) {
        throw new Error("Invalid expression");
    }
    if (!/^[0-9+\-*/%.()\s]+$/.test(expr)) {
        throw new Error("Invalid expression");
    }

    let pos = 0;

    function peek() {
        return expr[pos];
    }

    function skipSpaces() {
        while (pos < expr.length && /\s/.test(expr[pos])) pos++;
    }

    function parseNumber() {
        skipSpaces();
        const start = pos;
        if (peek() === "+" || peek() === "-") pos++;
        let sawDigitOrDot = false;
        while (pos < expr.length && /[0-9.]/.test(expr[pos])) {
            pos++;
            sawDigitOrDot = true;
        }
        if (!sawDigitOrDot) throw new Error("Invalid number");
        const numStr = expr.slice(start, pos);
        const value = Number(numStr);
        if (Number.isNaN(value)) throw new Error("Invalid number");
        return value;
    }

    function parseFactor() {
        skipSpaces();
        if (peek() === "(") {
            pos++; // consume '('
            const value = parseExpression();
            skipSpaces();
            if (peek() !== ")") throw new Error("Expected ')'");
            pos++; // consume ')'
            return value;
        }
        if (peek() === "-" || peek() === "+") {
            const sign = peek();
            pos++;
            const value = parseFactor();
            return sign === "-" ? -value : value;
        }
        return parseNumber();
    }

    function parseTerm() {
        let value = parseFactor();
        skipSpaces();
        while (peek() === "*" || peek() === "/" || peek() === "%") {
            const op = peek();
            pos++;
            const rhs = parseFactor();
            if (op === "*") value *= rhs;
            else if (op === "/") value /= rhs;
            else value %= rhs;
            skipSpaces();
        }
        return value;
    }

    function parseExpression() {
        let value = parseTerm();
        skipSpaces();
        while (peek() === "+" || peek() === "-") {
            const op = peek();
            pos++;
            const rhs = parseTerm();
            if (op === "+") value += rhs;
            else value -= rhs;
            skipSpaces();
        }
        return value;
    }

    const result = parseExpression();
    skipSpaces();
    if (pos !== expr.length) throw new Error("Unexpected trailing characters");
    if (!Number.isFinite(result)) throw new Error("Invalid result");
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

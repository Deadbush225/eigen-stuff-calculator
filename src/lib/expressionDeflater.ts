import { type characteristicPolynomial } from "./math";

// === TYPES ===
type Token = { type: 'NUM' | 'VAR' | 'OP' | 'LPAREN' | 'RPAREN', value: string };
type Poly = number[]; // [1, -1] means 1x - 1 (stored as ASC or DESC? Let's use ASC internally [const, x, x^2...])

/**
 * Standard Robust Parser using Shunting-Yard Algorithm
 */
function expandPolynomialManual(equation: string): characteristicPolynomial {
    try {
        // 1. Tokenize (Turn string into list of safe tokens)
        const tokens = tokenize(equation);
        
        // 2. Convert to RPN (Reverse Polish Notation) - Handles Order of Operations
        const rpn = shuntingYard(tokens);
        
        // 3. Evaluate RPN using Polynomial Arithmetic
        const finalPolyAsc = evaluateRPN(rpn);

        // 4. Format Output (Convert ASC [const, x...] to DESC [x^n...])
        const finalPolyDesc = [...finalPolyAsc].reverse();
        
        // Cleanup leading zeros (high power terms that cancelled out)
        while (finalPolyDesc.length > 1 && Math.abs(finalPolyDesc[0]) < 1e-9) {
            finalPolyDesc.shift();
        }

        return {
            expression: buildPolyString(finalPolyDesc),
            coefficients: finalPolyDesc,
            variables: ['x']
        };
    } catch (e) {
        console.error("Polynomial Parse Error:", e);
        return { expression: "Error", coefficients: [], variables: ['x'] };
    }
}

// ==========================================
// PHASE 1: TOKENIZER
// ==========================================
function tokenize(input: string): Token[] {
    const tokens: Token[] = [];
    // Remove spaces
    const str = input.replace(/\s+/g, '');
    
    let i = 0;
    while (i < str.length) {
        const char = str[i];

        // 1. Numbers (integers or decimals)
        if (/\d/.test(char)) {
            let numStr = char;
            while (i + 1 < str.length && /[\d\.]/.test(str[i+1])) {
                numStr += str[++i];
            }
            tokens.push({ type: 'NUM', value: numStr });
            // Check for implicit multiplication: "2x" or "2("
            if (i + 1 < str.length && (str[i+1] === 'x' || str[i+1] === '(')) {
                 tokens.push({ type: 'OP', value: '*' });
            }
        } 
        // 2. Variable 'x'
        else if (char === 'x') {
            tokens.push({ type: 'VAR', value: 'x' });
            // Check for implicit multiplication: "x("
            if (i + 1 < str.length && str[i+1] === '(') {
                 tokens.push({ type: 'OP', value: '*' });
            }
        }
        // 3. Operators
        else if (['+', '-', '*', '^'].includes(char)) {
            // Handle Unary Minus (negative sign at start or after another operator)
            // e.g. "-x" or "(-5)" or "^-1"
            if (char === '-' && (tokens.length === 0 || tokens[tokens.length-1].type === 'OP' || tokens[tokens.length-1].type === 'LPAREN')) {
                tokens.push({ type: 'NUM', value: '-1' });
                tokens.push({ type: 'OP', value: '*' });
            } else {
                tokens.push({ type: 'OP', value: char });
            }
        }
        // 4. Parentheses
        else if (char === '(') {
            tokens.push({ type: 'LPAREN', value: '(' });
        }
        else if (char === ')') {
            tokens.push({ type: 'RPAREN', value: ')' });
            // Check for implicit multiplication: ")(..." or ")x"
            if (i + 1 < str.length && (str[i+1] === '(' || str[i+1] === 'x')) {
                 tokens.push({ type: 'OP', value: '*' });
            }
        }
        i++;
    }
    return tokens;
}

// ==========================================
// PHASE 2: SHUNTING-YARD (Infix -> Postfix)
// ==========================================
function shuntingYard(tokens: Token[]): Token[] {
    const outputQueue: Token[] = [];
    const operatorStack: Token[] = [];

    const precedence: Record<string, number> = {
        '+': 2, '-': 2,
        '*': 3,
        '^': 4
    };
    const associativity: Record<string, 'Left' | 'Right'> = {
        '+': 'Left', '-': 'Left',
        '*': 'Left',
        '^': 'Right'
    };

    tokens.forEach(token => {
        if (token.type === 'NUM' || token.type === 'VAR') {
            outputQueue.push(token);
        } else if (token.type === 'OP') {
            while (operatorStack.length > 0) {
                const top = operatorStack[operatorStack.length - 1];
                if (top.type !== 'OP') break;
                
                if ((associativity[token.value] === 'Left' && precedence[token.value] <= precedence[top.value]) ||
                    (associativity[token.value] === 'Right' && precedence[token.value] < precedence[top.value])) {
                    outputQueue.push(operatorStack.pop()!);
                } else {
                    break;
                }
            }
            operatorStack.push(token);
        } else if (token.type === 'LPAREN') {
            operatorStack.push(token);
        } else if (token.type === 'RPAREN') {
            while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1].type !== 'LPAREN') {
                outputQueue.push(operatorStack.pop()!);
            }
            operatorStack.pop(); // Pop the left paren
        }
    });

    while (operatorStack.length > 0) {
        outputQueue.push(operatorStack.pop()!);
    }
    return outputQueue;
}

// ==========================================
// PHASE 3: EVALUATE RPN STACK
// ==========================================
function evaluateRPN(rpn: Token[]): Poly {
    const stack: Poly[] = [];

    rpn.forEach(token => {
        if (token.type === 'NUM') {
            stack.push([parseFloat(token.value)]); // Constant [c]
        } else if (token.type === 'VAR') {
            stack.push([0, 1]); // Variable x is [0, 1] (0 + 1x)
        } else if (token.type === 'OP') {
            const b = stack.pop()!;
            const a = stack.pop()!;
            
            switch (token.value) {
                case '+': stack.push(polyAdd(a, b)); break;
                case '-': stack.push(polySub(a, b)); break;
                case '*': stack.push(polyMultiply(a, b)); break;
                case '^': 
                    // Exponent must be a scalar constant for this simple parser
                    if (b.length > 1 || b[0] < 0) throw new Error("Only positive integer exponents supported");
                    stack.push(polyPower(a, Math.round(b[0]))); 
                    break;
            }
        }
    });

    return stack[0] || [0];
}

// ==========================================
// POLYNOMIAL MATH UTILS (coeffs in ASC order)
// ==========================================
function polyAdd(p1: Poly, p2: Poly): Poly {
    const len = Math.max(p1.length, p2.length);
    const res = new Array(len).fill(0);
    for (let i = 0; i < len; i++) res[i] = (p1[i]||0) + (p2[i]||0);
    return res;
}

function polySub(p1: Poly, p2: Poly): Poly {
    const len = Math.max(p1.length, p2.length);
    const res = new Array(len).fill(0);
    for (let i = 0; i < len; i++) res[i] = (p1[i]||0) - (p2[i]||0);
    return res;
}

function polyMultiply(p1: Poly, p2: Poly): Poly {
    const res = new Array(p1.length + p2.length - 1).fill(0);
    for (let i = 0; i < p1.length; i++) {
        for (let j = 0; j < p2.length; j++) {
            res[i+j] += p1[i] * p2[j];
        }
    }
    return res;
}

function polyPower(base: Poly, exp: number): Poly {
    if (exp === 0) return [1];
    let res = [1];
    for (let i = 0; i < exp; i++) res = polyMultiply(res, base);
    return res;
}

// ==========================================
// FORMATTER
// ==========================================
function buildPolyString(coeffs: number[]): string {
  if (coeffs.every(c => Math.abs(c) < 1e-9)) return "0";
  const degree = coeffs.length - 1;
  
  const terms = coeffs.map((coeff, index) => {
      if (Math.abs(coeff) < 1e-9) return ''; 
      const currentDegree = degree - index;
      const absCoeff = Math.abs(coeff);
      const sign = (coeff > 0) ? ' + ' : ' - ';
      
      let valueStr = parseFloat(absCoeff.toFixed(4)).toString(); 
      if (valueStr === '1' && currentDegree > 0) valueStr = ''; 

      let varStr = '';
      if (currentDegree === 1) varStr = 'x';
      else if (currentDegree > 0) varStr = `x^${currentDegree}`;

      return { sign, str: `${valueStr}${varStr}`, rawCoeff: coeff };
  }).filter(t => t !== '');

  return terms.map((t, i) => {
    if (i === 0) return t.rawCoeff < 0 ? `-${t.str}` : t.str;
    return `${t.sign}${t.str}`;
  }).join('');
}

export { expandPolynomialManual };
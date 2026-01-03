import { type Complex } from "mathjs";

// Helper functions to format mathematical content for LaTeX display

/**
 * Format matrix for LaTeX display
 */
function formatMatrixLatex(matrix: (string | number)[][]): string {
	const rows = matrix
		.map((row) =>
			row
				.map((cell) => {
					if (typeof cell === "string") {
						// Replace 'x' with proper LaTeX variable
						return cell.replace(/x/g, "\\lambda");
					}
					return cell.toString();
				})
				.join(" & ")
		)
		.join(" \\\\ ");

	return `\\begin{bmatrix} ${rows} \\end{bmatrix}`;
}

/**
 * Format expression for LaTeX display
 */
function formatExpressionLatex(expression: string): string {
	return expression
		.replace(/x/g, "\\lambda")
		.replace(/\*/g, "\\cdot")
		.replace(/\^(\d+)/g, "^{$1}");
	// .replace(/\(/g, '\\left(')
	// .replace(/\)/g, '\\right)');
}

function cleanExpressionLatex(expression: string): string {
	const final = expression
		.replace(/\\left/g, "")
		.replace(/\\right/g, "")
		.replace(/\\Bigl/g, "")
		.replace(/\\Bigr/g, "")
		.replace(/\\biggr/g, "")
		.replace(/\\biggl/g, "")
		.replace(/\\Biggl/g, "")
		.replace(/\\Biggr/g, "")
		.replace(/\\cdot/g, "*")
		.replace(/\\lambda/g, "x")
		.replace(/\\newline/g, "")
		.replace(/\[/g, "(")
		.replace(/\]/g, ")")
		.replace(/{/g, "")
		.replace(/}/g, "");
	console.log("CLEANED EXPRESSION:", final);
	return final;
}

/**
 * Format eigenvalues for LaTeX display
 */
function formatEigenvaluesLatex(eigenvalues: (number | Complex)[]): string {
	const formattedValues = eigenvalues.map((val) => {
		if (typeof val === "number") {
			return val.toFixed(4);
		} else {
			// Handle Complex numbers
			const complex = val as Complex;
			if (complex.im === 0) {
				return complex.re.toFixed(4);
			} else if (complex.re === 0) {
				return `${complex.im.toFixed(4)}i`;
			} else {
				const sign = complex.im >= 0 ? "+" : "-";
				return `${complex.re.toFixed(4)} ${sign} ${Math.abs(complex.im).toFixed(
					4
				)}i`;
			}
		}
	});

	return `\\sigma(A) = \\{${formattedValues.join(", ")}\\}`;
}

/**
 * Split LaTeX string into lines of ~200 characters, breaking at + or - operators
 */
function splitLatexByOperators(
	latex: string,
	maxLineLength: number = 1000
): string {
	const parts: string[] = [];
	let currentPart = "";

	for (let i = 0; i < latex.length; i++) {
		const char = latex[i];
		currentPart += char;

		// Check if we should break at + or - operators
		if ((char === "+" || char === "-") && currentPart.length >= maxLineLength) {
			// Don't break if this is the first character or if previous char is also an operator
			if (i > 0 && latex[i - 1] !== "+" && latex[i - 1] !== "-") {
				parts.push(currentPart);
				currentPart = "";
			}
		}
	}

	// Add remaining part if any
	if (currentPart.length > 0) {
		parts.push(currentPart);
	}

	return parts.join(" \\newline ");
}

function coefficientToPolynomial(coefficients: number[]): string {
	let polynomial = "";
	let degree = coefficients.length - 1;

	for (let i = 0; i < coefficients.length; i++) {
		if (coefficients[i] === 0) {
			degree--;
			continue;
		}

		// Add plus sign for positive coefficients (except the first term)
		if (i > 0 && coefficients[i] > 0) {
			polynomial += "+";
		}
		const term = coefficients[i].toString();
		const variable = `x^{${degree--}}`;
		polynomial += term + variable;
	}

	return polynomial;
}

export {
	formatMatrixLatex,
	formatExpressionLatex,
	formatEigenvaluesLatex,
	cleanExpressionLatex,
	splitLatexByOperators,
	coefficientToPolynomial,
};

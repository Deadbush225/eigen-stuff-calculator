import React from "react";
import "katex/dist/katex.min.css"; // Import CSS once in App or here
import katex from "katex";

interface MathProps {
	latex: string;
	block?: boolean; // true for centered $$...$$, false for inline
}

const MathDisplay: React.FC<MathProps> = ({ latex, block = false }) => {
	// 1. Generate HTML string using KaTeX logic
	// "throwOnError: false" renders the raw string instead of crashing if latex is invalid
	const html = katex.renderToString(latex, {
		throwOnError: false,
		displayMode: block,
	});

	// 2. Inject it safely
	return (
		<span
			dangerouslySetInnerHTML={{ __html: html }}
			style={{
				display: block ? "block" : "inline",
				textAlign: block ? "center" : "left",
			}}
			className={block ? "math-highlight" : ""}
		/>
	);
};

export default MathDisplay;

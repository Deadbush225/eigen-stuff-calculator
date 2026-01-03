import { create, all, type MathNode, type MathType } from "mathjs";
export const math = create(all);

export type LatexString = string;

export type characteristicPolynomial = {
	expression: MathNode | string;
	variables: string[];
	coefficients: MathType[];
};

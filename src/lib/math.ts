import { create, all, type MathNode, type MathType } from "mathjs";

export const math = create(all);

export type LatexString = string;

export type characteristicPolynomial = {
	expression: MathNode | string;
	variables: string[];
	coefficients: MathType[];
};

export type Eigenvalue = {
	value: number;
	multiplicity: number;
};

export type MatrixWString = (string | number)[][];
export type Matrix = number[][];
export type BasisVector = number[][];

export type Eigenspace = {
	eigenvalue: Eigenvalue;
	basis: BasisVector;
};

import { type Complex } from "mathjs";

export type BasisVector = (string | number)[][];
export type Eigenspace = {
	eigenvalue: number | Complex;
	basis: BasisVector;
};

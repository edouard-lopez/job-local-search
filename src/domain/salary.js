import { GOOD_SALARY_K } from "./thresholds.js";

/**
 * An offer's salary, as stated in the ad: { min, max, brut } in k€ per year.
 * brut is false when the ad gives a net amount or does not say.
 */
export const formatSalary = ({ min, max }) => (min === max || max == null ? `${min} k€` : `${min}-${max} k€`);
export const isGoodSalary = (s) => s.brut === true && s.min >= GOOD_SALARY_K;

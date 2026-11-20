const RULES = [
  [/CDI/i, "CDI"],
  [/CDD/i, "CDD"],
  [/intérim/i, "Intérim"],
  [/fonction/i, "Fonction publique"],
  [/freelance/i, "Freelance"],
  [/altern|apprent/i, "Alternance"],
];

/** Group a free-text contract ("CDD (6 mois)") into a filter category. */
export const contractCategory = (contract) => RULES.find(([re]) => re.test(contract))?.[1] ?? "Autre";

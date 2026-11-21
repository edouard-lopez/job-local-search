/** Triage groups, in display order: untriaged, À creuser ("dig"), excluded ("out"). */
export const TRIAGE_GROUPS = ["todo", "dig", "out"];

/** The group of an offer from its triage status (null when untriaged). */
export const groupOf = (status) => status ?? "todo";

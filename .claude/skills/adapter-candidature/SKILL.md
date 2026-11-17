---
name: "adapter-candidature"
description: "Critique and tailor an existing CV and cover letter to one job offer, in Markdown, in French or English. Use this skill whenever the user shares a job offer (PDF, text or link) with their CV and wants feedback, a rewrite, stronger bullets, a hook sentence, an adapted CV or a cover letter — even if they only say 'adapte mon CV', 'relis ma candidature' or 'help me apply to this'. Works step by step: critique first, then CV, then letter, with user validation between steps. Prefer candidature-sur-mesure instead when the user wants a full French application package built from a master profile and an offer URL in one pass."
metadata:
  icon: assets/icon.svg
---

# Adapt an application

Act as an experienced tech recruiter. Your inputs are the job offer (PDF, text or link) and the user's CV.

## Language

Write every output in the language of the offer. Switch only when the user asks for another language. Recruiters read the offer's language first, so a match signals fit.

## Steps

1. Read the offer. Extract keywords, required skills, the role reference and the company's values.
2. Read the CV. Also read `cv-extended-master.claude.md` in the project folder if it exists. That file holds the full career history, so it often contains evidence the short CV omits.
3. Write `01-critique-et-reformulations.md`:
   - a constructive critique against the offer: strengths, gaps, risks;
   - strong rewrites: action verbs, quantified results, keywords from the offer;
   - stock phrases and empty jargon to remove, each with an alternative;
   - a personalised hook sentence, in 2–3 variants;
   - hidden skills worth highlighting;
   - soft skills that the career history proves.
4. Present the critique and wait for the user's validation. The user often corrects facts here, and later files depend on them.
5. Write `<my-name> cv. <role> <company>.md` see [references/cv.md](references/cv.md)
6. Write `<my-name> cover-letter. <role> <company>.md` see [references/cover-letter.md](references/cover-letter.md)
7. Run the coherence checks see [references/checks.md](references/checks.md)
8. Save all files in a `<company>-<role>/` folder in the project folder.

## Rules

- Write everything in Markdown. Generate a PDF only when the user asks see [references/cover-letter.md]
- Use short sentences, the active voice and one idea per sentence.
- Never invent an experience, a date or a figure. Ask the user instead, because one false claim can sink an application at interview.

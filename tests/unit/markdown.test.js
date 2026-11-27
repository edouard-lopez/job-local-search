import { describe, expect, it } from "vitest";
import { fingerprint, parseBlocks, parseInline, parseUpdates } from "../../src/domain/markdown.js";

describe("parseUpdates", () => {
  it("splits a log into sections, in file order", () => {
    const md = "# Titre\n\nIntro\n\n## Mise à jour du 02/01\n\n- a\n\n## Mise à jour du 01/01\n\n- b\n";
    expect(parseUpdates(md)).toEqual([
      { title: "Mise à jour du 02/01", body: "- a" },
      { title: "Mise à jour du 01/01", body: "- b" },
    ]);
  });

  it("returns nothing when there is no section", () => {
    expect(parseUpdates("# Titre\n")).toEqual([]);
  });
});

describe("parseBlocks", () => {
  it("makes a list from consecutive bullets", () => {
    expect(parseBlocks("- un\n- deux")).toEqual([{ type: "list", items: ["un", "deux"] }]);
  });

  it("joins a wrapped bullet to the previous item", () => {
    expect(parseBlocks("- un\n  suite")).toEqual([{ type: "list", items: ["un suite"] }]);
  });

  it("joins the lines of a paragraph and splits on blank lines", () => {
    expect(parseBlocks("a\nb\n\nc")).toEqual([
      { type: "paragraph", text: "a b" },
      { type: "paragraph", text: "c" },
    ]);
  });

  it("reads a diff block with added, removed and plain lines", () => {
    expect(parseBlocks("```diff\n+ Neuve\n- Vieille\nautre\n```")).toEqual([
      { type: "diff", lines: [{ sign: "+", text: "Neuve" }, { sign: "-", text: "Vieille" }, { sign: " ", text: "autre" }] },
    ]);
  });

  it("goes back to normal blocks after a diff", () => {
    const blocks = parseBlocks("```diff\n- x\n```\n\n- suite");
    expect(blocks.map((b) => b.type)).toEqual(["diff", "list"]);
  });
});

describe("parseInline", () => {
  it("reads bold, code and https links", () => {
    expect(parseInline("a **b** `c` [d](https://e.fr)")).toEqual([
      { type: "text", text: "a " },
      { type: "strong", text: "b" },
      { type: "text", text: " " },
      { type: "code", text: "c" },
      { type: "text", text: " " },
      { type: "link", text: "d", href: "https://e.fr" },
    ]);
  });

  it("keeps only the label of an unsafe link", () => {
    expect(parseInline("[x](javascript:void)")).toEqual([{ type: "text", text: "x" }]);
  });
});

describe("fingerprint", () => {
  it("is stable and changes with the text", () => {
    expect(fingerprint("a")).toBe(fingerprint("a"));
    expect(fingerprint("a")).not.toBe(fingerprint("b"));
  });
});

import { describe, expect, it } from "vitest";
import * as Y from "yjs";
import { encodeDoc, restoreTriage } from "../../src/domain/triage-doc.js";

const fresh = () => { const doc = new Y.Doc(); return { doc, map: doc.getMap("triage") }; };

describe("restoreTriage", () => {
  it("restores the saved Yjs state", () => {
    const source = fresh();
    source.map.set("https://a", "dig");
    const target = fresh();
    restoreTriage(target.doc, target.map, { saved: encodeDoc(source.doc), legacy: null });
    expect(target.map.toJSON()).toEqual({ "https://a": "dig" });
  });

  it("imports the former JSON triage when nothing is saved yet", () => {
    const { doc, map } = fresh();
    restoreTriage(doc, map, { saved: null, legacy: '{"https://b":"exclude"}' });
    expect(map.toJSON()).toEqual({ "https://b": "exclude" });
  });

  it("prefers the saved state over the former triage", () => {
    const source = fresh();
    source.map.set("https://a", "dig");
    const target = fresh();
    restoreTriage(target.doc, target.map, { saved: encodeDoc(source.doc), legacy: '{"https://b":"exclude"}' });
    expect(target.map.toJSON()).toEqual({ "https://a": "dig" });
  });

  it("starts empty when the former triage is broken", () => {
    const { doc, map } = fresh();
    restoreTriage(doc, map, { saved: null, legacy: "{cassé" });
    expect(map.toJSON()).toEqual({});
  });
});

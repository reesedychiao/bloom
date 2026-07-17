import { describe, expect, it } from "vitest";
import { buildIcs } from "./ics";

const event = {
  uid: "abc-123@bloom",
  title: "Technical interview — Acme, Inc.",
  startsAt: new Date("2026-07-24T06:30:00Z"),
  durationMinutes: 45,
  location: "https://meet.example.com/xyz",
  description: "Round 2; bring questions",
};

describe("buildIcs", () => {
  const ics = buildIcs(event, new Date("2026-07-17T00:00:00Z"));

  it("emits UTC start/end from the duration", () => {
    expect(ics).toContain("DTSTART:20260724T063000Z");
    expect(ics).toContain("DTEND:20260724T071500Z");
  });

  it("escapes commas and semicolons in text fields", () => {
    expect(ics).toContain("SUMMARY:Technical interview — Acme\\, Inc.");
    expect(ics).toContain("DESCRIPTION:Round 2\\; bring questions");
  });

  it("includes both reminder alarms", () => {
    expect(ics).toContain("TRIGGER:-P1D");
    expect(ics).toContain("TRIGGER:-PT1H");
    expect(ics.match(/BEGIN:VALARM/g)).toHaveLength(2);
  });

  it("uses CRLF line endings throughout", () => {
    expect(ics.split("\r\n").length).toBeGreaterThan(20);
    expect(/[^\r]\n/.test(ics)).toBe(false);
  });
});

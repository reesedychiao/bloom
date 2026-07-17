/**
 * Minimal .ics builder for interview events, with built-in reminder alarms
 * (1 day and 1 hour before). Pure — takes everything as input, returns text.
 */

export interface IcsEvent {
  uid: string;
  title: string;
  startsAt: Date;
  durationMinutes?: number;
  description?: string;
  location?: string;
}

function icsDate(d: Date): string {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

/** Escape per RFC 5545: backslash, semicolon, comma, newline. */
function esc(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\n/g, "\\n");
}

export function buildIcs(event: IcsEvent, now: Date = new Date()): string {
  const end = new Date(event.startsAt.getTime() + (event.durationMinutes ?? 60) * 60_000);
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Bloom//Job Garden//EN",
    "BEGIN:VEVENT",
    `UID:${event.uid}`,
    `DTSTAMP:${icsDate(now)}`,
    `DTSTART:${icsDate(event.startsAt)}`,
    `DTEND:${icsDate(end)}`,
    `SUMMARY:${esc(event.title)}`,
    ...(event.location ? [`LOCATION:${esc(event.location)}`] : []),
    ...(event.description ? [`DESCRIPTION:${esc(event.description)}`] : []),
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "TRIGGER:-P1D",
    `DESCRIPTION:${esc(`Tomorrow: ${event.title}`)}`,
    "END:VALARM",
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "TRIGGER:-PT1H",
    `DESCRIPTION:${esc(`In an hour: ${event.title}`)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return lines.join("\r\n") + "\r\n";
}

/** Trigger a browser download of the event. */
export function downloadIcs(event: IcsEvent, filename: string): void {
  const blob = new Blob([buildIcs(event)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

import { describe, expect, it } from "vitest";
import { scheduleFor, localDateKey } from "./constants";
import { gratitudeCompleted } from "./hooks/useGratitudeEntries";
import { emptyNightEntry } from "./hooks/useNightEntry";

describe("regras das práticas da noite", () => {
  it("usa o dia do calendário local, não UTC", () => {
    expect(localDateKey(new Date(2026, 10, 10, 23, 30))).toBe("2026-11-10");
  });
  it("gratidão só conta como concluída com item salvo no dia", () => {
    const items = [{ id: "1", entry_date: "2026-11-09", content: "Ontem" }];
    expect(gratitudeCompleted(items, "2026-11-10")).toBe(false);
    expect(gratitudeCompleted([...items, { id: "2", entry_date: "2026-11-10", content: "Hoje" }], "2026-11-10")).toBe(true);
  });
  it("novo dia começa vazio com meditação padrão de 10 minutos", () => {
    expect(emptyNightEntry()).toMatchObject({ checked: [], notes: "", duration: 10 });
  });
  it("meditação para dormir fica de 20 a 10 minutos antes de dormir", () => {
    expect(scheduleFor("meditacao_sono", { bedtime: "22:30", wakeTime: "06:00" })).toEqual({ startTime: "22:10", endTime: "22:20" });
  });
});

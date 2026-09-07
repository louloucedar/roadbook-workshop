"use client";

import type { Trip } from "@/lib/schema";

type Selected = "overview" | "camps" | "supplies" | "reminders" | number;

export function Sidebar({
  trip,
  selected,
  onSelect,
}: {
  trip: Trip;
  selected: Selected;
  onSelect: (s: Selected) => void;
}) {
  return (
    <nav className="rail">
      <button
        className={"rail-item" + (selected === "overview" ? " active" : "")}
        onClick={() => onSelect("overview")}
      >
        总览表
      </button>
      <div className="rail-sep" />
      <div className="rail-label">逐日编辑 · 共{trip.days.length}天</div>
      {trip.days.map(day => (
        <button
          key={day.dayIndex}
          className={
            "rail-item" +
            (selected === day.dayIndex ? " active" : "") +
            (day.needsRecalc ? " dirty" : "")
          }
          onClick={() => onSelect(day.dayIndex)}
        >
          <span className="d">
            第{day.dayIndex}天 · {day.date} {day.weekday}
          </span>
          {day.summary.length > 16 ? day.summary.slice(0, 16) + "…" : day.summary}
        </button>
      ))}
      <div className="rail-sep" />
      <div className="rail-label">其它</div>
      <button
        className={"rail-item" + (selected === "camps" ? " active" : "")}
        onClick={() => onSelect("camps")}
      >
        驻车点清单 ({trip.camps.length})
      </button>
      <button
        className={"rail-item" + (selected === "supplies" ? " active" : "")}
        onClick={() => onSelect("supplies")}
      >
        物资清单 ({trip.supplies.length})
      </button>
      <button
        className={"rail-item" + (selected === "reminders" ? " active" : "")}
        onClick={() => onSelect("reminders")}
      >
        关键提醒 ({trip.keyReminders.length})
      </button>
    </nav>
  );
}

"use client";

import type { Trip } from "@/lib/schema";

export function SuppliesList({ trip }: { trip: Trip }) {
  return (
    <div>
      <div className="section-title">物资清单</div>
      <table className="overview-table">
        <thead>
          <tr>
            <th>分类</th>
            <th>物品</th>
            <th>备注</th>
          </tr>
        </thead>
        <tbody>
          {trip.supplies.map((s, i) => (
            <tr key={i}>
              <td className="d1">{s.category}</td>
              <td>{s.item}</td>
              <td>{s.note || ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function RemindersList({ trip }: { trip: Trip }) {
  return (
    <div>
      <div className="section-title">关键提醒</div>
      {trip.keyReminders.map((r, i) => (
        <div key={i} className="block-item" style={{ marginBottom: 8 }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{r.theme}</div>
            <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginBottom: 4 }}>
              风险:{r.reminder}
            </div>
            <div style={{ fontSize: 12.5, color: "var(--contour)" }}>应对:{r.response}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

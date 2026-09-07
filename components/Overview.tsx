"use client";

import type { Trip } from "@/lib/schema";

export function Overview({ trip, onOpenDay }: { trip: Trip; onOpenDay: (i: number) => void }) {
  return (
    <div>
      <div className="section-title">
        总览表 <span className="n">点击某一行进入逐日编辑</span>
      </div>
      <table className="overview-table">
        <thead>
          <tr>
            <th>日期</th>
            <th>当日行程</th>
            <th>驾车</th>
            <th>夜宿</th>
            <th>备注</th>
          </tr>
        </thead>
        <tbody>
          {trip.days.map(day => (
            <tr key={day.dayIndex} className="clickable" onClick={() => onOpenDay(day.dayIndex)}>
              <td className="d1">
                D{day.dayIndex} {day.date} {day.weekday}
                {day.needsRecalc && <span className="alt-tag"> ● 待重算</span>}
              </td>
              <td>{day.summary}</td>
              <td>{day.drive.raw}</td>
              <td>{day.overnight ? day.overnight.raw : "—"}</td>
              <td>{day.notes || ""}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="section-title">基础信息</div>
      <p className="hint">
        出发地 {trip.origin} → {trip.destination}
      </p>
      <p className="hint">
        房车:{trip.vehicle.type} · 电瓶 {trip.vehicle.battery || "—"} · 水箱{" "}
        {trip.vehicle.waterTankL || "—"}L
      </p>
    </div>
  );
}

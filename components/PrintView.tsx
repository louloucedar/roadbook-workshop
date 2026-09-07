"use client";

import type { Trip } from "@/lib/schema";

export function PrintView({ trip }: { trip: Trip }) {
  return (
    <div className="print-only">
      <h1 style={{ fontSize: 22, marginBottom: 4 }}>{trip.title}</h1>
      <p style={{ color: "var(--ink-soft)", margin: "0 0 18px" }}>
        {trip.subtitle} · {trip.dateRange.start} ~ {trip.dateRange.end}
      </p>
      <table className="overview-table" style={{ marginBottom: 24 }}>
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
            <tr key={day.dayIndex}>
              <td className="d1">
                D{day.dayIndex} {day.date} {day.weekday}
              </td>
              <td>{day.summary}</td>
              <td>{day.drive.raw}</td>
              <td>{day.overnight ? day.overnight.raw : "—"}</td>
              <td>{day.notes || ""}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {trip.days.map(day => (
        <div className="print-day" key={day.dayIndex}>
          <h2 style={{ fontSize: 16, marginBottom: 6 }}>
            DAY {day.dayIndex} · {day.date} {day.weekday}
          </h2>
          <p style={{ color: "var(--ink-soft)", margin: "0 0 10px" }}>{day.summary}</p>
          <p style={{ fontSize: 12.5, margin: "0 0 4px" }}>
            驾车:{day.drive.raw}　夜宿:{day.overnight ? day.overnight.raw : "—"}
          </p>
          {day.notes && (
            <p style={{ fontSize: 12.5, color: "var(--route)", margin: "0 0 10px" }}>
              备注:{day.notes}
            </p>
          )}
          {(day.planBlocks || []).map((b, i) => (
            <p key={i} style={{ fontSize: 12.5, margin: "2px 0" }}>
              {b}
            </p>
          ))}
          {(day.timeline || []).length > 0 && (
            <table className="overview-table" style={{ marginTop: 10 }}>
              <thead>
                <tr>
                  <th>时间</th>
                  <th>安排</th>
                  <th>距上段</th>
                  <th>耗时</th>
                </tr>
              </thead>
              <tbody>
                {day.timeline.map((seg, i) => (
                  <tr key={i}>
                    <td>{seg.time}</td>
                    <td>{seg.activity}</td>
                    <td>{seg.distanceFromPrevKm != null ? seg.distanceFromPrevKm + "km" : "—"}</td>
                    <td>{seg.durationFromPrevMin != null ? seg.durationFromPrevMin + "分" : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
      <p style={{ fontSize: 11, color: "var(--ink-faint)", marginTop: 20 }}>
        距离/时长数据来自高德地图驾车路径规划的真实调用结果。
      </p>
    </div>
  );
}

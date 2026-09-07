"use client";

import type { Trip } from "@/lib/schema";

export function CampsList({ trip }: { trip: Trip }) {
  return (
    <div>
      <div className="section-title">
        驻车点清单 <span className="n">共 {trip.camps.length} 个,来自你的原始清单,只读展示</span>
      </div>
      <table className="overview-table">
        <thead>
          <tr>
            <th>名称</th>
            <th>分类</th>
            <th>海拔</th>
            <th>带娃分级</th>
            <th>备注</th>
          </tr>
        </thead>
        <tbody>
          {trip.camps.map(c => (
            <tr key={c.id}>
              <td className="d1">{c.name}</td>
              <td>{c.category}</td>
              <td>{c.elevationM ? c.elevationM + "m" : "—"}</td>
              <td>{c.kidFriendlyAdvice || ""}</td>
              <td>{c.note || ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useTrip } from "@/lib/useTrip";
import { Sidebar } from "@/components/Sidebar";
import { Overview } from "@/components/Overview";
import { CampsList } from "@/components/CampsList";
import { SuppliesList, RemindersList } from "@/components/SuppliesAndReminders";
import { DayEditor } from "@/components/DayEditor";
import { PrintView } from "@/components/PrintView";

type Selected = "overview" | "camps" | "supplies" | "reminders" | number;

export default function Page() {
  const { trip, updateDay, markDirty, recalcDay, resetToSample, log } = useTrip();
  const [selected, setSelected] = useState<Selected>("overview");

  const kids = trip.travelers.kids.map(k => `${k.age}岁`).join("/");

  return (
    <div className="app">
      <header className="top">
        <div className="top-left">
          <span className="eyebrow">路书工坊 · 阶段1</span>
          <h1>{trip.title}</h1>
          <div className="sub">{trip.subtitle}</div>
        </div>
        <div className="top-right">
          <span className="meta-pill mono">
            {trip.dateRange.start} ~ {trip.dateRange.end}
          </span>
          <span className="meta-pill mono">
            {trip.travelers.adults}大人 + {trip.travelers.kids.length}孩子({kids})
          </span>
          <span className="meta-pill mono">{trip.vehicle.type}</span>
          <button className="btn" onClick={() => window.print()}>
            打印 / 导出 PDF
          </button>
          <button
            className="btn ghost"
            onClick={() => {
              if (confirm("恢复成最初的示例数据?你做的修改会被清空。")) resetToSample();
            }}
          >
            恢复原始数据
          </button>
        </div>
      </header>

      <div className="mock-banner">
        <span className="dot" />
        距离/时长通过服务端接口实时调用高德地图驾车路径规划,不是模拟数据。只有相邻两段都填了"地点"才会计算。
      </div>

      <div className="body-row">
        <Sidebar trip={trip} selected={selected} onSelect={setSelected} />
        <main className="content">
          <div className="screen-only">
            {selected === "overview" && <Overview trip={trip} onOpenDay={setSelected} />}
            {selected === "camps" && <CampsList trip={trip} />}
            {selected === "supplies" && <SuppliesList trip={trip} />}
            {selected === "reminders" && <RemindersList trip={trip} />}
            {typeof selected === "number" &&
              (() => {
                const day = trip.days.find(d => d.dayIndex === selected);
                if (!day) return null;
                return (
                  <DayEditor
                    day={day}
                    log={log[selected]}
                    onPatch={fn => updateDay(selected as number, fn)}
                    onMarkDirty={fromIdx => markDirty(selected as number, fromIdx)}
                    onRecalc={() => recalcDay(selected as number)}
                  />
                );
              })()}
          </div>
          <PrintView trip={trip} />
        </main>
      </div>
    </div>
  );
}

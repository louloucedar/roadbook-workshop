"use client";

import { useEffect, useRef, useState } from "react";
import type { Trip, Day, TimelineBlock } from "./schema";
import sample from "@/data/sample-trip.json";

const STORAGE_KEY = "roadbook-workshop-v1-trip";
const ORIGINAL = sample as unknown as Trip;

function loadInitial(): Trip {
  if (typeof window === "undefined") return structuredClone(ORIGINAL);
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return structuredClone(ORIGINAL);
}

export function useTrip() {
  const [trip, setTrip] = useState<Trip>(() => loadInitial());
  const [log, setLog] = useState<Record<number, string>>({});
  const hydrated = useRef(false);

  useEffect(() => {
    // 首次挂载时用 localStorage 里的数据覆盖(避免 SSR/CSR 首帧不一致)
    if (!hydrated.current) {
      hydrated.current = true;
      setTrip(loadInitial());
    }
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(trip));
    } catch {}
  }, [trip]);

  function updateDay(dayIndex: number, patch: (d: Day) => void) {
    setTrip(prev => {
      const next = structuredClone(prev);
      const day = next.days.find(d => d.dayIndex === dayIndex);
      if (day) patch(day);
      return next;
    });
  }

  function markDirty(dayIndex: number, fromIdx: number) {
    updateDay(dayIndex, d => {
      d.needsRecalc = true;
      d._dirtyFrom = d._dirtyFrom === undefined ? fromIdx : Math.min(d._dirtyFrom, fromIdx);
    });
  }

  /** 只重算从 _dirtyFrom 开始、且相邻两段都标注了 place 的路段——没标 place 的段落诚实跳过,不编造数字 */
  async function recalcDay(dayIndex: number) {
    const day = trip.days.find(d => d.dayIndex === dayIndex);
    if (!day) return;
    const from = day._dirtyFrom ?? 0;
    const timeline = day.timeline || [];
    let touched = 0;
    let skipped = 0;
    let failed = 0;
    const t0 = performance.now();

    const results: { i: number; patch: Partial<TimelineBlock> }[] = [];
    for (let i = Math.max(from, 1); i < timeline.length; i++) {
      if (i < from) continue;
      const prev = timeline[i - 1];
      const cur = timeline[i];
      if (!prev.place || !cur.place) {
        skipped++;
        continue;
      }
      try {
        const res = await fetch("/api/route-calc", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ origin: prev.place, destination: cur.place }),
        }).then(r => r.json());
        if (res.error) {
          failed++;
          continue;
        }
        touched++;
        results.push({
          i,
          patch: {
            distanceFromPrevKm: res.distanceKm,
            durationFromPrevMin: res.durationMin,
            computed: true,
          },
        });
      } catch {
        failed++;
      }
    }

    const ms = (performance.now() - t0).toFixed(0);
    updateDay(dayIndex, d => {
      for (const r of results) {
        Object.assign(d.timeline[r.i], r.patch);
      }
      d.needsRecalc = false;
      delete d._dirtyFrom;
    });
    setLog(prev => ({
      ...prev,
      [dayIndex]: `重算完成:共 ${timeline.length} 段,真实调用高德算出 ${touched} 段${
        skipped ? `,${skipped} 段因缺少地点标注跳过` : ""
      }${failed ? `,${failed} 段调用失败` : ""},耗时 ${ms}ms · 未触碰其它 ${trip.days.length - 1} 天的数据。`,
    }));
  }

  function resetToSample() {
    setTrip(structuredClone(ORIGINAL));
    setLog({});
  }

  return { trip, setTrip, updateDay, markDirty, recalcDay, resetToSample, log };
}

"use client";

import type { Day, TimelineBlock } from "@/lib/schema";

export function DayEditor({
  day,
  log,
  onPatch,
  onMarkDirty,
  onRecalc,
}: {
  day: Day;
  log?: string;
  onPatch: (fn: (d: Day) => void) => void;
  onMarkDirty: (fromIdx: number) => void;
  onRecalc: () => void;
}) {
  return (
    <div>
      <div className="day-head">
        <span className="idx">DAY {day.dayIndex}</span>
        <span className="date">
          {day.date} {day.weekday}
        </span>
        {day.needsRecalc && <span className="day-alt">有未重算的路线变更</span>}
      </div>

      <Field
        label="当日概要"
        value={day.summary}
        onChange={v => onPatch(d => (d.summary = v))}
      />

      <div className="field-row">
        <Field
          label="驾车(原始文案)"
          value={day.drive.raw}
          onChange={v => onPatch(d => (d.drive.raw = v))}
        />
        <Field
          label="夜宿(原始文案)"
          value={day.overnight?.raw || ""}
          onChange={v =>
            onPatch(d => {
              if (!d.overnight) d.overnight = { raw: "", elevationM: null };
              d.overnight.raw = v;
            })
          }
        />
      </div>

      <Field
        label="备注 / 风险提示"
        value={day.notes}
        onChange={v => onPatch(d => (d.notes = v))}
      />

      <div className="section-title">
        当日安排 planBlocks <span className="n">粗粒度,按【早/午/下午/晚】分段</span>
      </div>
      <div className="block-list">
        {(day.planBlocks || []).map((b, i) => (
          <BlockItem
            key={i}
            value={b}
            onChange={v =>
              onPatch(d => {
                d.planBlocks[i] = v;
              })
            }
            onUp={() =>
              onPatch(d => {
                if (i > 0) [d.planBlocks[i], d.planBlocks[i - 1]] = [d.planBlocks[i - 1], d.planBlocks[i]];
              })
            }
            onDown={() =>
              onPatch(d => {
                if (i < d.planBlocks.length - 1)
                  [d.planBlocks[i], d.planBlocks[i + 1]] = [d.planBlocks[i + 1], d.planBlocks[i]];
              })
            }
            onDelete={() =>
              onPatch(d => {
                d.planBlocks.splice(i, 1);
              })
            }
          />
        ))}
      </div>
      <button
        className="btn small add-row-btn"
        style={{ marginTop: 8 }}
        onClick={() => onPatch(d => (d.planBlocks = [...(d.planBlocks || []), "【】"]))}
      >
        + 添加一个时段
      </button>

      <div className="section-title">
        精细时间线 timeline{" "}
        <span className="n">
          共 {(day.timeline || []).length} 段 · 填了"地点"的相邻两段才能真实测距
        </span>
      </div>

      {day.needsRecalc && (
        <div className="recalc-bar">
          <p>
            检测到这天有路线变更需要重算,之前没改动的路段不会被重新计算,也不会碰其它天的数据。
          </p>
          <button className="btn primary small" onClick={onRecalc}>
            重新计算受影响路段(调用真实高德接口)
          </button>
        </div>
      )}

      <div className="seg-list">
        {(day.timeline || []).map((seg, i) => (
          <SegRow
            key={i}
            seg={seg}
            onTimeChange={v => {
              onPatch(d => (d.timeline[i].time = v));
              onMarkDirty(i);
            }}
            onActivityChange={v => onPatch(d => (d.timeline[i].activity = v))}
            onPlaceChange={v => {
              onPatch(d => (d.timeline[i].place = v));
              onMarkDirty(Math.max(0, i - 1));
            }}
            onUp={() => {
              if (i > 0) {
                onPatch(d => {
                  [d.timeline[i], d.timeline[i - 1]] = [d.timeline[i - 1], d.timeline[i]];
                });
                onMarkDirty(i - 1);
              }
            }}
            onDown={() => {
              onPatch(d => {
                if (i < d.timeline.length - 1)
                  [d.timeline[i], d.timeline[i + 1]] = [d.timeline[i + 1], d.timeline[i]];
              });
              onMarkDirty(i);
            }}
            onDelete={() => {
              onPatch(d => d.timeline.splice(i, 1));
              onMarkDirty(Math.max(0, i - 1));
            }}
          />
        ))}
      </div>
      <button
        className="btn small add-row-btn"
        style={{ marginTop: 10 }}
        onClick={() => {
          onPatch(d => (d.timeline = [...(d.timeline || []), { time: "00:00-00:00", activity: "" }]));
          onMarkDirty((day.timeline || []).length);
        }}
      >
        + 添加一段时间线
      </button>

      {log && <div className="recalc-log">{log}</div>}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      <input type="text" value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

function BlockItem({
  value,
  onChange,
  onUp,
  onDown,
  onDelete,
}: {
  value: string;
  onChange: (v: string) => void;
  onUp: () => void;
  onDown: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="block-item">
      <textarea rows={2} value={value} onChange={e => onChange(e.target.value)} />
      <div className="block-ctrl">
        <button className="icon-btn" title="上移" onClick={onUp}>↑</button>
        <button className="icon-btn" title="下移" onClick={onDown}>↓</button>
        <button className="icon-btn" title="删除" onClick={onDelete}>×</button>
      </div>
    </div>
  );
}

function SegRow({
  seg,
  onTimeChange,
  onActivityChange,
  onPlaceChange,
  onUp,
  onDown,
  onDelete,
}: {
  seg: TimelineBlock;
  onTimeChange: (v: string) => void;
  onActivityChange: (v: string) => void;
  onPlaceChange: (v: string) => void;
  onUp: () => void;
  onDown: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="seg-row">
      <div>
        <input
          type="text"
          defaultValue={seg.time}
          onBlur={e => onTimeChange(e.target.value)}
        />
      </div>
      <div>
        <textarea rows={2} value={seg.activity} onChange={e => onActivityChange(e.target.value)} />
        <div className="seg-place">
          <input
            type="text"
            placeholder="地点(选填,如「泸定桥」——填了才能测距)"
            defaultValue={seg.place || ""}
            onBlur={e => onPlaceChange(e.target.value)}
          />
        </div>
        <div className="seg-meta">
          {seg.distanceFromPrevKm != null && seg.durationFromPrevMin != null ? (
            <>
              <span className="seg-tag computed">距上段 {seg.distanceFromPrevKm}km · 高德实测</span>
              <span className="seg-tag computed">路上约 {seg.durationFromPrevMin}分钟</span>
            </>
          ) : (
            <span className="seg-tag">
              {seg.place ? "待重算" : "未标地点,无法测距"}
            </span>
          )}
        </div>
      </div>
      <div className="block-ctrl">
        <button className="icon-btn" title="上移" onClick={onUp}>↑</button>
        <button className="icon-btn" title="下移" onClick={onDown}>↓</button>
        <button className="icon-btn" title="删除" onClick={onDelete}>×</button>
      </div>
    </div>
  );
}

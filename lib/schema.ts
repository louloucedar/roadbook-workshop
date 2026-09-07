/**
 * 路书数据模型 v0.1(继承自开发交接文档第 7 节 roadbook-schema.ts)
 * 2026-09-07 新增:TimelineBlock.place —— 真实测距需要知道"这一段到了哪个地点",
 * 原 schema 只有自由文本 activity,没法拿去调高德路径规划。place 留空时,
 * 前端诚实显示"未标地点,无法测距",不编造数字。
 */

export interface Trip {
  id: string;
  title: string;
  subtitle: string;
  dateRange: { start: string; end: string };
  origin: string;
  destination: string;
  travelers: {
    adults: number;
    kids: { age: number }[];
  };
  vehicle: {
    type: string;
    battery?: string;
    waterTankL?: number;
  };
  days: Day[];
  camps: CampSite[];
  supplies: SupplyItem[];
  keyReminders: KeyReminder[];
}

export interface Day {
  dayIndex: number;
  date: string;
  weekday: string;
  summary: string;
  drive: {
    raw: string;
    distanceKmApprox: number | null;
    durationMinApprox: number | null;
  };
  overnight: {
    raw: string;
    elevationM: number | null;
    campId?: string;
  } | null;
  notes: string;
  planBlocks: string[];
  timeline: TimelineBlock[];
  sights?: string[];
  altitudeNotes?: string;
  /** 前端瞬时状态,不持久化进"最终路书",只在编辑会话内使用 */
  needsRecalc?: boolean;
  _dirtyFrom?: number;
}

export interface TimelineBlock {
  time: string;
  activity: string;
  /** 这一段落脚的地点名(如"泸定桥""康定伞岗坪房车营地")——测距用这个字段定位坐标,不解析 activity 自由文本 */
  place?: string;
  distanceFromPrevKm?: number;
  durationFromPrevMin?: number;
  /** 距离数据是否来自真实高德调用(true)还是还没算过 */
  computed?: boolean;
}

export type KidCategoryTag =
  | "overnight_kid_friendly"
  | "overnight_ok"
  | "day_stop_only"
  | "never_overnight"
  | "unclassified";

export interface CampSite {
  id: string | number;
  direction: string;
  name: string;
  category: string;
  elevationM: number | null;
  location: string;
  amenities: string;
  kidCategoryTag: KidCategoryTag;
  kidFriendlyAdvice: string;
  note: string;
}

export interface SupplyItem {
  category: string;
  item: string;
  note: string;
}

export interface KeyReminder {
  theme: string;
  reminder: string;
  response: string;
}

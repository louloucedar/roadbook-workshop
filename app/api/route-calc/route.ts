import { NextRequest, NextResponse } from "next/server";

/**
 * 高德代理接口(阶段1核心):输入两个地点(地名或"lng,lat"坐标),
 * 服务端解析坐标 + 调驾车路径规划,返回距离/时长。
 * AMAP_KEY 只存在服务端环境变量里,不会打进浏览器 bundle。
 *
 * 简单内存缓存:同一对起点终点短时间内不用重复调用高德。
 */

const AMAP_BASE = "https://restapi.amap.com/v3";
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 分钟

type CacheEntry = { at: number; data: RouteResult };
const cache = new Map<string, CacheEntry>();

type RouteResult = {
  distanceKm: number;
  durationMin: number;
  originResolved: string;
  destinationResolved: string;
};

const COORD_RE = /^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/;

async function resolvePlace(
  input: string,
  key: string
): Promise<{ lng: number; lat: number; label: string } | null> {
  const trimmed = input.trim();
  if (COORD_RE.test(trimmed)) {
    const [lng, lat] = trimmed.split(",").map(Number);
    return { lng, lat, label: trimmed };
  }

  // 1) POI 关键词搜索
  const poiUrl = `${AMAP_BASE}/place/text?keywords=${encodeURIComponent(
    trimmed
  )}&offset=1&extensions=base&key=${key}`;
  const poiRes = await fetch(poiUrl).then(r => r.json());
  if (poiRes.status === "1" && poiRes.pois?.length) {
    const p = poiRes.pois[0];
    const [lng, lat] = p.location.split(",").map(Number);
    return { lng, lat, label: `${p.name}(${p.adname || ""})` };
  }

  // 2) 回退地理编码
  const geoUrl = `${AMAP_BASE}/geocode/geo?address=${encodeURIComponent(
    trimmed
  )}&key=${key}`;
  const geoRes = await fetch(geoUrl).then(r => r.json());
  if (geoRes.status === "1" && geoRes.geocodes?.length) {
    const g = geoRes.geocodes[0];
    const [lng, lat] = g.location.split(",").map(Number);
    return { lng, lat, label: g.formatted_address || trimmed };
  }
  return null;
}

export async function POST(req: NextRequest) {
  const key = process.env.AMAP_KEY;
  if (!key) {
    return NextResponse.json({ error: "服务端未配置 AMAP_KEY" }, { status: 500 });
  }

  const body = await req.json().catch(() => null);
  const origin = body?.origin?.trim();
  const destination = body?.destination?.trim();
  if (!origin || !destination) {
    return NextResponse.json({ error: "origin/destination 必填" }, { status: 400 });
  }

  const cacheKey = `${origin}=>${destination}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return NextResponse.json({ ...cached.data, cached: true });
  }

  try {
    const [o, d] = await Promise.all([
      resolvePlace(origin, key),
      resolvePlace(destination, key),
    ]);
    if (!o) return NextResponse.json({ error: `无法定位起点"${origin}"` }, { status: 422 });
    if (!d) return NextResponse.json({ error: `无法定位终点"${destination}"` }, { status: 422 });

    const drivingUrl = `${AMAP_BASE}/direction/driving?origin=${o.lng},${o.lat}&destination=${d.lng},${d.lat}&extensions=base&strategy=0&key=${key}`;
    const drivingRes = await fetch(drivingUrl).then(r => r.json());
    const path = drivingRes?.route?.paths?.[0];
    if (drivingRes.status !== "1" || !path) {
      return NextResponse.json(
        { error: `高德路径规划失败: ${drivingRes.info || drivingRes.infocode || "未知错误"}` },
        { status: 502 }
      );
    }

    const result: RouteResult = {
      distanceKm: Math.round((Number(path.distance) / 1000) * 10) / 10,
      durationMin: Math.round(Number(path.duration) / 60),
      originResolved: o.label,
      destinationResolved: d.label,
    };
    cache.set(cacheKey, { at: Date.now(), data: result });
    return NextResponse.json({ ...result, cached: false });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "调用高德接口失败" }, { status: 502 });
  }
}

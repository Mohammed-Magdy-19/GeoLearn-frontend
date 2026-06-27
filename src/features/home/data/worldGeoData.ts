/**
 * worldGeoData.ts
 *
 * Geographic data provider for the 3D globe visualization.
 *
 * Data sources:
 *   1. **Esri Living Atlas** (primary) — fetched at runtime from
 *      World Countries (Generalized) FeatureServer.
 *      Provides accurate country polygons as GeoJSON.
 *
 *   2. **Fallback polygons** (secondary) — hand-drawn simplified
 *      continents used for instant rendering while Esri data loads,
 *      or if the network request fails.
 *
 * Coordinate system:
 *   - WGS84 (EPSG:4326)
 *   - Longitude: -180 (west) to 180 (east)
 *   - Latitude: -90 (south) to 90 (north)
 */

// ─── Types ───────────────────────────────────────────────────────────────

export type LonLat = [lon: number, lat: number];

/** Polygon with precomputed bounding box for fast rejection */
export interface IndexedPolygon {
  ring: LonLat[];
  minLon: number;
  maxLon: number;
  minLat: number;
  maxLat: number;
}

// ─── Esri Living Atlas fetch ─────────────────────────────────────────────

const ESRI_URL =
  "https://services.arcgis.com/P3ePLMYs2RVChkJx/arcgis/rest/services/" +
  "World_Countries_(Generalized)/FeatureServer/0/query";

/**
 * Fetch world country polygons from Esri Living Atlas.
 * Returns an array of IndexedPolygon with bounding boxes for fast PIP.
 *
 * Uses `maxAllowableOffset=0.5` (≈0.5° simplification) to keep the
 * response size manageable (~300–500 KB) while retaining recognizable
 * coastlines at globe scale.
 */
export async function fetchEsriLandData(): Promise<IndexedPolygon[]> {
  const params = new URLSearchParams({
    where: "1=1",
    outFields: "COUNTRY",
    f: "geojson",
    outSR: "4326",
    returnGeometry: "true",
    maxAllowableOffset: "0.5",
  });

  const res = await fetch(`${ESRI_URL}?${params}`);
  if (!res.ok) throw new Error(`Esri fetch failed: ${res.status}`);

  const geojson = await res.json();
  const polygons: IndexedPolygon[] = [];

  for (const feature of geojson.features) {
    const geom = feature.geometry;
    if (!geom) continue;

    const rings: number[][][] =
      geom.type === "Polygon"
        ? [geom.coordinates[0]] // exterior ring only
        : geom.type === "MultiPolygon"
          ? geom.coordinates.map((poly: number[][][]) => poly[0])
          : [];

    for (const ring of rings) {
      if (ring.length < 4) continue; // degenerate polygon

      let minLon = Infinity, maxLon = -Infinity;
      let minLat = Infinity, maxLat = -Infinity;
      const lonlats: LonLat[] = [];

      for (const [lon, lat] of ring) {
        lonlats.push([lon, lat]);
        if (lon < minLon) minLon = lon;
        if (lon > maxLon) maxLon = lon;
        if (lat < minLat) minLat = lat;
        if (lat > maxLat) maxLat = lat;
      }

      polygons.push({ ring: lonlats, minLon, maxLon, minLat, maxLat });
    }
  }

  return polygons;
}

// ─── Point-in-polygon (ray casting) ─────────────────────────────────────

function pipTest(lon: number, lat: number, ring: LonLat[]): boolean {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0], yi = ring[i][1];
    const xj = ring[j][0], yj = ring[j][1];
    if (
      yi > lat !== yj > lat &&
      lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi
    ) {
      inside = !inside;
    }
  }
  return inside;
}

/** Check if a coordinate falls on land using indexed polygons */
export function isLandIndexed(
  lon: number,
  lat: number,
  polygons: IndexedPolygon[]
): boolean {
  for (const p of polygons) {
    // Fast bbox rejection
    if (lon < p.minLon || lon > p.maxLon || lat < p.minLat || lat > p.maxLat) {
      continue;
    }
    if (pipTest(lon, lat, p.ring)) return true;
  }
  return false;
}

// ─── Sphere projection ──────────────────────────────────────────────────

/** Convert [lon°, lat°] to [x, y, z] on a sphere of given radius */
export function toSphereXYZ(
  lon: number,
  lat: number,
  radius: number
): [x: number, y: number, z: number] {
  const lonRad = (lon * Math.PI) / 180;
  const latRad = (lat * Math.PI) / 180;
  return [
    radius * Math.cos(latRad) * Math.sin(lonRad),
    radius * Math.sin(latRad),
    radius * Math.cos(latRad) * Math.cos(lonRad),
  ];
}

// ─── Fallback (hand-drawn) polygons ──────────────────────────────────────
// Used for instant rendering before Esri data arrives.

function toIndexed(ring: LonLat[]): IndexedPolygon {
  let minLon = Infinity, maxLon = -Infinity;
  let minLat = Infinity, maxLat = -Infinity;
  for (const [lon, lat] of ring) {
    if (lon < minLon) minLon = lon;
    if (lon > maxLon) maxLon = lon;
    if (lat < minLat) minLat = lat;
    if (lat > maxLat) maxLat = lat;
  }
  return { ring, minLon, maxLon, minLat, maxLat };
}

const FALLBACK_CONTINENTS: LonLat[][] = [
  // Africa
  [
    [-17, 15], [-17, 21], [-15, 28], [-5, 36], [10, 37], [25, 32],
    [33, 30], [36, 25], [43, 12], [51, 12], [42, -1], [35, -18],
    [28, -33], [18, -35], [12, -18], [5, 4], [-5, 5], [-16, 12], [-17, 15],
  ],
  // Europe
  [
    [-10, 37], [-9, 43], [-5, 48], [-10, 52], [-7, 58], [14, 56],
    [30, 60], [38, 48], [28, 41], [20, 38], [10, 37], [-5, 36], [-10, 37],
  ],
  // Asia
  [
    [28, 41], [38, 48], [30, 60], [55, 58], [75, 52], [85, 45],
    [72, 22], [77, 8], [95, 18], [105, 2], [120, 25], [140, 38],
    [170, 64], [170, 72], [100, 68], [50, 68], [30, 60],
    [20, 55], [28, 41],
  ],
  // N. America
  [
    [-170, 64], [-140, 72], [-95, 72], [-60, 55], [-70, 43],
    [-80, 32], [-95, 18], [-120, 35], [-145, 60], [-170, 64],
  ],
  // S. America
  [
    [-80, 10], [-62, 10], [-35, -8], [-50, -25], [-68, -48],
    [-75, -52], [-70, -18], [-80, 10],
  ],
  // Australia
  [
    [115, -35], [130, -32], [148, -38], [153, -28], [137, -12],
    [114, -22], [115, -35],
  ],
  // Greenland
  [
    [-55, 60], [-22, 70], [-20, 82], [-50, 80], [-55, 68], [-55, 60],
  ],
  // Arabia
  [
    [33, 30], [42, 28], [55, 22], [52, 13], [43, 13], [36, 25], [33, 30],
  ],
];

export const FALLBACK_INDEXED: IndexedPolygon[] =
  FALLBACK_CONTINENTS.map(toIndexed);

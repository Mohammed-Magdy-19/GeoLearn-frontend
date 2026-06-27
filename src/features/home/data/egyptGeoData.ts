/**
 * egyptGeoData.ts
 *
 * Pre-computed geographic data for the 3D Egypt isometric map.
 *
 * All coordinates are in a local system:
 *   - Origin at Egypt's approximate centroid (29.5°N, 30.5°E)
 *   - X axis = longitude (east+), Z axis = latitude (north+)
 *   - Scaled so the full country fits in roughly 10 × 12 units
 *   - Y axis = elevation (0..1.5)
 *
 * Data is intentionally simplified for a low-poly aesthetic:
 *   - Country outline: ~60 vertices (enough for recognizable shape)
 *   - Nile: ~30 waypoints (Aswan → Delta)
 *   - Elevation grid: 40 × 48 cells
 */

// ─── Helper types ────────────────────────────────────────────────────────────

export type Point2D = [x: number, z: number];
export type Point3D = [x: number, y: number, z: number];

// ─── Coordinate transform ────────────────────────────────────────────────────

/**
 * Convert a [lon, lat] pair to local [x, z] coordinates.
 * Centroid: 30.5E, 29.5N; Scale: 1 unit ≈ 1° longitude
 */
function toLocal(lon: number, lat: number): Point2D {
  return [lon - 30.5, lat - 26.0];
}

// ─── Egypt country outline ───────────────────────────────────────────────────
/**
 * Simplified polygon of Egypt's land border, ordered counter-clockwise.
 * Derived from Natural Earth 110m simplified data.
 */
export const EGYPT_OUTLINE: Point2D[] = [
  // Mediterranean coast (west → east)
  toLocal(25.0, 31.5),
  toLocal(26.0, 31.5),
  toLocal(27.0, 31.3),
  toLocal(28.0, 31.1),
  toLocal(28.5, 31.2),
  toLocal(29.0, 31.3),
  toLocal(29.5, 31.2),
  toLocal(30.0, 31.4),
  toLocal(30.5, 31.5),
  toLocal(31.0, 31.5),
  toLocal(31.5, 31.5),
  toLocal(32.0, 31.5),
  toLocal(32.5, 31.1),
  // Sinai north coast → Rafah
  toLocal(33.0, 31.1),
  toLocal(33.5, 31.0),
  toLocal(34.0, 31.2),
  toLocal(34.2, 31.3),
  // Gulf of Aqaba (Sinai east coast, southward)
  toLocal(34.3, 31.0),
  toLocal(34.4, 30.5),
  toLocal(34.5, 30.0),
  toLocal(34.5, 29.5),
  toLocal(34.4, 29.0),
  toLocal(34.3, 28.5),
  toLocal(34.2, 28.0),
  // Sinai tip (Sharm el-Sheikh / Ras Mohammed)
  toLocal(34.0, 27.8),
  toLocal(33.8, 27.7),
  // Red Sea coast (south from Hurghada region)
  toLocal(33.8, 27.2),
  toLocal(34.0, 26.5),
  toLocal(34.2, 26.0),
  toLocal(34.5, 25.5),
  toLocal(34.8, 25.0),
  toLocal(35.0, 24.5),
  toLocal(35.2, 24.0),
  toLocal(35.5, 23.5),
  toLocal(35.8, 23.0),
  toLocal(36.0, 22.5),
  toLocal(36.2, 22.0),
  // Southern border with Sudan (east → west at ~22°N)
  toLocal(35.0, 22.0),
  toLocal(34.0, 22.0),
  toLocal(33.0, 22.0),
  toLocal(32.0, 22.0),
  toLocal(31.0, 22.0),
  toLocal(30.0, 22.0),
  toLocal(29.0, 22.0),
  toLocal(28.0, 22.0),
  toLocal(27.0, 22.0),
  toLocal(26.0, 22.0),
  toLocal(25.0, 22.0),
  // Libyan border (south → north)
  toLocal(25.0, 23.0),
  toLocal(25.0, 24.0),
  toLocal(25.0, 25.0),
  toLocal(25.0, 26.0),
  toLocal(25.0, 27.0),
  toLocal(25.0, 28.0),
  toLocal(25.0, 29.0),
  toLocal(25.0, 30.0),
  toLocal(25.0, 31.0),
  toLocal(25.0, 31.5),
];

// ─── Nile River path ─────────────────────────────────────────────────────────
/**
 * Simplified polyline tracing the Nile from Lake Nasser (south)
 * through the valley to the Delta fan (north).
 */
export const NILE_RIVER: Point2D[] = [
  // Lake Nasser / Aswan area
  toLocal(32.9, 23.5),
  toLocal(32.8, 24.0),
  toLocal(32.9, 24.5),
  toLocal(32.8, 25.0),
  // Upper Egypt
  toLocal(32.6, 25.5),
  toLocal(32.7, 26.0),
  toLocal(32.6, 26.5),
  toLocal(32.4, 27.0),
  // Middle Egypt (Luxor → Asyut)
  toLocal(32.5, 27.5),
  toLocal(31.5, 28.0),
  toLocal(31.2, 28.5),
  toLocal(31.0, 29.0),
  // Cairo approach
  toLocal(31.2, 29.5),
  toLocal(31.2, 30.0),
  toLocal(31.3, 30.2),
  // Delta split
  toLocal(31.2, 30.5),
];

/** Rosetta branch of the Nile Delta */
export const NILE_ROSETTA: Point2D[] = [
  toLocal(31.2, 30.5),
  toLocal(30.8, 30.8),
  toLocal(30.5, 31.0),
  toLocal(30.4, 31.3),
  toLocal(30.4, 31.5),
];

/** Damietta branch of the Nile Delta */
export const NILE_DAMIETTA: Point2D[] = [
  toLocal(31.2, 30.5),
  toLocal(31.5, 30.8),
  toLocal(31.6, 31.0),
  toLocal(31.8, 31.3),
  toLocal(31.8, 31.5),
];

// ─── Governorate boundary lines ──────────────────────────────────────────────
/**
 * Major internal administrative divisions — simplified to key separating
 * lines rather than full polygons for the low-poly aesthetic.
 */
export const GOVERNORATE_LINES: Point2D[][] = [
  // Upper / Lower Egypt divide (~28.5°N)
  [toLocal(25.0, 28.5), toLocal(32.5, 28.5)],
  // Cairo / Delta divide (~30.2°N)
  [toLocal(29.0, 30.2), toLocal(32.5, 30.2)],
  // Sinai divide (Suez Canal)
  [toLocal(32.3, 30.8), toLocal(32.5, 29.5), toLocal(32.9, 29.0)],
  // Western Desert / Nile Valley (~30°E)
  [toLocal(28.5, 22.0), toLocal(28.5, 28.5)],
  // New Valley / Red Sea Mountains (~33°E)
  [toLocal(33.0, 22.0), toLocal(33.0, 28.0)],
];

// ─── Elevation grid ──────────────────────────────────────────────────────────
/**
 * Normalized elevation grid covering Egypt's bounding box.
 * Grid dimensions: GRID_COLS (W-E) × GRID_ROWS (S-N).
 *
 * Values range 0.0 – 1.0 representing relative height:
 *   0.0  = sea level / Nile Delta floor
 *   0.15 = Nile Valley depression
 *   0.3  = Western Desert low plateau
 *   0.5  = Eastern Desert / plateau
 *   0.7  = Sinai highlands
 *   1.0  = Mountain peaks (Saint Catherine ~2600m)
 *
 * The grid is indexed as ELEVATION_GRID[row][col], where
 *   row 0 = southernmost, row GRID_ROWS-1 = northernmost
 *   col 0 = westernmost, col GRID_COLS-1 = easternmost
 */

export const GRID_COLS = 40;
export const GRID_ROWS = 48;

// Bounding box in local coordinates
export const GRID_MIN_X = 25.0 - 30.5; // -5.5
export const GRID_MAX_X = 36.2 - 30.5; //  5.7
export const GRID_MIN_Z = 22.0 - 26.0; // -4.0
export const GRID_MAX_Z = 31.5 - 26.0; //  5.5

/**
 * Generate elevation grid procedurally based on Egypt's geography.
 * This avoids shipping a large JSON asset — the function runs once at import.
 */
function generateElevationGrid(): number[][] {
  const grid: number[][] = [];

  for (let row = 0; row < GRID_ROWS; row++) {
    const rowData: number[] = [];
    // lat goes from GRID_MIN_Z (south) to GRID_MAX_Z (north)
    const lat = GRID_MIN_Z + (row / (GRID_ROWS - 1)) * (GRID_MAX_Z - GRID_MIN_Z);

    for (let col = 0; col < GRID_COLS; col++) {
      const lon = GRID_MIN_X + (col / (GRID_COLS - 1)) * (GRID_MAX_X - GRID_MIN_X);

      // Convert back to geographic for feature detection
      const geoLon = lon + 30.5;
      const geoLat = lat + 26.0;

      let elev = 0.3; // Default: desert plateau

      // ── Nile Valley depression (narrow strip around 31-32°E, 24-31°N)
      const nileCenter = 31.5;
      const distToNile = Math.abs(geoLon - nileCenter);
      if (distToNile < 1.5 && geoLat > 23.0 && geoLat < 31.0) {
        elev = Math.max(0.05, 0.15 * (distToNile / 1.5));
      }

      // ── Nile Delta (broad, low, north of 30°N, 30-32°E)
      if (geoLat > 30.0 && geoLon > 29.5 && geoLon < 32.5) {
        const deltaFactor = (geoLat - 30.0) / 1.5;
        elev = Math.max(0.02, 0.1 * (1 - deltaFactor * 0.5));
      }

      // ── Western Desert plateau (25-30°E) — gradually rising west
      if (geoLon < 29.0 && geoLat < 30.0) {
        elev = 0.25 + 0.1 * ((29.0 - geoLon) / 4.0);
      }

      // ── Qattara Depression (around 27°E, 29.5°N)
      const distToQattara = Math.sqrt((geoLon - 27.0) ** 2 + (geoLat - 29.5) ** 2);
      if (distToQattara < 1.5) {
        elev = Math.min(elev, 0.05 + 0.15 * (distToQattara / 1.5));
      }

      // ── Eastern Desert / Red Sea Mountains (33-35°E, 24-28°N)
      if (geoLon > 32.5 && geoLon < 35.0 && geoLat > 24.0 && geoLat < 28.5) {
        const ridgeFactor = 1 - Math.abs(geoLon - 33.5) / 1.5;
        elev = 0.4 + 0.25 * Math.max(0, ridgeFactor);
      }

      // ── Sinai Peninsula (east of 32.3°E, north of 27.5°N)
      if (geoLon > 33.0 && geoLat > 27.5 && geoLat < 31.5) {
        elev = 0.4;
        // Southern Sinai highlands (Saint Catherine area ~33.9°E, 28.5°N)
        const distToStCatherine = Math.sqrt((geoLon - 33.9) ** 2 + (geoLat - 28.5) ** 2);
        if (distToStCatherine < 1.2) {
          elev = 0.5 + 0.5 * Math.max(0, 1 - distToStCatherine / 1.2);
        }
      }

      // ── Mediterranean coast — slight drop-off
      if (geoLat > 31.0) {
        elev = Math.min(elev, 0.1);
      }

      // ── Southern border area (Sahara)
      if (geoLat < 23.5) {
        elev = 0.3 + 0.05 * ((23.5 - geoLat) / 1.5);
      }

      // Clamp
      elev = Math.max(0, Math.min(1, elev));

      rowData.push(elev);
    }
    grid.push(rowData);
  }

  return grid;
}

export const ELEVATION_GRID = generateElevationGrid();

// ─── City markers ────────────────────────────────────────────────────────────
export interface CityMarker {
  name: string;
  position: Point2D;
}

export const CITIES: CityMarker[] = [
  { name: "القاهرة", position: toLocal(31.2, 30.0) },
  { name: "الإسكندرية", position: toLocal(29.9, 31.2) },
  { name: "أسوان", position: toLocal(32.9, 24.1) },
  { name: "الأقصر", position: toLocal(32.6, 25.7) },
  { name: "الجيزة", position: toLocal(31.2, 29.9) },
];

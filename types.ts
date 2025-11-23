export interface Coordinate {
  x: number;
  y: number;
}

export interface RecordedPoint extends Coordinate {
  timeOffset: number;
}

export interface GridPoint extends Coordinate {
  id: string;
  label: string;
}

export interface SquareCorner {
  id: string; // 'A', 'B', 'C', 'D'
  name: string; // 'Top-Left', etc.
  x: number; // Relative to square position (0 or 1)
  y: number; // Relative to square position (0 or 1)
  color: string;
}

export const SQUARE_CORNERS: SquareCorner[] = [
  { id: 'A', name: 'Top-Left', x: 0, y: 0, color: '#ef4444' },     // Red
  { id: 'B', name: 'Top-Right', x: 1, y: 0, color: '#3b82f6' },    // Blue
  { id: 'C', name: 'Bottom-Right', x: 1, y: 1, color: '#10b981' }, // Green
  { id: 'D', name: 'Bottom-Left', x: 0, y: 1, color: '#f59e0b' },  // Orange
];

export const GRID_SIZE = 10;
export const SQUARE_SIZE = 1;
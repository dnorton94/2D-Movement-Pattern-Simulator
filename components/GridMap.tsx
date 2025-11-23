import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Coordinate, GRID_SIZE, SQUARE_SIZE, SQUARE_CORNERS, RecordedPoint } from '../types';

interface GridMapProps {
  position: Coordinate;
  setPosition: (pos: Coordinate) => void;
  targetPosition: Coordinate | null;
  setTargetPosition: (pos: Coordinate | null) => void;
  interactionMode: 'MOVE' | 'TARGET';
  snapToGrid: boolean;
  onTouchedPointsChange: (points: Coordinate[]) => void;
  recordedPath: RecordedPoint[];
}

const GridMap: React.FC<GridMapProps> = ({ 
  position, 
  setPosition, 
  targetPosition,
  setTargetPosition,
  interactionMode,
  snapToGrid, 
  onTouchedPointsChange,
  recordedPath
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Coordinate>({ x: 0, y: 0 });

  // Generate grid points (0 to 10)
  const gridPoints = useMemo(() => {
    const points: Coordinate[] = [];
    for (let y = 0; y <= GRID_SIZE; y++) {
      for (let x = 0; x <= GRID_SIZE; x++) {
        points.push({ x, y });
      }
    }
    return points;
  }, []);

  // Calculate which points are "touched" (inside or on the edge of the square)
  const touchedPoints = useMemo(() => {
    return gridPoints.filter(p => 
      p.x >= position.x && p.x <= position.x + SQUARE_SIZE &&
      p.y >= position.y && p.y <= position.y + SQUARE_SIZE
    );
  }, [position, gridPoints]);

  // Notify parent of changes
  useEffect(() => {
    onTouchedPointsChange(touchedPoints);
  }, [touchedPoints, onTouchedPointsChange]);

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!svgRef.current) return;
    e.preventDefault();
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());

    if (interactionMode === 'TARGET') {
        setIsDragging(true);
        // If clicking on existing target, calculate offset. Otherwise, snap center to click (or top-left relative).
        const tPos = targetPosition || { x: svgP.x - SQUARE_SIZE/2, y: svgP.y - SQUARE_SIZE/2 };
        
        const isInsideTarget = targetPosition && 
            svgP.x >= targetPosition.x && svgP.x <= targetPosition.x + SQUARE_SIZE &&
            svgP.y >= targetPosition.y && svgP.y <= targetPosition.y + SQUARE_SIZE;

        if (isInsideTarget) {
            setDragOffset({ x: svgP.x - tPos.x, y: svgP.y - tPos.y });
        } else {
            // Jump to cursor (center aligned)
            const newX = svgP.x - SQUARE_SIZE/2;
            const newY = svgP.y - SQUARE_SIZE/2;
            setTargetPosition({ x: newX, y: newY });
            setDragOffset({ x: SQUARE_SIZE/2, y: SQUARE_SIZE/2 });
        }
        (e.target as Element).setPointerCapture(e.pointerId);
        return;
    }

    // Default: MOVE mode (Square)
    if (
      svgP.x >= position.x && svgP.x <= position.x + SQUARE_SIZE &&
      svgP.y >= position.y && svgP.y <= position.y + SQUARE_SIZE
    ) {
      setIsDragging(true);
      setDragOffset({ x: svgP.x - position.x, y: svgP.y - position.y });
      (e.target as Element).setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !svgRef.current) return;
    e.preventDefault();
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());

    let newX = svgP.x - dragOffset.x;
    let newY = svgP.y - dragOffset.y;

    // Boundaries
    newX = Math.max(0, Math.min(newX, GRID_SIZE - SQUARE_SIZE));
    newY = Math.max(0, Math.min(newY, GRID_SIZE - SQUARE_SIZE));

    if (snapToGrid) {
      newX = Math.round(newX);
      newY = Math.round(newY);
    }

    if (interactionMode === 'TARGET') {
        setTargetPosition({ x: newX, y: newY });
    } else {
        setPosition({ x: newX, y: newY });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as Element).releasePointerCapture(e.pointerId);
  };

  return (
    <div className={`w-full aspect-square max-w-[600px] bg-white rounded-xl shadow-inner border border-slate-200 overflow-hidden relative select-none ${interactionMode === 'TARGET' ? 'cursor-crosshair' : ''}`}>
      <svg
        ref={svgRef}
        viewBox={`-1 -1 ${GRID_SIZE + 2} ${GRID_SIZE + 2}`}
        className="w-full h-full touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Grid Lines */}
        <defs>
          <pattern id="smallGrid" width="1" height="1" patternUnits="userSpaceOnUse">
            <path d="M 1 0 L 0 0 0 1" fill="none" stroke="#e2e8f0" strokeWidth="0.05" />
          </pattern>
        </defs>
        <rect x="0" y="0" width={GRID_SIZE} height={GRID_SIZE} fill="url(#smallGrid)" />
        <rect x="0" y="0" width={GRID_SIZE} height={GRID_SIZE} fill="none" stroke="#cbd5e1" strokeWidth="0.1" />

        {/* Axis Labels */}
        {Array.from({ length: GRID_SIZE + 1 }).map((_, i) => (
            <React.Fragment key={i}>
                <text x={i} y="-0.3" fontSize="0.3" textAnchor="middle" fill="#64748b" className="font-mono">{i}</text>
                <text x="-0.3" y={i} fontSize="0.3" textAnchor="middle" dominantBaseline="middle" fill="#64748b" className="font-mono">{i}</text>
            </React.Fragment>
        ))}

        {/* Recorded Path Visualization */}
        {recordedPath.length > 0 && (
          <g className="pointer-events-none">
             {recordedPath.length > 1 && (
                <polyline
                    points={recordedPath.map(p => `${p.x + SQUARE_SIZE/2},${p.y + SQUARE_SIZE/2}`).join(' ')}
                    fill="none"
                    stroke="#fb7185" 
                    strokeWidth="0.04"
                    strokeDasharray="0.15 0.15"
                    strokeOpacity="0.6"
                />
             )}
             {recordedPath.map((p, i) => (
                <circle
                    key={`path-${i}`}
                    cx={p.x + SQUARE_SIZE/2}
                    cy={p.y + SQUARE_SIZE/2}
                    r={i === recordedPath.length - 1 ? "0.05" : "0.02"}
                    fill="#f43f5e"
                    opacity={0.8}
                />
             ))}
          </g>
        )}

        {/* Touched Points Highlights */}
        {touchedPoints.map((p) => (
          <circle
            key={`touched-${p.x}-${p.y}`}
            cx={p.x}
            cy={p.y}
            r="0.15"
            className="fill-indigo-500/50 animate-pulse"
          />
        ))}

        {/* All Grid Points (Dots) */}
        {gridPoints.map((p) => {
            const isTouched = touchedPoints.some(tp => tp.x === p.x && tp.y === p.y);
            return (
                <circle
                    key={`point-${p.x}-${p.y}`}
                    cx={p.x}
                    cy={p.y}
                    r={isTouched ? "0.08" : "0.05"}
                    fill={isTouched ? "#4f46e5" : "#cbd5e1"}
                    className="transition-colors duration-150"
                />
            );
        })}

        {/* Target Square */}
        {targetPosition && (
             <g 
                transform={`translate(${targetPosition.x}, ${targetPosition.y})`}
                className={`transition-opacity duration-300 ${interactionMode === 'TARGET' ? 'opacity-100' : 'opacity-60'}`}
             >
                <rect
                    width={SQUARE_SIZE}
                    height={SQUARE_SIZE}
                    fill="rgba(16, 185, 129, 0.1)"
                    stroke="#10b981"
                    strokeWidth="0.05"
                    strokeDasharray="0.2 0.1"
                />
                 {/* Center Cross of Target */}
                <line x1="0.5" y1="0.3" x2="0.5" y2="0.7" stroke="#10b981" strokeWidth="0.03" />
                <line x1="0.3" y1="0.5" x2="0.7" y2="0.5" stroke="#10b981" strokeWidth="0.03" />
                <text x="0.5" y="-0.15" fontSize="0.2" fill="#10b981" textAnchor="middle" className="font-mono font-bold">TARGET</text>
             </g>
        )}

        {/* Draggable Square (Main) */}
        <g 
            transform={`translate(${position.x}, ${position.y})`} 
            className={`${isDragging && interactionMode === 'MOVE' ? 'cursor-grabbing' : 'cursor-grab'} ${interactionMode === 'TARGET' ? 'opacity-40 grayscale' : 'opacity-100'} transition-all duration-300 ease-out`}
        >
          {/* Main Body */}
          <rect
            width={SQUARE_SIZE}
            height={SQUARE_SIZE}
            fill="rgba(59, 130, 246, 0.2)"
            stroke="#3b82f6"
            strokeWidth="0.05"
            className="hover:fill-blue-500/30 transition-colors"
          />
          
          {/* Corners */}
          {SQUARE_CORNERS.map((corner) => (
            <g key={corner.id} transform={`translate(${corner.x}, ${corner.y})`}>
                <circle r="0.12" fill={corner.color} stroke="white" strokeWidth="0.02" />
                <text 
                    y="0.04" 
                    fontSize="0.15" 
                    textAnchor="middle" 
                    fill="white" 
                    fontWeight="bold" 
                    pointerEvents="none"
                >
                    {corner.id}
                </text>
            </g>
          ))}
        </g>
      </svg>
      
      {/* Visual Helper */}
       <div className={`absolute bottom-2 right-2 px-2 py-1 rounded text-xs pointer-events-none transition-colors ${interactionMode === 'TARGET' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-white/80 text-slate-400'}`}>
        {interactionMode === 'TARGET' ? 'Click & Drag to Set Target' : '1m x 1m Square'}
      </div>
    </div>
  );
};

export default GridMap;
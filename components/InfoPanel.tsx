import React from 'react';
import { Coordinate, SQUARE_CORNERS, SquareCorner } from '../types';
import { Crosshair, ArrowRightLeft } from 'lucide-react';

interface InfoPanelProps {
  squarePos: Coordinate;
  touchedPoints: Coordinate[];
  targetPos: Coordinate | null;
}

const InfoPanel: React.FC<InfoPanelProps> = ({ squarePos, touchedPoints, targetPos }) => {
  
  const getCornerCoordinate = (corner: SquareCorner): Coordinate => ({
    x: Number((squarePos.x + corner.x).toFixed(2)),
    y: Number((squarePos.y + corner.y).toFixed(2))
  });

  const distanceToTarget = targetPos 
    ? Math.sqrt(Math.pow(targetPos.x - squarePos.x, 2) + Math.pow(targetPos.y - squarePos.y, 2))
    : 0;

  return (
    <div className="space-y-6">
      
      {/* Target Section (New) */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
         <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center justify-between">
            <span>Target Goal</span>
            {targetPos && <Crosshair className="w-4 h-4 text-emerald-500" />}
         </h3>
         
         {targetPos ? (
            <div className="space-y-3">
                 <div className="flex items-center justify-between bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                    <div className="flex flex-col">
                        <span className="text-xs text-emerald-600 font-semibold uppercase">Location</span>
                        <span className="font-mono text-lg text-emerald-800">
                            ({targetPos.x.toFixed(2)}, {targetPos.y.toFixed(2)})
                        </span>
                    </div>
                     <div className="flex flex-col items-end">
                        <span className="text-xs text-emerald-600 font-semibold uppercase">Distance</span>
                        <div className="flex items-center space-x-1">
                             <ArrowRightLeft className="w-3 h-3 text-emerald-600" />
                            <span className="font-mono text-lg text-emerald-800">
                                {distanceToTarget.toFixed(2)}m
                            </span>
                        </div>
                    </div>
                </div>
            </div>
         ) : (
             <div className="text-center py-4 text-slate-400 text-sm italic">
                 Enable Target Mode to set a destination.
             </div>
         )}
      </div>

      {/* Square Coordinates Section */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
          Square Corners
        </h3>
        <div className="grid grid-cols-1 gap-3">
            {SQUARE_CORNERS.map((corner) => {
                const coord = getCornerCoordinate(corner);
                return (
                    <div key={corner.id} className="flex items-center justify-between group">
                        <div className="flex items-center space-x-3">
                            <div 
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold shadow-sm"
                                style={{ backgroundColor: corner.color }}
                            >
                                {corner.id}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-700">{corner.name}</p>
                                <p className="text-xs text-slate-400 font-mono">Relative: ({corner.x}, {corner.y})</p>
                            </div>
                        </div>
                        <div className="font-mono text-sm font-semibold text-slate-700 bg-slate-50 px-2 py-1 rounded border border-slate-100">
                            ({coord.x.toFixed(1)}, {coord.y.toFixed(1)})
                        </div>
                    </div>
                );
            })}
        </div>
      </div>

      {/* Intersected Grid Points Section */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
             <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                Active Grid Points
            </h3>
            <span className="bg-indigo-100 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {touchedPoints.length}
            </span>
        </div>
       
        {touchedPoints.length > 0 ? (
          <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
            {touchedPoints.map((p) => (
              <div 
                key={`${p.x}-${p.y}`}
                className="flex items-center justify-center bg-indigo-50 border border-indigo-100 rounded p-2 text-indigo-700 font-mono text-sm hover:bg-indigo-100 transition-colors"
              >
                {p.x},{p.y}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-400 italic text-center py-4">No grid points intersected</p>
        )}
      </div>
    </div>
  );
};

export default InfoPanel;
import React, { useState } from 'react';
import { X, MapPin, Copy, Check, Play, Flag, Crosshair, Timer } from 'lucide-react';
import { Coordinate, SQUARE_CORNERS, RecordedPoint } from '../types';

interface PathModalProps {
  isOpen: boolean;
  onClose: () => void;
  path: RecordedPoint[];
  targetPosition: Coordinate | null;
  duration: number;
}

const PathModal: React.FC<PathModalProps> = ({ isOpen, onClose, path, targetPosition, duration }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const startPos = path.length > 0 ? path[0] : null;
  const endPos = path.length > 0 ? path[path.length - 1] : null;

  const getCornersForPosition = (pos: Coordinate) => {
    return SQUARE_CORNERS.map(c => ({
        id: c.id,
        name: c.name,
        x: Number((pos.x + c.x).toFixed(2)),
        y: Number((pos.y + c.y).toFixed(2))
    }));
  };

  const handleCopy = () => {
    // Generate detailed history with all corners calculated
    const pathHistory = path.map((p, index) => ({
        step: index + 1,
        timeOffset: Number(p.timeOffset.toFixed(3)),
        position: { x: p.x, y: p.y },
        corners: getCornersForPosition(p)
    }));

    const data = {
      summary: {
          startPosition: startPos ? { position: { x: startPos.x, y: startPos.y }, corners: getCornersForPosition(startPos) } : null,
          endPosition: endPos ? { position: { x: endPos.x, y: endPos.y }, corners: getCornersForPosition(endPos) } : null,
          targetPosition: targetPosition,
          durationSeconds: Number(duration.toFixed(2)),
          totalSteps: path.length
      },
      recordingHistory: pathHistory
    };

    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-3">
            <div className="bg-indigo-100 p-2 rounded-lg">
                <MapPin className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
                <h3 className="font-bold text-slate-800">Recorded Path Data</h3>
                <p className="text-xs text-slate-500">{path.length} data points captured</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary Cards */}
        {path.length > 0 && (
            <div className="p-4 bg-white grid grid-cols-2 md:grid-cols-4 gap-3 border-b border-slate-100">
                <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-100 flex flex-col items-center text-center space-y-1">
                    <div className="flex items-center space-x-1 text-blue-600 mb-1">
                        <Play className="w-3 h-3 fill-current" />
                        <span className="text-xs font-bold uppercase tracking-wide">Start</span>
                    </div>
                    <code className="text-sm font-mono font-semibold text-slate-700">
                        {startPos?.x.toFixed(1)}, {startPos?.y.toFixed(1)}
                    </code>
                </div>

                <div className="bg-red-50 p-2.5 rounded-lg border border-red-100 flex flex-col items-center text-center space-y-1">
                     <div className="flex items-center space-x-1 text-red-600 mb-1">
                        <Flag className="w-3 h-3 fill-current" />
                        <span className="text-xs font-bold uppercase tracking-wide">Finish</span>
                    </div>
                    <code className="text-sm font-mono font-semibold text-slate-700">
                        {endPos?.x.toFixed(1)}, {endPos?.y.toFixed(1)}
                    </code>
                </div>

                <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-100 flex flex-col items-center text-center space-y-1">
                     <div className="flex items-center space-x-1 text-emerald-600 mb-1">
                        <Crosshair className="w-3 h-3" />
                        <span className="text-xs font-bold uppercase tracking-wide">Target</span>
                    </div>
                     <code className="text-sm font-mono font-semibold text-slate-700">
                        {targetPosition ? `${targetPosition.x.toFixed(1)}, ${targetPosition.y.toFixed(1)}` : 'N/A'}
                    </code>
                </div>

                <div className="bg-amber-50 p-2.5 rounded-lg border border-amber-100 flex flex-col items-center text-center space-y-1">
                     <div className="flex items-center space-x-1 text-amber-600 mb-1">
                        <Timer className="w-3 h-3" />
                        <span className="text-xs font-bold uppercase tracking-wide">Duration</span>
                    </div>
                     <code className="text-sm font-mono font-semibold text-slate-700">
                        {duration.toFixed(2)}s
                    </code>
                </div>
            </div>
        )}
        
        {/* Toolbar */}
        <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex justify-end">
             <button
                onClick={handleCopy}
                disabled={path.length === 0}
                className={`text-xs font-medium flex items-center space-x-1.5 px-3 py-1.5 rounded-md transition-all border ${
                    copied 
                    ? 'bg-green-100 text-green-700 border-green-200' 
                    : 'bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                }`}
             >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied JSON!' : 'Copy as JSON'}</span>
             </button>
        </div>

        {/* Content List */}
        <div className="overflow-y-auto p-4 space-y-3 custom-scrollbar flex-1 bg-slate-50/30">
            {path.length === 0 ? (
                <div className="text-center py-12 flex flex-col items-center justify-center text-slate-400">
                    <MapPin className="w-12 h-12 mb-3 text-slate-200" />
                    <p className="italic">No movement data recorded yet.</p>
                    <p className="text-xs mt-1">Start recording and move the square.</p>
                </div>
            ) : (
                <div className="space-y-2">
                    <div className="flex items-center justify-between px-1">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Detailed History</p>
                        <p className="text-[10px] text-slate-400 font-mono">TL: Top-Left • TR: Top-Right • BR: Bottom-Right • BL: Bottom-Left</p>
                    </div>
                    
                    {path.map((p, i) => {
                        const corners = getCornersForPosition(p);
                        return (
                            <div key={i} className="bg-white rounded-lg border border-slate-100 shadow-sm hover:shadow-md transition-all overflow-hidden">
                                {/* Header Row */}
                                <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b border-slate-100">
                                    <div className="flex items-center space-x-3">
                                        <div className="flex items-center space-x-2">
                                            <span className="w-5 h-5 flex items-center justify-center bg-white border border-slate-200 rounded text-[10px] font-mono text-slate-500 font-bold">
                                                {i + 1}
                                            </span>
                                            <span className="text-xs font-semibold text-slate-600">Step</span>
                                        </div>
                                        <div className="flex items-center space-x-1 bg-amber-50 px-2 py-0.5 rounded border border-amber-100">
                                            <Timer className="w-3 h-3 text-amber-500" />
                                            <span className="font-mono text-xs font-medium text-amber-700">
                                                {p.timeOffset.toFixed(2)}s
                                            </span>
                                        </div>
                                    </div>
                                    <code className="font-mono text-indigo-600 text-xs font-bold">
                                        x: {p.x.toFixed(2)}, y: {p.y.toFixed(2)}
                                    </code>
                                </div>
                                
                                {/* Corners Grid */}
                                <div className="grid grid-cols-2 gap-px bg-slate-100">
                                    {corners.map((corner) => (
                                        <div key={corner.id} className="bg-white px-3 py-1.5 flex items-center justify-between">
                                            <span className="text-[10px] text-slate-400 font-medium">{corner.name} ({corner.id})</span>
                                            <code className="text-[10px] font-mono text-slate-600">
                                                {corner.x.toFixed(2)}, {corner.y.toFixed(2)}
                                            </code>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-white">
            <button 
                onClick={onClose}
                className="w-full py-2.5 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 active:scale-[0.99]"
            >
                Close View
            </button>
        </div>
      </div>
    </div>
  );
};

export default PathModal;
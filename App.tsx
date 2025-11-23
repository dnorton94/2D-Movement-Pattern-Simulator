import React, { useState, useEffect, useRef } from 'react';
import GridMap from './components/GridMap';
import InfoPanel from './components/InfoPanel';
import PathModal from './components/PathModal';
import { Coordinate, RecordedPoint } from './types';
import { MousePointer2, Crosshair, Move, Circle, Square, History, List } from 'lucide-react';

const App: React.FC = () => {
  const [position, setPosition] = useState<Coordinate>({ x: 2, y: 2 });
  const [targetPosition, setTargetPosition] = useState<Coordinate | null>(null);
  const [interactionMode, setInteractionMode] = useState<'MOVE' | 'TARGET'>('MOVE');
  
  const [touchedPoints, setTouchedPoints] = useState<Coordinate[]>([]);
  const [snapToGrid, setSnapToGrid] = useState(false);

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [recordedPath, setRecordedPath] = useState<RecordedPoint[]>([]);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Refs for precise timing
  const startTimeRef = useRef<number>(0);

  // Toggle Recording
  const handleRecordClick = () => {
    if (isRecording) {
      // STOP RECORDING MANUALLY
      setIsRecording(false);
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      setRecordingDuration(elapsed);
      setTimeLeft(10);
    } else {
      // START RECORDING
      setRecordedPath([]);
      startTimeRef.current = Date.now();
      setIsRecording(true);
      setTimeLeft(10);
      setRecordingDuration(0);
      // The tracking useEffect will trigger immediately due to isRecording dependency
      // and add the first point at t ~= 0
    }
  };

  // Timer Logic
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    
    if (isRecording && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // TIMER FINISHED
      setIsRecording(false);
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      setRecordingDuration(elapsed);
      setTimeLeft(10); // Reset for next time
    }

    return () => clearInterval(interval);
  }, [isRecording, timeLeft]);

  // Track Path
  useEffect(() => {
    if (isRecording) {
      const timeOffset = Math.max(0, (Date.now() - startTimeRef.current) / 1000);
      setRecordedPath((prev) => [...prev, { ...position, timeOffset }]);
    }
  }, [position, isRecording]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 leading-tight">Movement Pattern Simulator</h1>
                    <p className="text-sm text-slate-500">2D Fencing Movement Simulator</p>
                </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
                {/* Mode Toggles */}
                <div className="bg-slate-100 p-1 rounded-lg border border-slate-200 flex items-center">
                    <button
                        onClick={() => setInteractionMode('MOVE')}
                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                            interactionMode === 'MOVE'
                            ? 'bg-white text-blue-600 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Move className="w-4 h-4" />
                        <span>Move Square</span>
                    </button>
                    <button
                        onClick={() => setInteractionMode('TARGET')}
                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                            interactionMode === 'TARGET'
                            ? 'bg-white text-emerald-600 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <Crosshair className="w-4 h-4" />
                        <span>Set Target</span>
                    </button>
                </div>

                {/* Snap Toggle */}
                <div className="bg-slate-100 p-1 rounded-lg border border-slate-200">
                    <button
                        onClick={() => setSnapToGrid(!snapToGrid)}
                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                            snapToGrid 
                            ? 'bg-white text-indigo-600 shadow-sm' 
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                    >
                        <MousePointer2 className="w-4 h-4" />
                        <span>Snap: {snapToGrid ? 'ON' : 'OFF'}</span>
                    </button>
                </div>
            </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow p-4 md:p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Grid Visualization */}
            <div className="lg:col-span-7 xl:col-span-8 flex flex-col items-center">
                <GridMap 
                    position={position} 
                    setPosition={setPosition}
                    targetPosition={targetPosition}
                    setTargetPosition={setTargetPosition}
                    interactionMode={interactionMode}
                    snapToGrid={snapToGrid}
                    onTouchedPointsChange={setTouchedPoints}
                    recordedPath={recordedPath}
                />
                <div className="mt-4 text-center text-sm text-slate-400 max-w-md">
                   {interactionMode === 'MOVE' 
                        ? "Drag the blue square to move it. Switch modes to set a target."
                        : "Click anywhere on the grid or drag to set the green target position."
                   }
                </div>
            </div>

            {/* Right Column: Data & Insights */}
            <div className="lg:col-span-5 xl:col-span-4 flex flex-col space-y-6">
                
                {/* Info Panel */}
                <InfoPanel squarePos={position} touchedPoints={touchedPoints} targetPos={targetPosition} />

                {/* Recorder Panel */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                    <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                            <History className="w-4 h-4" />
                            Motion Tracker
                        </h3>
                        {isRecording && (
                            <span className="flex items-center space-x-1 text-red-500 animate-pulse">
                                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                <span className="text-xs font-bold">REC</span>
                            </span>
                        )}
                    </div>

                    <div className="flex items-center space-x-4 mb-4">
                        <div className={`text-4xl font-mono font-bold tabular-nums ${isRecording ? 'text-slate-800' : 'text-slate-300'}`}>
                            00:{timeLeft.toString().padStart(2, '0')}
                        </div>
                        <button
                            onClick={handleRecordClick}
                            className={`flex-1 py-3 px-4 rounded-lg font-semibold shadow-sm transition-all flex items-center justify-center space-x-2 ${
                                isRecording 
                                ? 'bg-red-50 text-red-600 border border-red-100 hover:bg-red-100' 
                                : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95'
                            }`}
                        >
                            {isRecording ? (
                                <>
                                    <Square className="w-4 h-4 fill-current" />
                                    <span>Stop Recording</span>
                                </>
                            ) : (
                                <>
                                    <Circle className="w-4 h-4 fill-current" />
                                    <span>Start Record (10s)</span>
                                </>
                            )}
                        </button>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-2">
                        <div className="text-xs text-slate-500">
                            Recorded Positions: <span className="font-mono font-medium text-slate-700">{recordedPath.length}</span>
                        </div>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            disabled={recordedPath.length === 0}
                            className="text-xs font-medium text-indigo-600 hover:text-indigo-800 disabled:text-slate-300 disabled:cursor-not-allowed flex items-center space-x-1 py-1 px-2 rounded hover:bg-indigo-50 transition-colors"
                        >
                            <List className="w-3 h-3" />
                            <span>View Data List</span>
                        </button>
                    </div>
                </div>

            </div>
        </div>
      </main>

      {/* Modals */}
      <PathModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        path={recordedPath} 
        targetPosition={targetPosition}
        duration={recordingDuration}
      />
    </div>
  );
};

export default App;
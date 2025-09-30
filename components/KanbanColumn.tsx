import React from 'react';
import { Match, Column, ColumnId } from '../types';
import MatchCard from './MatchCard';
import { SparklesIcon } from './icons/SparklesIcon';

interface KanbanColumnProps {
  column: Column;
  matches: Match[];
  betSlip: Match[];
  onDragStart: (e: React.DragEvent<HTMLDivElement>, matchId: string) => void;
  onDrop: (columnId: ColumnId) => void;
  onDeleteMatch: (matchId: string) => void;
  onToggleBetSlip: (match: Match) => void;
  onFullAnalysis: (matchId: string) => void;
  analyzingMatchId: string | null;
  onSuggestBetSlip: () => void;
  isSuggestingBetSlip: boolean;
}

const KanbanColumn: React.FC<KanbanColumnProps> = (props) => {
  const {
    column, matches, onDragStart, onDrop, onDeleteMatch, onToggleBetSlip, betSlip,
    onFullAnalysis, analyzingMatchId, onSuggestBetSlip, isSuggestingBetSlip
  } = props;

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    onDrop(column.id);
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className="bg-gray-900 border border-border-color rounded-xl flex flex-col h-full"
    >
      <div className="p-4 border-b border-border-color">
        <h3 className="font-bold text-lg text-white">{column.title}</h3>
        <p className="text-xs text-gray-400 mt-1">{column.description}</p>
        {column.id === 'final_selection' && (
           <button
             onClick={onSuggestBetSlip}
             disabled={isSuggestingBetSlip || matches.length < 2}
             className="w-full mt-3 py-2 px-3 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition-colors bg-blue-accent hover:bg-blue-500 text-white disabled:bg-gray-600 disabled:cursor-not-allowed"
           >
             {isSuggestingBetSlip ? (
               <>
                 <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                   <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                   <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                 </svg>
                 Suggestion...
               </>
             ) : (
               <>
                 <SparklesIcon className="h-4 w-4" />
                 Suggérer Combiné (IA)
               </>
             )}
           </button>
        )}
      </div>
      <div className="p-4 flex-grow space-y-4 overflow-y-auto">
        {matches.map(match => (
          <MatchCard
            key={match.id}
            match={match}
            onDragStart={onDragStart}
            onDelete={onDeleteMatch}
            onToggleBetSlip={onToggleBetSlip}
            isInBetSlip={betSlip.some(m => m.id === match.id)}
            onFullAnalysis={onFullAnalysis}
            isAnalyzing={analyzingMatchId === match.id}
          />
        ))}
         {matches.length === 0 && (
          <div className="text-center py-10 text-gray-500 text-sm">
            Déposez des matchs ici.
          </div>
        )}
      </div>
    </div>
  );
};

export default KanbanColumn;
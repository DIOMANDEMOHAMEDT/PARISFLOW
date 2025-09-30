import React from 'react';
import { Match, Column, ColumnId } from '../types';
import KanbanColumn from './KanbanColumn';

interface KanbanBoardProps {
  matches: Match[];
  columns: Column[];
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

const KanbanBoard: React.FC<KanbanBoardProps> = (props) => {
  const { 
    matches, columns, onDragStart, onDrop, onDeleteMatch, onToggleBetSlip, betSlip, 
    onFullAnalysis, analyzingMatchId, onSuggestBetSlip, isSuggestingBetSlip 
  } = props;
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6">
      {columns.map(column => (
        <KanbanColumn
          key={column.id}
          column={column}
          matches={matches.filter(match => match.status === column.id)}
          onDragStart={onDragStart}
          onDrop={onDrop}
          onDeleteMatch={onDeleteMatch}
          onToggleBetSlip={onToggleBetSlip}
          betSlip={betSlip}
          onFullAnalysis={onFullAnalysis}
          analyzingMatchId={analyzingMatchId}
          onSuggestBetSlip={onSuggestBetSlip}
          isSuggestingBetSlip={isSuggestingBetSlip}
        />
      ))}
    </div>
  );
};

export default KanbanBoard;
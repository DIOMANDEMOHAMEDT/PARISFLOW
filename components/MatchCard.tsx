import React from 'react';
import { Match } from '../types';
import { TrashIcon } from './icons/TrashIcon';
import { PlusIcon } from './icons/PlusIcon';
import { SparklesIcon } from './icons/SparklesIcon';

interface MatchCardProps {
  match: Match;
  isInBetSlip: boolean;
  isAnalyzing: boolean;
  onDragStart: (e: React.DragEvent<HTMLDivElement>, matchId: string) => void;
  onDelete: (matchId: string) => void;
  onToggleBetSlip: (match: Match) => void;
  onFullAnalysis: (matchId: string) => void;
}

const StatItem: React.FC<{ label: string; value: string | number; color?: string }> = ({ label, value, color = 'text-gray-200' }) => (
    <div className="text-center">
        <p className="text-xs text-gray-400">{label}</p>
        <p className={`font-bold text-lg ${color}`}>{value}</p>
    </div>
);


const MatchCard: React.FC<MatchCardProps> = ({ match, onDragStart, onDelete, onToggleBetSlip, isInBetSlip, onFullAnalysis, isAnalyzing }) => {
  const getOddsColor = (odds: number) => {
    if (odds >= 1.40 && odds <= 1.70) return 'text-green-400';
    return 'text-yellow-400';
  };
  
  const isArchived = match.status === 'archived';
    
  return (
    <div
      draggable={!isArchived}
      onDragStart={(e) => !isArchived && onDragStart(e, match.id)}
      className={`bg-gray-800 rounded-lg p-4 border border-border-color shadow-lg transition-all duration-200 flex flex-col gap-2 ${isArchived ? 'opacity-60 cursor-default' : 'cursor-grab active:cursor-grabbing hover:border-blue-accent'}`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="font-bold text-base text-white">{match.teamA} vs {match.teamB}</p>
          <p className="text-xs text-gray-400">{match.league}</p>
          <p className="text-xs text-gray-500">{new Date(match.matchDate).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
        </div>
        {!isArchived && (
            <button
            onClick={() => onDelete(match.id)}
            className="text-gray-500 hover:text-red-500 transition-colors"
            aria-label="Supprimer le match"
            >
            <TrashIcon />
            </button>
        )}
      </div>
      
      <div className="grid grid-cols-3 gap-2 my-2">
        <StatItem label="+2.5 Buts" value={`${match.over25Probability}%`} color={match.over25Probability >= 65 ? 'text-green-400' : 'text-gray-200'}/>
        <StatItem label="BTTS" value={`${match.bttsProbability}%`} color={match.bttsProbability >= 60 ? 'text-green-400' : 'text-gray-200'}/>
        <StatItem label="Cote O2.5" value={match.odds.toFixed(2)} color={getOddsColor(match.odds)} />
        <StatItem label="xG" value={match.avgXG.toFixed(2)} color={match.avgXG > 1.5 ? 'text-green-400' : 'text-gray-200'} />
        <StatItem label="xGA" value={match.avgXGA.toFixed(2)} color={match.avgXGA > 1.2 ? 'text-green-400' : 'text-gray-200'} />
        <StatItem label="Forme" value={`${match.recentOver25Count}/5`} color={match.recentOver25Count >= 4 ? 'text-green-400' : 'text-gray-200'} />
      </div>

      {match.aiAnalysis && (
        <div className={`mt-2 pt-3 border-t border-gray-700`}>
            <h5 className={`text-xs font-bold flex items-center gap-1.5 ${match.aiAnalysis.isGoodCandidate ? 'text-green-400' : 'text-yellow-400'}`}>
                <SparklesIcon className="h-4 w-4" />
                Analyse Forme IA: {match.aiAnalysis.isGoodCandidate ? "Bon Candidat" : "Candidat Moyen"}
            </h5>
            <p className="text-sm mt-1 text-gray-300">
                {match.aiAnalysis.analysis}
            </p>
        </div>
      )}

      {match.oddsAnalysis && (
        <div className={`mt-2 pt-3 border-t border-gray-700`}>
            <h5 className={`text-xs font-bold flex items-center gap-1.5 ${match.oddsAnalysis.isGoodValue ? 'text-green-400' : 'text-red-500'}`}>
                <SparklesIcon className="h-4 w-4" />
                Analyse Cotes IA: {match.oddsAnalysis.isGoodValue ? "Bonne Value" : "Cote Suspecte"}
            </h5>
            <p className="text-sm mt-1 text-gray-300">
                {match.oddsAnalysis.analysis}
            </p>
        </div>
      )}

      {!isArchived && (
         <div className="mt-auto pt-2">
            {match.status === 'shortlist' && !match.aiAnalysis && (
                <button
                onClick={() => onFullAnalysis(match.id)}
                disabled={isAnalyzing}
                className="w-full py-2 px-4 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition-colors bg-gray-700 hover:bg-gray-600 text-white disabled:bg-gray-600 disabled:cursor-wait"
                >
                {isAnalyzing ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyse Complète...
                    </>
                ) : (
                    <>
                        <SparklesIcon className="h-4 w-4" />
                        Lancer l'Analyse Complète (IA)
                    </>
                )}
                </button>
            )}

            {match.status === 'final_selection' && (
                <button
                onClick={() => onToggleBetSlip(match)}
                className={`w-full py-2 px-4 rounded-md text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${
                    isInBetSlip 
                    ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                    : 'bg-green-accent hover:bg-green-accent-hover text-white'
                }`}
                >
                {isInBetSlip ? 'Retirer du Combiné' : <> <PlusIcon className="h-4 w-4" /> Ajouter au Combiné</>}
                </button>
            )}
         </div>
      )}
    </div>
  );
};

export default MatchCard;
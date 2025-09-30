import React from 'react';
import { Bet } from '../types';

interface BetHistoryDetailModalProps {
  bet: Bet;
  onClose: () => void;
}

const BetHistoryDetailModal: React.FC<BetHistoryDetailModalProps> = ({ bet, onClose }) => {
  const getResultColor = (result: 'pending' | 'won' | 'lost') => {
    if (result === 'won') return 'bg-green-500 text-white';
    if (result === 'lost') return 'bg-red-500 text-white';
    return 'bg-yellow-500 text-black';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-lg border border-border-color relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl font-bold">&times;</button>
        <h2 className="text-2xl font-bold text-white mb-2">Détails du Pari</h2>
        <p className="text-sm text-gray-400 mb-6">Pari placé le {new Date(bet.date).toLocaleString()}</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-gray-900 p-4 rounded-lg mb-6">
            <div className="text-center">
                <p className="text-xs text-gray-400">Résultat</p>
                <p className={`font-bold text-lg px-2 py-0.5 rounded-md inline-block mt-1 text-sm ${getResultColor(bet.result)}`}>
                    {bet.result.toUpperCase()}
                </p>
            </div>
            <div className="text-center">
                <p className="text-xs text-gray-400">Cote Totale</p>
                <p className="font-bold text-lg text-blue-accent">{bet.totalOdds.toFixed(2)}</p>
            </div>
            <div className="text-center">
                <p className="text-xs text-gray-400">Mise</p>
                <p className="font-bold text-lg text-white">{bet.stake.toFixed(2)}€</p>
            </div>
            <div className="text-center">
                <p className="text-xs text-gray-400">Gains</p>
                <p className={`font-bold text-lg ${bet.result === 'won' ? 'text-green-400' : 'text-gray-300'}`}>
                    {bet.result === 'won' ? `+${(bet.stake * bet.totalOdds).toFixed(2)}€` : '0.00€'}
                </p>
            </div>
        </div>

        <h3 className="text-lg font-semibold text-white mb-3">Matchs du Combiné</h3>
        <div className="space-y-3 bg-gray-900 p-4 rounded-lg">
            {bet.matches.map(match => (
                <div key={match.id} className="flex justify-between items-center text-sm p-2 bg-gray-800 rounded">
                    <div>
                        <p className="font-semibold text-gray-200">{match.teamA} vs {match.teamB}</p>
                        <p className="text-xs text-gray-400">{match.league}</p>
                    </div>
                    <span className="font-bold text-blue-accent">{match.odds.toFixed(2)}</span>
                </div>
            ))}
        </div>

        <div className="flex justify-end mt-6">
            <button onClick={onClose} className="py-2 px-4 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-semibold transition-colors">Fermer</button>
        </div>
      </div>
    </div>
  );
};

export default BetHistoryDetailModal;
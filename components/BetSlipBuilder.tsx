import React, { useState, useMemo } from 'react';
import { Match, Bet } from '../types';
import { InfoIcon } from './icons/InfoIcon';

interface BetSlipBuilderProps {
  betSlip: Match[];
  onPlaceBet: (stake: number, totalOdds: number) => void;
  bankroll: number;
  betHistory: Bet[];
  onUpdateBetResult: (betId: string, result: 'won' | 'lost') => void;
  onViewBetDetails: (bet: Bet) => void;
}

const BetSlipBuilder: React.FC<BetSlipBuilderProps> = ({ betSlip, onPlaceBet, bankroll, betHistory, onUpdateBetResult, onViewBetDetails }) => {
  const [stake, setStake] = useState<number>(10);

  const totalOdds = useMemo(() => {
    return betSlip.reduce((acc, match) => acc * match.odds, 1);
  }, [betSlip]);

  const potentialWinnings = useMemo(() => {
    return stake * totalOdds;
  }, [stake, totalOdds]);

  const handlePlaceBet = () => {
    if (stake <= 0) {
      alert("La mise doit être supérieure à 0.");
      return;
    }
    if (betSlip.length < 2) {
      alert("Un combiné doit contenir au moins 2 matchs.");
      return;
    }
    onPlaceBet(stake, totalOdds);
  };
  
  const setStakePercentage = (percentage: number) => {
    setStake(Math.round((bankroll * percentage / 100) * 100) / 100);
  };

  const isBetValid = betSlip.length >= 2 && betSlip.length <=3 && totalOdds <= 2.5;

  return (
    <div className="bg-gray-900 border border-border-color rounded-xl flex flex-col h-full">
      <div className="p-4 border-b border-border-color">
        <h3 className="font-bold text-lg text-white">Combiné & Historique</h3>
      </div>
      <div className="p-4 flex-grow flex flex-col">
        {/* Bet Slip Section */}
        <div className="bg-gray-800 rounded-lg p-4 border border-border-color mb-4">
          <h4 className="font-semibold text-white mb-3">Votre Combiné</h4>
          {betSlip.length === 0 ? (
            <p className="text-sm text-gray-400">Ajoutez des matchs depuis la "Sélection Finale".</p>
          ) : (
            <div className="space-y-2">
              {betSlip.map(match => (
                <div key={match.id} className="flex justify-between text-sm">
                  <span className="text-gray-300 truncate pr-2">{match.teamA} vs {match.teamB}</span>
                  <span className="font-bold text-blue-accent">{match.odds.toFixed(2)}</span>
                </div>
              ))}
            </div>
          )}
          
          {betSlip.length > 0 && (
            <div className="mt-4 pt-4 border-t border-border-color">
              <div className="flex justify-between text-lg font-bold">
                <span className="text-gray-300">Cote Totale:</span>
                <span className={totalOdds > 2.5 ? 'text-red-500' : 'text-green-400'}>{totalOdds.toFixed(2)}</span>
              </div>
              
              <div className="mt-4">
                 <label htmlFor="stake" className="block text-sm font-medium text-gray-300 mb-1">Mise (€)</label>
                 <div className="flex items-center gap-2">
                    <input
                        type="number"
                        id="stake"
                        value={stake}
                        onChange={(e) => setStake(parseFloat(e.target.value) || 0)}
                        className="w-full bg-gray-900 border border-border-color text-white rounded-md p-2"
                    />
                    <button onClick={() => setStakePercentage(5)} className="text-xs bg-gray-700 px-2 py-1 rounded hover:bg-gray-600">5%</button>
                    <button onClick={() => setStakePercentage(10)} className="text-xs bg-gray-700 px-2 py-1 rounded hover:bg-gray-600">10%</button>
                 </div>
                 <p className="text-right text-sm mt-1 text-gray-300">Gains potentiels: <span className="font-bold text-green-400">{potentialWinnings.toFixed(2)}€</span></p>
              </div>

              <button 
                onClick={handlePlaceBet}
                disabled={!isBetValid}
                className="w-full mt-4 py-2 px-4 rounded-lg bg-blue-accent text-white font-bold transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed hover:bg-blue-500"
              >
                Placer le Pari
              </button>
              {!isBetValid && <p className="text-xs text-red-500 text-center mt-2">Le combiné doit avoir 2-3 matchs et une cote ≤ 2.5.</p>}
            </div>
          )}
        </div>
        
        {/* History Section */}
        <div className="flex-grow">
          <h4 className="font-semibold text-white mb-3">Historique des Paris</h4>
          <div className="space-y-3 overflow-y-auto max-h-96 pr-2">
            {betHistory.length === 0 ? <p className="text-sm text-gray-400">Aucun pari placé.</p> :
            betHistory.map(bet => (
              <div key={bet.id} className="bg-gray-800 p-3 rounded-lg text-sm">
                <div className="flex justify-between items-center">
                    <p className="text-gray-400">{new Date(bet.date).toLocaleDateString()}</p>
                    <div className="flex items-center gap-2">
                        <p className={`font-bold px-2 py-0.5 rounded text-xs ${
                            bet.result === 'pending' ? 'bg-yellow-500 text-black' :
                            bet.result === 'won' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}>{bet.result.toUpperCase()}</p>
                         <button onClick={() => onViewBetDetails(bet)} aria-label="Voir les détails du pari" className="text-gray-400 hover:text-blue-accent">
                            <InfoIcon className="h-4 w-4" />
                        </button>
                    </div>
                </div>
                <p className="text-white font-semibold mt-1">{bet.matches.length} Matchs - Cote: {bet.totalOdds.toFixed(2)}</p>
                <p className="text-gray-300">Mise: {bet.stake.toFixed(2)}€ - Gains pot: {(bet.stake * bet.totalOdds).toFixed(2)}€</p>
                {bet.result === 'pending' && (
                    <div className="flex gap-2 mt-2">
                        <button onClick={() => onUpdateBetResult(bet.id, 'won')} className="text-xs bg-green-accent px-2 py-1 rounded hover:bg-green-accent-hover w-full">Gagné</button>
                        <button onClick={() => onUpdateBetResult(bet.id, 'lost')} className="text-xs bg-red-600 px-2 py-1 rounded hover:bg-red-700 w-full">Perdu</button>
                    </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BetSlipBuilder;
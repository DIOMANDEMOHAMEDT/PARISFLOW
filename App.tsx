import React, { useState, useEffect } from 'react';
import { Match, ColumnId, Bet } from './types';
import { COLUMNS } from './constants';
import Header from './components/Header';
import KanbanBoard from './components/KanbanBoard';
import BetSlipBuilder from './components/BetSlipBuilder';
import BankrollManager from './components/BankrollManager';
import AddMatchModal from './components/AddMatchModal';
import { PlusIcon } from './components/icons/PlusIcon';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { GoogleGenAI, Type } from '@google/genai';
import BetHistoryDetailModal from './components/BetHistoryDetailModal';

const defaultMatchesForTest: Match[] = [
  {
    id: 'match-20251001-1',
    matchDate: '2025-10-01',
    teamA: 'FC Dynamo',
    teamB: 'AC Metropolis',
    league: 'Champions League',
    status: 'shortlist',
    over25Probability: 75,
    avgGoals: 3.1,
    bttsProbability: 68,
    avgXG: 1.8,
    avgXGA: 1.4,
    recentOver25Count: 4,
    odds: 1.58,
  },
  {
    id: 'match-20251001-2',
    matchDate: '2025-10-01',
    teamA: 'United Strikers',
    teamB: 'Olympique City',
    league: 'Europa League',
    status: 'shortlist',
    over25Probability: 68,
    avgGoals: 2.9,
    bttsProbability: 72,
    avgXG: 1.7,
    avgXGA: 1.5,
    recentOver25Count: 3,
    odds: 1.65,
  },
  {
    id: 'match-20251001-3',
    matchDate: '2025-10-01',
    teamA: 'Vanguards FC',
    teamB: 'SC Titans',
    league: 'Ligue Nationale Majeure',
    status: 'shortlist',
    over25Probability: 80,
    avgGoals: 3.4,
    bttsProbability: 61,
    avgXG: 2.1,
    avgXGA: 1.3,
    recentOver25Count: 5,
    odds: 1.52,
  },
];


const App: React.FC = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [betSlip, setBetSlip] = useState<Match[]>([]);
  const [bankroll, setBankroll] = useState<number>(1000);
  const [betHistory, setBetHistory] = useState<Bet[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [draggedMatch, setDraggedMatch] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [analyzingMatchId, setAnalyzingMatchId] = useState<string | null>(null);
  const [isSuggestingBetSlip, setIsSuggestingBetSlip] = useState(false);
  const [viewingBet, setViewingBet] = useState<Bet | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('2025-10-01');


  useEffect(() => {
    const savedMatches = localStorage.getItem('pari-flow-matches');
    const savedBankroll = localStorage.getItem('pari-flow-bankroll');
    const savedBetHistory = localStorage.getItem('pari-flow-bet-history');
    if (savedMatches) {
      setMatches(JSON.parse(savedMatches));
    } else {
      setMatches(defaultMatchesForTest);
    }
    if (savedBankroll) setBankroll(JSON.parse(savedBankroll));
    if (savedBetHistory) setBetHistory(JSON.parse(savedBetHistory));
  }, []);

  useEffect(() => {
    localStorage.setItem('pari-flow-matches', JSON.stringify(matches));
  }, [matches]);

  useEffect(() => {
    localStorage.setItem('pari-flow-bankroll', JSON.stringify(bankroll));
  }, [bankroll]);

  useEffect(() => {
    localStorage.setItem('pari-flow-bet-history', JSON.stringify(betHistory));
  }, [betHistory]);

  const addMatch = (newMatch: Omit<Match, 'id' | 'status'>) => {
    const matchWithId: Match = {
      ...newMatch,
      id: `match-${Date.now()}-${Math.random()}`,
      status: 'shortlist'
    };
    setMatches(prev => [...prev, matchWithId]);
  };
  
  const deleteMatch = (matchId: string) => {
    setMatches(prev => prev.filter(m => m.id !== matchId));
    setBetSlip(prev => prev.filter(m => m.id !== matchId));
  };
  
  const handleGenerateMatches = async () => {
    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const responseSchema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            matchDate: { type: Type.STRING },
            teamA: { type: Type.STRING },
            teamB: { type: Type.STRING },
            league: { type: Type.STRING },
            over25Probability: { type: Type.NUMBER },
            avgGoals: { type: Type.NUMBER },
            bttsProbability: { type: Type.NUMBER },
            avgXG: { type: Type.NUMBER },
            avgXGA: { type: Type.NUMBER },
            recentOver25Count: { type: Type.NUMBER },
            odds: { type: Type.NUMBER },
          },
          required: ["matchDate", "teamA", "teamB", "league", "over25Probability", "avgGoals", "bttsProbability", "avgXG", "avgXGA", "recentOver25Count", "odds"]
        },
      };

      const formattedDate = new Date(selectedDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

      const prompt = `
        Agis en tant qu'analyste de données sportives expert utilisant des outils comme FootyStats et SoccerStats pour le repérage. Ta mission est de trouver des matchs de football réels ou très réalistes pour la date du **${formattedDate} (${selectedDate})**. Ces matchs doivent être des candidats idéaux pour une stratégie de pari "Over 2.5 buts".

        Respecte IMPÉRATIVEMENT les critères suivants pour chaque match trouvé :
        - matchDate: La date du match. Doit être "${selectedDate}".
        - over25Probability: Pourcentage de matchs terminés à +2.5 buts. Doit être supérieur ou égal à 65.
        - avgGoals: Moyenne de buts par match. Doit être supérieure ou égale à 2.7.
        - bttsProbability: Pourcentage de matchs où les deux équipes marquent. Doit être supérieur ou égal à 60.
        - league: Choisis des ligues principales et évite les divisions exotiques ou les ligues de réserve, qui sont trop imprévisibles.
        - odds: La cote pour l'over 2.5 doit être entre 1.40 et 1.70.
        - avgXG, avgXGA, recentOver25Count: Génère des valeurs de base réalistes pour ces statistiques, elles seront affinées plus tard.

        Retourne le résultat sous forme de tableau JSON de 4 matchs, en respectant le schéma fourni.
      `;
      
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: responseSchema,
        },
      });

      const generatedMatches = JSON.parse(response.text);
      generatedMatches.forEach((match: Omit<Match, 'id' | 'status'>) => {
        addMatch(match);
      });

    } catch (error) {
      console.error("Error generating matches:", error);
      alert("Une erreur est survenue lors de la génération des matchs. Veuillez réessayer.");
    } finally {
      setIsGenerating(false);
    }
  };

    const handleFullAnalysis = async (matchId: string) => {
    const matchToAnalyze = matches.find(m => m.id === matchId);
    if (!matchToAnalyze) return;

    setAnalyzingMatchId(matchId);

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        // --- Step 1: Form Analysis ---
        const formAnalysisSchema = {
            type: Type.OBJECT,
            properties: {
                isGoodCandidate: { type: Type.BOOLEAN },
                analysis: { type: Type.STRING },
                updatedStats: {
                    type: Type.OBJECT,
                    properties: {
                        avgXG: { type: Type.NUMBER },
                        avgXGA: { type: Type.NUMBER },
                        recentOver25Count: { type: Type.NUMBER },
                    },
                    required: ["avgXG", "avgXGA", "recentOver25Count"]
                }
            },
            required: ["isGoodCandidate", "analysis", "updatedStats"]
        };
        const formAnalysisPrompt = `
          Agis en tant qu'analyste de données sportives expert, utilisant des outils comme FootballXG.com et FBref pour l'analyse de forme. Analyse le match suivant : ${matchToAnalyze.teamA} vs ${matchToAnalyze.teamB} en ${matchToAnalyze.league}.
          Ta mission est de vérifier la forme récente des équipes et de déterminer si le match est un candidat SOLIDE pour un pari "Over 2.5 buts". Pour être un bon candidat, les conditions suivantes doivent être remplies lors de ton analyse FICTIVE mais réaliste :
          1. Occasions créées : Les équipes doivent créer beaucoup d'occasions réelles. L'avgXG (xG moyen) doit être supérieur à 1.5.
          2. Défense perméable : La défense doit concéder des occasions. L'avgXGA (xGA moyen) doit être supérieur à 1.2.
          3. Forme récente : Au moins 4 des 5 derniers matchs doivent s'être terminés à +2.5 buts.
          Retourne ta réponse en JSON en respectant le schéma.
          - isGoodCandidate: true si les 3 conditions sont remplies, sinon false.
          - analysis: Une phrase courte justifiant ta décision en te basant sur les xG, xGA et la forme.
          - updatedStats: Un objet avec les valeurs affinées pour avgXG, avgXGA, et recentOver25Count qui confirment ton analyse.
        `;
        const formResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: formAnalysisPrompt,
            config: { responseMimeType: "application/json", responseSchema: formAnalysisSchema },
        });
        const formResult = JSON.parse(formResponse.text);

        if (!formResult.isGoodCandidate) {
            setMatches(prev => prev.map(m => m.id === matchId ? {
                ...m,
                ...formResult.updatedStats,
                aiAnalysis: { isGoodCandidate: formResult.isGoodCandidate, analysis: formResult.analysis }
            } : m));
            return;
        }

        // --- Step 2: Odds Analysis ---
        const oddsAnalysisSchema = {
            type: Type.OBJECT,
            properties: { isGoodValue: { type: Type.BOOLEAN }, analysis: { type: Type.STRING } },
            required: ["isGoodValue", "analysis"]
        };
        const oddsAnalysisPrompt = `
          Agis comme un analyste expert du marché des paris sportifs, utilisant des outils comme OddsPortal et BetExplorer. Analyse la cote "Over 2.5 buts" pour le match ${matchToAnalyze.teamA} vs ${matchToAnalyze.teamB}, actuellement à ${matchToAnalyze.odds}.
          Ta mission est de contrôler la cote et de déterminer si elle a une bonne "value". Pour ce faire, effectue une analyse FICTIVE mais réaliste :
          1. Fourchette de cote : Vérifie que la cote de ${matchToAnalyze.odds} est bien dans la fourchette cible pour un combiné modéré (entre 1.40 et 1.70).
          2. Mouvement du marché : Simule une vérification pour t'assurer qu'il n'y a pas de chute anormale de cote sur le pari inverse ("Under 2.5"), ce qui serait un très mauvais signe.
          3. Comparaison : Simule une comparaison entre bookmakers pour confirmer que la cote actuelle est compétitive.
          Retourne ta réponse en JSON en respectant le schéma.
          - isGoodValue: true si la cote est dans la fourchette, qu'il n'y a pas de mouvement suspect et qu'elle est compétitive. False sinon.
          - analysis: Une phrase courte justifiant ta décision.
        `;
        const oddsResponse = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: oddsAnalysisPrompt,
            config: { responseMimeType: "application/json", responseSchema: oddsAnalysisSchema },
        });
        const oddsResult = JSON.parse(oddsResponse.text);

        // --- Final State Update ---
        setMatches(prev => prev.map(m => {
            if (m.id === matchId) {
                return {
                    ...m,
                    ...formResult.updatedStats,
                    aiAnalysis: { isGoodCandidate: formResult.isGoodCandidate, analysis: formResult.analysis },
                    oddsAnalysis: { isGoodValue: oddsResult.isGoodValue, analysis: oddsResult.analysis },
                    status: oddsResult.isGoodValue ? 'final_selection' : 'odds_check'
                };
            }
            return m;
        }));

    } catch (error) {
        console.error("Error during full analysis:", error);
        alert("Une erreur est survenue lors de l'analyse complète. Veuillez réessayer.");
    } finally {
        setAnalyzingMatchId(null);
    }
  };
  
  const handleSuggestBetSlip = async () => {
    const finalSelectionMatches = matches.filter(m => m.status === 'final_selection');
    if (finalSelectionMatches.length < 2) {
      alert("Il faut au moins 2 matchs dans la 'Sélection Finale' pour une suggestion.");
      return;
    }

    setIsSuggestingBetSlip(true);
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const responseSchema = {
            type: Type.OBJECT,
            properties: {
                selectedMatchIds: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                },
                justification: { type: Type.STRING }
            },
            required: ["selectedMatchIds", "justification"]
        };

        const prompt = `
          Agis comme un parieur professionnel stratège. Voici une liste de matchs ayant passé toutes les étapes de validation :
          ${JSON.stringify(finalSelectionMatches.map(m => ({id: m.id, teamA: m.teamA, teamB: m.teamB, odds: m.odds, xG: m.avgXG, over25Probability: m.over25Probability, aiAnalysis: m.aiAnalysis, oddsAnalysis: m.oddsAnalysis})))}

          Ta mission est de construire le combiné final. Suis ces règles d'or IMPÉRATIVES :
          1.  **Règle 1 (Composition) :** Le combiné doit contenir EXACTEMENT 2 ou 3 matchs.
          2.  **Règle 2 (Cote Totale) :** La cote finale (produit des cotes) doit être INFÉRIEURE OU ÉGALE à 2.5. C'est une limite stricte.
          3.  **Règle 3 (Stabilité) :** Si tu as le choix entre plusieurs combinaisons possibles, privilégie celle qui utilise les matchs les plus STABLES, c'est-à-dire ceux avec les meilleurs xG et les pourcentages d'over 2.5 les plus élevés.
          4.  **Règle 4 (Validation IA) :** Tu ne peux utiliser QUE des matchs qui ont une validation positive de l'IA pour la forme (\`aiAnalysis.isGoodCandidate: true\`) ET pour les cotes (\`oddsAnalysis.isGoodValue: true\`).

          Choisis la meilleure combinaison possible et retourne ta réponse en JSON en respectant le schéma.
          - selectedMatchIds: Un tableau contenant les IDs des matchs que tu as sélectionnés.
          - justification: Une justification DÉTAILLÉE expliquant pourquoi ce combiné est le choix optimal, en mentionnant explicitement la stabilité des matchs choisis (xG, % overs) et comment la cote finale respecte la stratégie de risque modéré (≤ 2.5).
        `;

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: responseSchema,
            },
        });

        const suggestion = JSON.parse(response.text);
        const suggestedMatches = finalSelectionMatches.filter(m => suggestion.selectedMatchIds.includes(m.id));
        
        if (suggestedMatches.length > 0) {
            setBetSlip(suggestedMatches);
            alert(`Suggestion IA : ${suggestion.justification}`);
        } else {
            alert("L'IA n'a pas pu former un combiné optimal avec les matchs actuels (vérifiez que les analyses IA sont positives).");
        }

    } catch (error) {
        console.error("Error suggesting bet slip:", error);
        alert("Une erreur est survenue lors de la suggestion du combiné. Veuillez réessayer.");
    } finally {
        setIsSuggestingBetSlip(false);
    }
  };


  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, matchId: string) => {
    setDraggedMatch(matchId);
    e.dataTransfer.effectAllowed = 'move';
  };
  
  const handleDrop = (columnId: ColumnId) => {
    if (!draggedMatch) return;
    setMatches(prevMatches =>
      prevMatches.map(match =>
        match.id === draggedMatch ? { ...match, status: columnId } : match
      )
    );
    setDraggedMatch(null);
  };
  
  const toggleBetSlip = (match: Match) => {
    setBetSlip(prev => {
      const isInSlip = prev.some(m => m.id === match.id);
      if (isInSlip) {
        return prev.filter(m => m.id !== match.id);
      } else {
        if (prev.length < 3) return [...prev, match];
        return prev; // Max 3 matches
      }
    });
  };

  const placeBet = (stake: number, totalOdds: number) => {
    if (stake > bankroll) {
      alert("Mise supérieure au capital !");
      return;
    }

    const newBet: Bet = {
      id: `bet-${Date.now()}`,
      matches: [...betSlip],
      stake,
      totalOdds,
      date: new Date().toISOString(),
      result: 'pending'
    };
    
    setBetHistory(prev => [newBet, ...prev]);
    setBankroll(prev => prev - stake);
    
    // Move matches to 'archived' and clear slip
    const betSlipIds = betSlip.map(m => m.id);
    setMatches(prev => prev.map(m => 
      betSlipIds.includes(m.id) ? { ...m, status: 'archived' } : m
    ));
    setBetSlip([]);
  };
  
  const updateBetResult = (betId: string, result: 'won' | 'lost') => {
      const bet = betHistory.find(b => b.id === betId);
      if (!bet || bet.result !== 'pending') return;

      setBetHistory(prev => prev.map(b => b.id === betId ? {...b, result} : b));

      if(result === 'won') {
          const winnings = bet.stake * bet.totalOdds;
          setBankroll(prev => prev + winnings);
      }
  };


  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <Header />
      <main className="flex-grow p-4 md:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div className="lg:col-span-2 xl:col-span-3">
           <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
             <h2 className="text-2xl font-bold text-gray-100">Workflow Quotidien</h2>
             <div className="flex flex-wrap gap-2 items-center">
                <div>
                  <label htmlFor="match-date-picker" className="sr-only">Choisir une date</label>
                  <input
                      type="date"
                      id="match-date-picker"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="bg-gray-800 border border-border-color text-gray-200 rounded-lg p-2 h-[42px] focus:ring-2 focus:ring-blue-accent focus:border-blue-accent outline-none"
                  />
                </div>
                <button
                    onClick={handleGenerateMatches}
                    disabled={isGenerating}
                    className="flex items-center gap-2 bg-blue-accent text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-500 transition-colors duration-200 disabled:bg-gray-600 disabled:cursor-wait"
                >
                    {isGenerating ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Génération...
                        </>
                    ) : (
                        <>
                            <SparklesIcon />
                            Générer des Matchs (IA)
                        </>
                    )}
                 </button>
                 <button
                   onClick={() => setIsModalOpen(true)}
                   className="flex items-center gap-2 bg-green-accent text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-accent-hover transition-colors duration-200"
                 >
                   <PlusIcon />
                   Ajouter un Match
                 </button>
             </div>
           </div>
          <KanbanBoard 
            matches={matches} 
            columns={COLUMNS}
            onDragStart={handleDragStart}
            onDrop={handleDrop}
            onDeleteMatch={deleteMatch}
            onToggleBetSlip={toggleBetSlip}
            betSlip={betSlip}
            onFullAnalysis={handleFullAnalysis}
            analyzingMatchId={analyzingMatchId}
            onSuggestBetSlip={handleSuggestBetSlip}
            isSuggestingBetSlip={isSuggestingBetSlip}
          />
        </div>

        <div className="lg:col-span-1 xl:col-span-1 flex flex-col gap-6">
          <BankrollManager bankroll={bankroll} setBankroll={setBankroll} />
          <BetSlipBuilder 
            betSlip={betSlip} 
            onPlaceBet={placeBet} 
            bankroll={bankroll} 
            betHistory={betHistory}
            onUpdateBetResult={updateBetResult}
            onViewBetDetails={setViewingBet}
          />
        </div>
      </main>
      
      {isModalOpen && (
        <AddMatchModal 
          onClose={() => setIsModalOpen(false)}
          onAddMatch={addMatch}
        />
      )}

      {viewingBet && (
        <BetHistoryDetailModal 
            bet={viewingBet}
            onClose={() => setViewingBet(null)}
        />
      )}
    </div>
  );
};

export default App;
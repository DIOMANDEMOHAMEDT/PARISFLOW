
import React, { useState } from 'react';

interface AddMatchModalProps {
  onClose: () => void;
  onAddMatch: (matchData: any) => void;
}

const InputField: React.FC<{label: string, name: string, type?: string, value: string | number, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, step?: string}> = 
({ label, name, type = 'text', value, onChange, step = "0.01" }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <input
            type={type}
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            step={type === 'number' ? step : undefined}
            className="w-full bg-gray-900 border border-border-color text-white rounded-md p-2 focus:ring-2 focus:ring-blue-accent focus:border-blue-accent outline-none"
            required
        />
    </div>
);


const AddMatchModal: React.FC<AddMatchModalProps> = ({ onClose, onAddMatch }) => {
  const [formData, setFormData] = useState({
    matchDate: new Date().toISOString().split('T')[0],
    teamA: '',
    teamB: '',
    league: '',
    over25Probability: 70,
    avgGoals: 2.8,
    bttsProbability: 65,
    avgXG: 1.6,
    avgXGA: 1.3,
    recentOver25Count: 4,
    odds: 1.55,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddMatch(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-2xl border border-border-color relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">&times;</button>
        <h2 className="text-2xl font-bold text-white mb-6">Ajouter un nouveau match</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-1"><InputField label="Équipe Domicile" name="teamA" value={formData.teamA} onChange={handleChange} /></div>
                <div className="md:col-span-1"><InputField label="Équipe Extérieur" name="teamB" value={formData.teamB} onChange={handleChange} /></div>
                <div className="md:col-span-1"><InputField label="Ligue" name="league" value={formData.league} onChange={handleChange} /></div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-1"><InputField label="Date du Match" name="matchDate" type="date" value={formData.matchDate} onChange={handleChange} /></div>
                <div className="md:col-span-1"><InputField label="+2.5 Buts (%)" name="over25Probability" type="number" value={formData.over25Probability} onChange={handleChange} step="1" /></div>
                <div className="md:col-span-1"><InputField label="BTTS (%)" name="bttsProbability" type="number" value={formData.bttsProbability} onChange={handleChange} step="1" /></div>
                <div className="md:col-span-1"><InputField label="Cote Over 2.5" name="odds" type="number" value={formData.odds} onChange={handleChange} /></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <InputField label="xG Moyen" name="avgXG" type="number" value={formData.avgXG} onChange={handleChange} />
                <InputField label="xGA Moyen" name="avgXGA" type="number" value={formData.avgXGA} onChange={handleChange} />
                <InputField label="Forme +2.5 /5" name="recentOver25Count" type="number" value={formData.recentOver25Count} onChange={handleChange} step="1"/>
            </div>
            <div className="flex justify-end gap-4 pt-4">
                <button type="button" onClick={onClose} className="py-2 px-4 rounded-lg bg-gray-600 hover:bg-gray-700 text-white font-semibold transition-colors">Annuler</button>
                <button type="submit" className="py-2 px-4 rounded-lg bg-green-accent hover:bg-green-accent-hover text-white font-semibold transition-colors">Ajouter le Match</button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default AddMatchModal;
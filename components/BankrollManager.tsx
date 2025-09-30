
import React, { useState, useEffect } from 'react';

interface BankrollManagerProps {
  bankroll: number;
  setBankroll: (newBankroll: number) => void;
}

const BankrollManager: React.FC<BankrollManagerProps> = ({ bankroll, setBankroll }) => {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(bankroll.toString());

  useEffect(() => {
    setInputValue(bankroll.toFixed(2));
  }, [bankroll]);

  const handleSave = () => {
    const newValue = parseFloat(inputValue);
    if (!isNaN(newValue)) {
      setBankroll(newValue);
    }
    setEditing(false);
  };

  return (
    <div className="bg-gray-900 border border-border-color rounded-xl p-4">
      <h3 className="font-bold text-lg text-white mb-2">Gestion du Capital</h3>
      <div className="flex items-center justify-between">
        <span className="text-gray-400 text-sm">Capital Actuel:</span>
        {editing ? (
            <input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onBlur={handleSave}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                className="bg-gray-800 text-2xl font-bold text-green-400 w-32 text-right border border-blue-accent rounded px-2"
                autoFocus
            />
        ) : (
            <span 
                className="text-2xl font-bold text-green-400 cursor-pointer"
                onClick={() => setEditing(true)}
            >
                {bankroll.toFixed(2)}€
            </span>
        )}
      </div>
    </div>
  );
};

export default BankrollManager;

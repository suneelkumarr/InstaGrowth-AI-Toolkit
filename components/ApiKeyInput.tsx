import React, { useState, useEffect } from 'react';

const ApiKeyInput: React.FC = () => {
  const [key, setKey] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const storedKey = localStorage.getItem('rapidApiKey');
    if (storedKey) {
      setKey(storedKey);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('rapidApiKey', key);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000); // Hide message after 3 seconds
  };

  return (
    <div className="bg-yellow-900/20 border border-yellow-700/50 p-4 rounded-lg mb-6">
      <h3 className="font-semibold text-yellow-300">RapidAPI Key Configuration</h3>
      <p className="text-sm text-yellow-400 mb-3">
        The Instagram API has a monthly request limit. Please provide your own RapidAPI key to avoid service interruptions.
        You can get a free key from{' '}
        <a href="https://rapidapi.com/irrors-apis/api/instagram-looter2" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-200">
          RapidAPI
        </a>.
      </p>
      <div className="flex items-center gap-2">
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder="Enter your RapidAPI key"
          className="flex-grow px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-700 transition-colors duration-200"
        >
          Save Key
        </button>
      </div>
      {isSaved && <p className="text-green-400 text-sm mt-2">API Key saved successfully!</p>}
    </div>
  );
};

export default ApiKeyInput;

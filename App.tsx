
import React, { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Loader2, ExternalLink, Menu, Sparkles, LayoutDashboard } from 'lucide-react';
import { getWeatherData } from './services/geminiService';
import { WeatherResponse, HistoryItem } from './types';
import WeatherDisplay from './components/WeatherDisplay';
import AlgorithmView from './components/AlgorithmView';
import HistorySidebar from './components/HistorySidebar';

const App = () => {
  const [query, setQuery] = useState('');
  const [weatherResponse, setWeatherResponse] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bgClass, setBgClass] = useState('from-blue-500 to-blue-900');
  
  // UI State
  const [activeTab, setActiveTab] = useState<'weather' | 'algorithm'>('weather');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('weather_history');
    if (saved) {
      setHistory(JSON.parse(saved));
    }
  }, []);

  const saveToHistory = (data: WeatherResponse['data']) => {
    if (!data) return;
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      location: data.location,
      temp: data.current.temp,
      condition: data.current.condition,
      timestamp: Date.now()
    };
    
    setHistory(prev => {
      // Avoid duplicates at the top
      const filtered = prev.filter(h => h.location.toLowerCase() !== data.location.toLowerCase());
      const updated = [newItem, ...filtered].slice(0, 10); // Keep last 10
      localStorage.setItem('weather_history', JSON.stringify(updated));
      return updated;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('weather_history');
  };

  // Determine background based on condition
  const updateBackground = (condition: string) => {
    const c = condition.toLowerCase();
    if (c.includes('rain') || c.includes('storm')) {
      setBgClass('from-slate-800 to-slate-900');
    } else if (c.includes('cloud') || c.includes('overcast')) {
      setBgClass('from-slate-500 to-slate-800');
    } else if (c.includes('clear') || c.includes('sunny')) {
      setBgClass('from-blue-400 to-blue-600');
    } else if (c.includes('snow')) {
      setBgClass('from-indigo-100 to-indigo-300 text-slate-800');
    } else {
      setBgClass('from-indigo-500 to-purple-900');
    }
  };

  const fetchWeather = useCallback(async (location: string) => {
    setLoading(true);
    setError(null);
    setActiveTab('weather'); // Reset to main tab on new search
    
    try {
      const result = await getWeatherData(location);
      setWeatherResponse(result);
      if (result.data) {
        updateBackground(result.data.current.condition);
        saveToHistory(result.data);
      }
    } catch (err) {
      setError("Could not fetch weather data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      fetchWeather(query);
    }
  };

  const handleGeoLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          fetchWeather(`${latitude}, ${longitude}`);
        },
        (err) => {
          console.error(err);
          setError("Location access denied or unavailable.");
          setLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
    }
  };

  // Initial load
  useEffect(() => {
    if (history.length > 0) {
      // Optional: Load last searched item, or just default
      // fetchWeather(history[0].location); 
      // Let's default to New York if no interaction yet
      fetchWeather("New York");
    } else {
      fetchWeather("New York");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isLightMode = bgClass.includes('indigo-100');

  return (
    <div className={`min-h-screen w-full bg-gradient-to-br ${bgClass} transition-colors duration-1000 flex items-center justify-center p-4 md:p-8 overflow-hidden`}>
      
      <HistorySidebar 
        history={history} 
        onSelect={fetchWeather} 
        onClear={clearHistory}
        isOpen={isHistoryOpen}
        setIsOpen={setIsHistoryOpen}
      />

      <div className={`w-full max-w-5xl min-h-[700px] flex flex-col gap-6 relative transition-all duration-500 ${isHistoryOpen ? 'md:ml-72' : ''} ${isLightMode ? 'text-slate-800' : 'text-white'}`}>
        
        {/* Header / Search Bar */}
        <header className="w-full flex flex-col md:flex-row gap-4 items-center justify-between z-10">
          <div className="flex items-center gap-4 w-full md:w-auto">
             <button 
               onClick={() => setIsHistoryOpen(!isHistoryOpen)}
               className={`p-2 rounded-full hover:bg-white/20 transition-colors ${isHistoryOpen ? 'bg-white/20' : ''}`}
               title="Toggle History"
             >
               <Menu className="w-6 h-6" />
             </button>
             <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                    <span className="text-2xl">🌤️</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight whitespace-nowrap">Weather Today</h1>
             </div>
          </div>

          <form onSubmit={handleSearch} className="relative w-full md:w-96 group">
            <input
              type="text"
              placeholder="Search city..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={`w-full py-3 pl-12 pr-12 rounded-full outline-none transition-all duration-300 
                ${isLightMode 
                  ? 'bg-white/60 focus:bg-white text-slate-800 placeholder-slate-500 shadow-sm' 
                  : 'bg-white/10 focus:bg-white/20 text-white placeholder-white/50 border border-white/10 focus:border-white/30'
                }`}
            />
            <Search className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isLightMode ? 'text-slate-500' : 'text-white/50'}`} />
            
            <button
              type="button"
              onClick={handleGeoLocation}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-white/20 transition-colors ${isLightMode ? 'text-slate-600' : 'text-white/80'}`}
              title="Use my location"
            >
              <MapPin className="w-4 h-4" />
            </button>
          </form>
        </header>

        {/* Tab Navigation (Only visible if we have data) */}
        {weatherResponse?.data && !loading && !error && (
          <div className="flex gap-4 border-b border-white/10 pb-2">
             <button
               onClick={() => setActiveTab('weather')}
               className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === 'weather' ? 'bg-white/20 font-semibold' : 'hover:bg-white/5 opacity-70'}`}
             >
               <LayoutDashboard className="w-4 h-4" />
               Overview
             </button>
             <button
               onClick={() => setActiveTab('algorithm')}
               className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === 'algorithm' ? 'bg-white/20 font-semibold' : 'hover:bg-white/5 opacity-70'}`}
             >
               <Sparkles className="w-4 h-4 text-yellow-300" />
               Advanced AI Analysis
             </button>
          </div>
        )}

        {/* Content Area */}
        <main className="flex-1 w-full relative min-h-[400px]">
          {loading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center animate-pulse gap-4">
              <Loader2 className="w-12 h-12 animate-spin opacity-70" />
              <p className="text-lg font-medium opacity-80">Consulting satellite data...</p>
            </div>
          ) : error ? (
             <div className="glass-panel rounded-2xl p-8 text-center border-red-400/30 bg-red-500/10">
               <p className="text-xl font-semibold mb-2">Oops!</p>
               <p className="opacity-80">{error}</p>
             </div>
          ) : weatherResponse?.data ? (
            <>
              {activeTab === 'weather' && (
                <WeatherDisplay data={weatherResponse.data} />
              )}
              {activeTab === 'algorithm' && weatherResponse.insights && (
                <AlgorithmView insights={weatherResponse.insights} data={weatherResponse.data} />
              )}
              {activeTab === 'algorithm' && !weatherResponse.insights && (
                 <div className="flex flex-col items-center justify-center h-full opacity-60">
                   <Loader2 className="w-8 h-8 animate-spin mb-2" />
                   <p>Generating algorithm steps...</p>
                 </div>
              )}
            </>
          ) : (
             weatherResponse?.rawText && (
              <div className="glass-panel rounded-2xl p-8 whitespace-pre-wrap">
                 {weatherResponse.rawText}
              </div>
            )
          )}
        </main>

        {/* Footer */}
        {weatherResponse && weatherResponse.sources.length > 0 && activeTab === 'weather' && (
          <footer className="mt-auto pt-6 border-t border-white/10">
            <p className="text-xs font-semibold uppercase tracking-wider opacity-60 mb-3">Sources</p>
            <div className="flex flex-wrap gap-3">
              {weatherResponse.sources.slice(0, 4).map((source, idx) => (
                <a 
                  key={idx} 
                  href={source.uri} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md transition-colors
                    ${isLightMode 
                      ? 'bg-white/40 hover:bg-white/60 text-slate-700' 
                      : 'bg-white/5 hover:bg-white/15 text-white/70'
                    }`}
                >
                  <span className="truncate max-w-[150px]">{source.title}</span>
                  <ExternalLink className="w-3 h-3 opacity-50" />
                </a>
              ))}
            </div>
          </footer>
        )}
      </div>
    </div>
  );
};

export default App;

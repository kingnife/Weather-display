import React from 'react';
import { WeatherData } from '../types';
import { WeatherIcon, WindIcon, HumidityIcon, TempIcon } from './Icons';

interface WeatherDisplayProps {
  data: WeatherData;
}

const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ data }) => {
  return (
    <div className="flex flex-col gap-6 text-white animate-fade-in">
      {/* Header Info */}
      <div className="text-center md:text-left">
        <h2 className="text-3xl font-bold tracking-tight">{data.location}</h2>
        <p className="text-lg opacity-80 mt-1">{data.current.condition}</p>
      </div>

      {/* Main Stats Card */}
      <div className="glass-panel rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-4">
          <WeatherIcon condition={data.current.condition} className="w-24 h-24 text-yellow-300 drop-shadow-lg" />
          <div className="flex flex-col">
            <span className="text-7xl font-bold tracking-tighter">{data.current.temp}</span>
            {data.current.feels_like && (
               <span className="opacity-75 text-sm">Feels like {data.current.feels_like}</span>
            )}
          </div>
        </div>

        <div className="flex gap-6 md:gap-12">
           <div className="flex flex-col items-center gap-2">
             <div className="p-3 rounded-full bg-white/10">
               <WindIcon className="w-6 h-6" />
             </div>
             <div className="text-center">
                <span className="block text-sm opacity-70">Wind</span>
                <span className="font-semibold">{data.current.wind}</span>
             </div>
           </div>
           <div className="flex flex-col items-center gap-2">
             <div className="p-3 rounded-full bg-white/10">
               <HumidityIcon className="w-6 h-6" />
             </div>
             <div className="text-center">
                <span className="block text-sm opacity-70">Humidity</span>
                <span className="font-semibold">{data.current.humidity}</span>
             </div>
           </div>
        </div>
      </div>

      {/* AI Advice */}
      <div className="glass-panel rounded-2xl p-6 border-l-4 border-yellow-400">
        <h3 className="text-sm uppercase tracking-wider font-bold opacity-60 mb-2 flex items-center gap-2">
          <TempIcon className="w-4 h-4" /> AI Insight
        </h3>
        <p className="text-lg italic font-medium leading-relaxed">"{data.advice}"</p>
      </div>

      {/* Forecast */}
      <div>
        <h3 className="text-xl font-semibold mb-4 opacity-90">5-Day Forecast</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {data.forecast.map((day, idx) => (
            <div key={idx} className="glass-panel rounded-xl p-4 flex flex-col items-center justify-center gap-2 text-center transition-transform hover:scale-105 duration-200">
              <span className="text-sm font-semibold opacity-80">{day.day}</span>
              <WeatherIcon condition={day.condition} className="w-8 h-8 my-1 text-white/90" />
              <div className="flex gap-2 text-sm">
                <span className="font-bold">{day.temp_high}</span>
                <span className="opacity-60">{day.temp_low}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WeatherDisplay;

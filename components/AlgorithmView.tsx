
import React from 'react';
import { BarChart, Cpu, ArrowRight, Database, CloudCog, FileOutput, TrendingUp } from 'lucide-react';
import { AdvancedInsights, WeatherData } from '../types';

interface AlgorithmViewProps {
  insights: AdvancedInsights;
  data: WeatherData;
}

const AlgorithmView: React.FC<AlgorithmViewProps> = ({ insights, data }) => {
  
  // Helper to extract number from string like "18°C" or "-5°"
  const parseTemp = (str: string) => {
    const match = str.match(/-?\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };

  // Prepare chart data
  const chartData = data.forecast.map(day => ({
    day: day.day,
    high: parseTemp(day.temp_high),
    low: parseTemp(day.temp_low)
  }));

  const maxTemp = Math.max(...chartData.map(d => d.high), 10); // Ensure min height
  const minTemp = Math.min(...chartData.map(d => d.low), 0);
  
  // Normalize range to ensure bars fit well
  // We use a simple relative scaling: 0 is the minTemp (minus some padding)
  const chartMin = minTemp < 0 ? minTemp - 5 : 0;
  const chartRange = (maxTemp + 5) - chartMin;

  const getHeight = (val: number) => {
    return `${((val - chartMin) / chartRange) * 100}%`;
  };

  return (
    <div className="space-y-8 animate-fade-in text-white h-full flex flex-col">
      
      {/* Flowchart Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold flex items-center gap-2 opacity-90">
          <Cpu className="w-5 h-5 text-blue-300" />
          Prediction Algorithm Flow
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            {insights.algorithmSteps.map((step, idx) => {
              const icons = [Database, CloudCog, Cpu, FileOutput];
              const Icon = icons[idx % icons.length];
              
              return (
                <div key={idx} className="relative group">
                  <div className="glass-panel p-5 rounded-xl h-full border border-white/10 hover:border-blue-400/50 transition-all duration-300 bg-gradient-to-br from-white/5 to-white/0">
                    <div className="mb-3 p-2 bg-blue-500/20 w-fit rounded-lg text-blue-300">
                        <Icon className="w-6 h-6" />
                    </div>
                    <h4 className="font-bold text-sm uppercase tracking-wider mb-2 text-blue-100">{step.title}</h4>
                    <p className="text-sm opacity-70 leading-relaxed">{step.description}</p>
                  </div>
                  
                  {/* Arrow for desktop */}
                  {idx < insights.algorithmSteps.length - 1 && (
                    <div className="hidden md:flex absolute top-1/2 -right-4 -translate-y-1/2 z-10 text-white/20">
                      <ArrowRight className="w-6 h-6" />
                    </div>
                  )}
                   {/* Arrow for mobile */}
                  {idx < insights.algorithmSteps.length - 1 && (
                    <div className="md:hidden flex justify-center py-2 text-white/20">
                      <ArrowRight className="w-6 h-6 rotate-90" />
                    </div>
                  )}
                </div>
              );
            })}
        </div>
      </div>

      {/* Chart Section */}
      <div className="space-y-4 flex-1">
        <h3 className="text-xl font-semibold flex items-center gap-2 opacity-90">
          <BarChart className="w-5 h-5 text-green-300" />
          Temperature Trend Analysis
        </h3>
        
        <div className="glass-panel p-6 rounded-xl border border-white/10 flex flex-col gap-6">
            <div className="flex items-end justify-between h-64 w-full gap-2 md:gap-8 pb-2 border-b border-white/10 relative">
               {/* Y-Axis Grid Lines (Simplified) */}
               <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-10">
                  <div className="w-full h-px bg-white" />
                  <div className="w-full h-px bg-white" />
                  <div className="w-full h-px bg-white" />
                  <div className="w-full h-px bg-white" />
                  <div className="w-full h-px bg-white" />
               </div>

               {chartData.map((d, i) => (
                 <div key={i} className="flex-1 flex flex-col items-center justify-end h-full gap-2 group relative z-10">
                    <div className="flex items-end gap-1 md:gap-2 w-full justify-center h-full">
                        {/* Low Temp Bar */}
                        <div 
                          className="w-3 md:w-8 rounded-t-md bg-gradient-to-t from-blue-600 to-cyan-400 transition-all duration-1000 ease-out hover:opacity-80"
                          style={{ height: getHeight(d.low) }}
                          title={`Low: ${d.low}°`}
                        >
                            <span className="hidden group-hover:block absolute -top-8 left-1/2 -translate-x-1/2 text-xs bg-black/60 px-2 py-1 rounded">Low: {d.low}°</span>
                        </div>
                        {/* High Temp Bar */}
                        <div 
                          className="w-3 md:w-8 rounded-t-md bg-gradient-to-t from-orange-600 to-yellow-400 transition-all duration-1000 ease-out hover:opacity-80"
                          style={{ height: getHeight(d.high) }}
                          title={`High: ${d.high}°`}
                        >
                             <span className="hidden group-hover:block absolute -top-16 left-1/2 -translate-x-1/2 text-xs bg-black/60 px-2 py-1 rounded">High: {d.high}°</span>
                        </div>
                    </div>
                    {/* Day Label */}
                    <span className="text-xs md:text-sm font-medium opacity-80 mt-2">{d.day}</span>
                    {/* Temp Labels for Mobile/Desktop visibility */}
                    <div className="flex gap-2 text-[10px] md:text-xs opacity-60">
                         <span className="text-cyan-200">{d.low}°</span>
                         <span className="text-yellow-200">{d.high}°</span>
                    </div>
                 </div>
               ))}
            </div>
            
            <div className="flex items-start gap-3 bg-white/5 p-4 rounded-lg">
                <TrendingUp className="w-5 h-5 text-yellow-300 mt-0.5 shrink-0" />
                <p className="text-sm md:text-base opacity-90 leading-relaxed italic">
                  "{insights.analysisSummary}"
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AlgorithmView;

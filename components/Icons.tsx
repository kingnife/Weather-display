import React from 'react';
import { 
  Cloud, 
  CloudRain, 
  CloudLightning, 
  CloudSnow, 
  Sun, 
  Moon, 
  CloudDrizzle, 
  Wind,
  Droplets,
  Thermometer,
  CloudFog
} from 'lucide-react';

export const WeatherIcon = ({ condition, className = "w-6 h-6" }: { condition: string; className?: string }) => {
  const lowerCondition = condition.toLowerCase();

  if (lowerCondition.includes('rain')) return <CloudRain className={className} />;
  if (lowerCondition.includes('drizzle')) return <CloudDrizzle className={className} />;
  if (lowerCondition.includes('storm') || lowerCondition.includes('thunder')) return <CloudLightning className={className} />;
  if (lowerCondition.includes('snow') || lowerCondition.includes('ice')) return <CloudSnow className={className} />;
  if (lowerCondition.includes('fog') || lowerCondition.includes('mist')) return <CloudFog className={className} />;
  if (lowerCondition.includes('cloud') || lowerCondition.includes('overcast')) return <Cloud className={className} />;
  if (lowerCondition.includes('clear') || lowerCondition.includes('sunny')) return <Sun className={className} />;

  return <Sun className={className} />;
};

export const WindIcon = ({ className = "w-4 h-4" }: { className?: string }) => <Wind className={className} />;
export const HumidityIcon = ({ className = "w-4 h-4" }: { className?: string }) => <Droplets className={className} />;
export const TempIcon = ({ className = "w-4 h-4" }: { className?: string }) => <Thermometer className={className} />;

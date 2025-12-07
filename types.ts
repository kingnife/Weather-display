
export interface ForecastDay {
  day: string;
  temp_high: string;
  temp_low: string;
  condition: string;
}

export interface WeatherData {
  location: string;
  current: {
    temp: string;
    condition: string;
    humidity: string;
    wind: string;
    feels_like?: string;
  };
  forecast: ForecastDay[];
  advice: string;
}

export interface Source {
  title: string;
  uri: string;
}

export interface AlgorithmStep {
  title: string;
  description: string;
}

export interface AdvancedInsights {
  analysisSummary: string;
  algorithmSteps: AlgorithmStep[];
}

export interface WeatherResponse {
  data: WeatherData | null;
  rawText: string;
  sources: Source[];
  insights?: AdvancedInsights;
}

export interface HistoryItem {
  id: string;
  location: string;
  temp: string;
  condition: string;
  timestamp: number;
}


import { GoogleGenAI } from "@google/genai";
import { WeatherResponse, WeatherData, Source, AdvancedInsights } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const WEATHER_SYSTEM_INSTRUCTION = `
You are a helpful weather assistant. 
When asked for weather, use Google Search to find the latest current weather and a 5-day forecast.
You MUST output the final answer as a VALID JSON object wrapped in a markdown code block (e.g., \`\`\`json ... \`\`\`).
The JSON schema must be exactly:
{
  "location": "City, Country",
  "current": {
    "temp": "15°C",
    "condition": "Partly Cloudy",
    "humidity": "60%",
    "wind": "10 km/h NW",
    "feels_like": "14°C"
  },
  "forecast": [
    { "day": "Mon", "temp_high": "18°", "temp_low": "10°", "condition": "Sunny" },
    ... (5 days total)
  ],
  "advice": "A short, witty, or helpful sentence about what to wear or do."
}
If you cannot find specific data, make a reasonable estimate based on the search results or omit the field. 
Do not include any conversational text outside the JSON block.
`;

const INSIGHTS_SYSTEM_INSTRUCTION = `
You are a data scientist specializing in meteorology.
Generate a response in valid JSON format (wrapped in \`\`\`json\`) containing two parts:
1. "analysisSummary": A brief, professional 2-sentence summary analyzing the temperature trend (e.g., "Temperatures are steadily rising..." or "A cold front is approaching...").
2. "algorithmSteps": An array of 4 steps (objects with "title" and "description") explaining the flow of how a weather prediction model (like GFS) processes data to get this result.
`;

export const getWeatherData = async (query: string): Promise<WeatherResponse> => {
  try {
    // 1. Fetch Basic Weather Data
    const weatherReq = ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Find the current weather and 5-day forecast for: ${query}. Remember to format as JSON.`,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: WEATHER_SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });

    const response = await weatherReq;
    const text = response.text || "";
    
    // Extract Sources
    const sources: Source[] = [];
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      response.candidates[0].groundingMetadata.groundingChunks.forEach((chunk) => {
        if (chunk.web) {
          sources.push({
            title: chunk.web.title || "Source",
            uri: chunk.web.uri || "#",
          });
        }
      });
    }

    // Parse Weather JSON
    let weatherData: WeatherData | null = null;
    const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```([\s\S]*?)```/);
    
    if (jsonMatch && jsonMatch[1]) {
      try {
        weatherData = JSON.parse(jsonMatch[1]);
      } catch (e) {
        console.error("Failed to parse Weather JSON", e);
      }
    } else {
        try {
            const possibleJson = text.trim();
            if (possibleJson.startsWith('{') && possibleJson.endsWith('}')) {
                weatherData = JSON.parse(possibleJson);
            }
        } catch (e) { console.warn("Could not parse JSON structure."); }
    }

    // 2. If weather data exists, fetch Advanced Insights (Analysis & Algo)
    let insights: AdvancedInsights | undefined;
    if (weatherData) {
      try {
        const insightsReq = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: `Generate analysis summary and algorithm steps for this weather data: ${JSON.stringify(weatherData.current)}`,
          config: {
            systemInstruction: INSIGHTS_SYSTEM_INSTRUCTION,
            temperature: 0.5,
          }
        });
        
        const insightsText = insightsReq.text || "";
        const insightsMatch = insightsText.match(/```json\n([\s\S]*?)\n```/) || insightsText.match(/```([\s\S]*?)```/);
        if (insightsMatch && insightsMatch[1]) {
           insights = JSON.parse(insightsMatch[1]);
        }
      } catch (err) {
        console.warn("Failed to fetch advanced insights", err);
      }
    }

    return {
      data: weatherData,
      rawText: text,
      sources,
      insights
    };
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};

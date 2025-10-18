#!/usr/bin/env node

/**
 * MCP (Model Context Protocol) Server
 * 
 * Bu server, AI modelleri için araçlar (tools) sağlar:
 * - get_current_weather: Hava durumu bilgisi (Open-Meteo API)
 * - calculate: Matematiksel hesaplamalar
 * - get_current_time: Tarih ve saat bilgisi
 * 
 * MCP standardına uygun olarak stdio üzerinden çalışır.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema,
  ListToolsRequestSchema 
} from '@modelcontextprotocol/sdk/types.js';
import { fetchWeatherApi } from 'openmeteo';

// ============================================================================
// MCP TOOLS DEFINITIONS - Araç Tanımları
// ============================================================================

const mcpTools = [
  {
    name: 'get_current_weather',
    description: 'Belirtilen şehir için güncel hava durumu bilgisini getirir. Open-Meteo API kullanarak gerçek zamanlı hava durumu verisi sağlar.',
    inputSchema: {
      type: 'object',
      properties: {
        city: {
          type: 'string',
          description: 'Hava durumu sorgulanacak şehir adı (örn: Istanbul, Ankara, Izmir)'
        },
        unit: {
          type: 'string',
          description: 'Sıcaklık birimi - celsius veya fahrenheit',
          enum: ['celsius', 'fahrenheit'],
          default: 'celsius'
        }
      },
      required: ['city']
    }
  },
  {
    name: 'calculate',
    description: 'Matematiksel hesaplama yapar (toplama, çıkarma, çarpma, bölme)',
    inputSchema: {
      type: 'object',
      properties: {
        operation: {
          type: 'string',
          description: 'Yapılacak işlem türü',
          enum: ['add', 'subtract', 'multiply', 'divide']
        },
        a: {
          type: 'number',
          description: 'İlk sayı'
        },
        b: {
          type: 'number',
          description: 'İkinci sayı'
        }
      },
      required: ['operation', 'a', 'b']
    }
  },
  {
    name: 'get_current_time',
    description: 'Mevcut tarih ve saat bilgisini belirtilen zaman diliminde getirir',
    inputSchema: {
      type: 'object',
      properties: {
        timezone: {
          type: 'string',
          description: 'Zaman dilimi (örn: Europe/Istanbul, America/New_York)',
          default: 'Europe/Istanbul'
        }
      },
      required: []
    }
  }
];

// ============================================================================
// TOOL IMPLEMENTATIONS - Araç Implementasyonları
// ============================================================================

const toolImplementations = {
  get_current_weather: async ({ city, unit = 'celsius' }) => {
    try {
      // 1. Şehir adından koordinat al (Geocoding API - Open-Meteo)
      const geocodeUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=tr&format=json`;
      
      console.error(`\n  🌐 [Geocoding API] İstek gönderiliyor...`);
      console.error(`     URL: ${geocodeUrl}`);
      console.error(`     Şehir: ${city}`);
      
      const geocodeResponse = await fetch(geocodeUrl);
      
      console.error(`  📥 [Geocoding API] Yanıt alındı - Status: ${geocodeResponse.status}`);
      
      if (!geocodeResponse.ok) {
        throw new Error(`Geocoding hatası: ${geocodeResponse.status}`);
      }
      
      const geocodeData = await geocodeResponse.json();
      console.error(`  ✅ [Geocoding API] Veri başarıyla parse edildi`);
      
      if (!geocodeData.results || geocodeData.results.length === 0) {
        return {
          error: true,
          message: `"${city}" şehri bulunamadı. Lütfen geçerli bir şehir adı girin.`
        };
      }
      
      const location = geocodeData.results[0];
      const latitude = location.latitude;
      const longitude = location.longitude;
      
      console.error(`  📍 Konum bulundu: ${location.name}, ${location.country || location.country_code}`);
      console.error(`     Koordinatlar: ${latitude}°N, ${longitude}°E`);
      
      // 2. Koordinatlarla hava durumu al (Open-Meteo Weather API)
      const params = {
        latitude,
        longitude,
        current: ['temperature_2m', 'relative_humidity_2m', 'apparent_temperature', 'precipitation', 'weather_code', 'wind_speed_10m', 'pressure_msl'],
        timezone: 'auto',
        temperature_unit: unit === 'fahrenheit' ? 'fahrenheit' : 'celsius',
        wind_speed_unit: 'kmh'
      };
      
      const weatherUrl = 'https://api.open-meteo.com/v1/forecast';
      
      console.error(`\n  🌤️  [Weather API] İstek gönderiliyor...`);
      console.error(`     URL: ${weatherUrl}`);
      console.error(`     Parametreler:`, JSON.stringify(params, null, 6));
      
      const responses = await fetchWeatherApi(weatherUrl, params);
      const response = responses[0];
      
      console.error(`  📥 [Weather API] Hava durumu verisi alındı!`);
      
      // Mevcut hava durumu verisi
      const current = response.current();
      
      // Weather code'u açıklamaya çevir (WMO kodu)
      const weatherCodeDescriptions = {
        0: 'Açık gökyüzü',
        1: 'Genelde açık', 2: 'Parçalı bulutlu', 3: 'Bulutlu',
        45: 'Sisli', 48: 'Dondurucu sis',
        51: 'Hafif çiseleyen yağmur', 53: 'Orta şiddette çiseleyen yağmur', 55: 'Yoğun çiseleyen yağmur',
        61: 'Hafif yağmur', 63: 'Orta şiddette yağmur', 65: 'Şiddetli yağmur',
        71: 'Hafif kar', 73: 'Orta şiddette kar', 75: 'Şiddetli kar',
        80: 'Hafif sağanak', 81: 'Orta şiddette sağanak', 82: 'Şiddetli sağanak',
        95: 'Gök gürültülü fırtına', 96: 'Dolulu fırtına', 99: 'Şiddetli dolulu fırtına'
      };
      
      const weatherCode = current.variables(4).value();
      const condition = weatherCodeDescriptions[weatherCode] || 'Bilinmiyor';
      
      const unitSymbol = unit === 'fahrenheit' ? '°F' : '°C';
      const temp = Math.round(current.variables(0).value());
      const feelsLike = Math.round(current.variables(2).value());
      const humidity = Math.round(current.variables(1).value());
      const windSpeed = Math.round(current.variables(5).value());
      const pressure = Math.round(current.variables(6).value());
      const precipitation = current.variables(3).value();
      
      return {
        city: location.name,
        country: location.country_code || location.country || 'N/A',
        latitude: latitude.toFixed(2),
        longitude: longitude.toFixed(2),
        temperature: `${temp}${unitSymbol}`,
        feelsLike: `${feelsLike}${unitSymbol}`,
        condition: condition,
        humidity: `${humidity}%`,
        pressure: `${pressure} hPa`,
        windSpeed: `${windSpeed} km/h`,
        precipitation: `${precipitation} mm`,
        weatherCode: weatherCode,
        timezone: location.timezone || 'N/A',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        error: true,
        message: `Hava durumu alınamadı: ${error.message}`
      };
    }
  },

  calculate: ({ operation, a, b }) => {
    let result;
    switch (operation) {
      case 'add':
        result = a + b;
        break;
      case 'subtract':
        result = a - b;
        break;
      case 'multiply':
        result = a * b;
        break;
      case 'divide':
        if (b === 0) {
          throw new Error('Sıfıra bölme hatası!');
        }
        result = a / b;
        break;
      default:
        throw new Error(`Bilinmeyen işlem: ${operation}`);
    }

    const operationSymbols = {
      'add': '+',
      'subtract': '-',
      'multiply': '×',
      'divide': '÷'
    };

    return {
      operation: operation,
      expression: `${a} ${operationSymbols[operation]} ${b}`,
      result: result
    };
  },

  get_current_time: ({ timezone = 'Europe/Istanbul' }) => {
    try {
      const now = new Date();
      const options = {
        timeZone: timezone,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        weekday: 'long'
      };
      
      const formatter = new Intl.DateTimeFormat('tr-TR', options);
      const formattedTime = formatter.format(now);

      return {
        timezone: timezone,
        currentTime: formattedTime,
        timestamp: now.toISOString()
      };
    } catch (error) {
      return {
        timezone: timezone,
        currentTime: new Date().toLocaleString('tr-TR'),
        timestamp: new Date().toISOString()
      };
    }
  }
};

// ============================================================================
// MCP SERVER SETUP
// ============================================================================

// MCP Server instance oluştur
const server = new Server(
  {
    name: 'weather-tools-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List Tools Handler - Kullanılabilir araçları döndürür
server.setRequestHandler(ListToolsRequestSchema, async () => {
  console.error('📋 [MCP Server] Tools listesi istendi');
  return {
    tools: mcpTools
  };
});

// Call Tool Handler - Araç çağrılarını işler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  console.error(`\n🔧 [MCP Server] Tool çağrısı: ${name}`);
  console.error(`   Parametreler:`, JSON.stringify(args, null, 2));

  try {
    // Aracı çağır
    if (!toolImplementations[name]) {
      throw new Error(`Bilinmeyen araç: ${name}`);
    }

    const result = await toolImplementations[name](args);
    console.error(`   ✅ Sonuç:`, JSON.stringify(result, null, 2));

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2)
        }
      ]
    };
  } catch (error) {
    console.error(`   ❌ Hata:`, error.message);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: error.message }, null, 2)
        }
      ],
      isError: true
    };
  }
});

// ============================================================================
// SERVER START
// ============================================================================

async function main() {
  console.error('🚀 [MCP Server] Starting Model Context Protocol Server...');
  console.error(`   Server: weather-tools-server v1.0.0`);
  console.error(`   Tools: ${mcpTools.map(t => t.name).join(', ')}`);
  console.error(`   Transport: stdio`);
  console.error('');

  const transport = new StdioServerTransport();
  await server.connect(transport);
  
  console.error('✅ [MCP Server] Server hazır ve bağlantı bekliyor...\n');
}

// Error handling
process.on('uncaughtException', (error) => {
  console.error('❌ [MCP Server] Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ [MCP Server] Unhandled rejection:', reason);
  process.exit(1);
});

// Start server
main().catch((error) => {
  console.error('❌ [MCP Server] Failed to start:', error);
  process.exit(1);
});


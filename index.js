#!/usr/bin/env node

/**
 * Gemini AI + MCP Client
 * 
 * Bu uygulama:
 * - MCP Server'a bağlanır ve araçları kullanır
 * - Gemini AI ile konuşur
 * - Readline CLI ile kullanıcı etkileşimi sağlar
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import readline from 'readline';
import { spawn } from 'child_process';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

// Environment variables yükle
dotenv.config();

// API key kontrolü
const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.error('❌ HATA: GEMINI_API_KEY environment variable tanımlı değil!');
  console.error('Lütfen .env dosyası oluşturun ve GEMINI_API_KEY ekleyin.');
  process.exit(1);
}

// Gemini AI instance oluştur
const genAI = new GoogleGenerativeAI(apiKey);

// ============================================================================
// MCP CLIENT SETUP
// ============================================================================

let mcpClient = null;
let mcpTools = [];
let geminiTools = [];

/**
 * MCP Server'ı başlat ve client'ı bağla
 */
async function initializeMCPClient() {
  console.log('🔗 [MCP Client] MCP Server başlatılıyor...');
  
  try {
    // MCP Server'ı child process olarak başlat
    const serverProcess = spawn('node', ['mcp-server.js'], {
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    // Server'ın stderr çıktısını konsola yaz (loglar için)
    serverProcess.stderr.on('data', (data) => {
      const message = data.toString().trim();
      if (message) {
        console.error(`   [Server] ${message}`);
      }
    });

    // Server process hata kontrolü
    serverProcess.on('error', (error) => {
      console.error('❌ [MCP Client] Server başlatılamadı:', error.message);
      process.exit(1);
    });

    serverProcess.on('exit', (code) => {
      if (code !== 0 && code !== null) {
        console.error(`❌ [MCP Client] Server beklenmedik şekilde kapandı (code: ${code})`);
      }
    });

    // MCP Client oluştur
    mcpClient = new Client({
      name: 'gemini-mcp-client',
      version: '1.0.0',
    }, {
      capabilities: {}
    });

    // Stdio transport ile server'a bağlan
    const transport = new StdioClientTransport({
      command: 'node',
      args: ['mcp-server.js'],
    });

    await mcpClient.connect(transport);
    console.log('✅ [MCP Client] Server\'a bağlandı!');

    // Server'dan araçları al
    const toolsList = await mcpClient.listTools();
    mcpTools = toolsList.tools;
    
    console.log(`📋 [MCP Client] ${mcpTools.length} araç bulundu:`);
    mcpTools.forEach(tool => {
      console.log(`   - ${tool.name}: ${tool.description}`);
    });

    // MCP araçlarını Gemini formatına dönüştür
    geminiTools = mcpTools.map(tool => ({
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema
    }));

    console.log('✅ [MCP Client] Hazır!\n');
    return true;
  } catch (error) {
    console.error('❌ [MCP Client] Başlatma hatası:', error.message);
    throw error;
  }
}

/**
 * MCP aracını çağır
 */
async function callMCPTool(toolName, args) {
  try {
    const result = await mcpClient.callTool({
      name: toolName,
      arguments: args
    });

    // Sonucu parse et
    if (result.content && result.content[0]) {
      return JSON.parse(result.content[0].text);
    }
    
    return { error: true, message: 'MCP yanıtı alınamadı' };
  } catch (error) {
    console.error(`❌ [MCP Tool] ${toolName} çağrısı başarısız:`, error.message);
    return { error: true, message: error.message };
  }
}

// ============================================================================
// GEMINI CONVERSATION
// ============================================================================

/**
 * Gemini AI ile konuşma
 */
async function runConversation(userMessage) {
  console.log('\n' + '='.repeat(80));
  console.log('💬 Kullanıcı Mesajı:', userMessage);
  console.log('='.repeat(80));

  try {
    console.log('\n🤖 [Gemini API] Model hazırlanıyor...');
    console.log('   Model: gemini-2.0-flash-exp');
    console.log('   Function Calling Mode: AUTO');
    console.log('   🔗 MCP Integration: ACTIVE');
    console.log(`   Kullanılabilir MCP Araçları: ${geminiTools.map(t => t.name).join(', ')}`);
    
    // Model oluştur - MCP araçlarıyla
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      tools: [{
        functionDeclarations: geminiTools
      }],
      toolConfig: {
        functionCallingConfig: {
          mode: 'AUTO'
        }
      }
    });

    const chat = model.startChat({
      history: [],
    });

    console.log('\n📤 [Gemini API] Mesaj gönderiliyor...');
    
    // İlk mesajı gönder
    let result = await chat.sendMessage(userMessage);
    let response = result.response;
    
    console.log('📥 [Gemini API] Yanıt alındı!');
    console.log('\n🤖 AI İlk Yanıt:');
    
    // Function call kontrolü
    const functionCalls = response.functionCalls();
    
    if (functionCalls && functionCalls.length > 0) {
      console.log(`📞 AI ${functionCalls.length} MCP aracı çağırıyor...\n`);

      // Tüm function call'ları MCP server üzerinden işle
      const functionResponses = await Promise.all(
        functionCalls.map(async (call) => {
          console.log(`  🔧 [MCP Tool] ${call.name}`);
          console.log(`  📥 Parametreler:`, JSON.stringify(call.args, null, 2));

          try {
            // MCP aracını çağır
            const toolResult = await callMCPTool(call.name, call.args);
            console.log(`  ✅ [MCP] Sonuç:`, JSON.stringify(toolResult, null, 2));
            console.log('');

            return {
              functionResponse: {
                name: call.name,
                response: toolResult
              }
            };
          } catch (error) {
            console.error(`  ❌ [MCP] Hata:`, error.message);
            console.log('');
            
            return {
              functionResponse: {
                name: call.name,
                response: { error: error.message }
              }
            };
          }
        })
      );

      // Function sonuçlarını AI'a geri gönder
      console.log('\n📤 [Gemini API] MCP araç sonuçları AI\'a gönderiliyor...');
      console.log(`   Toplam ${functionResponses.length} araç sonucu gönderiliyor`);
      
      result = await chat.sendMessage(functionResponses);
      response = result.response;
      
      console.log('📥 [Gemini API] Final yanıt alındı!');
    }

    // Final yanıtı göster
    const finalText = response.text();
    console.log('🎯 AI Final Yanıtı:');
    console.log('-'.repeat(80));
    console.log(finalText);
    console.log('-'.repeat(80));

    return finalText;

  } catch (error) {
    console.error('\n❌ HATA:', error.message);
    if (error.response) {
      console.error('API Yanıtı:', error.response);
    }
    throw error;
  }
}

// ============================================================================
// INTERACTIVE CLI
// ============================================================================

// Readline interface oluştur
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Yardım mesajını göster
function showHelp() {
  console.log('\n📚 Kullanılabilir Komutlar:');
  console.log('  - Herhangi bir soru sorun (örn: "İstanbul\'da hava nasıl?")');
  console.log('  - "help" veya "?" - Bu yardım mesajını göster');
  console.log('  - "examples" - Örnek soruları göster');
  console.log('  - "tools" - Kullanılabilir MCP araçlarını listele');
  console.log('  - "clear" - Ekranı temizle');
  console.log('  - "exit" veya "quit" - Programdan çık');
  console.log('');
}

// Örnek soruları göster
function showExamples() {
  console.log('\n💡 Örnek Sorular:');
  console.log('  1. "İstanbul\'da hava nasıl?"');
  console.log('  2. "25 ile 17\'yi çarp"');
  console.log('  3. "Ankara\'da hava durumu nasıl ve şu an saat kaç?"');
  console.log('  4. "Şu an Avrupa/İstanbul zaman diliminde saat kaç?"');
  console.log('  5. "100 ile 25\'i böl"');
  console.log('  6. "Antalya\'da hava durumu Fahrenheit cinsinden nasıl?"');
  console.log('');
}

// MCP araçlarını göster
function showTools() {
  console.log('\n🔧 Kullanılabilir MCP Araçları:');
  mcpTools.forEach(tool => {
    console.log(`\n  📦 ${tool.name}`);
    console.log(`     ${tool.description}`);
    if (tool.inputSchema.properties) {
      console.log(`     Parametreler:`);
      Object.entries(tool.inputSchema.properties).forEach(([name, prop]) => {
        const required = tool.inputSchema.required?.includes(name) ? '(zorunlu)' : '(opsiyonel)';
        console.log(`       - ${name}: ${prop.description} ${required}`);
      });
    }
  });
  console.log('');
}

// Soru sormak için promise-based fonksiyon
function askQuestion(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer.trim());
    });
  });
}

// İnteraktif ana döngü
async function interactiveMode() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║     🤖 GEMINI AI + MCP (Model Context Protocol) - İNTERAKTİF MOD            ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════════╝');
  
  console.log('\n✨ Hoş geldiniz! Gemini AI\'a soru sorabilirsiniz.');
  console.log('🔗 Model Context Protocol (MCP) client-server mimarisi aktif');
  console.log('💡 İpucu: "help" yazarak komutları görebilirsiniz.');
  console.log('');

  let questionCount = 0;

  while (true) {
    try {
      // Kullanıcıdan input al
      const userInput = await askQuestion('🙋 Siz: ');

      // Boş input kontrolü
      if (!userInput) {
        continue;
      }

      // Özel komutlar
      const command = userInput.toLowerCase();

      if (command === 'exit' || command === 'quit') {
        console.log('\n👋 Görüşmek üzere! İyi günler dileriz.\n');
        break;
      }

      if (command === 'help' || command === '?') {
        showHelp();
        continue;
      }

      if (command === 'examples') {
        showExamples();
        continue;
      }

      if (command === 'tools') {
        showTools();
        continue;
      }

      if (command === 'clear' || command === 'cls') {
        console.clear();
        console.log('✨ Ekran temizlendi!\n');
        continue;
      }

      // AI ile konuşma
      questionCount++;
      await runConversation(userInput);
      
      console.log('\n' + '─'.repeat(80) + '\n');

    } catch (error) {
      console.error('\n❌ Bir hata oluştu:', error.message);
      console.log('Lütfen tekrar deneyin.\n');
    }
  }

  rl.close();
  
  // MCP client'ı kapat
  if (mcpClient) {
    await mcpClient.close();
  }
  
  process.exit(0);
}

// Demo modu (otomatik örnekler)
async function demoMode() {
  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║        🤖 GEMINI AI + MCP (Model Context Protocol) - DEMO MODU              ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════════╝');

  const examples = [
    'İstanbul\'da hava nasıl?',
    '25 ile 17\'yi çarp',
    'Ankara\'da hava durumu nasıl ve şu an saat kaç?',
    'Şu an saat kaç?'
  ];

  console.log('\n🎬 Demo modu başlıyor - otomatik örnekler çalışacak...\n');

  for (let i = 0; i < examples.length; i++) {
    try {
      await runConversation(examples[i]);
      
      // Sonraki örnek için bekle
      if (i < examples.length - 1) {
        console.log('\n⏳ Sonraki örnek için bekleniyor...\n');
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    } catch (error) {
      console.error(`Örnek ${i + 1} başarısız oldu:`, error.message);
    }
  }

  console.log('\n');
  console.log('╔═══════════════════════════════════════════════════════════════════════════════╗');
  console.log('║                            ✨ DEMO TAMAMLANDI ✨                              ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════════╝');
  console.log('\n');
  
  // MCP client'ı kapat
  if (mcpClient) {
    await mcpClient.close();
  }
  
  process.exit(0);
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  try {
    // MCP Client'ı başlat
    await initializeMCPClient();
    
    // Komut satırı argümanlarını kontrol et
    const args = process.argv.slice(2);
    const mode = args[0]?.toLowerCase();

    if (mode === 'demo' || mode === '--demo' || mode === '-d') {
      await demoMode();
    } else {
      // Varsayılan: İnteraktif mod
      await interactiveMode();
    }
  } catch (error) {
    console.error('❌ Program başlatılamadı:', error.message);
    process.exit(1);
  }
}

// Error handling
process.on('SIGINT', async () => {
  console.log('\n\n👋 Program sonlandırılıyor...');
  if (mcpClient) {
    await mcpClient.close();
  }
  process.exit(0);
});

// Programı çalıştır
main().catch(console.error);

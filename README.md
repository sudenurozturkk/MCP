# 🤖 Gemini AI + MCP (Model Context Protocol) Örneği

Bu proje, **Model Context Protocol (MCP)** standardına uygun bir araç sunucusu (tool server) implementasyonudur. 

**İki şekilde kullanabilirsiniz:**
1. 🖥️ **Claude Desktop** ile - Server'ı Claude Desktop'a ekleyin (önerilen - en kolay!)
2. 🤖 **Gemini AI CLI** ile - Terminal'den interaktif kullanım

Her iki durumda da aynı MCP server (`mcp-server.js`) kullanılır!

## 🚀 Hızlı Başlangıç

### Claude Desktop Kullanıcıları için (Önerilen)

```bash
# 1. Projeyi klonlayın ve bağımlılıkları yükleyin
npm install

# 2. claude_desktop_config.json dosyasını açın ve path'i düzenleyin
#    (Dosya içinde Windows/macOS/Linux örnekleri var)

# 3. Config dosyasını Claude Desktop klasörüne kopyalayın
copy claude_desktop_config.json %APPDATA%\Claude\claude_desktop_config.json  # Windows
# veya
cp claude_desktop_config.json ~/Library/Application\ Support/Claude/  # macOS

# 4. Claude Desktop'ı yeniden başlatın
# 5. Claude'a "İstanbul'da hava nasıl?" diye sorun! ✨
```

### Gemini CLI Kullanıcıları için

```bash
# 1. Projeyi klonlayın ve bağımlılıkları yükleyin
npm install

# 2. .env dosyası oluşturun ve GEMINI_API_KEY ekleyin
# 3. Uygulamayı başlatın
npm start
```

## 🎯 Model Context Protocol (MCP) Nedir?

**MCP (Model Context Protocol)**, AI uygulamalarının harici araçları ve veri kaynaklarını standart bir şekilde kullanmasını sağlayan açık bir protokoldür. Bu projede:

- 🔧 **MCP Server** (`mcp-server.js`): Araçları (tools) standart MCP formatında tanımlar ve sunar
  - Stdio üzerinden iletişim kurar
  - Tool definitions ve implementations içerir
  - Bağımsız bir process olarak çalışır
  
- 🔌 **MCP Client** (`index.js`): Server'a bağlanır ve Gemini AI'a araçları iletir
  - Server'ı child process olarak başlatır
  - Stdio transport ile server'a bağlanır
  - Tool çağrılarını yönetir
  
- 📡 **Standart İletişim**: JSON-RPC formatında tool çağrıları ve yanıtları

**MCP'nin Avantajları:**
- ✅ Standart, birlikte çalışabilir araç tanımları
- ✅ Kolay genişletilebilir mimari
- ✅ Client-Server mimarisi ile temiz ayrım
- ✅ Çoklu AI modeli desteği (Claude, Gemini, vb.)
- ✅ Araç yönetimi ve versiyonlama

## 📋 Özellikler

### 🏗️ Mimari
- 🔗 **MCP Client-Server Mimarisi**: Temiz ayrılmış, profesyonel yapı
- 📄 **İki Dosya Sistemi**: 
  - `mcp-server.js`: MCP Server (tool provider)
  - `index.js`: MCP Client + Gemini AI + CLI
- 📡 **Stdio Transport**: Standart MCP iletişim protokolü
- 🔄 **Otomatik Server Yönetimi**: Client otomatik olarak server'ı başlatır
- 🖥️ **Claude Desktop Desteği**: Server doğrudan Claude Desktop'ta kullanılabilir!

### 🛠️ Araçlar (Tools)
- ✅ **Gerçek Hava Durumu Sorgulama**: Open-Meteo API ile gerçek zamanlı, ücretsiz hava durumu bilgisi
- ✅ **API Key Gerektirmez**: Hava durumu için API key'e gerek yok!
- ✅ **Hesap Makinesi**: Matematiksel işlemler (toplama, çıkarma, çarpma, bölme)
- ✅ **Zaman Bilgisi**: Farklı zaman dilimleri için tarih ve saat
- ✅ **Çoklu Fonksiyon Çağrısı**: AI, gerektiğinde birden fazla fonksiyonu otomatik çağırabilir

### 💻 Kullanıcı Deneyimi
- ✅ **Hata Yönetimi**: Kapsamlı hata yakalama ve raporlama
- ✅ **İnteraktif CLI**: Readline ile komut satırından sürekli soru sorabilme
- ✅ **Demo Modu**: Otomatik örneklerle hızlı test
- ✅ **Tools Komutu**: Kullanılabilir araçları listele

## 🚀 Kurulum

### 1. Bağımlılıkları Yükleyin

```bash
npm install
```

### 2. Claude Desktop ile Kullanım (Opsiyonel)

Bu MCP server'ı Claude Desktop uygulamasında kullanabilirsiniz!

#### Adım 1: Config dosyasını hazırlayın

Proje içindeki `claude_desktop_config.json` dosyasını açın ve path'i kendi sisteminize göre düzenleyin.

Dosya içinde tüm sistemler için örnekler var:

```json
{
  "mcpServers": {
    "weather-tools": {
      "command": "node",
      "args": [
        "BURAYA_PROJE_YOLUNU_YAZIN/mcp-server.js"
      ],
      "env": {},
      "_comment": "Yukarıdaki path'i kendi sisteminize göre değiştirin",
      "_examples": {
        "windows": "C:\\Users\\YourName\\Desktop\\MCP\\mcp-server.js",
        "macos": "/Users/yourname/Desktop/MCP/mcp-server.js",
        "linux": "/home/yourname/Desktop/MCP/mcp-server.js"
      }
    }
  }
}
```

**💡 Önemli:** 
- Windows'ta path'lerde `\\` (çift ters slash) kullanın
- macOS/Linux'ta normal `/` (slash) kullanın
- Node.js'in PATH'inizde olduğundan emin olun
- Dosya içindeki `_examples` kısmına bakın, sisteminize uygun olanı seçin

#### Adım 2: Config dosyasını Claude Desktop klasörüne kopyalayın

**Windows:**
```powershell
# Dosyayı kopyalayın
copy claude_desktop_config.json %APPDATA%\Claude\claude_desktop_config.json

# Veya dizini manuel açıp kopyalayın:
explorer %APPDATA%\Claude
```

**macOS:**
```bash
cp claude_desktop_config.json ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Linux:**
```bash
cp claude_desktop_config.json ~/.config/Claude/claude_desktop_config.json
```

#### Adım 3: Claude Desktop'ı yeniden başlatın

Config dosyasını kaydettikten sonra Claude Desktop'ı kapatıp tekrar açın.

#### Adım 4: Server'ı test edin

Claude Desktop içinde şöyle sorular sorabilirsiniz:
- "İstanbul'da hava nasıl?" 🌤️
- "25 ile 17'yi çarp" 🧮
- "Şu an saat kaç?" ⏰

Claude otomatik olarak MCP araçlarınızı kullanacak!

**🔍 Server'ın çalıştığını doğrulama:**
- Claude Desktop'ta yeni bir konuşma başlatın
- Sağ alt köşede "🔌" simgesine tıklayın
- "weather-tools" server'ını listede görmelisiniz
- Yeşil nokta = Server çalışıyor ✅
- Kırmızı nokta = Server hatası ❌

**💡 İpucu:** Claude Desktop'ta araçlar otomatik kullanılır. Gemini CLI'dan farklı olarak, hangi aracın çağrıldığını görmezsiniz - sadece sonucu görürsünüz.

---

### 3. Environment Variables Ayarlayın (Gemini CLI kullanımı için)

`.env.example` dosyasını `.env` olarak kopyalayın:

```bash
copy .env.example .env
```

Ardından `.env` dosyasını düzenleyip Gemini API key'inizi ekleyin:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

**Gemini API Key Nasıl Alınır?**
1. [Google AI Studio](https://aistudio.google.com/app/apikey) adresine gidin
2. Google hesabınızla giriş yapın
3. "Create API Key" butonuna tıklayın
4. Oluşturulan key'i kopyalayıp `.env` dosyasına yapıştırın

**💡 Not:** Hava durumu için Open-Meteo API kullanıldığından, hava durumu API key'ine gerek yoktur!

---

### 4. Uygulamayı Çalıştırın (Gemini CLI)

**İnteraktif Mod (Varsayılan)** - Soru sorarak kullanın:

```bash
npm start
```

Bu modda:
- ✅ CLI'dan istediğiniz soruyu sorabilirsiniz
- ✅ Sürekli soru sorabilirsiniz
- ✅ `help` yazarak komutları görebilirsiniz
- ✅ `exit` yazarak çıkabilirsiniz

**Demo Mod** - Otomatik örnekleri izleyin:

```bash
npm run demo
```

**Geliştirme Modu** - Otomatik yeniden başlatma:

```bash
npm run dev
```

## 📖 Nasıl Çalışır?

### MCP + Function Calling Akışı

1. **MCP Server Başlatma**: Server, araçları MCP standardında tanımlar (`get_current_weather`, `calculate`, `get_current_time`)
2. **Tool Registration**: Araçlar, input şemaları ve açıklamalarıyla MCP Server'a kaydedilir
3. **Gemini AI Entegrasyonu**: MCP araçları Gemini AI'a iletilir
4. **Kullanıcı Mesajı**: Kullanıcı doğal dilde bir soru sorar (CLI readline ile)
5. **AI Analizi**: Gemini AI, soruyu analiz eder ve uygun MCP araçlarını seçer
6. **MCP Tool Çağrısı**: Seçilen araçlar MCP Server üzerinden çağrılır (JSON-RPC formatında)
7. **Tool Execution**: MCP Server aracı çalıştırır ve sonucu döndürür
8. **Sonuç AI'a İletilir**: Tool sonuçları Gemini AI'a geri gönderilir
9. **Final Yanıt**: AI, sonuçları kullanarak kullanıcıya anlamlı bir yanıt oluşturur

### MCP Client-Server Mimarisi

```
┌─────────────────────────────────────────────────────┐
│                    index.js                         │
│              (MCP Client + Gemini AI)               │
│                                                     │
│  ┌──────────────┐         ┌──────────────────┐    │
│  │   User CLI   │────────►│   Gemini AI      │    │
│  │  (readline)  │         │  (AI Model)      │    │
│  └──────────────┘         └────────┬─────────┘    │
│                                    │               │
│                           ┌────────▼─────────┐    │
│                           │   MCP Client     │    │
│                           │  (Tool Caller)   │    │
│                           └────────┬─────────┘    │
└────────────────────────────────────┼──────────────┘
                                     │
                              stdio transport
                                     │
┌────────────────────────────────────▼──────────────┐
│                 mcp-server.js                     │
│                  (MCP Server)                     │
│                                                   │
│  ┌──────────────────────────────────────────┐   │
│  │          MCP Server Handler              │   │
│  │  - listTools: Araçları listele          │   │
│  │  - callTool: Araç çağrılarını işle      │   │
│  └─────────────────┬────────────────────────┘   │
│                    │                             │
│         ┌──────────▼───────────────┐            │
│         │   Tool Implementations   │            │
│         │  - get_current_weather   │            │
│         │  - calculate             │            │
│         │  - get_current_time      │            │
│         └──────────────────────────┘            │
└───────────────────────────────────────────────────┘
```

**İletişim Akışı:**
1. Kullanıcı CLI'dan soru sorar
2. Gemini AI, uygun MCP aracını seçer
3. MCP Client, server'a tool çağrısı yapar (stdio)
4. MCP Server aracı çalıştırır ve sonucu döndürür
5. Client sonucu Gemini AI'a gönderir
6. AI final yanıtı kullanıcıya sunar

### Örnek Kullanım Senaryoları

```javascript
// Hava durumu sorgulama
"İstanbul'da hava nasıl?"

// Matematiksel hesaplama
"25 ile 17'yi çarp"

// Zaman bilgisi
"Şu an saat kaç?"

// Birden fazla fonksiyon çağrısı
"Ankara'da hava durumu nasıl ve şu an saat kaç?"
```

## 🎮 İnteraktif Mod Komutları

İnteraktif modda kullanabileceğiniz komutlar:

| Komut | Açıklama |
|-------|----------|
| Herhangi bir soru | AI'a soru sorun (örn: "İstanbul'da hava nasıl?") |
| `help` veya `?` | Yardım mesajını göster |
| `examples` | Örnek soruları listele |
| `clear` veya `cls` | Ekranı temizle |
| `exit` veya `quit` | Programdan çık |

**Örnek Kullanım:**

```bash
$ npm start

🙋 Siz: İstanbul'da hava nasıl?
🤖 AI: [Hava durumu bilgisi...]

🙋 Siz: 50 ile 8'i böl
🤖 AI: [Hesaplama sonucu...]

🙋 Siz: examples
💡 Örnek Sorular:
  1. "İstanbul'da hava nasıl?"
  ...

🙋 Siz: exit
👋 Görüşmek üzere!
```

## 🔧 Kod Yapısı

### 📄 `mcp-server.js` - MCP Server
Model Context Protocol standardında server implementasyonu:

- **MCP Server Instance**: Stdio transport ile çalışan server
  ```javascript
  const server = new Server({
    name: 'weather-tools-server',
    version: '1.0.0',
  }, { capabilities: { tools: {} } });
  ```

- **Tool Definitions** (`mcpTools`): MCP formatında araç tanımları
  ```javascript
  {
    name: 'get_current_weather',
    description: 'Hava durumu bilgisi getirir',
    inputSchema: { /* JSON Schema */ }
  }
  ```

- **Tool Implementations** (`toolImplementations`): Gerçek araç fonksiyonları
  - `get_current_weather`: Open-Meteo API ile hava durumu
  - `calculate`: Matematiksel hesaplamalar
  - `get_current_time`: Tarih ve saat bilgisi

- **Request Handlers**:
  - `ListToolsRequestSchema`: Araçları listeler
  - `CallToolRequestSchema`: Araç çağrılarını işler

### 📄 `index.js` - MCP Client + Gemini AI
Client ve AI entegrasyonu:

- **MCP Client Setup** (`initializeMCPClient`):
  - MCP Server'ı child process olarak başlatır
  - Stdio transport ile server'a bağlanır
  - Araçları alır ve Gemini formatına dönüştürür

- **Tool Calling** (`callMCPTool`):
  - MCP server'a araç çağrısı yapar
  - Sonuçları parse eder ve döndürür

- **Gemini Integration** (`runConversation`):
  - Gemini API ile chat başlatır
  - MCP araçlarını Gemini'ye function declarations olarak iletir
  - Function call'ları MCP Server üzerinden işler
  - Sonuçları AI'a geri gönderir

- **Interactive CLI**:
  - Readline ile kullanıcı etkileşimi
  - Komut işleme (help, examples, tools, exit)
  - Demo modu desteği

### `toolConfig` - Function Calling Modu
Proje **AUTO** modunda çalışır:
- **AUTO** (Varsayılan): AI, gerektiğinde otomatik olarak fonksiyon çağırır veya direkt yanıt verir
- **ANY**: AI her durumda en az bir fonksiyon çağırmaya zorlanır
- **NONE**: AI hiçbir fonksiyon çağırmaz, sadece text yanıt verir

```javascript
toolConfig: {
  functionCallingConfig: {
    mode: 'AUTO'  // İhtiyacınıza göre değiştirilebilir
  }
}
```

### 🔌 Dosya İlişkileri

**Gemini CLI Kullanımı:**
```
index.js (Client)
    ↓ spawn child process
    ↓ stdio transport
mcp-server.js (Server)
    ↓ executes
Tool Implementations
```

**Claude Desktop Kullanımı:**
```
Claude Desktop
    ↓ reads config
claude_desktop_config.json
    ↓ spawns via stdio
mcp-server.js (Server)
    ↓ executes
Tool Implementations
```

### 📦 Dosyalar

| Dosya | Açıklama | Kullanım |
|-------|----------|----------|
| `mcp-server.js` | MCP Server - Araçları sağlar | Her iki kullanımda da çalışır ⭐ |
| `index.js` | MCP Client + Gemini AI + CLI | Sadece Gemini CLI kullanımı için |
| `claude_desktop_config.json` | Claude Desktop config (şablon) | Claude Desktop kurulumu için 🖥️ |
| `package.json` | NPM bağımlılıkları ve scriptler | Proje yönetimi |
| `README.md` | Detaylı dokümantasyon | Kurulum ve kullanım rehberi |

## 🌟 MCP Araçları (Tools)

### 1. get_current_weather
**Open-Meteo API** kullanarak belirtilen şehir için gerçek zamanlı, ücretsiz hava durumu bilgisi getirir.

**MCP Tool Name:** `get_current_weather`

**Parametreler:**
- `city` (string, zorunlu): Şehir adı (örn: "Istanbul", "London", "New York", "Tokyo")
- `unit` (string, opsiyonel): "celsius" veya "fahrenheit" (varsayılan: celsius)

**Dönen Veriler:**
- Şehir adı, ülke kodu ve koordinatlar
- Sıcaklık (gerçek ve hissedilen)
- Hava durumu açıklaması (WMO kodlarına göre Türkçe)
- Nem oranı
- Atmosfer basıncı
- Rüzgar hızı
- Yağış miktarı
- Zaman dilimi

**MCP Yanıt Formatı:**
```json
{
  "city": "Istanbul",
  "country": "TR",
  "latitude": "41.01",
  "longitude": "28.95",
  "temperature": "18°C",
  "feelsLike": "16°C",
  "condition": "Parçalı bulutlu",
  "humidity": "65%",
  "pressure": "1013 hPa",
  "windSpeed": "15 km/h",
  "precipitation": "0 mm",
  "timezone": "Europe/Istanbul"
}
```

**Avantajlar:**
- ✅ API key gerektirmez
- ✅ Ücretsiz ve sınırsız kullanım
- ✅ Dünya çapında tüm şehirler
- ✅ WMO standart hava kodları

### 2. calculate
Matematiksel işlem yapar.

**MCP Tool Name:** `calculate`

**Parametreler:**
- `operation` (string, zorunlu): "add", "subtract", "multiply", "divide"
- `a` (number, zorunlu): İlk sayı
- `b` (number, zorunlu): İkinci sayı

**MCP Call Örneği:**
```json
{
  "method": "tools/call",
  "params": {
    "name": "calculate",
    "arguments": {
      "operation": "multiply",
      "a": 25,
      "b": 17
    }
  }
}
```

### 3. get_current_time
Belirtilen zaman dilimi için tarih ve saat bilgisi getirir.

**MCP Tool Name:** `get_current_time`

**Parametreler:**
- `timezone` (string, opsiyonel): Zaman dilimi (varsayılan: "Europe/Istanbul")

**MCP Call Örneği:**
```json
{
  "method": "tools/call",
  "params": {
    "name": "get_current_time",
    "arguments": {
      "timezone": "Europe/Istanbul"
    }
  }
}
```

## 🛠️ Özelleştirme

### Yeni MCP Aracı Ekleme

Model Context Protocol standardına uygun yeni bir araç eklemek çok kolay! Sadece **`mcp-server.js`** dosyasını düzenlemeniz yeterli:

#### 1. **`mcp-server.js` içinde araç tanımı ekleyin:**

```javascript
// mcpTools dizisine yeni aracı ekle
const mcpTools = [
  // Mevcut araçlar...
  {
    name: 'my_new_tool',
    description: 'Aracın ne yaptığının açıklaması',
    inputSchema: {
      type: 'object',
      properties: {
        param1: {
          type: 'string',
          description: 'Parametre açıklaması'
        },
        param2: {
          type: 'number',
          description: 'İkinci parametre'
        }
      },
      required: ['param1']
    }
  }
];
```

#### 2. **Aynı dosyada implementasyon ekleyin:**

```javascript
// toolImplementations objesine yeni fonksiyon ekle
const toolImplementations = {
  // Mevcut implementasyonlar...
  my_new_tool: async ({ param1, param2 }) => {
    // Aracın mantığı
    try {
      // İşlemler...
      const result = await someAsyncOperation(param1, param2);
      
      return {
        success: true,
        result: result,
        message: 'İşlem başarılı'
      };
    } catch (error) {
      return {
        error: true,
        message: error.message
      };
    }
  }
};
```

**O kadar! 🎉**

MCP Client (`index.js`) otomatik olarak:
- Server'dan yeni aracı alır
- Gemini AI formatına dönüştürür
- Kullanıma hazır hale getirir

Server'ı yeniden başlattığınızda yeni araç hemen kullanılabilir olur!

#### MCP Server'ı Ayrı Çalıştırma (Opsiyonel)

Server'ı ayrı bir terminal'de manuel olarak çalıştırmak isterseniz:

```bash
# Terminal 1 - Server
npm run server

# Terminal 2 - Client
npm start
```

Bu şekilde server loglarını ayrı görebilirsiniz.

## 📝 Notlar

- ✅ **Gerçek Hava Durumu**: Open-Meteo API ile gerçek zamanlı hava durumu bilgisi
- 🔐 **Güvenlik**: API key'inizi asla git'e commit etmeyin!
- 🏗️ **Production**: Rate limiting ve hata yönetimi production için geliştirilmelidir
- 🔧 **MCP Standardı**: Server-Client mimarisi MCP spesifikasyonuna uygun
- 📡 **Stdio Transport**: Client-Server iletişimi stdio üzerinden (stdin/stdout)
- 🔄 **Otomatik Bağlantı**: Client otomatik olarak server'ı başlatır ve bağlanır
- 🛠️ **Geliştirme**: Server logları stderr'e yazılır, bu sayede debugging kolay

## 🔒 Güvenlik

- `.env` dosyası `.gitignore`'a eklenmiştir
- API key'ler asla kod içinde hardcode edilmemelidir
- Environment variables kullanarak hassas bilgileri koruyun

## 📚 Kaynaklar

### Model Context Protocol (MCP)
- [MCP Resmi Dokümantasyon](https://modelcontextprotocol.io)
- [MCP GitHub Repository](https://github.com/modelcontextprotocol)
- [MCP SDK for TypeScript/JavaScript](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Quickstart Guide](https://modelcontextprotocol.io/quickstart)

### Claude Desktop
- [Claude Desktop İndir](https://claude.ai/download)
- [Claude Desktop MCP Kurulum](https://modelcontextprotocol.io/quickstart/user)
- [Claude Desktop Config Dokümantasyonu](https://modelcontextprotocol.io/docs/tools/claude-desktop)

### Gemini AI
- [Google AI Gemini API Dokümantasyonu](https://ai.google.dev/docs)
- [Function Calling Guide](https://ai.google.dev/docs/function_calling)
- [Google Generative AI NPM Package](https://www.npmjs.com/package/@google/generative-ai)

### Hava Durumu API
- [Open-Meteo API](https://open-meteo.com/)
- [Open-Meteo Documentation](https://open-meteo.com/en/docs)

## 📄 Lisans

MIT

---

**Geliştirici Notu:** Bu proje eğitim amaçlıdır ve **Model Context Protocol (MCP)** standardı ile Gemini API'nin function calling özelliğini entegre ederek nasıl kullanılabileceğini göstermek için tasarlanmıştır. MCP, AI uygulamalarında araç yönetimi için açık ve standart bir protokol sağlar.


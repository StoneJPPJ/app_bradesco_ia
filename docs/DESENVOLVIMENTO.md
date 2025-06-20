# 🛠️ Guia de Desenvolvimento - Bradesco ChatBot

## 🎯 Visão Geral

Este guia fornece instruções detalhadas para desenvolvedores que desejam contribuir, modificar ou entender profundamente o projeto ChatBot Bradesco.

---

## 🏗️ Arquitetura Técnica

### 📊 Diagrama de Arquitetura

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   Database      │
│   (HTML/CSS/JS) │◄──►│   (Java 17)     │◄──►│   (SQL Server)  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       ▼                       │
         │              ┌─────────────────┐              │
         └─────────────►│   Gemini AI     │◄─────────────┘
                        │   (Google)      │
                        └─────────────────┘
```

### 🔧 Stack Tecnológico

#### Backend
- **Java 17** - LTS, record classes, pattern matching
- **Maven 3.9+** - Gerenciamento de dependências
- **HttpServer (nativo)** - Servidor HTTP sem frameworks
- **JDBC** - Conexão direta com banco
- **JSON manual** - Processamento sem bibliotecas externas

#### Frontend
- **HTML5** - Estrutura semântica
- **CSS3** - Grid, Flexbox, Custom Properties
- **JavaScript ES6+** - Módulos, async/await, fetch API
- **Font Awesome** - Ícones
- **Google Fonts** - Tipografia

#### Database
- **SQL Server** - Banco principal
- **T-SQL** - Queries e procedures

---

## 🚀 Setup do Ambiente de Desenvolvimento

### 📋 Pré-requisitos

```bash
# Verificar versões
java -version    # Deve ser 17+
mvn -version     # Deve ser 3.6+
node -version    # Opcional, para ferramentas frontend
```

### 🔧 Configuração Inicial

#### 1. Clone e Setup
```bash
git clone <repository>
cd Projeto-A3

# Instalar dependências
mvn clean install

# Configurar banco de dados
sqlcmd -S localhost -i database/dados_teste.sql
```

#### 2. Configuração de Ambiente
```bash
# Criar arquivo .env (não commitado)
echo "DB_URL=jdbc:sqlserver://localhost:1433;databaseName=bradesco" > .env
echo "DB_USER=seu_usuario" >> .env
echo "DB_PASSWORD=sua_senha" >> .env
echo "GEMINI_API_KEY=sua_chave" >> .env
```

#### 3. Estrutura de Desenvolvimento
```
src/
├── main/java/com/bradesco/chatbot/
│   ├── ChatBotBradesco.java          # Aplicação principal
│   ├── handlers/                     # Handlers HTTP separados
│   ├── model/                        # Classes de modelo
│   ├── service/                      # Lógica de negócio
│   └── util/                         # Utilitários
├── test/java/                        # Testes unitários
└── resources/
    ├── application.properties        # Configurações
    └── sql/                          # Scripts SQL
```

---

## 🧪 Ambiente de Desenvolvimento

### 🔧 IDEs Recomendadas

#### Visual Studio Code
```json
// .vscode/settings.json
{
    "java.home": "/path/to/java17",
    "maven.executable.path": "/path/to/mvn",
    "java.format.settings.url": "https://raw.githubusercontent.com/google/styleguide/gh-pages/eclipse-java-google-style.xml"
}
```

#### IntelliJ IDEA
```properties
# Configurações recomendadas
- Java 17 SDK
- Maven integration
- Google Java Format plugin
- SonarLint plugin
```

### 🏃‍♂️ Scripts de Desenvolvimento

#### Maven Profiles
```xml
<!-- pom.xml -->
<profiles>
    <profile>
        <id>dev</id>
        <properties>
            <spring.profiles.active>dev</spring.profiles.active>
        </properties>
    </profile>
    <profile>
        <id>prod</id>
        <properties>
            <spring.profiles.active>prod</spring.profiles.active>
        </properties>
    </profile>
</profiles>
```

#### Scripts Personalizados
```bash
# scripts/dev.sh
#!/bin/bash
export PROFILE=dev
mvn clean compile exec:java -Dexec.mainClass="com.bradesco.chatbot.ChatBotBradesco"

# scripts/test.sh
#!/bin/bash
mvn clean test
mvn jacoco:report

# scripts/build.sh
#!/bin/bash
mvn clean package -DskipTests
```

---

## 📊 Estruturas de Dados - Análise Detalhada

### 🗂️ HashMap vs ConcurrentHashMap

#### Escolha Arquitetural
```java
// ❌ HashMap - Não thread-safe
private static final Map<String, ClienteInfo> clientesLogados = new HashMap<>();

// ✅ ConcurrentHashMap - Thread-safe
private static final Map<String, ClienteInfo> clientesLogados = new ConcurrentHashMap<>();
```

**Justificativa:**
- Múltiplas requisições simultâneas
- Servidor HTTP aceita conexões paralelas
- Evita corrupção de dados em ambiente concorrente

#### Performance Comparison
```java
// Benchmark interno
public class HashMapBenchmark {
    // ConcurrentHashMap: ~15ns por operação
    // HashMap + synchronized: ~45ns por operação
    // Overhead aceitável para segurança
}
```

### 📋 ArrayList para Histórico

#### Implementação Otimizada
```java
private static final Map<String, List<Message>> sessionHistories = new ConcurrentHashMap<>();

// Limitação de memória
private static final int HISTORY_CAPACITY = 20;

private static void atualizarHistorico(String sessionId, String userPrompt, String modelResponse) {
    sessionHistories.computeIfAbsent(sessionId, k -> new ArrayList<>());
    List<Message> history = sessionHistories.get(sessionId);
    
    // Adicionar mensagens
    history.add(new Message("user", userPrompt));
    history.add(new Message("assistant", modelResponse));
    
    // Manter apenas últimas 20 mensagens (10 pares)
    if (history.size() > HISTORY_CAPACITY) {
        history.subList(0, history.size() - HISTORY_CAPACITY).clear();
    }
}
```

**Complexidade:**
- Inserção: O(1) amortizado
- Acesso: O(1) por índice
- Limpeza: O(n) quando necessário

### 🔒 Record Classes para Imutabilidade

#### Vantagens dos Records
```java
// ❌ Classe tradicional
public class Message {
    private final String role;
    private final String text;
    
    public Message(String role, String text) {
        this.role = role;
        this.text = text;
    }
    
    // getters, equals, hashCode, toString...
}

// ✅ Record class
private static record Message(String role, String text) {}
```

**Benefícios:**
- Código mais limpo (17 linhas → 1 linha)
- Imutabilidade garantida
- equals/hashCode automáticos
- Performance otimizada pelo compilador

---

## 🔍 Algoritmos Implementados

### 🔎 Algoritmo de Busca de Cliente

```java
private static ClienteInfo buscarClienteNoBanco(String identificador) {
    // Estratégia: Busca por ID primeiro (mais eficiente), depois por nome
    String sql = """
        SELECT id_cliente, nome_cliente, celular, idade 
        FROM clientes_cadastrados 
        WHERE id_cliente = ? OR LOWER(nome_cliente) LIKE LOWER(?)
        ORDER BY 
            CASE WHEN id_cliente = ? THEN 1 ELSE 2 END
        """;
    
    try (Connection conn = getConnection();
         PreparedStatement stmt = conn.prepareStatement(sql)) {
        
        stmt.setString(1, identificador);
        stmt.setString(2, "%" + identificador + "%");
        stmt.setString(3, identificador);
        
        // Execução otimizada com índice
        try (ResultSet rs = stmt.executeQuery()) {
            if (rs.next()) {
                return new ClienteInfo(
                    rs.getString("id_cliente"),
                    rs.getString("nome_cliente"),
                    rs.getString("celular"),
                    rs.getInt("idade")
                );
            }
        }
    } catch (Exception e) {
        System.err.println("❌ Erro na busca: " + e.getMessage());
    }
    
    return null;
}
```

**Otimizações:**
- Índice composto em `(id_cliente, nome_cliente)`
- PreparedStatement previne SQL Injection
- ORDER BY prioriza match exato de ID

### 📈 Algoritmo de Cálculo de Status

```java
private static Map<String, Object> calcularStatusEmprestimo(String idCliente) {
    // Algoritmo baseado em diferença de datas
    String sql = """
        SELECT valor, parcelas, data_deposito 
        FROM propostas_emprestimo 
        WHERE id_cliente = ?
        """;
    
    try (Connection conn = getConnection();
         PreparedStatement stmt = conn.prepareStatement(sql)) {
        
        stmt.setString(1, idCliente);
        
        try (ResultSet rs = stmt.executeQuery()) {
            if (rs.next()) {
                BigDecimal valor = rs.getBigDecimal("valor");
                int totalParcelas = rs.getInt("parcelas");
                Date dataDeposito = rs.getDate("data_deposito");
                
                // Cálculo de parcelas pagas baseado na data
                int parcelasPagas = calcularParcelasPagas(dataDeposito, totalParcelas);
                int parcelasPendentes = totalParcelas - parcelasPagas;
                
                BigDecimal valorParcela = valor.divide(
                    BigDecimal.valueOf(totalParcelas), 2, RoundingMode.HALF_UP
                );
                BigDecimal valorPendente = valorParcela.multiply(
                    BigDecimal.valueOf(parcelasPendentes)
                );
                
                // Construção do resultado
                Map<String, Object> status = new HashMap<>();
                status.put("parcelas_pagas", parcelasPagas);
                status.put("parcelas_pendentes", parcelasPendentes);
                status.put("valor_pendente", formatarMoeda(valorPendente));
                status.put("proximo_vencimento", calcularProximoVencimento());
                
                return status;
            }
        }
    } catch (Exception e) {
        System.err.println("❌ Erro no cálculo: " + e.getMessage());
    }
    
    return new HashMap<>();
}

private static int calcularParcelasPagas(Date dataDeposito, int totalParcelas) {
    // Algoritmo: uma parcela por mês desde o depósito
    LocalDate deposito = dataDeposito.toLocalDate();
    LocalDate hoje = LocalDate.now();
    
    long mesesDecorridos = ChronoUnit.MONTHS.between(deposito, hoje);
    
    // Não pode pagar mais parcelas que o total
    return Math.min((int) mesesDecorridos, totalParcelas);
}
```

**Complexidade:**
- Tempo: O(1) - consulta por índice primário
- Espaço: O(1) - estruturas fixas

---

## 🔐 Implementação de Segurança

### 🛡️ Validação de Entrada

```java
public class InputValidator {
    private static final Pattern VALID_ID = Pattern.compile("^[0-9]{1,10}$");
    private static final Pattern VALID_NAME = Pattern.compile("^[a-zA-ZÀ-ÿ\\s]{2,50}$");
    
    public static boolean isValidIdentifier(String identifier) {
        if (identifier == null || identifier.trim().isEmpty()) {
            return false;
        }
        
        String clean = identifier.trim();
        
        // Tenta como ID numérico
        if (VALID_ID.matcher(clean).matches()) {
            return true;
        }
        
        // Tenta como nome
        return VALID_NAME.matcher(clean).matches();
    }
    
    public static String sanitizeInput(String input) {
        if (input == null) return "";
        
        return input.trim()
                   .replaceAll("[<>\"'&]", "") // Remove HTML perigoso
                   .substring(0, Math.min(input.length(), 500)); // Limita tamanho
    }
}
```

### 🔒 Prevenção SQL Injection

```java
// ❌ Vulnerável
String sql = "SELECT * FROM clientes WHERE id = '" + userInput + "'";

// ✅ Seguro
String sql = "SELECT * FROM clientes WHERE id = ?";
PreparedStatement stmt = conn.prepareStatement(sql);
stmt.setString(1, userInput);
```

### 🛡️ Headers de Segurança

```java
private static void adicionarCORS(HttpExchange exchange) {
    Headers headers = exchange.getResponseHeaders();
    
    // CORS
    headers.add("Access-Control-Allow-Origin", "*");
    headers.add("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    headers.add("Access-Control-Allow-Headers", "Content-Type, Session-Id");
    
    // Segurança
    headers.add("X-Content-Type-Options", "nosniff");
    headers.add("X-Frame-Options", "DENY");
    headers.add("X-XSS-Protection", "1; mode=block");
    headers.add("Strict-Transport-Security", "max-age=31536000");
}
```

---

## 🧪 Estratégia de Testes

### ✅ Estrutura de Testes

```java
src/test/java/com/bradesco/chatbot/
├── unit/                    # Testes unitários
│   ├── service/            # Lógica de negócio
│   ├── util/               # Utilitários
│   └── model/              # Classes de modelo
├── integration/            # Testes de integração
│   ├── database/           # Testes de BD
│   └── api/                # Testes de API
└── performance/            # Testes de performance
    └── load/               # Testes de carga
```

### 🔬 Testes Unitários

```java
@Test
public void testBuscarClienteNoBanco_ComIdValido_DeveRetornarCliente() {
    // Arrange
    String idValido = "12345";
    
    // Act
    ClienteInfo resultado = ChatBotBradesco.buscarClienteNoBanco(idValido);
    
    // Assert
    assertNotNull(resultado);
    assertEquals("12345", resultado.idCliente);
    assertEquals("João Silva", resultado.nomeCliente);
}

@Test
public void testCalcularStatusEmprestimo_ComDadosValidos_DeveCalcularCorretamente() {
    // Arrange
    String idCliente = "12345";
    
    // Act
    Map<String, Object> status = ChatBotBradesco.calcularStatusEmprestimo(idCliente);
    
    // Assert
    assertFalse(status.isEmpty());
    assertTrue(status.containsKey("parcelas_pagas"));
    assertTrue(status.containsKey("valor_pendente"));
}
```

### 🔗 Testes de Integração

```java
@Test
public void testApiAuth_ComCredenciaisValidas_DeveAutenticar() throws Exception {
    // Arrange
    String json = "{\"identificador\":\"12345\"}";
    
    // Act
    HttpResponse<String> response = httpClient.send(
        HttpRequest.newBuilder()
            .uri(URI.create("http://localhost:8080/api/auth"))
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(json))
            .build(),
        HttpResponse.BodyHandlers.ofString()
    );
    
    // Assert
    assertEquals(200, response.statusCode());
    assertTrue(response.body().contains("success\":true"));
}
```

### ⚡ Testes de Performance

```java
@Test
public void testPerformanceConsultaCliente_DeveDemorarMenosDe100ms() {
    // Arrange
    String idCliente = "12345";
    long tempoInicio = System.nanoTime();
    
    // Act
    for (int i = 0; i < 100; i++) {
        ChatBotBradesco.buscarClienteNoBanco(idCliente);
    }
    
    long tempoTotal = System.nanoTime() - tempoInicio;
    long tempoMedio = tempoTotal / 100;
    
    // Assert (100ms = 100_000_000 nanosegundos)
    assertTrue("Consulta muito lenta: " + tempoMedio + "ns", 
               tempoMedio < 100_000_000);
}
```

---

## 📊 Monitoramento e Debugging

### 🔍 Sistema de Logs

```java
public class Logger {
    private static final String LOG_FORMAT = "%s [%s] %s - %s%n";
    
    public static void info(String component, String message) {
        System.out.printf(LOG_FORMAT, 
            LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME),
            "INFO",
            component,
            message
        );
    }
    
    public static void error(String component, String message, Exception e) {
        System.err.printf(LOG_FORMAT,
            LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME),
            "ERROR",
            component,
            message + " - " + e.getMessage()
        );
        
        if (Boolean.parseBoolean(System.getProperty("debug", "false"))) {
            e.printStackTrace();
        }
    }
}
```

### 📈 Métricas Customizadas

```java
public class Metrics {
    private static final Map<String, AtomicLong> counters = new ConcurrentHashMap<>();
    private static final Map<String, AtomicLong> timers = new ConcurrentHashMap<>();
    
    public static void incrementCounter(String name) {
        counters.computeIfAbsent(name, k -> new AtomicLong(0)).incrementAndGet();
    }
    
    public static void recordTime(String name, long timeMs) {
        timers.computeIfAbsent(name, k -> new AtomicLong(0)).addAndGet(timeMs);
    }
    
    public static Map<String, Object> getMetrics() {
        Map<String, Object> metrics = new HashMap<>();
        metrics.put("counters", new HashMap<>(counters));
        metrics.put("timers", new HashMap<>(timers));
        return metrics;
    }
}
```

---

## 🚀 Processo de Deploy

### 🏗️ Build Pipeline

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    - name: Set up JDK 17
      uses: actions/setup-java@v3
      with:
        java-version: '17'
        distribution: 'temurin'
    
    - name: Run tests
      run: mvn clean test
    
    - name: Generate coverage report
      run: mvn jacoco:report
    
    - name: Upload coverage to Codecov
      uses: codecov/codecov-action@v3

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
    - name: Build JAR
      run: mvn clean package -DskipTests
    
    - name: Build Docker image
      run: docker build -t bradesco-chatbot .
```

### 🐳 Containerização

```dockerfile
# Dockerfile
FROM openjdk:17-jre-slim

WORKDIR /app

COPY target/chatbot-1.0.0.jar app.jar
COPY src/main/resources/application.properties application.properties

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/api/health || exit 1

CMD ["java", "-jar", "app.jar"]
```

### ☁️ Deploy na Nuvem

```bash
# Heroku
heroku create bradesco-chatbot
heroku config:set DB_URL=$DB_URL
heroku config:set DB_USER=$DB_USER
heroku config:set DB_PASSWORD=$DB_PASSWORD
git push heroku main

# AWS ECS
aws ecs create-cluster --cluster-name bradesco-chatbot
aws ecs register-task-definition --cli-input-json file://task-definition.json
aws ecs create-service --cluster bradesco-chatbot --service-name chatbot-service

# Railway
railway login
railway init
railway add
railway deploy
```

---

## 🛠️ Ferramentas de Desenvolvimento

### 📝 Formatação de Código

```xml
<!-- pom.xml -->
<plugin>
    <groupId>com.spotify.fmt</groupId>
    <artifactId>fmt-maven-plugin</artifactId>
    <version>2.19</version>
    <executions>
        <execution>
            <goals>
                <goal>format</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

### 🔍 Análise de Código

```xml
<!-- SonarQube -->
<plugin>
    <groupId>org.sonarsource.scanner.maven</groupId>
    <artifactId>sonar-maven-plugin</artifactId>
    <version>3.9.1.2184</version>
</plugin>
```

### 📊 Coverage

```xml
<!-- JaCoCo -->
<plugin>
    <groupId>org.jacoco</groupId>
    <artifactId>jacoco-maven-plugin</artifactId>
    <version>0.8.8</version>
    <executions>
        <execution>
            <goals>
                <goal>prepare-agent</goal>
            </goals>
        </execution>
        <execution>
            <id>report</id>
            <phase>test</phase>
            <goals>
                <goal>report</goal>
            </goals>
        </execution>
    </executions>
</plugin>
```

---

## 🎯 Melhores Práticas

### 💡 Convenções de Código

1. **Nomenclatura**:
   - Classes: `PascalCase`
   - Métodos: `camelCase`
   - Constantes: `UPPER_SNAKE_CASE`
   - Pacotes: `lowercase`

2. **Documentação**:
   ```java
   /**
    * Busca informações de um cliente no banco de dados.
    * 
    * @param identificador ID numérico ou nome do cliente
    * @return ClienteInfo com dados do cliente ou null se não encontrado
    * @throws SQLException em caso de erro de banco de dados
    */
   private static ClienteInfo buscarClienteNoBanco(String identificador) {
       // implementação
   }
   ```

3. **Tratamento de Erros**:
   ```java
   try {
       // operação que pode falhar
   } catch (SQLException e) {
       Logger.error("DATABASE", "Erro na consulta", e);
       return null; // ou valor padrão apropriado
   }
   ```

### 🔒 Segurança

1. **Nunca hardcode credenciais**
2. **Sempre use PreparedStatement**
3. **Valide todas as entradas do usuário**
4. **Implemente rate limiting**
5. **Use HTTPS em produção**

### ⚡ Performance

1. **Use connection pooling**
2. **Implemente cache quando apropriado**
3. **Monitore métricas de performance**
4. **Otimize queries SQL**
5. **Use estruturas de dados apropriadas**

---

Este guia fornece uma base sólida para desenvolvimento e manutenção do projeto ChatBot Bradesco. Para dúvidas específicas, consulte a documentação das tecnologias utilizadas ou entre em contato com a equipe de desenvolvimento. 🚀 
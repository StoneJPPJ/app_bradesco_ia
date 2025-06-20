# 🚀 Guia de Deploy - Bradesco ChatBot

## 🎯 Visão Geral

Este guia apresenta diferentes opções de deploy para o sistema ChatBot Bradesco, desde desenvolvimento local até produção em nuvem profissional.

---

## 🏠 Deploy Local (Desenvolvimento)

### 📋 Pré-requisitos
- Java 17+ instalado
- Maven 3.6+ configurado
- SQL Server rodando localmente
- Navegador moderno

### 🔧 Passo a Passo

#### 1. Preparação do Ambiente
```bash
# Verificar instalações
java -version
mvn -version

# Configurar banco de dados
sqlcmd -S localhost -i database/dados_teste.sql
```

#### 2. Configuração
```properties
# src/main/resources/application.properties
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=bradesco
spring.datasource.username=seu_usuario
spring.datasource.password=sua_senha
gemini.api.key=sua_chave_api
```

#### 3. Execução
```bash
# Backend
mvn clean compile exec:java -Dexec.mainClass="com.bradesco.chatbot.ChatBotBradesco"

# Frontend (nova aba do terminal)
cd frontend
python -m http.server 8000
```

#### 4. Acesso
- Backend: `http://localhost:8080/api/health`
- Frontend: `http://localhost:8000`

---

## ☁️ Deploy em Nuvem - Opções Gratuitas

### 1. 🟢 Heroku (Recomendado para iniciantes)

#### Características
- ✅ Deploy simples
- ✅ PostgreSQL gratuito
- ✅ SSL automático
- ✅ Git-based deployment
- ❌ Dorme após 30min de inatividade
- ❌ Limitado a 550h/mês

#### Setup Passo a Passo

##### Preparação
```bash
# Instalar Heroku CLI
# Windows: https://devcenter.heroku.com/articles/heroku-cli
# macOS: brew tap heroku/brew && brew install heroku
# Linux: curl https://cli-assets.heroku.com/install.sh | sh

heroku login
```

##### Configuração do Projeto
```bash
# Criar Procfile
echo "web: java -jar target/chatbot-1.0.0.jar" > Procfile

# Adicionar plugin Maven para Heroku
```

```xml
<!-- pom.xml - adicionar no build/plugins -->
<plugin>
    <groupId>com.heroku.sdk</groupId>
    <artifactId>heroku-maven-plugin</artifactId>
    <version>3.0.4</version>
    <configuration>
        <appName>bradesco-chatbot-${user.name}</appName>
        <includeTarget>false</includeTarget>
        <includes>
            <include>target/chatbot-1.0.0.jar</include>
        </includes>
    </configuration>
</plugin>
```

##### Deploy
```bash
# Criar aplicação
heroku create bradesco-chatbot-seunome

# Configurar banco PostgreSQL (gratuito)
heroku addons:create heroku-postgresql:mini

# Configurar variáveis de ambiente
heroku config:set GEMINI_API_KEY=sua_chave
heroku config:set JAVA_OPTS="-Xmx300m -Xss512k"

# Deploy
git add .
git commit -m "Deploy inicial no Heroku"
git push heroku main

# Verificar logs
heroku logs --tail
```

##### Configuração do Banco PostgreSQL
```java
// Atualizar ChatBotBradesco.java para suportar PostgreSQL
private static final String DB_URL = System.getenv("DATABASE_URL") != null 
    ? System.getenv("DATABASE_URL")
    : "jdbc:sqlserver://localhost:1433;databaseName=bradesco";
```

### 2. 🚂 Railway (Moderno e fácil)

#### Características
- ✅ Deploy automático via GitHub
- ✅ PostgreSQL/MySQL incluído
- ✅ Domínio personalizado
- ✅ $5 crédito grátis/mês
- ✅ Sem sleep mode

#### Setup
```bash
# Instalar Railway CLI
npm install -g @railway/cli
# ou
curl -fsSL https://railway.app/install.sh | sh

# Login
railway login

# Inicializar projeto
railway init

# Deploy
railway up
```

##### railway.json
```json
{
  "build": {
    "builder": "nixpacks"
  },
  "deploy": {
    "startCommand": "java -jar target/chatbot-1.0.0.jar",
    "healthcheckPath": "/api/health"
  }
}
```

### 3. 🔗 Render (Alternativa robusta)

#### Características
- ✅ SSL automático
- ✅ PostgreSQL gratuito
- ✅ Deploy via GitHub
- ✅ 750h gratuitas/mês
- ❌ Build pode ser lento

#### Setup
1. Conectar repositório GitHub em [render.com](https://render.com)
2. Configurar build:
   - **Build Command**: `mvn clean package -DskipTests`
   - **Start Command**: `java -jar target/chatbot-1.0.0.jar`
3. Adicionar variáveis de ambiente

### 4. 🌐 Vercel (Frontend) + Backend separado

#### Para o Frontend
```bash
# Instalar Vercel CLI
npm i -g vercel

# Na pasta frontend/
vercel

# Configurar redirects
```

```json
// vercel.json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://seu-backend.herokuapp.com/api/$1"
    }
  ]
}
```

---

## 🏢 Deploy Profissional - Nuvem

### 1. ☁️ AWS (Amazon Web Services)

#### Opção 1: AWS Elastic Beanstalk
```bash
# Instalar EB CLI
pip install awsebcli

# Inicializar
eb init -p java-17 bradesco-chatbot

# Criar ambiente
eb create production

# Deploy
eb deploy

# Configurar banco RDS
aws rds create-db-instance \
  --db-instance-identifier bradesco-db \
  --db-instance-class db.t3.micro \
  --engine sqlserver-ex \
  --master-username admin \
  --master-user-password SenhaSegura123
```

#### Opção 2: AWS ECS (Docker)
```dockerfile
# Dockerfile otimizado para produção
FROM openjdk:17-jre-slim

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copiar JAR
COPY target/chatbot-1.0.0.jar app.jar

# Configurar usuário não-root
RUN addgroup --system app && adduser --system --group app
USER app

EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/api/health || exit 1

# Configurações JVM otimizadas
ENV JAVA_OPTS="-Xmx512m -Xms256m -XX:+UseG1GC -XX:MaxGCPauseMillis=200"

CMD java $JAVA_OPTS -jar app.jar
```

```yaml
# docker-compose.yml para desenvolvimento
version: '3.8'

services:
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - DB_URL=jdbc:sqlserver://db:1433;databaseName=bradesco
      - DB_USER=sa
      - DB_PASSWORD=SenhaSegura123
    depends_on:
      - db

  db:
    image: mcr.microsoft.com/mssql/server:2019-latest
    environment:
      - ACCEPT_EULA=Y
      - SA_PASSWORD=SenhaSegura123
    ports:
      - "1433:1433"
    volumes:
      - ./database/dados_teste.sql:/docker-entrypoint-initdb.d/init.sql
```

### 2. 🔷 Microsoft Azure

#### Azure App Service
```bash
# Instalar Azure CLI
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Login
az login

# Criar resource group
az group create --name rg-bradesco-chatbot --location eastus

# Criar app service plan
az appservice plan create \
  --name plan-bradesco-chatbot \
  --resource-group rg-bradesco-chatbot \
  --sku B1 \
  --is-linux

# Criar web app
az webapp create \
  --name bradesco-chatbot-unique \
  --resource-group rg-bradesco-chatbot \
  --plan plan-bradesco-chatbot \
  --runtime "JAVA|17-java17"

# Deploy
az webapp deploy \
  --resource-group rg-bradesco-chatbot \
  --name bradesco-chatbot-unique \
  --src-path target/chatbot-1.0.0.jar \
  --type jar
```

#### Azure SQL Database
```bash
# Criar SQL Server
az sql server create \
  --name sqlserver-bradesco \
  --resource-group rg-bradesco-chatbot \
  --location eastus \
  --admin-user sqladmin \
  --admin-password SenhaSegura123!

# Criar banco de dados
az sql db create \
  --resource-group rg-bradesco-chatbot \
  --server sqlserver-bradesco \
  --name bradesco \
  --service-objective Basic

# Configurar firewall
az sql server firewall-rule create \
  --resource-group rg-bradesco-chatbot \
  --server sqlserver-bradesco \
  --name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

### 3. 🌐 Google Cloud Platform

#### Cloud Run (Serverless)
```bash
# Instalar gcloud CLI
curl https://sdk.cloud.google.com | bash

# Configurar projeto
gcloud config set project seu-projeto-id

# Build da imagem
gcloud builds submit --tag gcr.io/seu-projeto-id/bradesco-chatbot

# Deploy
gcloud run deploy bradesco-chatbot \
  --image gcr.io/seu-projeto-id/bradesco-chatbot \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1
```

---

## 🗄️ Configuração de Banco de Dados em Produção

### 1. SQL Server na Nuvem

#### Azure SQL Database
```java
// Connection string para Azure SQL
private static final String DB_URL = 
    "jdbc:sqlserver://seu-servidor.database.windows.net:1433;" +
    "database=bradesco;" +
    "encrypt=true;" +
    "trustServerCertificate=false;" +
    "hostNameInCertificate=*.database.windows.net;" +
    "loginTimeout=30;";
```

#### AWS RDS SQL Server
```java
// Connection string para AWS RDS
private static final String DB_URL = 
    "jdbc:sqlserver://bradesco-db.abcdef.us-east-1.rds.amazonaws.com:1433;" +
    "databaseName=bradesco;" +
    "encrypt=true;" +
    "trustServerCertificate=true;";
```

### 2. Migração para PostgreSQL (Gratuito)

#### Script de Migração
```sql
-- PostgreSQL equivalent of dados_teste.sql
CREATE DATABASE bradesco;

\c bradesco;

CREATE TABLE clientes_cadastrados (
    id_cliente VARCHAR(50) PRIMARY KEY,
    nome_cliente VARCHAR(200) NOT NULL,
    celular VARCHAR(20) NOT NULL,
    idade INTEGER NOT NULL
);

CREATE TABLE propostas_emprestimo (
    id_proposta SERIAL PRIMARY KEY,
    id_cliente VARCHAR(50) NOT NULL,
    valor DECIMAL(15,2) NOT NULL,
    parcelas INTEGER NOT NULL,
    data_solicitacao DATE NOT NULL,
    data_deposito DATE NOT NULL,
    agencia VARCHAR(20) NOT NULL,
    tipo_formalizacao VARCHAR(50) NOT NULL,
    FOREIGN KEY (id_cliente) REFERENCES clientes_cadastrados(id_cliente)
);

-- Inserir dados de teste (mesmo conteúdo)
INSERT INTO clientes_cadastrados VALUES 
('12345', 'João Silva', '(11) 99999-9999', 35),
('67890', 'Maria Santos', '(11) 88888-8888', 28);
-- ... resto dos dados
```

#### Atualização do Java
```java
// Adicionar dependência PostgreSQL no pom.xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <version>42.6.0</version>
</dependency>

// Configuração automática de banco
private static String getDbUrl() {
    String databaseUrl = System.getenv("DATABASE_URL");
    if (databaseUrl != null) {
        // Heroku PostgreSQL format
        return databaseUrl;
    }
    
    // Local SQL Server
    return "jdbc:sqlserver://localhost:1433;databaseName=bradesco";
}
```

---

## 🔐 Configurações de Segurança para Produção

### 1. Variáveis de Ambiente

```bash
# Nunca commitar estas informações!
export DB_URL="jdbc:sqlserver://prod-server:1433;databaseName=bradesco"
export DB_USER="usuario_producao"
export DB_PASSWORD="senha_super_segura_123"
export GEMINI_API_KEY="chave_api_producao"
export CORS_ORIGINS="https://seudominio.com,https://www.seudominio.com"
```

### 2. SSL/TLS
```java
// Configuração para HTTPS obrigatório
private static void configurarSeguranca(HttpExchange exchange) {
    Headers headers = exchange.getResponseHeaders();
    
    // Forçar HTTPS
    headers.add("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
    
    // Outras configurações de segurança
    headers.add("Content-Security-Policy", "default-src 'self'");
    headers.add("X-Frame-Options", "DENY");
    headers.add("X-Content-Type-Options", "nosniff");
}
```

### 3. Rate Limiting Avançado
```java
// Implementação de rate limiting por IP
private static final Map<String, List<Long>> requestHistory = new ConcurrentHashMap<>();
private static final int MAX_REQUESTS_PER_MINUTE = 60;

private static boolean isRateLimited(String clientIP) {
    long now = System.currentTimeMillis();
    long oneMinuteAgo = now - 60000;
    
    requestHistory.computeIfAbsent(clientIP, k -> new ArrayList<>());
    List<Long> requests = requestHistory.get(clientIP);
    
    // Remove requests older than 1 minute
    requests.removeIf(timestamp -> timestamp < oneMinuteAgo);
    
    if (requests.size() >= MAX_REQUESTS_PER_MINUTE) {
        return true; // Rate limited
    }
    
    requests.add(now);
    return false;
}
```

---

## 📊 Monitoramento em Produção

### 1. Health Checks
```java
// Health check mais detalhado para produção
static class HealthHandler implements HttpHandler {
    @Override
    public void handle(HttpExchange exchange) throws IOException {
        Map<String, Object> health = new HashMap<>();
        
        // Status geral
        health.put("status", "healthy");
        health.put("timestamp", System.currentTimeMillis());
        
        // Verificar banco de dados
        boolean dbHealthy = testarBanco();
        health.put("database", dbHealthy ? "healthy" : "unhealthy");
        
        // Verificar memória
        Runtime runtime = Runtime.getRuntime();
        long maxMemory = runtime.maxMemory();
        long usedMemory = runtime.totalMemory() - runtime.freeMemory();
        double memoryUsage = (double) usedMemory / maxMemory;
        
        Map<String, Object> memory = new HashMap<>();
        memory.put("used_mb", usedMemory / 1024 / 1024);
        memory.put("max_mb", maxMemory / 1024 / 1024);
        memory.put("usage_percent", Math.round(memoryUsage * 100));
        health.put("memory", memory);
        
        // Status code baseado na saúde geral
        int statusCode = dbHealthy && memoryUsage < 0.9 ? 200 : 503;
        
        enviarRespostaJSON(exchange, formatarParaJSON(health), statusCode);
    }
}
```

### 2. Logs Estruturados
```java
// Logging para produção
public class ProductionLogger {
    private static final ObjectMapper mapper = new ObjectMapper();
    
    public static void logEvent(String level, String component, String message, 
                               String userId, Map<String, Object> metadata) {
        Map<String, Object> logEntry = new HashMap<>();
        logEntry.put("timestamp", Instant.now().toString());
        logEntry.put("level", level);
        logEntry.put("component", component);
        logEntry.put("message", message);
        logEntry.put("user_id", userId);
        logEntry.put("metadata", metadata);
        
        try {
            System.out.println(mapper.writeValueAsString(logEntry));
        } catch (Exception e) {
            System.err.println("Erro no logging: " + e.getMessage());
        }
    }
}
```

---

## 📈 Otimizações de Performance

### 1. Connection Pooling
```java
// Implementação simples de pool de conexões
public class ConnectionPool {
    private static final int POOL_SIZE = 10;
    private static final Queue<Connection> availableConnections = new ConcurrentLinkedQueue<>();
    private static final Set<Connection> usedConnections = ConcurrentHashMap.newKeySet();
    
    static {
        for (int i = 0; i < POOL_SIZE; i++) {
            try {
                availableConnections.add(createConnection());
            } catch (Exception e) {
                System.err.println("Erro criando pool de conexões: " + e.getMessage());
            }
        }
    }
    
    public static Connection getConnection() throws SQLException {
        Connection conn = availableConnections.poll();
        if (conn == null || conn.isClosed()) {
            conn = createConnection();
        }
        usedConnections.add(conn);
        return conn;
    }
    
    public static void releaseConnection(Connection conn) {
        usedConnections.remove(conn);
        availableConnections.offer(conn);
    }
    
    private static Connection createConnection() throws SQLException {
        return DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD);
    }
}
```

### 2. Cache de Respostas
```java
// Cache simples para respostas frequentes
private static final Map<String, Map<String, Object>> responseCache = new ConcurrentHashMap<>();
private static final long CACHE_TTL = 300000; // 5 minutos

private static Map<String, Object> getCachedResponse(String key) {
    Map<String, Object> cachedItem = responseCache.get(key);
    if (cachedItem != null) {
        long timestamp = (Long) cachedItem.get("timestamp");
        if (System.currentTimeMillis() - timestamp < CACHE_TTL) {
            return (Map<String, Object>) cachedItem.get("data");
        } else {
            responseCache.remove(key);
        }
    }
    return null;
}

private static void cacheResponse(String key, Map<String, Object> response) {
    Map<String, Object> cacheItem = new HashMap<>();
    cacheItem.put("data", response);
    cacheItem.put("timestamp", System.currentTimeMillis());
    responseCache.put(key, cacheItem);
}
```

---

## 🎯 Checklist de Deploy

### ✅ Pré-Deploy
- [ ] Todos os testes passando
- [ ] Configurações de produção definidas
- [ ] Variáveis de ambiente configuradas
- [ ] Banco de dados migrado
- [ ] SSL/TLS configurado
- [ ] Rate limiting implementado
- [ ] Logs estruturados funcionando
- [ ] Health checks implementados

### ✅ Deploy
- [ ] Build da aplicação
- [ ] Deploy do backend
- [ ] Deploy do frontend
- [ ] Configuração do banco
- [ ] Teste de conectividade
- [ ] Verificação de SSL
- [ ] Teste de performance básico

### ✅ Pós-Deploy
- [ ] Monitoramento ativo
- [ ] Logs sendo coletados
- [ ] Backup do banco configurado
- [ ] Alertas configurados
- [ ] Documentação atualizada
- [ ] Equipe notificada

---

## 🆘 Troubleshooting de Deploy

### Problemas Comuns

#### 1. "Application failed to start"
```bash
# Verificar logs
heroku logs --tail  # Heroku
railway logs         # Railway
az webapp log tail   # Azure

# Causas comuns:
# - Porta incorreta (usar PORT env var)
# - Falta de dependências
# - Configuração de banco incorreta
```

#### 2. "Database connection failed"
```bash
# Verificar string de conexão
# Verificar firewall
# Verificar credenciais
# Testar conectividade local

telnet seu-db-host 1433
```

#### 3. "Out of memory"
```bash
# Aumentar heap size
export JAVA_OPTS="-Xmx512m -Xms256m"

# Ou no Procfile
web: java $JAVA_OPTS -jar target/chatbot-1.0.0.jar
```

#### 4. "SSL/TLS errors"
```java
// Adicionar ao connection string
"trustServerCertificate=true"

// Ou configurar certificado específico
"hostNameInCertificate=*.database.windows.net"
```

---

Este guia cobre desde deploys simples para desenvolvimento até configurações profissionais de produção. Escolha a opção que melhor se adequa às suas necessidades e orçamento! 🚀 
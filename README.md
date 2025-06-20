# 🏦 Bradesco - Sistema de ChatBot para Empréstimos

## 📋 Visão Geral do Projeto

Sistema completo de chatbot bancário desenvolvido para auxiliar clientes do Bradesco com consultas sobre empréstimos. O projeto integra tecnologias modernas de desenvolvimento web e Java, oferecendo uma interface intuitiva e funcionalidades robustas de backend.

### 🎯 Objetivo Acadêmico
Este projeto foi desenvolvido como parte da disciplina **"Estrutura de Dados e Algoritmos"** com foco em:
- Implementação de estruturas de dados eficientes
- Algoritmos de busca e manipulação de dados
- Integração com banco de dados SQL Server
- Desenvolvimento de API REST
- Interface web responsiva

---

## 🏗️ Arquitetura do Sistema

### 📁 Estrutura Organizacional

```
Projeto-A3/
├── 📂 src/
│   └── main/
│       ├── java/com/bradesco/chatbot/
│       │   ├── ChatBotBradesco.java          # Aplicação principal
│       │   └── BradescoChatBotCompleto.java  # Versão alternativa
│       └── resources/
│           └── application.properties        # Configurações Spring
├── 📂 frontend/
│   ├── index.html                           # Interface principal
│   └── assets/
│       ├── css/
│       │   └── styles.css                   # Estilos visuais
│       └── js/
│           └── script.js                    # Lógica frontend
├── 📂 database/
│   └── dados_teste.sql                      # Estrutura e dados de teste
├── 📂 config/
│   └── config.properties                    # Configurações gerais
├── 📂 docs/                                 # Documentação
├── 📂 lib/
│   └── mssql-jdbc-12.10.0.jre11.jar       # Driver SQL Server
├── 📂 target/                               # Artefatos compilados
├── pom.xml                                  # Configuração Maven
└── README.md                                # Este arquivo
```

### 💻 Tecnologias Utilizadas

#### Backend
- **Java 17** - Linguagem principal
- **Maven** - Gerenciamento de dependências
- **Spring Boot** - Framework de desenvolvimento
- **SQL Server** - Banco de dados
- **HttpServer** - Servidor HTTP nativo Java
- **Gemini AI** - Integração com IA generativa

#### Frontend
- **HTML5** - Estrutura da página
- **CSS3** - Estilização avançada
- **JavaScript (ES6+)** - Lógica de interação
- **Font Awesome** - Ícones
- **Google Fonts** - Tipografia

---

## ⚙️ Funcionalidades Implementadas

### 🔐 Sistema de Autenticação
- Validação de cliente por ID ou nome
- Sistema de sessões seguras
- Integração com base de dados real

### 💬 Chatbot Inteligente
- **Consulta de Agência**: Onde o empréstimo foi realizado
- **Detalhes do Empréstimo**: Valores, parcelas, datas
- **Status do Empréstimo**: Situação atual das parcelas
- **Contato com Especialista**: Conexão com agentes

### 🎨 Interface Moderna
- Design responsivo (mobile-first)
- Cores oficiais do Bradesco
- Animações e transições suaves
- Feedback visual em tempo real

---

## 🚀 Como Executar o Projeto

### 📋 Pré-requisitos

1. **Java 17+** instalado
2. **Maven 3.6+** configurado
3. **SQL Server** rodando
4. **Navegador moderno** (Chrome, Firefox, Edge)

### 🔧 Configuração do Banco de Dados

1. Execute o script de criação:
```sql
-- Execute o arquivo: database/dados_teste.sql
```

2. Configure as credenciais em `src/main/resources/application.properties`:
```properties
# Configurações do banco
spring.datasource.url=jdbc:sqlserver://localhost:1433;databaseName=bradesco
spring.datasource.username=seu_usuario
spring.datasource.password=sua_senha
```

### 📡 Executando o Backend

```bash
# 1. Navegue para o diretório do projeto
cd Projeto-A3

# 2. Compile o projeto
mvn clean compile

# 3. Execute a aplicação principal
mvn exec:java -Dexec.mainClass="com.bradesco.chatbot.ChatBotBradesco"

# Ou execute a versão alternativa
mvn exec:java -Dexec.mainClass="com.bradesco.chatbot.BradescoChatBotCompleto"
```

### 🌐 Executando o Frontend

```bash
# Opção 1: Servidor HTTP simples com Python
cd frontend
python -m http.server 8000

# Opção 2: Servidor HTTP com Node.js
npx http-server frontend

# Acesse: http://localhost:8000
```

---

## 🧪 Testando o Sistema

### 👥 Usuários de Teste

| ID Cliente | Nome | Telefone | Empréstimo |
|------------|------|----------|------------|
| 12345 | João Silva | (11) 99999-9999 | R$ 25.000,00 |
| 67890 | Maria Santos | (11) 88888-8888 | R$ 15.000,00 |
| 11111 | Carlos Oliveira | (11) 77777-7777 | R$ 50.000,00 |
| 54321 | Ana Costa | (11) 66666-6666 | R$ 30.000,00 |
| 98765 | Pedro Fernandes | (11) 55555-5555 | R$ 20.000,00 |

### 🔍 Endpoints da API

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/health` | GET | Status do sistema |
| `/api/auth` | POST | Autenticação de cliente |
| `/api/chatbot` | POST | Chat principal |
| `/api/emprestimo/detalhes` | GET | Detalhes do empréstimo |
| `/api/emprestimo/status` | GET | Status das parcelas |
| `/api/emprestimo/agencia` | GET | Informações da agência |
| `/api/agente/contato` | POST | Contato com especialista |

---

## 📊 Estruturas de Dados Utilizadas

### 🗂️ Principais Estruturas

#### 1. **ConcurrentHashMap** - Gestão de Sessões
```java
private static final Map<String, ClienteInfo> clientesLogados = new ConcurrentHashMap<>();
```
- **Vantagem**: Thread-safe para aplicações concorrentes
- **Uso**: Armazenar clientes autenticados por sessão

#### 2. **ArrayList** - Histórico de Mensagens
```java
private static final Map<String, List<Message>> sessionHistories = new ConcurrentHashMap<>();
```
- **Vantagem**: Acesso sequencial otimizado
- **Uso**: Manter histórico de conversas por sessão

#### 3. **Record Classes** - Estruturas Imutáveis
```java
private static record Message(String role, String text) {}
```
- **Vantagem**: Imutabilidade e performance
- **Uso**: Representar mensagens do chat

### 🔍 Algoritmos Implementados

#### 1. **Busca por Identificador**
```java
private static ClienteInfo buscarClienteNoBanco(String identificador) {
    // Busca otimizada por ID ou nome usando PreparedStatement
}
```

#### 2. **Cálculo de Status de Empréstimo**
```java
private static Map<String, Object> calcularStatusEmprestimo(String idCliente) {
    // Algoritmo para calcular parcelas pagas baseado em datas
}
```

---

## 🔧 Configurações Avançadas

### 🔐 Variáveis de Ambiente

```bash
# Backend
export DB_URL="jdbc:sqlserver://localhost:1433;databaseName=bradesco"
export DB_USER="usuario_java"
export DB_PASSWORD="senha_segura"
export GEMINI_API_KEY="sua_api_key_gemini"

# Frontend
export API_BASE_URL="http://localhost:8080"
```

### ⚡ Otimizações de Performance

#### Backend
```java
// Pool de conexões
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.minimum-idle=5

// Cache de consultas
spring.jpa.properties.hibernate.cache.use_second_level_cache=true
```

#### Frontend
```javascript
// Debounce em pesquisas
const debouncedSearch = debounce(searchFunction, 300);

// Cache de resultados
const responseCache = new Map();
```

---

## 📈 Monitoramento e Logs

### 📊 Métricas Importantes
- Tempo de resposta da API
- Taxa de autenticação bem-sucedida
- Número de sessões ativas
- Erros de banco de dados

### 📝 Sistema de Logs
```java
// Configuração de logging
logging.level.com.bradesco.chatbot=INFO
logging.pattern.console=%d{yyyy-MM-dd HH:mm:ss} - %msg%n
```

---

## 🛡️ Segurança

### 🔒 Medidas Implementadas
- **CORS** configurado para origens específicas
- **Input Validation** em todos os endpoints
- **Prepared Statements** contra SQL Injection
- **Session Management** seguro
- **Error Handling** sem exposição de dados internos

### 🚨 Recomendações para Produção
```java
// Headers de segurança
response.setHeader("X-Content-Type-Options", "nosniff");
response.setHeader("X-Frame-Options", "DENY");
response.setHeader("X-XSS-Protection", "1; mode=block");
```

---

## 🧪 Testes

### ✅ Testes Unitários
```bash
mvn test
```

### 🔍 Testes de Integração
```bash
# Teste de conectividade
curl http://localhost:8080/api/health

# Teste de autenticação
curl -X POST http://localhost:8080/api/auth \
  -H "Content-Type: application/json" \
  -d '{"identificador":"12345"}'
```

---

## 📞 Suporte e Documentação

### 🆘 Resolução de Problemas

#### Backend não inicia
1. Verifique se o Java 17+ está instalado
2. Confirme as configurações do banco de dados
3. Verifique se a porta 8080 está disponível

#### Frontend não carrega dados
1. Confirme se o backend está rodando
2. Verifique as configurações de CORS
3. Inspecione o console do navegador

#### Erro de autenticação
1. Verifique se os dados de teste foram inseridos
2. Confirme a string de conexão do banco
3. Teste a consulta SQL manualmente

### 📚 Documentação Adicional
- [Documentação da API](docs/API.md)
- [Guia de Desenvolvimento](docs/DESENVOLVIMENTO.md)
- [Manual do Usuário](docs/USUARIO.md)

---

## 🚀 Próximas Melhorias

### 🎯 Roadmap
- [ ] **Autenticação JWT** - Segurança aprimorada
- [ ] **WebSocket** - Chat em tempo real
- [ ] **Notificações Push** - Alertas automáticos
- [ ] **Dashboard Administrativo** - Métricas e controle
- [ ] **Testes Automatizados** - Cobertura completa
- [ ] **Docker** - Containerização
- [ ] **CI/CD** - Deploy automatizado
- [ ] **Monitoramento** - APM integrado

---

## 👥 Contribuidores

**Desenvolvido para o projeto acadêmico:**
- **Disciplina**: Estrutura de Dados e Algoritmos
- **Tema**: Sistema de Notificação de Empréstimos Pendentes
- **Instituição**: Banco Bradesco (Simulação Acadêmica)

---

## 📄 Licença

Este projeto é destinado exclusivamente para fins acadêmicos e educacionais.

---

## 🏆 Conclusão

Este sistema demonstra a aplicação prática de conceitos fundamentais de:
- **Estruturas de Dados**: HashMap, ArrayList, Records
- **Algoritmos**: Busca, ordenação, cálculos financeiros
- **Arquitetura de Software**: Separação de responsabilidades
- **Integração de Sistemas**: API REST, banco de dados, IA
- **Interface do Usuário**: Design responsivo e acessível

O projeto está pronto para **desenvolvimento**, **testes** e **deploy em produção** com as configurações adequadas para cada ambiente. 

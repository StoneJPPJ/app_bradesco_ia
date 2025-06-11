# 🏦 Bradesco - Chatbot de Empréstimos

Sistema de chatbot web para consulta de informações sobre empréstimos bancários, desenvolvido para integração com API REST Java.

## 📋 Sobre o Projeto

Este projeto foi desenvolvido como parte da disciplina "Estruturas de Dados e Algoritmos" e consiste em uma interface web moderna para um chatbot que auxilia clientes do Bradesco com informações sobre seus empréstimos.

### ✨ Funcionalidades

- 🏢 **Consulta de Agência**: Informações sobre onde o empréstimo foi realizado
- 📊 **Detalhes do Empréstimo**: Valor total, parcelas, datas de vencimento
- 📈 **Status do Empréstimo**: Situação atual, parcelas pendentes
- 👩‍💼 **Contato com Especialista**: Conexão direta com agente de empréstimos
- 💬 **Chat Interativo**: Interface moderna com histórico de conversas
- 📱 **Design Responsivo**: Funciona perfeitamente em mobile e desktop

## 🎨 Design

A interface utiliza as cores oficiais do Banco Bradesco:
- **Vermelho Principal**: `#CC092F`
- **Vermelho Escuro**: `#A50725`  
- **Vermelho Claro**: `#E6394B`
- **Branco e Cinzas**: Para contraste e legibilidade

## 🚀 Como Usar

### 1. Execução Local

```bash
# Clone ou faça download dos arquivos
# Abra o arquivo index.html em um navegador web
```

### 2. Servidor Local (Recomendado)

```bash
# Com Python 3
python -m http.server 8000

# Com Node.js (http-server)
npx http-server

# Acesse: http://localhost:8000
```

### 3. Teste as Funcionalidades

- Clique nos botões de opções rápidas
- Digite mensagens como "onde foi feito", "detalhes", "status"
- Teste a opção "Falar com especialista"

## 🔗 Integração com API REST

### Configuração da API

No arquivo `script.js`, localize a seção de configuração:

```javascript
const CONFIG = {
    API_BASE_URL: 'http://localhost:8080', // ✏️ Altere para seu backend
    ENDPOINTS: {
        CHAT: '/chatbot',
        LOAN_DETAILS: '/emprestimo/detalhes',
        LOAN_STATUS: '/emprestimo/status',
        AGENCY_INFO: '/emprestimo/agencia',
        CONTACT_AGENT: '/agente/contato'
    }
};
```

### Função Principal de Integração

A função `sendToAPI()` é o **ponto principal de conexão** com seu backend:

```javascript
// 📍 LINHA ~142 em script.js
async sendToAPI(message, endpoint = CONFIG.ENDPOINTS.CHAT) {
    const url = `${CONFIG.API_BASE_URL}${endpoint}`;
    
    const requestBody = {
        message: message,
        timestamp: new Date().toISOString(),
        sessionId: this.generateSessionId(),
        userContext: {
            messageCount: this.messageCount++,
            lastActivity: Date.now()
        }
    };

    // 🔥 DESCOMENTE ESTE BLOCO QUANDO A API ESTIVER PRONTA:
    /*
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            // 'Authorization': 'Bearer your-token' // Se necessário
        },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
    */
}
```

### Estrutura de Resposta Esperada

Seu backend Java deve retornar JSON no seguinte formato:

```json
{
    "type": "loan_details",
    "message": "Aqui estão os detalhes do seu empréstimo:",
    "data": {
        "valor_total": "R$ 15.000,00",
        "valor_parcela": "R$ 1.250,00",
        "parcelas_totais": 12,
        "parcelas_pagas": 8,
        "próximo_vencimento": "15/12/2024"
    }
}
```

### Tipos de Resposta Suportados

| Tipo | Descrição | Campos de Data |
|------|-----------|----------------|
| `agency_info` | Informações da agência | `agencia`, `endereco`, `telefone` |
| `loan_details` | Detalhes do empréstimo | `valor_total`, `valor_parcela`, `parcelas_totais`, etc. |
| `loan_status` | Status atual | `status`, `parcelas_pendentes`, `valor_pendente` |
| `contact_agent` | Contato especialista | `agent_name`, `available`, `phone`, `email` |
| `general` | Resposta genérica | Apenas `message` |

## 🛠️ Estrutura dos Arquivos

```
projeto-chatbot/
├── index.html          # Página principal
├── styles.css          # Estilos (tema Bradesco)
├── script.js           # Lógica do chatbot + integração API
└── README.md           # Documentação
```

## 🧪 Desenvolvimento e Debug

### Funções Utilitárias

O sistema inclui funções para facilitar o desenvolvimento:

```javascript
// No console do navegador:

// Testar conexão com API
testAPI()

// Limpar histórico de chat
clearChat()

// Acessar instância do chatbot
window.chatbot
```

### Logs de Debug

O sistema gera logs detalhados no console:

- `💬` Inicialização do chatbot
- `📡` Chamadas para API
- `❌` Erros de comunicação
- `✅` Sucessos de operação

## 📱 Responsividade

A interface é otimizada para:

- **Desktop**: Layout com sidebar para opções
- **Tablet**: Layout adaptado com botões menores
- **Mobile**: Interface full-screen otimizada

## 🔒 Segurança

### Headers Recomendados

Para produção, configure no seu backend:

```http
Access-Control-Allow-Origin: https://seu-dominio.com
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### Autenticação

Para adicionar autenticação, modifique os headers na função `sendToAPI()`:

```javascript
headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userToken}`
}
```

## 🚀 Deploy

### Para Produção

1. **Frontend**: Hospede os arquivos em qualquer servidor web
2. **Backend**: Configure CORS para permitir origem do frontend
3. **URL da API**: Atualize `CONFIG.API_BASE_URL` para URL de produção

### Exemplo de Deploy

```javascript
// Para produção
const CONFIG = {
    API_BASE_URL: 'https://api.bradesco-emprestimos.com',
    // ... resto da configuração
};
```

## 📞 Suporte

Para dúvidas sobre integração:

1. Verifique os logs no console do navegador
2. Teste a função `testAPI()` 
3. Confirme se o backend está respondendo nos endpoints corretos
4. Verifique configurações de CORS

## 🎯 Próximos Passos

- [ ] Implementar autenticação de usuário
- [ ] Adicionar notificações push
- [ ] Integrar com sistema de tickets
- [ ] Adicionar histórico persistente
- [ ] Implementar chat em tempo real (WebSocket)

---

**Desenvolvido para o projeto acadêmico de Estruturas de Dados e Algoritmos**

Tema: Sistema de Notificação de Empréstimos Pendentes - Banco Bradesco 
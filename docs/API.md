# 📡 Documentação da API REST - Bradesco ChatBot

## 🎯 Visão Geral

Esta API REST foi desenvolvida para fornecer acesso programático às funcionalidades do ChatBot Bradesco. Utiliza arquitetura RESTful com endpoints bem definidos para diferentes operações do sistema.

---

## 🏗️ Arquitetura

### Base URL
- **Desenvolvimento**: `http://localhost:8080`
- **Produção**: `https://seu-dominio.com`

### Formato de Dados
- **Content-Type**: `application/json`
- **Charset**: `UTF-8`
- **Métodos HTTP**: GET, POST, OPTIONS

---

## 🔐 Autenticação e Autorização

### Sistema de Sessões

A API utiliza um sistema de sessões baseado em tokens temporários:

```json
{
    "sessionId": "cliente_12345_1671234567890",
    "expiration": "2024-12-20T10:30:00Z",
    "clienteId": "12345"
}
```

### Headers Obrigatórios

```http
Content-Type: application/json
Accept: application/json
Session-Id: cliente_12345_1671234567890 (após autenticação)
```

---

## 📋 Endpoints Disponíveis

### 1. 🔍 Health Check

Verifica o status geral do sistema.

**Endpoint:** `GET /api/health`

**Response:**
```json
{
    "status": "✅ Bradesco ChatBot FUNCIONANDO!",
    "database": "CONECTADO",
    "ai": "CONFIGURADO",
    "active_sessions": 5,
    "timestamp": "2024-12-20T10:30:00Z"
}
```

**Códigos de Status:**
- `200` - Sistema funcionando
- `503` - Falha em algum componente

---

### 2. 🔐 Autenticação de Cliente

Autentica um cliente no sistema.

**Endpoint:** `POST /api/auth`

**Request Body:**
```json
{
    "identificador": "12345"
}
```

**Successful Response (200):**
```json
{
    "success": true,
    "message": "Cliente autenticado com sucesso!",
    "sessionId": "cliente_12345_1671234567890",
    "cliente": {
        "id": "12345",
        "nome": "João Silva",
        "celular": "(11) 99999-9999"
    }
}
```

**Error Response (404):**
```json
{
    "success": false,
    "message": "Cliente não encontrado no sistema. Verifique o ID ou nome informado."
}
```

**Códigos de Status:**
- `200` - Autenticação bem-sucedida
- `404` - Cliente não encontrado
- `500` - Erro interno do servidor

---

### 3. 💬 Chat Principal

Processa mensagens do chatbot com IA.

**Endpoint:** `POST /api/chatbot`

**Request Body:**
```json
{
    "message": "Quero saber sobre meu empréstimo",
    "sessionId": "cliente_12345_1671234567890"
}
```

**Response:**
```json
{
    "type": "general",
    "message": "Olá João! Posso ajudá-lo com informações sobre seu empréstimo. Você gostaria de ver os detalhes, status ou informações da agência?",
    "suggestions": [
        "Ver detalhes do empréstimo",
        "Consultar status das parcelas",
        "Informações da agência"
    ],
    "timestamp": "2024-12-20T10:30:00Z"
}
```

---

### 4. 📊 Detalhes do Empréstimo

Retorna informações detalhadas do empréstimo do cliente.

**Endpoint:** `GET /api/emprestimo/detalhes?sessionId={sessionId}`

**Response:**
```json
{
    "type": "loan_details",
    "message": "Aqui estão os detalhes do seu empréstimo:",
    "data": {
        "valor_total": "R$ 25.000,00",
        "valor_parcela": "R$ 2.083,33",
        "parcelas_totais": 12,
        "data_solicitacao": "15/01/2024",
        "data_deposito": "20/01/2024",
        "agencia": "1234-5",
        "tipo_formalizacao": "Digital"
    },
    "timestamp": "2024-12-20T10:30:00Z"
}
```

---

### 5. 📈 Status do Empréstimo

Consulta o status atual das parcelas.

**Endpoint:** `GET /api/emprestimo/status?sessionId={sessionId}`

**Response:**
```json
{
    "type": "loan_status",
    "message": "Status atual do seu empréstimo:",
    "data": {
        "status": "Em Dia",
        "parcelas_pagas": 8,
        "parcelas_pendentes": 4,
        "valor_pendente": "R$ 8.333,32",
        "proximo_vencimento": "15/12/2024",
        "ultimo_pagamento": "15/11/2024"
    },
    "timestamp": "2024-12-20T10:30:00Z"
}
```

---

### 6. 🏢 Informações da Agência

Retorna dados da agência onde o empréstimo foi realizado.

**Endpoint:** `GET /api/emprestimo/agencia?sessionId={sessionId}`

**Response:**
```json
{
    "type": "agency_info",
    "message": "Informações da agência onde seu empréstimo foi realizado:",
    "data": {
        "agencia": "1234-5",
        "nome": "Agência São Paulo Centro",
        "endereco": "Av. Paulista, 1234 - Bela Vista, São Paulo - SP",
        "telefone": "(11) 3456-7890",
        "horario": "Segunda a Sexta: 9h às 16h"
    },
    "timestamp": "2024-12-20T10:30:00Z"
}
```

---

### 7. 👩‍💼 Contato com Especialista

Solicita contato com um agente especializado.

**Endpoint:** `POST /api/agente/contato`

**Request Body:**
```json
{
    "sessionId": "cliente_12345_1671234567890",
    "motivo": "Renegociação de dívida",
    "preferencia_contato": "whatsapp"
}
```

**Response:**
```json
{
    "type": "contact_agent",
    "message": "Especialista disponível para atendimento:",
    "data": {
        "agent_name": "Maria Silva",
        "agent_id": "ESP001",
        "available": true,
        "phone": "(11) 9999-8888",
        "email": "maria.silva@bradesco.com.br",
        "whatsapp": "(11) 9999-8888",
        "estimated_wait": "5 minutos"
    },
    "timestamp": "2024-12-20T10:30:00Z"
}
```

---

## 🚨 Tratamento de Erros

### Códigos de Status HTTP

| Código | Significado | Descrição |
|--------|-------------|-----------|
| 200 | OK | Requisição bem-sucedida |
| 400 | Bad Request | Dados inválidos na requisição |
| 401 | Unauthorized | Sessão expirada ou inválida |
| 404 | Not Found | Recurso não encontrado |
| 500 | Internal Server Error | Erro interno do servidor |
| 503 | Service Unavailable | Serviço temporariamente indisponível |

### Formato de Erro Padrão

```json
{
    "success": false,
    "error": {
        "code": "INVALID_SESSION",
        "message": "Sessão expirada ou inválida",
        "details": "Por favor, faça login novamente",
        "timestamp": "2024-12-20T10:30:00Z"
    }
}
```

### Tipos de Erro Comuns

#### 1. Sessão Inválida
```json
{
    "success": false,
    "error": {
        "code": "INVALID_SESSION",
        "message": "Sessão expirada ou inválida"
    }
}
```

#### 2. Cliente Não Encontrado
```json
{
    "success": false,
    "error": {
        "code": "CLIENT_NOT_FOUND",
        "message": "Cliente não encontrado no sistema"
    }
}
```

#### 3. Erro de Banco de Dados
```json
{
    "success": false,
    "error": {
        "code": "DATABASE_ERROR",
        "message": "Erro ao consultar dados do cliente"
    }
}
```

---

## 🔧 Configurações CORS

### Headers Permitidos

A API está configurada com os seguintes headers CORS:

```http
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type, Session-Id, Authorization
Access-Control-Max-Age: 86400
```

### Preflight Requests

Para requisições complexas, o navegador fará uma requisição OPTIONS automaticamente:

```http
OPTIONS /api/chatbot HTTP/1.1
Origin: http://localhost:3000
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Content-Type, Session-Id
```

---

## 📈 Rate Limiting

### Limites por Endpoint

| Endpoint | Limite | Janela |
|----------|--------|--------|
| `/api/auth` | 5 tentativas | 15 minutos |
| `/api/chatbot` | 60 mensagens | 1 minuto |
| Outros endpoints | 100 requisições | 1 minuto |

### Headers de Rate Limiting

```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1671234567
```

---

## 🧪 Exemplos de Uso

### JavaScript/Fetch

```javascript
// Autenticação
const authResponse = await fetch('http://localhost:8080/api/auth', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        identificador: '12345'
    })
});

const authData = await authResponse.json();
const sessionId = authData.sessionId;

// Chat
const chatResponse = await fetch('http://localhost:8080/api/chatbot', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Session-Id': sessionId
    },
    body: JSON.stringify({
        message: 'Quero ver detalhes do meu empréstimo',
        sessionId: sessionId
    })
});

const chatData = await chatResponse.json();
console.log(chatData.message);
```

### cURL

```bash
# Autenticação
curl -X POST http://localhost:8080/api/auth \
  -H "Content-Type: application/json" \
  -d '{"identificador":"12345"}'

# Detalhes do empréstimo
curl -X GET "http://localhost:8080/api/emprestimo/detalhes?sessionId=cliente_12345_1671234567890" \
  -H "Content-Type: application/json"
```

### Python Requests

```python
import requests

# Autenticação
auth_response = requests.post(
    'http://localhost:8080/api/auth',
    json={'identificador': '12345'}
)
session_id = auth_response.json()['sessionId']

# Chat
chat_response = requests.post(
    'http://localhost:8080/api/chatbot',
    json={
        'message': 'Status do empréstimo',
        'sessionId': session_id
    },
    headers={'Session-Id': session_id}
)
print(chat_response.json()['message'])
```

---

## 🔒 Segurança

### Validação de Entrada

Todos os endpoints validam:
- Formato JSON válido
- Campos obrigatórios presentes
- Tipos de dados corretos
- Tamanho máximo de strings

### Proteção contra Ataques

- **SQL Injection**: Uso de PreparedStatement
- **XSS**: Escape de caracteres especiais
- **CSRF**: Tokens de sessão únicos
- **DoS**: Rate limiting implementado

### Logs de Segurança

Todos os acessos são registrados:
```
2024-12-20 10:30:00 - AUTH SUCCESS - Cliente: 12345 - IP: 192.168.1.100
2024-12-20 10:31:00 - CHAT REQUEST - Session: cliente_12345_... - Message: status empréstimo
2024-12-20 10:32:00 - AUTH FAILED - Tentativa: 67890 - IP: 192.168.1.101
```

---

## 📊 Monitoramento

### Métricas Coletadas

- Latência média por endpoint
- Taxa de erro por tipo
- Número de sessões ativas
- Uso de CPU e memória
- Conexões de banco de dados

### Health Check Detalhado

```json
{
    "status": "healthy",
    "components": {
        "database": {
            "status": "healthy",
            "connection_pool": "8/20",
            "response_time": "12ms"
        },
        "gemini_ai": {
            "status": "healthy",
            "api_quota": "450/1000",
            "response_time": "890ms"
        },
        "memory": {
            "status": "healthy",
            "used": "256MB",
            "max": "512MB"
        }
    },
    "timestamp": "2024-12-20T10:30:00Z"
}
```

---

## 🚀 Performance

### Tempos de Resposta Esperados

| Endpoint | Tempo Médio | Timeout |
|----------|-------------|---------|
| `/api/health` | < 10ms | 5s |
| `/api/auth` | < 100ms | 10s |
| `/api/chatbot` | < 2s | 30s |
| Consultas BD | < 50ms | 5s |

### Otimizações Implementadas

- Pool de conexões de banco
- Cache de sessões em memória
- Compressão gzip nas respostas
- Índices otimizados no banco
- Queries preparadas e reutilizáveis

---

Essa API está pronta para integração com qualquer frontend moderno e suporta todas as funcionalidades essenciais do ChatBot Bradesco. 🚀 
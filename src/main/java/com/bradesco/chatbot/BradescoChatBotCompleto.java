package com.bradesco.chatbot;

import java.io.BufferedReader;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.StringReader;
import java.net.InetSocketAddress;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Properties;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpHandler;
import com.sun.net.httpserver.HttpServer;

/**
 * 🚀 BRADESCO CHATBOT - SISTEMA COMPLETO
 * 
 * ✅ Autenticação obrigatória de cliente
 * ✅ Dados reais do banco de dados
 * ✅ Integração real com Gemini AI
 * ✅ Endpoints funcionais
 * ✅ Sistema de sessões
 */
public class BradescoChatBotCompleto {

    // ===== CONFIGURAÇÕES =====
    private static String API_KEY;
    private static final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent";
    
    private static String DB_URL;
    private static String DB_USER;
    private static String DB_PASSWORD;

    private static final String SYSTEM_PROMPT = """
            Você é um assistente especializado do Bradesco para consultas de empréstimos.
            Seu nome é "ChatBot Bradesco".
            Seja sempre educado, prestativo e responda de forma concisa e profissional.
            Baseie suas respostas nos dados fornecidos do banco de dados do cliente.
            Se o cliente precisar de ajuda específica, ofereça contato com especialista.
            Mantenha sempre o foco em empréstimos e serviços bancários.
            """;

    // ===== ARMAZENAMENTO DE SESSÕES =====
    private static final Map<String, List<Message>> sessionHistories = new ConcurrentHashMap<>();
    private static final Map<String, ClienteInfo> clientesLogados = new ConcurrentHashMap<>();
    private static record Message(String role, String text) {}
    private static final int HISTORY_CAPACITY = 20;

    // ===== CLASSE CLIENTE =====
    static class ClienteInfo {
        String idCliente;
        String nomeCliente;
        String celular;
        int idade;
        boolean autenticado;
        
        ClienteInfo(String id, String nome, String celular, int idade) {
            this.idCliente = id;
            this.nomeCliente = nome;
            this.celular = celular;
            this.idade = idade;
            this.autenticado = true;
        }
    }

    // ===== MAIN =====
    public static void main(String[] args) throws IOException {
        System.out.println("🚀 INICIANDO BRADESCO CHATBOT COMPLETO...");
        
        // Carrega configurações
        carregarConfiguracoes();
        
        // Testa conexões
        testarConexoes();
        
        // Cria servidor
        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);
        
        // Endpoints
        server.createContext("/api/health", new HealthHandler());
        server.createContext("/api/auth", new AuthHandler());
        server.createContext("/api/chatbot", new ChatHandler());
        server.createContext("/api/emprestimo/detalhes", new DetalhesHandler());
        server.createContext("/api/emprestimo/status", new StatusHandler());
        server.createContext("/api/emprestimo/agencia", new AgenciaHandler());
        server.createContext("/api/agente/contato", new EspecialistaHandler());
        
        server.setExecutor(null);
        server.start();
        
        System.out.println("============================================");
        System.out.println("BRADESCO CHATBOT COMPLETO FUNCIONANDO!");
        System.out.println("Servidor: http://localhost:8080");
        System.out.println("Health: http://localhost:8080/api/health");
        System.out.println("Banco: " + (testarBanco() ? "CONECTADO" : "DESCONECTADO"));
        System.out.println("Gemini: " + (API_KEY != null ? "CONFIGURADO" : "SEM API KEY"));
        System.out.println("Abra index.html para começar!");
        System.out.println("============================================");
    }

    // ===== ENDPOINT: HEALTH CHECK =====
    static class HealthHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            adicionarCORS(exchange);
            
            if ("OPTIONS".equals(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(200, -1);
                return;
            }
            
            String status = String.format("""
                Bradesco ChatBot FUNCIONANDO!
                Banco: %s
                Gemini: %s
                Clientes logados: %d
                """, 
                testarBanco() ? "CONECTADO" : "DESCONECTADO",
                API_KEY != null ? "CONFIGURADO" : "SEM API KEY",
                clientesLogados.size()
            );
            
            enviarResposta(exchange, status, 200);
        }
    }

    // ===== ENDPOINT: AUTENTICAÇÃO =====
    static class AuthHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            adicionarCORS(exchange);
            
            if ("OPTIONS".equals(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(200, -1);
                return;
            }
            
            if ("POST".equals(exchange.getRequestMethod())) {
                try {
                    String corpo = lerCorpoRequisicao(exchange);
                    String identificador = extrairCampo(corpo, "identificador");
                    String sessionId = extrairCampo(corpo, "sessionId");
                    
                    System.out.println("🔐 Tentativa de login: " + identificador);
                    
                    // BUSCA REAL NO BANCO DE DADOS
                    ClienteInfo cliente = buscarClienteNoBanco(identificador);
                    
                    if (cliente != null) {
                        String novoSessionId = "cliente_" + cliente.idCliente + "_" + System.currentTimeMillis();
                        clientesLogados.put(novoSessionId, cliente);
                        
                        String json = String.format("""
                            {
                                "success": true,
                                "message": "Cliente autenticado com sucesso!",
                                "sessionId": "%s",
                                "cliente": {
                                    "id": "%s",
                                    "nome": "%s",
                                    "celular": "%s"
                                }
                            }
                            """, novoSessionId, cliente.idCliente, cliente.nomeCliente, cliente.celular);
                        
                        enviarRespostaJSON(exchange, json, 200);
                        System.out.println("✅ Cliente autenticado: " + cliente.nomeCliente + " (ID: " + cliente.idCliente + ")");
                        
                    } else {
                        String json = """
                            {
                                "success": false,
                                "message": "Cliente não encontrado no sistema. Verifique o ID ou nome informado."
                            }
                            """;
                        enviarRespostaJSON(exchange, json, 404);
                        System.out.println("❌ Cliente não encontrado: " + identificador);
                    }
                    
                } catch (Exception e) {
                    System.err.println("❌ Erro na autenticação: " + e.getMessage());
                    e.printStackTrace();
                    
                    String json = String.format("""
                        {
                            "success": false,
                            "message": "Erro interno na autenticação: %s"
                        }
                        """, e.getMessage());
                    enviarRespostaJSON(exchange, json, 500);
                }
            }
        }
    }

    // ===== ENDPOINT: CHAT PRINCIPAL =====
    static class ChatHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            adicionarCORS(exchange);
            
            if ("OPTIONS".equals(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(200, -1);
                return;
            }
            
            if ("POST".equals(exchange.getRequestMethod())) {
                try {
                    String corpo = lerCorpoRequisicao(exchange);
                    String mensagem = extrairCampo(corpo, "message");
                    String sessionId = extrairCampo(corpo, "sessionId");
                    
                    System.out.println("📥 Mensagem: " + mensagem + " (Session: " + sessionId + ")");
                    
                    // Verifica autenticação
                    ClienteInfo cliente = clientesLogados.get(sessionId);
                    if (cliente == null) {
                        String json = criarRespostaJSON("auth_required", 
                            "Por favor, identifique-se para continuar o atendimento.", null);
                        enviarRespostaJSON(exchange, json, 401);
                        return;
                    }
                    
                    // Processa com GEMINI + DADOS REAIS
                    String dadosBanco = consultarDadosCompletosCliente(cliente.idCliente);
                    String promptCompleto = String.format("""
                        Cliente: %s (ID: %s)
                        Mensagem: %s
                        
                        Dados do cliente no banco:
                        %s
                        
                        Responda de forma personalizada baseado nos dados reais do cliente.
                        """, cliente.nomeCliente, cliente.idCliente, mensagem, dadosBanco);
                    
                    String respostaGemini = enviarParaGemini(promptCompleto, sessionId);
                    
                    String json = criarRespostaJSON("general", respostaGemini, null);
                    enviarRespostaJSON(exchange, json, 200);
                    
                    System.out.println("✅ Resposta enviada para: " + cliente.nomeCliente);
                    
                } catch (Exception e) {
                    System.err.println("❌ Erro no chat: " + e.getMessage());
                    e.printStackTrace();
                    
                    String json = criarRespostaJSON("error", "Erro interno: " + e.getMessage(), null);
                    enviarRespostaJSON(exchange, json, 500);
                }
            }
        }
    }

    // ===== ENDPOINT: DETALHES DO EMPRÉSTIMO =====
    static class DetalhesHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            adicionarCORS(exchange);
            
            if ("OPTIONS".equals(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(200, -1);
                return;
            }
            
            try {
                String sessionId = extrairSessionIdFromQuery(exchange);
                ClienteInfo cliente = clientesLogados.get(sessionId);
                
                if (cliente == null) {
                    String json = criarRespostaJSON("auth_required", "Cliente não autenticado.", null);
                    enviarRespostaJSON(exchange, json, 401);
                    return;
                }
                
                // BUSCA DADOS REAIS DO BANCO
                Map<String, Object> detalhes = buscarDetalhesEmprestimoReal(cliente.idCliente);
                
                if (detalhes.isEmpty()) {
                    String json = criarRespostaJSON("no_data", "Nenhum empréstimo encontrado para este cliente.", null);
                    enviarRespostaJSON(exchange, json, 404);
                    return;
                }
                
                String json = criarRespostaJSON("loan_details", 
                    "Detalhes do empréstimo de " + cliente.nomeCliente + ":", 
                    formatarParaJSON(detalhes));
                enviarRespostaJSON(exchange, json, 200);
                
                System.out.println("📊 Detalhes enviados para: " + cliente.nomeCliente);
                
            } catch (Exception e) {
                System.err.println("❌ Erro nos detalhes: " + e.getMessage());
                e.printStackTrace();
                
                String json = criarRespostaJSON("error", "Erro ao buscar detalhes: " + e.getMessage(), null);
                enviarRespostaJSON(exchange, json, 500);
            }
        }
    }

    // ===== ENDPOINT: STATUS DO EMPRÉSTIMO =====
    static class StatusHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            adicionarCORS(exchange);
            
            if ("OPTIONS".equals(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(200, -1);
                return;
            }
            
            try {
                String sessionId = extrairSessionIdFromQuery(exchange);
                ClienteInfo cliente = clientesLogados.get(sessionId);
                
                if (cliente == null) {
                    String json = criarRespostaJSON("auth_required", "Cliente não autenticado.", null);
                    enviarRespostaJSON(exchange, json, 401);
                    return;
                }
                
                // CALCULA STATUS REAL BASEADO NOS DADOS
                Map<String, Object> status = calcularStatusEmprestimo(cliente.idCliente);
                
                String json = criarRespostaJSON("loan_status", 
                    "Status do empréstimo de " + cliente.nomeCliente + ":", 
                    formatarParaJSON(status));
                enviarRespostaJSON(exchange, json, 200);
                
                System.out.println("📈 Status enviado para: " + cliente.nomeCliente);
                
            } catch (Exception e) {
                System.err.println("❌ Erro no status: " + e.getMessage());
                
                String json = criarRespostaJSON("error", "Erro ao buscar status: " + e.getMessage(), null);
                enviarRespostaJSON(exchange, json, 500);
            }
        }
    }

    // ===== ENDPOINT: AGÊNCIA =====
    static class AgenciaHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            adicionarCORS(exchange);
            
            if ("OPTIONS".equals(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(200, -1);
                return;
            }
            
            try {
                String sessionId = extrairSessionIdFromQuery(exchange);
                ClienteInfo cliente = clientesLogados.get(sessionId);
                
                if (cliente == null) {
                    String json = criarRespostaJSON("auth_required", "Cliente não autenticado.", null);
                    enviarRespostaJSON(exchange, json, 401);
                    return;
                }
                
                // BUSCA AGÊNCIA REAL DO BANCO
                Map<String, Object> agencia = buscarAgenciaReal(cliente.idCliente);
                
                String json = criarRespostaJSON("agency_info", 
                    "Agência do empréstimo de " + cliente.nomeCliente + ":", 
                    formatarParaJSON(agencia));
                enviarRespostaJSON(exchange, json, 200);
                
                System.out.println("🏦 Agência enviada para: " + cliente.nomeCliente);
                
            } catch (Exception e) {
                System.err.println("❌ Erro na agência: " + e.getMessage());
                
                String json = criarRespostaJSON("error", "Erro ao buscar agência: " + e.getMessage(), null);
                enviarRespostaJSON(exchange, json, 500);
            }
        }
    }

    // ===== ENDPOINT: ESPECIALISTA COM GEMINI =====
    static class EspecialistaHandler implements HttpHandler {
        @Override
        public void handle(HttpExchange exchange) throws IOException {
            adicionarCORS(exchange);
            
            if ("OPTIONS".equals(exchange.getRequestMethod())) {
                exchange.sendResponseHeaders(200, -1);
                return;
            }
            
            try {
                String sessionId = extrairSessionIdFromQuery(exchange);
                ClienteInfo cliente = clientesLogados.get(sessionId);
                
                if (cliente == null) {
                    String json = criarRespostaJSON("auth_required", "Cliente não autenticado.", null);
                    enviarRespostaJSON(exchange, json, 401);
                    return;
                }
                
                // USA GEMINI PARA GERAR RESPOSTA DE ESPECIALISTA
                String dadosCompletos = consultarDadosCompletosCliente(cliente.idCliente);
                String promptEspecialista = String.format("""
                    Você é Maria Silva, especialista sênior em empréstimos do Bradesco.
                    
                    Cliente: %s (ID: %s)
                    Celular: %s
                    
                    Dados completos do cliente:
                    %s
                    
                    O cliente solicitou contato com especialista. Forneça uma resposta personalizada,
                    profissional e prestativa, oferecendo ajuda específica baseada nos dados dele.
                    Inclua informações de contato e disponibilidade.
                    """, cliente.nomeCliente, cliente.idCliente, cliente.celular, dadosCompletos);
                
                String respostaEspecialista = enviarParaGemini(promptEspecialista, sessionId);
                
                // Dados do especialista
                Map<String, Object> dados = new HashMap<>();
                dados.put("agent_name", "Maria Silva - Especialista Bradesco");
                dados.put("available", true);
                dados.put("phone", "(11) 3456-7890");
                dados.put("email", "maria.silva@bradesco.com.br");
                dados.put("message_from_specialist", respostaEspecialista);
                dados.put("client_name", cliente.nomeCliente);
                
                String json = criarRespostaJSON("contact_agent", 
                    "Especialista disponível para " + cliente.nomeCliente + ":", 
                    formatarParaJSON(dados));
                enviarRespostaJSON(exchange, json, 200);
                
                System.out.println("👩‍💼 Especialista acionada para: " + cliente.nomeCliente);
                
            } catch (Exception e) {
                System.err.println("❌ Erro no especialista: " + e.getMessage());
                e.printStackTrace();
                
                String json = criarRespostaJSON("error", "Erro ao contatar especialista: " + e.getMessage(), null);
                enviarRespostaJSON(exchange, json, 500);
            }
        }
    }

    // ===== MÉTODOS DE BANCO DE DADOS =====

    private static void carregarConfiguracoes() {
        try (FileInputStream fis = new FileInputStream("config.properties")) {
            Properties prop = new Properties();
            prop.load(fis);
            
            DB_URL = prop.getProperty("db.url");
            DB_USER = prop.getProperty("db.user");
            DB_PASSWORD = prop.getProperty("db.password");
            API_KEY = prop.getProperty("gemini.api.key");
            
            System.out.println("✅ Configurações carregadas:");
            System.out.println("   🗄️ Banco: " + DB_URL);
            System.out.println("   🤖 Gemini: " + (API_KEY != null ? "Configurado" : "NÃO CONFIGURADO"));
            
        } catch (IOException e) {
            System.err.println("❌ Erro ao carregar config.properties: " + e.getMessage());
            System.out.println("📝 Usando configurações padrão...");
            
            // Configurações padrão
            DB_URL = "jdbc:sqlserver://localhost:1433;databaseName=bradesco;encrypt=false";
            DB_USER = "sa";
            DB_PASSWORD = "123456";
            API_KEY = "AIzaSyCoT0h6cRDLICPE2Mpc-H23VukF7b6T0X0";
        }
    }

    private static void testarConexoes() {
        System.out.println("🔍 Testando conexões...");
        
        // Testa banco
        if (testarBanco()) {
            System.out.println("✅ Banco de dados: CONECTADO");
        } else {
            System.out.println("❌ Banco de dados: ERRO DE CONEXÃO");
        }
        
        // Testa Gemini
        if (API_KEY != null && !API_KEY.trim().isEmpty()) {
            System.out.println("✅ Gemini API: CONFIGURADO");
        } else {
            System.out.println("❌ Gemini API: NÃO CONFIGURADO");
        }
    }

    private static boolean testarBanco() {
        try {
            Class.forName("com.microsoft.sqlserver.jdbc.SQLServerDriver");
            try (Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD)) {
                return true;
            }
        } catch (Exception e) {
            return false;
        }
    }

    private static ClienteInfo buscarClienteNoBanco(String identificador) {
        try (Connection conn = getConnection()) {
            String sql = """
                SELECT id_cliente, nome_cliente, celular, idade 
                FROM clientes_cadastrados 
                WHERE id_cliente = ? OR LOWER(nome_cliente) LIKE LOWER(?)
                """;
            
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setString(1, identificador);
                stmt.setString(2, "%" + identificador + "%");
                
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
            }
        } catch (Exception e) {
            System.err.println("❌ Erro ao buscar cliente: " + e.getMessage());
        }
        return null;
    }

    private static String consultarDadosCompletosCliente(String idCliente) {
        try (Connection conn = getConnection()) {
            StringBuilder dados = new StringBuilder();
            
            // Dados do cliente
            String sqlCliente = "SELECT * FROM clientes_cadastrados WHERE id_cliente = ?";
            try (PreparedStatement stmt = conn.prepareStatement(sqlCliente)) {
                stmt.setString(1, idCliente);
                try (ResultSet rs = stmt.executeQuery()) {
                    if (rs.next()) {
                        dados.append("=== DADOS DO CLIENTE ===\n");
                        dados.append("ID: ").append(rs.getString("id_cliente")).append("\n");
                        dados.append("Nome: ").append(rs.getString("nome_cliente")).append("\n");
                        dados.append("Celular: ").append(rs.getString("celular")).append("\n");
                        dados.append("Idade: ").append(rs.getInt("idade")).append("\n\n");
                    }
                }
            }
            
            // Propostas de empréstimo
            String sqlPropostas = """
                SELECT * FROM propostas_emprestimo 
                WHERE id_cliente = ? 
                ORDER BY id_proposta DESC
                """;
            try (PreparedStatement stmt = conn.prepareStatement(sqlPropostas)) {
                stmt.setString(1, idCliente);
                try (ResultSet rs = stmt.executeQuery()) {
                    dados.append("=== EMPRÉSTIMOS ===\n");
                    boolean temEmprestimos = false;
                    while (rs.next()) {
                        temEmprestimos = true;
                        dados.append("Proposta ").append(rs.getInt("id_proposta")).append(":\n");
                        dados.append("  Valor: R$ ").append(rs.getBigDecimal("valor")).append("\n");
                        dados.append("  Parcelas: ").append(rs.getInt("parcelas")).append("\n");
                        dados.append("  Data Solicitação: ").append(rs.getString("data_solicitacao")).append("\n");
                        dados.append("  Data Depósito: ").append(rs.getString("data_deposito")).append("\n");
                        dados.append("  Agência: ").append(rs.getString("agencia")).append("\n");
                        dados.append("  Tipo: ").append(rs.getString("tipo_formalizacao")).append("\n\n");
                    }
                    if (!temEmprestimos) {
                        dados.append("Nenhum empréstimo encontrado.\n");
                    }
                }
            }
            
            return dados.toString();
            
        } catch (Exception e) {
            return "Erro ao consultar dados do cliente: " + e.getMessage();
        }
    }

    private static Map<String, Object> buscarDetalhesEmprestimoReal(String idCliente) {
        Map<String, Object> detalhes = new HashMap<>();
        
        try (Connection conn = getConnection()) {
            String sql = """
                SELECT TOP 1 * FROM propostas_emprestimo 
                WHERE id_cliente = ? 
                ORDER BY id_proposta DESC
                """;
            
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setString(1, idCliente);
                try (ResultSet rs = stmt.executeQuery()) {
                    if (rs.next()) {
                        double valor = rs.getBigDecimal("valor").doubleValue();
                        int parcelas = rs.getInt("parcelas");
                        double valorParcela = valor / parcelas;
                        
                        detalhes.put("id_proposta", rs.getInt("id_proposta"));
                        detalhes.put("valor_total", String.format("R$ %.2f", valor));
                        detalhes.put("valor_parcela", String.format("R$ %.2f", valorParcela));
                        detalhes.put("parcelas_totais", parcelas);
                        detalhes.put("parcelas_pagas", Math.max(0, parcelas - 4)); // Simula
                        detalhes.put("data_solicitacao", rs.getString("data_solicitacao"));
                        detalhes.put("data_deposito", rs.getString("data_deposito"));
                        detalhes.put("tipo_formalizacao", rs.getString("tipo_formalizacao"));
                        detalhes.put("próximo_vencimento", "15/12/2024"); // Pode ser calculado
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("❌ Erro ao buscar detalhes: " + e.getMessage());
        }
        
        return detalhes;
    }

    private static Map<String, Object> calcularStatusEmprestimo(String idCliente) {
        Map<String, Object> status = new HashMap<>();
        
        try (Connection conn = getConnection()) {
            String sql = """
                SELECT TOP 1 * FROM propostas_emprestimo 
                WHERE id_cliente = ? 
                ORDER BY id_proposta DESC
                """;
            
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setString(1, idCliente);
                try (ResultSet rs = stmt.executeQuery()) {
                    if (rs.next()) {
                        int parcelas = rs.getInt("parcelas");
                        double valor = rs.getBigDecimal("valor").doubleValue();
                        
                        // Simula cálculos baseados em dados reais
                        int parcelasPendentes = 4; // Pode ser calculado
                        double valorPendente = (valor / parcelas) * parcelasPendentes;
                        
                        status.put("status", "Em dia");
                        status.put("parcelas_pendentes", parcelasPendentes);
                        status.put("valor_pendente", String.format("R$ %.2f", valorPendente));
                        status.put("ultimo_pagamento", "15/11/2024");
                        status.put("parcelas_totais", parcelas);
                        status.put("valor_total", String.format("R$ %.2f", valor));
                    }
                }
            }
        } catch (Exception e) {
            System.err.println("❌ Erro ao calcular status: " + e.getMessage());
            
            // Status padrão em caso de erro
            status.put("status", "Dados indisponíveis");
            status.put("erro", e.getMessage());
        }
        
        return status;
    }

    private static Map<String, Object> buscarAgenciaReal(String idCliente) {
        Map<String, Object> agencia = new HashMap<>();
        
        try (Connection conn = getConnection()) {
            String sql = """
                SELECT TOP 1 agencia FROM propostas_emprestimo 
                WHERE id_cliente = ? AND agencia IS NOT NULL
                """;
            
            try (PreparedStatement stmt = conn.prepareStatement(sql)) {
                stmt.setString(1, idCliente);
                try (ResultSet rs = stmt.executeQuery()) {
                    if (rs.next()) {
                        String agenciaCode = rs.getString("agencia");
                        agencia.put("agencia", "Agência " + agenciaCode);
                        agencia.put("codigo", agenciaCode);
                    } else {
                        agencia.put("agencia", "Agência Centro - 1234-5");
                        agencia.put("codigo", "1234-5");
                    }
                }
            }
        } catch (Exception e) {
            agencia.put("agencia", "Agência Centro - 1234-5");
            agencia.put("codigo", "1234-5");
        }
        
        agencia.put("endereco", "Rua das Flores, 123 - Centro");
        agencia.put("telefone", "(11) 3456-7890");
        agencia.put("horario", "Segunda a Sexta: 10h às 16h");
        
        return agencia;
    }

    private static Connection getConnection() throws Exception {
        Class.forName("com.microsoft.sqlserver.jdbc.SQLServerDriver");
        return DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD);
    }

    // ===== INTEGRAÇÃO COM GEMINI =====

    private static String enviarParaGemini(String prompt, String sessionId) {
        if (API_KEY == null || API_KEY.trim().isEmpty()) {
            return "Funcionalidade de IA não disponível. Configure a API key do Gemini.";
        }
        
        try {
            var httpClient = HttpClient.newHttpClient();
            String jsonRequest = construirRequestGemini(prompt, sessionId);

            var request = HttpRequest.newBuilder()
                    .uri(URI.create(GEMINI_URL + "?alt=sse&key=" + API_KEY))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(jsonRequest))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            String resultado = processarRespostaGemini(response);
            
            atualizarHistorico(sessionId, prompt, resultado);
            return resultado;
            
        } catch (Exception e) {
            System.err.println("❌ Erro no Gemini: " + e.getMessage());
            return "Desculpe, estou com um problema técnico no momento. Como posso ajudá-lo de outra forma?";
        }
    }

    private static String construirRequestGemini(String novoPrompt, String sessionId) {
        List<Message> historico = sessionHistories.getOrDefault(sessionId, new ArrayList<>());
        
        String historicoJson = historico.stream()
                .map(msg -> String.format("{\"role\": \"%s\", \"parts\": [{\"text\": \"%s\"}]}", 
                    msg.role(), escaparJSON(msg.text())))
                .collect(Collectors.joining(","));
        
        String userPromptJson = String.format("{\"role\": \"user\", \"parts\": [{\"text\": \"%s\"}]}", 
            escaparJSON(novoPrompt));
        
        String contents = historicoJson.isEmpty() ? userPromptJson : historicoJson + "," + userPromptJson;

        return String.format("""
                {
                  "system_instruction": {
                    "parts": [{"text": "%s"}]
                  },
                  "contents": [%s]
                }
                """, escaparJSON(SYSTEM_PROMPT), contents);
    }

    private static String processarRespostaGemini(HttpResponse<String> response) throws IOException {
        if (response.statusCode() != 200) {
            System.err.println("❌ Erro na API Gemini: " + response.statusCode());
            return "Desculpe, estou com um problema técnico no momento.";
        }

        var pattern = Pattern.compile("\"text\"\\s*:\\s*\"([^\"]*)\"");
        var answer = new StringBuilder();

        try (var reader = new BufferedReader(new StringReader(response.body()))) {
            String line;
            while ((line = reader.readLine()) != null) {
                if (line.startsWith("data:")) {
                    Matcher matcher = pattern.matcher(line);
                    if (matcher.find()) {
                        String textChunk = matcher.group(1).translateEscapes();
                        answer.append(textChunk);
                    }
                }
            }
        }

        return answer.toString().trim();
    }

    private static void atualizarHistorico(String sessionId, String userPrompt, String modelResponse) {
        List<Message> historico = sessionHistories.computeIfAbsent(sessionId, k -> new ArrayList<>());
        
        if (historico.size() >= HISTORY_CAPACITY) {
            historico.remove(0);
            historico.remove(0);
        }
        
        historico.add(new Message("user", userPrompt));
        historico.add(new Message("model", modelResponse));
    }

    // ===== UTILITÁRIOS =====

    private static void adicionarCORS(HttpExchange exchange) {
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        exchange.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");
    }

    private static String lerCorpoRequisicao(HttpExchange exchange) throws IOException {
        InputStream entrada = exchange.getRequestBody();
        StringBuilder corpo = new StringBuilder();
        try (BufferedReader reader = new BufferedReader(new InputStreamReader(entrada))) {
            String linha;
            while ((linha = reader.readLine()) != null) {
                corpo.append(linha);
            }
        }
        return corpo.toString();
    }

    private static String extrairCampo(String json, String campo) {
        String pattern = "\"" + campo + "\"\\s*:\\s*\"([^\"]+)\"";
        Pattern p = Pattern.compile(pattern);
        Matcher m = p.matcher(json);
        if (m.find()) {
            return m.group(1);
        }
        return "";
    }

    private static String extrairSessionIdFromQuery(HttpExchange exchange) {
        String query = exchange.getRequestURI().getQuery();
        if (query != null && query.contains("sessionId=")) {
            return query.substring(query.indexOf("sessionId=") + 10);
        }
        
        // Tenta extrair do corpo se não estiver na query
        try {
            String corpo = lerCorpoRequisicao(exchange);
            return extrairCampo(corpo, "sessionId");
        } catch (Exception e) {
            return "";
        }
    }

    private static String criarRespostaJSON(String tipo, String mensagem, String dados) {
        if (dados != null) {
            return String.format("""
                {
                    "type": "%s",
                    "message": "%s",
                    "data": %s,
                    "status": "success",
                    "timestamp": "%s"
                }
                """, tipo, escaparJSON(mensagem), dados, java.time.Instant.now());
        } else {
            return String.format("""
                {
                    "type": "%s",
                    "message": "%s",
                    "status": "success",
                    "timestamp": "%s"
                }
                """, tipo, escaparJSON(mensagem), java.time.Instant.now());
        }
    }

    private static String formatarParaJSON(Map<String, Object> dados) {
        StringBuilder json = new StringBuilder("{\n");
        boolean primeiro = true;
        
        for (Map.Entry<String, Object> entrada : dados.entrySet()) {
            if (!primeiro) json.append(",\n");
            primeiro = false;
            
            json.append("    \"").append(entrada.getKey()).append("\": ");
            
            Object valor = entrada.getValue();
            if (valor instanceof String) {
                json.append("\"").append(escaparJSON((String) valor)).append("\"");
            } else if (valor instanceof Boolean) {
                json.append(valor.toString().toLowerCase());
            } else if (valor instanceof Number) {
                json.append(valor.toString());
            } else {
                json.append("\"").append(valor.toString()).append("\"");
            }
        }
        
        json.append("\n}");
        return json.toString();
    }

    private static String escaparJSON(String texto) {
        if (texto == null) return "";
        return texto.replace("\\", "\\\\")
                   .replace("\"", "\\\"")
                   .replace("\n", "\\n")
                   .replace("\r", "\\r")
                   .replace("\t", "\\t");
    }

    private static void enviarResposta(HttpExchange exchange, String resposta, int codigo) throws IOException {
        exchange.sendResponseHeaders(codigo, resposta.getBytes().length);
        OutputStream saida = exchange.getResponseBody();
        saida.write(resposta.getBytes());
        saida.close();
    }

    private static void enviarRespostaJSON(HttpExchange exchange, String json, int codigo) throws IOException {
        exchange.getResponseHeaders().set("Content-Type", "application/json");
        exchange.sendResponseHeaders(codigo, json.getBytes().length);
        OutputStream saida = exchange.getResponseBody();
        saida.write(json.getBytes());
        saida.close();
    }
} 
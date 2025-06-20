/**
 * SISTEMA DE CHATBOT - BRADESCO EMPRÉSTIMOS
 * ========================================
 * 
 * Este arquivo contém toda a lógica do chatbot para consulta de empréstimos.
 * 
 * PRINCIPAIS FUNCIONALIDADES:
 * - Envio de mensagens via API REST
 * - Consultas específicas de empréstimo
 * - Interface interativa com opções rápidas
 * - Histórico de conversas
 * - Integração com backend Java
 */

// ====================================
// CONFIGURAÇÕES E CONSTANTES
// ====================================

const CONFIG = {
    // 🔗 PONTO DE INTEGRAÇÃO COM A API REST
    API_BASE_URL: 'http://localhost:8081', // URL do backend Java
    ENDPOINTS: {
        CHAT: '/chatbot',
        LOAN_DETAILS: '/emprestimo/detalhes',
        LOAN_STATUS: '/emprestimo/status',
        AGENCY_INFO: '/emprestimo/agencia',
        CONTACT_AGENT: '/agente/contato'
    },
    TYPING_DELAY: 2000,
    MESSAGE_ANIMATION_DELAY: 300
};

// ====================================
// CLASSE PRINCIPAL DO CHATBOT
// ====================================

class BradescoChatbot {
    constructor() {
        this.messageInput = document.getElementById('messageInput');
        this.sendButton = document.getElementById('sendButton');
        this.chatMessages = document.getElementById('chatMessages');
        this.quickOptions = document.getElementById('quickOptions');
        this.typingIndicator = document.getElementById('typingIndicator');
        this.loadingOverlay = document.getElementById('loadingOverlay');
        
        this.isTyping = false;
        this.messageCount = 0;
        this.clienteAutenticado = false;
        this.currentSessionId = this.generateSessionId();
        this.aguardandoAuth = false;
        this.modoEspecialista = false;
        this.emprestimoStatus = null;
        this.clienteInfo = null;
        
        this.init();
    }

    /**
     * Inicializa o chatbot
     */
    init() {
        this.setupEventListeners();
        this.setupQuickOptions();
        
        // ESCONDE BOTÕES INICIALMENTE
        this.quickOptions.style.display = 'none';
        
        // INICIA COM MENSAGEM DE AUTENTICAÇÃO ORGANIZADA
        this.addBotMessage('Olá! Bem-vindo ao atendimento Bradesco! 😊\n\nPara te atender melhor, preciso que você se identifique.\n\nPor favor, informe:\n• Seu ID de cliente OU\n• Seu nome completo\n\nDigite sua identificação abaixo:');
        this.aguardandoAuth = true;
        
        console.log('💬 Bradesco Chatbot inicializado com sucesso!');
    }

    /**
     * Configura os event listeners
     */
    setupEventListeners() {
        // Envio de mensagem por botão
        this.sendButton.addEventListener('click', () => this.handleSendMessage());
        
        // Envio de mensagem por Enter
        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSendMessage();
            }
        });

        // Auto-resize do input
        this.messageInput.addEventListener('input', () => {
            this.updateSendButtonState();
        });

        // Focus inicial
        this.messageInput.focus();
    }

    /**
     * Configura as opções rápidas
     */
    setupQuickOptions() {
        const optionButtons = document.querySelectorAll('.option-btn');
        optionButtons.forEach(button => {
            button.addEventListener('click', () => {
                const option = button.dataset.option;
                this.handleQuickOption(option);
            });
        });
    }

    /**
     * Atualiza o estado do botão de envio
     */
    updateSendButtonState() {
        const hasText = this.messageInput.value.trim().length > 0;
        this.sendButton.disabled = !hasText || this.isTyping;
        
        if (hasText && !this.isTyping) {
            this.sendButton.style.background = 'var(--bradesco-red)';
        } else {
            this.sendButton.style.background = 'var(--dark-gray)';
        }
    }

    /**
     * 📤 FUNÇÃO PRINCIPAL DE ENVIO DE MENSAGEM
     * Esta é a função responsável pela integração com a API
     */
    async handleSendMessage() {
        const message = this.messageInput.value.trim();
        
        if (!message || this.isTyping) return;

        // Adiciona mensagem do usuário
        this.addUserMessage(message);
        this.messageInput.value = '';
        this.updateSendButtonState();

        // Simula digitação do bot
        this.showTyping();

        try {
            // Se está aguardando autenticação, processa como identificação
            if (!this.clienteAutenticado) {
                await this.processarAutenticacao(message);
                return;
            }
            
            // Se está no modo especialista, envia para o endpoint do especialista
            if (this.modoEspecialista) {
                await this.enviarParaEspecialista(message);
                return;
            }
            
            // Verifica se o usuário quer falar com especialista
            if (message.toLowerCase().includes('especialista')) {
                this.addBotMessage('🎧 Conectando você com nossa especialista Maria Silva...');
                this.addBotMessage('Você pode fazer uma pergunta específica sobre empréstimos ou receber informações de contato. Digite sua dúvida:');
                this.modoEspecialista = true;
                this.messageInput.placeholder = 'Digite sua dúvida sobre empréstimos...';
                return;
            }
            
            // 🔗 CHAMADA PARA A API REST (só depois de autenticado)
            const response = await this.sendToAPI(message);
            
            // Processa resposta
            await this.processBotResponse(response);
            
        } catch (error) {
            console.error('❌ Erro na comunicação com a API:', error);
            this.addBotMessage('Desculpe, houve um problema na comunicação. Tente novamente em alguns instantes.');
        } finally {
            this.hideTyping();
        }
    }

    /**
     * 🔗 INTEGRAÇÃO COM API REST - CONEXÃO REAL COM SEU BACKEND JAVA
     * 
     * Esta função agora se conecta diretamente com sua API Java
     */
    async sendToAPI(message, endpoint = '/api/chatbot') {
        const url = `${CONFIG.API_BASE_URL}${endpoint}`;
        
        const requestBody = {
            message: message,
            sessionId: this.currentSessionId,
            timestamp: new Date().toISOString()
        };

        console.log('📡 Enviando para API Java:', url, requestBody);

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('✅ Resposta da API:', data);
            return data;
            
        } catch (error) {
            console.error('❌ Erro na API:', error);
            throw error; // Remove fallback de simulação
        }
    }

    // *** FUNÇÃO DE SIMULAÇÃO REMOVIDA - AGORA USA APENAS API REAL ***

    /**
     * Processa a resposta do bot
     */
    async processBotResponse(response) {
        await this.delay(CONFIG.MESSAGE_ANIMATION_DELAY);
        
        // Verifica se precisa de autenticação
        if (response.type === 'auth_required') {
            this.aguardandoAuth = true;
            this.addBotMessage(response.message);
            this.quickOptions.style.display = 'none'; // Esconde botões até autenticar
            return;
        }
        
        this.addBotMessage(response.message);
        
        // Adiciona informações específicas baseado no tipo
        if (response.data) {
            await this.delay(500);
            this.addBotDataMessage(response.type, response.data);
        }
    }

    /**
     * Processa autenticação do cliente
     */
    async processarAutenticacao(identificador) {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/api/auth`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    identificador: identificador,
                    sessionId: this.currentSessionId
                })
            });

            const data = await response.json();
            
            if (data.success) {
                this.clienteAutenticado = true;
                this.aguardandoAuth = false;
                this.currentSessionId = data.sessionId;
                
                // Armazena informações do cliente para controle dos botões
                this.clienteInfo = data.cliente;
                
                this.addBotMessage(`✅ ${data.message}`);
                this.addBotMessage(`Olá, ${data.cliente.nome}! Agora posso te ajudar com informações sobre seus empréstimos. Use as opções abaixo:`);
                
                // Verifica status do empréstimo para controlar visibilidade dos botões
                await this.verificarStatusEmprestimo();
                
                console.log('🎯 Cliente autenticado:', data.cliente);
            } else {
                this.addBotMessage(`❌ ${data.message}`);
                this.addBotMessage('Tente novamente informando seu ID de cliente ou nome completo:');
            }
            
        } catch (error) {
            console.error('❌ Erro na autenticação:', error);
            this.addBotMessage('Erro na autenticação. Tente novamente.');
        }
    }

    /**
     * Verifica status do empréstimo para controlar botões
     */
    async verificarStatusEmprestimo() {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/api/emprestimo/status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId: this.currentSessionId,
                    message: 'Verificação de status',
                    timestamp: new Date().toISOString()
                })
            });

            const data = await response.json();
            console.log('🔍 Resposta da verificação de status:', data);
            
            if (data.status === "success" && data.data) {
                const statusEmprestimo = data.data.status;
                this.emprestimoStatus = statusEmprestimo;
                
                console.log('📊 Status detectado:', statusEmprestimo);
                
                // Controla visibilidade dos botões baseado no status
                this.atualizarVisibilidadeBotoes(statusEmprestimo);
                
                // Mostra os botões após verificação
                this.quickOptions.style.display = 'block';
            } else {
                console.log('⚠️ Não foi possível verificar status, mostrando todos os botões');
                console.log('⚠️ Resposta recebida:', data);
                // Se não conseguir verificar, mostra todos os botões
                this.quickOptions.style.display = 'block';
            }
            
        } catch (error) {
            console.error('❌ Erro ao verificar status:', error);
            // Em caso de erro, mostra todos os botões
            this.quickOptions.style.display = 'block';
        }
    }

    /**
     * Atualiza visibilidade dos botões baseado no status do empréstimo
     */
    atualizarVisibilidadeBotoes(status) {
        console.log('🔧 Iniciando atualização de visibilidade dos botões...');
        console.log('📊 Status recebido para verificação:', status);
        
        // Aguarda um pouco para garantir que os botões foram renderizados
        setTimeout(() => {
            const detalhesBtn = document.querySelector('[data-option="detalhes"]');
            const allButtons = document.querySelectorAll('.option-btn');
            
            console.log('🔍 Total de botões encontrados:', allButtons.length);
            console.log('🔍 Botão detalhes encontrado:', detalhesBtn ? 'SIM' : 'NÃO');
            
            if (detalhesBtn) {
                // Verifica se é empréstimo pendente (case insensitive)
                const isPendente = status && (
                    status.toLowerCase() === 'pendente' || 
                    status.toUpperCase() === 'PENDENTE' ||
                    status.toLowerCase().includes('pendente')
                );
                
                console.log('🔍 É empréstimo pendente?', isPendente);
                
                if (isPendente) {
                    // Esconde botão "Detalhes" para empréstimos pendentes
                    detalhesBtn.style.display = 'none';
                    detalhesBtn.style.visibility = 'hidden';
                    detalhesBtn.disabled = true;
                    console.log('🔒 Botão "Detalhes" ESCONDIDO - Empréstimo pendente');
                } else {
                    // Mostra botão "Detalhes" para empréstimos ativos
                    detalhesBtn.style.display = 'inline-block';
                    detalhesBtn.style.visibility = 'visible';
                    detalhesBtn.disabled = false;
                    console.log('✅ Botão "Detalhes" VISÍVEL - Empréstimo ativo');
                }
            } else {
                console.log('❌ Botão "Detalhes" não encontrado no DOM');
                console.log('🔍 Botões disponíveis:', Array.from(allButtons).map(btn => btn.dataset.option));
            }
        }, 200); // Aumentei o timeout para 200ms
    }

    /**
     * Envia mensagem para o especialista
     */
    async enviarParaEspecialista(pergunta) {
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/api/agente/contato`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId: this.currentSessionId,
                    message: pergunta,
                    timestamp: new Date().toISOString()
                })
            });

            const data = await response.json();
            console.log('🔍 Resposta do especialista:', data);
            
            if (data.status === "success" && data.type === "contact_agent") {
                // Se há uma resposta do especialista, mostra ela
                if (data.data && data.data.message_from_specialist) {
                    this.addBotMessage(`👩‍💼 **Maria Silva - Especialista Bradesco:**`);
                    this.addBotMessage(data.data.message_from_specialist);
                } else {
                    await this.processBotResponse(data);
                }
                
                // Sai do modo especialista e restaura placeholder
                this.modoEspecialista = false;
                this.messageInput.placeholder = 'Digite sua mensagem...';
                
                // Adiciona opção de fazer outra pergunta
                await this.delay(1000);
                this.addBotMessage('Posso ajudar com mais alguma coisa? Use as opções abaixo ou digite "especialista" para fazer outra pergunta:');
                
            } else {
                console.error('❌ Erro na resposta do especialista:', data);
                this.addBotMessage('❌ Erro ao conectar com especialista. Tente novamente.');
                this.modoEspecialista = false;
                this.messageInput.placeholder = 'Digite sua mensagem...';
            }
            
        } catch (error) {
            console.error('❌ Erro ao enviar para especialista:', error);
            this.addBotMessage('❌ Erro na comunicação com especialista. Tente novamente.');
            this.modoEspecialista = false;
            this.messageInput.placeholder = 'Digite sua mensagem...';
        }
    }

    /**
     * Manipula opções rápidas
     */
    async handleQuickOption(option) {
        const optionTexts = {
            'agencia': 'Onde foi feito meu empréstimo?',
            'detalhes': 'Quais são os detalhes do meu empréstimo?',
            'status': 'Qual o status do meu empréstimo?',
            'agente': 'Quero falar com um especialista'
        };

        const message = optionTexts[option];
        
        // Tratamento especial para o especialista
        if (option === 'agente') {
            this.addUserMessage(message);
            this.addBotMessage('🎧 Conectando você com nossa especialista Bradesquinho...');
            this.addBotMessage('Você pode fazer uma pergunta específica sobre empréstimos ou receber informações de contato. Digite sua dúvida:');
            
            // Ativa modo especialista
            this.modoEspecialista = true;
            this.messageInput.placeholder = 'Digite sua dúvida sobre empréstimos...';
            return;
        }
        
        if (message) {
            this.addUserMessage(message);
            this.showTyping();

            try {
                let url = `${CONFIG.API_BASE_URL}/api`;
                
                // Define endpoint específico baseado na opção
                switch(option) {
                    case 'agencia': url += '/emprestimo/agencia'; break;
                    case 'detalhes': url += '/emprestimo/detalhes'; break;
                    case 'status': url += '/emprestimo/status'; break;
                    default: url += '/chatbot'; break;
                }

                // Para botões, fazemos POST com sessionId no body
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        sessionId: this.currentSessionId,
                        message: message,
                        timestamp: new Date().toISOString()
                    })
                });

                const data = await response.json();
                await this.processBotResponse(data);
                
            } catch (error) {
                console.error('❌ Erro ao processar opção rápida:', error);
                this.addBotMessage('Desculpe, houve um erro ao processar sua solicitação.');
            } finally {
                this.hideTyping();
            }
        }
    }

    /**
     * Adiciona mensagem do usuário
     */
    addUserMessage(text) {
        const messageElement = this.createMessageElement(text, 'user');
        this.chatMessages.appendChild(messageElement);
        this.scrollToBottom();
    }

    /**
     * Adiciona mensagem do bot
     */
    addBotMessage(text, messageType = '') {
        const messageElement = this.createMessageElement(text, 'bot', messageType);
        this.chatMessages.appendChild(messageElement);
        this.scrollToBottom();
    }

    /**
     * Adiciona mensagem com dados estruturados
     */
    addBotDataMessage(dataType, data) {
        let content = '';
        
        switch(dataType) {
            case 'agency_info':
                content = `
                    <div class="data-card">
                        <h4><i class="fas fa-building"></i> Informações da Agência</h4>
                        <p><strong>Agência:</strong> ${data.agencia}</p>
                        <p><strong>Endereço:</strong> ${data.endereco}</p>
                        <p><strong>Telefone:</strong> ${data.telefone}</p>
                    </div>
                `;
                break;
                
            case 'loan_details':
                content = `
                    <div class="data-card">
                        <h4><i class="fas fa-info-circle"></i> Detalhes do Empréstimo</h4>
                        <p><strong>Valor Total:</strong> ${data.valor_total}</p>
                        <p><strong>Valor da Parcela:</strong> ${data.valor_parcela}</p>
                        <p><strong>Parcelas:</strong> ${data.parcelas_pagas}/${data.parcelas_totais}</p>
                        <p><strong>Próximo Vencimento:</strong> ${data.próximo_vencimento}</p>
                    </div>
                `;
                break;
                
            case 'loan_status':
                            if (data.status && (data.status.toLowerCase() === 'pendente' || data.status.toUpperCase() === 'PENDENTE')) {
                // Layout específico para empréstimos pendentes
                    content = `
                        <div class="data-card">
                            <h4><i class="fas fa-clock"></i> Status do Empréstimo</h4>
                            <p><strong>Status:</strong> <span class="status-badge status-pendente">${data.status}</span></p>
                            <p><strong>Valor do Empréstimo:</strong> ${data.valor_solicitado || data.valor_total}</p>
                            <p><strong>Data de Solicitação:</strong> ${data.data_solicitacao}</p>
                            <p><strong>Tipo de Formalização:</strong> ${data.tipo_formalizacao || 'Não informado'}</p>
                            <p><strong>Situação:</strong> ${data.situacao || 'Em análise'}</p>
                            <p><strong>Previsão de Liberação:</strong> ${data.previsao_liberacao || '2-3 dias úteis'}</p>
                        </div>
                    `;
                } else {
                    // Layout para empréstimos ativos
                    content = `
                        <div class="data-card">
                            <h4><i class="fas fa-chart-line"></i> Status do Empréstimo</h4>
                            <p><strong>Status:</strong> <span class="status-badge status-${data.status.toLowerCase().replace(' ', '-')}">${data.status}</span></p>
                            <p><strong>Tipo de Formalização:</strong> ${data.tipo_formalizacao || 'Não informado'}</p>
                            <p><strong>Parcelas Pendentes:</strong> ${data.parcelas_pendentes}</p>
                            <p><strong>Valor Pendente:</strong> ${data.valor_pendente}</p>
                            <p><strong>Último Pagamento:</strong> ${data.ultimo_pagamento}</p>
                        </div>
                    `;
                }
                break;
                
            case 'contact_agent':
                content = `
                    <div class="data-card agent-card">
                        <h4><i class="fas fa-headset"></i> Especialista Disponível</h4>
                        <p><strong>Nome:</strong> ${data.agent_name}</p>
                        <p><strong>Status:</strong> <span class="agent-status ${data.available ? 'available' : 'busy'}">${data.available ? 'Disponível' : 'Ocupado'}</span></p>
                        <div class="contact-buttons">
                            <button onclick="window.location.href='tel:${data.phone}'" class="contact-btn">
                                <i class="fas fa-phone"></i> Ligar
                            </button>
                            <button onclick="window.location.href='mailto:${data.email}'" class="contact-btn">
                                <i class="fas fa-envelope"></i> E-mail
                            </button>
                        </div>
                    </div>
                `;
                break;
        }
        
        if (content) {
            const messageElement = document.createElement('div');
            messageElement.className = 'message bot-message data-message';
            messageElement.innerHTML = `
                <div class="message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                    ${content}
                    <span class="message-time">${this.getCurrentTime()}</span>
                </div>
            `;
            
            this.chatMessages.appendChild(messageElement);
            this.scrollToBottom();
        }
    }

    /**
     * Cria elemento de mensagem
     */
    createMessageElement(text, sender, messageType = '') {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}-message ${messageType}`;
        
        const avatar = sender === 'user' ? 
            '<i class="fas fa-user"></i>' : 
            '<i class="fas fa-robot"></i>';
        
        messageElement.innerHTML = `
            <div class="message-avatar">
                ${avatar}
            </div>
            <div class="message-content">
                <p>${text}</p>
                <span class="message-time">${this.getCurrentTime()}</span>
            </div>
        `;
        
        return messageElement;
    }

    /**
     * Mostra indicador de digitação
     */
    showTyping() {
        this.isTyping = true;
        this.typingIndicator.style.display = 'flex';
        this.updateSendButtonState();
        this.scrollToBottom();
    }

    /**
     * Esconde indicador de digitação
     */
    hideTyping() {
        this.isTyping = false;
        this.typingIndicator.style.display = 'none';
        this.updateSendButtonState();
    }

    /**
     * Mostra overlay de loading
     */
    showLoading() {
        this.loadingOverlay.style.display = 'flex';
    }

    /**
     * Esconde overlay de loading
     */
    hideLoading() {
        this.loadingOverlay.style.display = 'none';
    }

    /**
     * Rola para a última mensagem
     */
    scrollToBottom() {
        setTimeout(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        }, 100);
    }

    /**
     * Obtém hora atual formatada
     */
    getCurrentTime() {
        return new Date().toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    /**
     * Gera ID de sessão
     */
    generateSessionId() {
        return 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Função utilitária para delay
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// ====================================
// ESTILOS DINÂMICOS PARA DADOS
// ====================================

const additionalStyles = `
    .data-card {
        background: var(--light-gray);
        border-radius: 0.5rem;
        padding: 1rem;
        margin-top: 0.5rem;
        border-left: 4px solid var(--bradesco-red);
    }

    .data-card h4 {
        color: var(--bradesco-red);
        margin-bottom: 0.75rem;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .data-card p {
        margin: 0.25rem 0;
        font-size: 0.85rem;
        line-height: 1.4;
    }

    .status-badge {
        padding: 0.25rem 0.5rem;
        border-radius: 1rem;
        font-size: 0.75rem;
        font-weight: 600;
        color: white;
    }

    .status-em-dia { background: var(--success-green); }
    .status-pendente { background: var(--warning-orange); }
    .status-atrasado { background: #f44336; }

    .agent-status {
        padding: 0.25rem 0.5rem;
        border-radius: 1rem;
        font-size: 0.75rem;
        font-weight: 600;
        color: white;
    }

    .agent-status.available { background: var(--success-green); }
    .agent-status.busy { background: var(--warning-orange); }

    .contact-buttons {
        display: flex;
        gap: 0.5rem;
        margin-top: 0.75rem;
    }

    .contact-btn {
        background: var(--bradesco-red);
        color: white;
        border: none;
        padding: 0.5rem 0.75rem;
        border-radius: 0.25rem;
        cursor: pointer;
        font-size: 0.8rem;
        display: flex;
        align-items: center;
        gap: 0.25rem;
        transition: background 0.3s ease;
    }

    .contact-btn:hover {
        background: var(--bradesco-dark-red);
    }

    .data-message .message-content {
        max-width: 85%;
    }
`;

// Adiciona estilos dinâmicos
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// ====================================
// INICIALIZAÇÃO
// ====================================

// Inicializa o chatbot quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    const chatbot = new BradescoChatbot();
    
    // Torna o chatbot acessível globalmente para debug
    window.chatbot = chatbot;
    
    console.log('🎯 Sistema pronto! Para testar a integração da API, modifique a função sendToAPI() no arquivo script.js');
});

// ====================================
// UTILITÁRIOS PARA DESENVOLVIMENTO
// ====================================

/**
 * Função utilitária para testar a API
 * Use no console: testAPI()
 */
window.testAPI = async function() {
    console.log('🧪 Testando conexão com API...');
    
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.ENDPOINTS.CHAT}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('✅ API respondeu:', response.status);
        return response;
    } catch (error) {
        console.log('❌ Erro na API:', error.message);
        return null;
    }
};

/**
 * Limpa o histórico de chat
 */
window.clearChat = function() {
    if (window.chatbot) {
        window.chatbot.chatMessages.innerHTML = `
            <div class="message bot-message">
                <div class="message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                    <p>Olá! Sou o assistente virtual do Bradesco. Como posso ajudá-lo com seu empréstimo hoje?</p>
                    <span class="message-time">Agora</span>
                </div>
            </div>
        `;
        console.log('🧹 Chat limpo!');
    }
}; 
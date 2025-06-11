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
    API_BASE_URL: 'http://localhost:8080', // URL do backend Java
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
        
        this.init();
    }

    /**
     * Inicializa o chatbot
     */
    init() {
        this.setupEventListeners();
        this.setupQuickOptions();
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
            // 🔗 CHAMADA PARA A API REST
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
     * 🔗 INTEGRAÇÃO COM API REST - PONTO PRINCIPAL DE CONEXÃO
     * 
     * Esta função é responsável por enviar dados para o backend Java
     * Modifique esta função conforme a estrutura da sua API
     */
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

        console.log('📡 Enviando para API:', url, requestBody);

        // Simula chamada API para demonstração
        // SUBSTITUA este bloco pela chamada real quando o backend estiver pronto
        return await this.simulateAPICall(requestBody);

        /* 
        // 🔥 DESCOMENTE E USE ESTE BLOCO QUANDO A API ESTIVER PRONTA:
        
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                // Adicione headers de autenticação se necessário
                // 'Authorization': 'Bearer your-token'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
        */
    }

    /**
     * Simula resposta da API (remover quando API real estiver pronta)
     */
    async simulateAPICall(requestBody) {
        // Simula delay da rede
        await this.delay(1500);

        const message = requestBody.message.toLowerCase();
        
        // Simula diferentes tipos de resposta baseado na mensagem
        if (message.includes('agência') || message.includes('onde')) {
            return {
                type: 'agency_info',
                data: {
                    agencia: 'Agência Centro - 1234-5',
                    endereco: 'Rua das Flores, 123 - Centro',
                    telefone: '(11) 3456-7890'
                },
                message: 'Seu empréstimo foi realizado na seguinte agência:'
            };
        }
        
        if (message.includes('detalhes') || message.includes('valor')) {
            return {
                type: 'loan_details',
                data: {
                    valor_total: 'R$ 15.000,00',
                    valor_parcela: 'R$ 1.250,00',
                    parcelas_totais: 12,
                    parcelas_pagas: 8,
                    próximo_vencimento: '15/12/2024'
                },
                message: 'Aqui estão os detalhes do seu empréstimo:'
            };
        }
        
        if (message.includes('status')) {
            return {
                type: 'loan_status',
                data: {
                    status: 'Em dia',
                    parcelas_pendentes: 4,
                    valor_pendente: 'R$ 5.000,00',
                    ultimo_pagamento: '15/11/2024'
                },
                message: 'Status atual do seu empréstimo:'
            };
        }
        
        if (message.includes('agente') || message.includes('especialista')) {
            return {
                type: 'contact_agent',
                data: {
                    agent_name: 'Maria Silva',
                    available: true,
                    phone: '(11) 3456-7890',
                    email: 'maria.silva@bradesco.com.br'
                },
                message: 'Vou conectá-lo com nossa especialista em empréstimos:'
            };
        }

        // Resposta padrão
        return {
            type: 'general',
            message: 'Entendi sua mensagem! Como posso ajudá-lo com informações sobre seu empréstimo? Use as opções abaixo para consultas específicas.'
        };
    }

    /**
     * Processa a resposta do bot
     */
    async processBotResponse(response) {
        await this.delay(CONFIG.MESSAGE_ANIMATION_DELAY);
        
        this.addBotMessage(response.message);
        
        // Adiciona informações específicas baseado no tipo
        if (response.data) {
            await this.delay(500);
            this.addBotDataMessage(response.type, response.data);
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
        if (message) {
            this.addUserMessage(message);
            this.showTyping();

            try {
                let endpoint = CONFIG.ENDPOINTS.CHAT;
                
                // Define endpoint específico baseado na opção
                switch(option) {
                    case 'agencia': endpoint = CONFIG.ENDPOINTS.AGENCY_INFO; break;
                    case 'detalhes': endpoint = CONFIG.ENDPOINTS.LOAN_DETAILS; break;
                    case 'status': endpoint = CONFIG.ENDPOINTS.LOAN_STATUS; break;
                    case 'agente': endpoint = CONFIG.ENDPOINTS.CONTACT_AGENT; break;
                }

                const response = await this.sendToAPI(message, endpoint);
                await this.processBotResponse(response);
                
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
                content = `
                    <div class="data-card">
                        <h4><i class="fas fa-chart-line"></i> Status do Empréstimo</h4>
                        <p><strong>Status:</strong> <span class="status-badge status-${data.status.toLowerCase().replace(' ', '-')}">${data.status}</span></p>
                        <p><strong>Parcelas Pendentes:</strong> ${data.parcelas_pendentes}</p>
                        <p><strong>Valor Pendente:</strong> ${data.valor_pendente}</p>
                        <p><strong>Último Pagamento:</strong> ${data.ultimo_pagamento}</p>
                    </div>
                `;
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
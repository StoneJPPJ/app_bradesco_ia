-- SCRIPT PARA CRIAR DADOS DE TESTE NO BANCO BRADESCO
-- Execute este script no SQL Server Management Studio

-- Criar banco se não existir
USE master;
GO
IF NOT EXISTS (SELECT name FROM sys.databases WHERE name = 'bradesco')
BEGIN
    CREATE DATABASE bradesco;
END
GO

USE bradesco;
GO

-- Criar tabela de clientes se não existir
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='clientes_cadastrados' AND xtype='U')
BEGIN
    CREATE TABLE clientes_cadastrados (
        id_cliente VARCHAR(50) PRIMARY KEY,
        nome_cliente VARCHAR(200) NOT NULL,
        celular VARCHAR(20) NOT NULL,
        idade INT NOT NULL
    );
END
GO

-- Criar tabela de propostas se não existir
IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='propostas_emprestimo' AND xtype='U')
BEGIN
    CREATE TABLE propostas_emprestimo (
        id_proposta INT IDENTITY(1,1) PRIMARY KEY,
        id_cliente VARCHAR(50) NOT NULL,
        valor DECIMAL(15,2) NOT NULL,
        parcelas INT NOT NULL,
        data_solicitacao DATE NOT NULL,
        data_deposito DATE NOT NULL,
        agencia VARCHAR(20) NOT NULL,
        tipo_formalizacao VARCHAR(50) NOT NULL,
        FOREIGN KEY (id_cliente) REFERENCES clientes_cadastrados(id_cliente)
    );
END
GO

-- Limpar dados existentes (se houver)
DELETE FROM propostas_emprestimo;
DELETE FROM clientes_cadastrados;

-- Inserir clientes de teste
INSERT INTO clientes_cadastrados (id_cliente, nome_cliente, celular, idade) VALUES
('12345', 'João Silva', '(11) 99999-9999', 35),
('67890', 'Maria Santos', '(11) 88888-8888', 28),
('11111', 'Carlos Oliveira', '(11) 77777-7777', 42),
('54321', 'Ana Costa', '(11) 66666-6666', 31),
('98765', 'Pedro Fernandes', '(11) 55555-5555', 38);

-- Inserir propostas de empréstimo
INSERT INTO propostas_emprestimo (id_cliente, valor, parcelas, data_solicitacao, data_deposito, agencia, tipo_formalizacao) VALUES
('12345', 25000.00, 12, '2024-01-15', '2024-01-20', '1234-5', 'Digital'),
('67890', 15000.00, 10, '2024-02-10', '2024-02-15', '5678-9', 'Presencial'),
('11111', 50000.00, 18, '2024-03-05', '2024-03-10', '9999-1', 'Digital'),
('54321', 30000.00, 15, '2024-04-12', '2024-04-17', '2222-3', 'Digital'),
('98765', 20000.00, 8, '2024-05-20', '2024-05-25', '7777-8', 'Presencial');

-- Verificar dados inseridos
SELECT 'CLIENTES CADASTRADOS:' AS Info;
SELECT * FROM clientes_cadastrados;

SELECT 'PROPOSTAS DE EMPRÉSTIMO:' AS Info;
SELECT * FROM propostas_emprestimo;

PRINT 'Dados de teste inseridos com sucesso!';
PRINT 'Agora você pode testar o sistema com os seguintes IDs/Nomes:';
PRINT '- ID: 12345 ou Nome: João';
PRINT '- ID: 67890 ou Nome: Maria'; 
PRINT '- ID: 11111 ou Nome: Carlos';
PRINT '- ID: 54321 ou Nome: Ana';
PRINT '- ID: 98765 ou Nome: Pedro'; 
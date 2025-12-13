-- Schema SQL para Sistema de Agendamento de Serviços (Barbearia/Salão de Beleza)
-- Usando PostgreSQL como exemplo

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela de Profissionais/Usuários
CREATE TABLE users_professionals (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    photo_url TEXT,
    role VARCHAR(100) NOT NULL, -- e.g., "Senior Stylist", "Barber"
    calendar_color VARCHAR(7) NOT NULL DEFAULT '#000000', -- Hex color
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    notification_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- 2. Tabela de Clientes
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    photo_url TEXT,
    birth_date DATE,
    address_city VARCHAR(100),
    address_state VARCHAR(100),
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    tags TEXT[], -- Array de tags como "VIP", "Pagador Pontual"
    preferences TEXT,
    allergies TEXT,
    avg_rating DECIMAL(3,2) DEFAULT 0.00 CHECK (avg_rating >= 0 AND avg_rating <= 5),
    total_visits INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- 3. Tabela de Serviços
CREATE TABLE services (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL, -- 'Hair', 'Beard', 'Combo', 'Coloring'
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    icon_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL
);

-- 4. Tabela de Agendamentos
CREATE TABLE appointments (
    id SERIAL PRIMARY KEY,
    start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    professional_id INTEGER NOT NULL REFERENCES users_professionals(id) ON DELETE CASCADE,
    service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('confirmed', 'pending', 'cancelled', 'completed')),
    payment_method VARCHAR(20) CHECK (payment_method IN ('online', 'cash', 'card')),
    total_value DECIMAL(10,2) NOT NULL CHECK (total_value >= 0),
    notes TEXT,
    check_in_done BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE NULL,
    CONSTRAINT valid_datetime CHECK (end_datetime > start_datetime)
);

-- 5. Tabela de Bloqueios de Horário
CREATE TABLE time_blocks (
    id SERIAL PRIMARY KEY,
    professional_id INTEGER NOT NULL REFERENCES users_professionals(id) ON DELETE CASCADE,
    start_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    end_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    reason TEXT,
    type VARCHAR(50) NOT NULL, -- 'unavailable', 'vacation', 'lunch'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_block_datetime CHECK (end_datetime > start_datetime)
);

-- 6. Tabela de Solicitações de Agendamento
CREATE TABLE appointment_requests (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    requested_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tabela de Histórico de Atendimentos
CREATE TABLE service_history (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    service_date DATE NOT NULL,
    customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),
    comments TEXT,
    amount_paid DECIMAL(10,2) NOT NULL CHECK (amount_paid >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Tabela de Junção Profissionais-Serviços (N:N)
CREATE TABLE professional_services (
    id SERIAL PRIMARY KEY,
    professional_id INTEGER NOT NULL REFERENCES users_professionals(id) ON DELETE CASCADE,
    service_id INTEGER NOT NULL REFERENCES services(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(professional_id, service_id)
);

-- 9. Tabela de Configurações do Negócio
CREATE TABLE business_settings (
    id SERIAL PRIMARY KEY,
    business_name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    address TEXT,
    phone VARCHAR(20),
    opening_hours JSONB DEFAULT '{}', -- e.g., {"monday": "09:00-18:00", ...}
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    notification_settings JSONB DEFAULT '{}',
    financial_metrics JSONB DEFAULT '{}', -- Para métricas agregadas como total_revenue, monthly_revenue, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Tabela de Templates de Notificação
CREATE TABLE notification_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'confirmation', 'reminder', 'cancellation'
    content TEXT NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    professional_id INTEGER REFERENCES users_professionals(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para performance
CREATE INDEX idx_appointments_start_datetime ON appointments(start_datetime);
CREATE INDEX idx_appointments_end_datetime ON appointments(end_datetime);
CREATE INDEX idx_appointments_customer_id ON appointments(customer_id);
CREATE INDEX idx_appointments_professional_id ON appointments(professional_id);
CREATE INDEX idx_appointments_status ON appointments(status);
CREATE INDEX idx_time_blocks_professional_id ON time_blocks(professional_id);
CREATE INDEX idx_time_blocks_start_datetime ON time_blocks(start_datetime);
CREATE INDEX idx_service_history_appointment_id ON service_history(appointment_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_users_professionals_email ON users_professionals(email);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_professionals_updated_at BEFORE UPDATE ON users_professionals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_time_blocks_updated_at BEFORE UPDATE ON time_blocks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_appointment_requests_updated_at BEFORE UPDATE ON appointment_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_service_history_updated_at BEFORE UPDATE ON service_history FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_business_settings_updated_at BEFORE UPDATE ON business_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notification_templates_updated_at BEFORE UPDATE ON notification_templates FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Dados de exemplo

-- Profissionais
INSERT INTO users_professionals (first_name, last_name, email, phone, role, calendar_color, status) VALUES
('Sarah', 'Jenkins', 'sarah.jenkins@servicepro.com', '+5511999999999', 'Senior Stylist', '#FF6B6B', 'active'),
('Michael', 'Chen', 'michael.chen@servicepro.com', '+5511988888888', 'Barber', '#4ECDC4', 'active'),
('Elara', 'Vane', 'elara.vane@servicepro.com', '+5511977777777', 'Color Specialist', '#45B7D1', 'active');

-- Clientes
INSERT INTO customers (full_name, email, phone, birth_date, address_city, address_state, tags, preferences, avg_rating, total_visits) VALUES
('João Silva', 'joao.silva@email.com', '+5511966666666', '1990-05-15', 'São Paulo', 'SP', ARRAY['VIP', 'Pagador Pontual'], 'Prefere horários matinais', 4.8, 12),
('Maria Santos', 'maria.santos@email.com', '+5511955555555', '1985-08-22', 'São Paulo', 'SP', ARRAY['VIP'], 'Alergia a produtos químicos', 4.5, 8),
('Pedro Oliveira', 'pedro.oliveira@email.com', '+5511944444444', '1992-12-10', 'São Paulo', 'SP', ARRAY['Novo Cliente'], 'Primeira visita', 0.0, 1),
('Ana Costa', 'ana.costa@email.com', '+5511933333333', '1988-03-30', 'São Paulo', 'SP', ARRAY['Regular'], 'Corte tradicional', 4.2, 15),
('Carlos Ferreira', 'carlos.ferreira@email.com', '+5511922222222', '1995-07-18', 'São Paulo', 'SP', ARRAY['VIP'], 'Serviços premium', 4.9, 20),
('Lucia Almeida', 'lucia.almeida@email.com', '+5511911111111', '1980-11-05', 'São Paulo', 'SP', ARRAY['Regular'], 'Horários flexíveis', 4.0, 6),
('Roberto Lima', 'roberto.lima@email.com', '+5511900000000', '1998-01-25', 'São Paulo', 'SP', ARRAY['Novo Cliente'], NULL, 0.0, 0);

-- Serviços
INSERT INTO services (name, description, category, duration_minutes, price, status) VALUES
('Corte Masculino', 'Corte de cabelo masculino completo', 'Hair', 30, 35.00, 'active'),
('Barba', 'Aparação e modelagem da barba', 'Beard', 20, 25.00, 'active'),
('Cabelo + Barba', 'Combo completo de cabelo e barba', 'Combo', 45, 55.00, 'active'),
('Tintura', 'Coloração completa do cabelo', 'Coloring', 90, 120.00, 'active'),
('Sobrancelha', 'Design e limpeza de sobrancelhas', 'Hair', 15, 15.00, 'active'),
('Lavagem', 'Lavagem e tratamento capilar', 'Hair', 20, 20.00, 'active'),
('Massagem Capilar', 'Massagem relaxante no couro cabeludo', 'Hair', 30, 40.00, 'active');

-- Relacionamento Profissionais-Serviços
INSERT INTO professional_services (professional_id, service_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 4), (1, 5), (1, 6), (1, 7), -- Sarah oferece todos
(2, 1), (2, 2), (2, 3), (2, 6), -- Michael especialista em masculino
(3, 4), (3, 5), (3, 6), (3, 7); -- Elara especialista em cor e tratamento

-- Agendamentos para dezembro 2025
INSERT INTO appointments (start_datetime, end_datetime, customer_id, professional_id, service_id, status, payment_method, total_value, notes) VALUES
('2025-12-15 09:00:00+00', '2025-12-15 09:30:00+00', 1, 2, 1, 'confirmed', 'card', 35.00, 'Cliente VIP'),
('2025-12-15 10:00:00+00', '2025-12-15 10:45:00+00', 2, 1, 3, 'confirmed', 'cash', 55.00, 'Alergia a produtos químicos'),
('2025-12-16 14:00:00+00', '2025-12-16 14:20:00+00', 3, 2, 2, 'pending', NULL, 25.00, 'Primeira barba'),
('2025-12-17 11:00:00+00', '2025-12-17 12:30:00+00', 4, 3, 4, 'confirmed', 'online', 120.00, 'Tintura completa'),
('2025-12-18 16:00:00+00', '2025-12-18 16:15:00+00', 5, 1, 5, 'completed', 'card', 15.00, 'Design de sobrancelhas'),
('2025-12-19 13:00:00+00', '2025-12-19 13:45:00+00', 6, 1, 3, 'confirmed', 'cash', 55.00, 'Cliente regular'),
('2025-12-20 10:30:00+00', '2025-12-20 11:00:00+00', 7, 2, 1, 'pending', NULL, 35.00, 'Novo cliente');

-- Bloqueios de horário
INSERT INTO time_blocks (professional_id, start_datetime, end_datetime, reason, type) VALUES
(1, '2025-12-25 00:00:00+00', '2025-12-26 00:00:00+00', 'Férias de Natal', 'vacation'),
(2, '2025-12-15 12:00:00+00', '2025-12-15 13:00:00+00', 'Almoço', 'lunch'),
(3, '2025-12-20 17:00:00+00', '2025-12-20 18:00:00+00', 'Consulta médica', 'unavailable');

-- Histórico de atendimentos (para agendamentos concluídos)
INSERT INTO service_history (appointment_id, service_date, customer_rating, comments, amount_paid) VALUES
(5, '2025-12-18', 5, 'Excelente serviço!', 15.00);

-- Configurações do negócio
INSERT INTO business_settings (business_name, address, phone, opening_hours, timezone, financial_metrics) VALUES
('ServicePro Barbearia', 'Rua das Flores, 123 - São Paulo, SP', '+5511987654321',
 '{"monday": "09:00-18:00", "tuesday": "09:00-18:00", "wednesday": "09:00-18:00", "thursday": "09:00-18:00", "friday": "09:00-19:00", "saturday": "08:00-17:00", "sunday": "closed"}',
 'America/Sao_Paulo',
 '{"total_revenue": 2450.00, "monthly_revenue": 2450.00, "avg_ticket": 44.64, "total_appointments": 7}');

-- Templates de notificação
INSERT INTO notification_templates (name, type, content, active) VALUES
('Confirmação de Agendamento', 'confirmation', 'Olá {cliente}! Seu agendamento para {servico} está confirmado para {data} às {hora}.', true),
('Lembrete de Agendamento', 'reminder', 'Olá {cliente}! Lembrete: seu agendamento para {servico} é amanhã às {hora}.', true),
('Cancelamento de Agendamento', 'cancellation', 'Olá {cliente}! Seu agendamento para {servico} em {data} foi cancelado.', true);
        class Database {
            constructor() {
                this.initDatabase();
            }

            initDatabase() {
                if (!localStorage.getItem('barbearias')) {
                    const barbearias = [
                        { id: 1, nome: 'Barbearia Estilo Clássico', localizacao: 'Centro', descricao: 'Especializada em cortes tradicionais' },
                        { id: 2, nome: 'The Modern Barber', localizacao: 'Zona Sul', descricao: 'Cortes modernos e tendências atuais' },
                        { id: 3, nome: 'Corte & Estilo', localizacao: 'Zona Norte', descricao: 'Serviços completos de beleza masculina' }
                    ];
                    localStorage.setItem('barbearias', JSON.stringify(barbearias));
                }

                if (!localStorage.getItem('servicos')) {
                    const servicos = [
                        { id: 1, barbearia_id: 1, nome: 'Corte de Cabelo', preco: 40.00, duracao_minutos: 30 },
                        { id: 2, barbearia_id: 1, nome: 'Barba', preco: 30.00, duracao_minutos: 20 },
                        { id: 3, barbearia_id: 2, nome: 'Corte Premium', preco: 60.00, duracao_minutos: 45 },
                        { id: 4, barbearia_id: 2, nome: 'Pacote Completo', preco: 80.00, duracao_minutos: 60 },
                        { id: 5, barbearia_id: 3, nome: 'Corte Básico', preco: 35.00, duracao_minutos: 25 }
                    ];
                    localStorage.setItem('servicos', JSON.stringify(servicos));
                }

                if (!localStorage.getItem('agendamentos')) {
                    localStorage.setItem('agendamentos', JSON.stringify([]));
                }
            }

            // Métodos para barbearias
            getBarbearias() {
                return JSON.parse(localStorage.getItem('barbearias'));
            }

            getBarbearia(id) {
                const barbearias = this.getBarbearias();
                return barbearias.find(b => b.id === id);
            }

            // Métodos para serviços
            getServicos() {
                return JSON.parse(localStorage.getItem('servicos'));
            }

            getServicosByBarbearia(barbeariaId) {
                const servicos = this.getServicos();
                return servicos.filter(s => s.barbearia_id === barbeariaId);
            }

            getServico(id) {
                const servicos = this.getServicos();
                return servicos.find(s => s.id === id);
            }

            // Métodos para agendamentos
            getAgendamentos() {
                return JSON.parse(localStorage.getItem('agendamentos'));
            }

            getAgendamentosByEmail(email) {
                const agendamentos = this.getAgendamentos();
                return agendamentos.filter(a => a.cliente_email === email);
            }

            createAgendamento(agendamento) {
                const agendamentos = this.getAgendamentos();
                const newId = agendamentos.length > 0 ? Math.max(...agendamentos.map(a => a.id)) + 1 : 1;
                
                const newAgendamento = {
                    id: newId,
                    ...agendamento,
                    status: 'agendado',
                    criado_em: new Date().toISOString()
                };
                
                agendamentos.push(newAgendamento);
                localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
                return newAgendamento;
            }

            cancelAgendamento(id) {
                const agendamentos = this.getAgendamentos();
                const index = agendamentos.findIndex(a => a.id === id);
                
                if (index !== -1) {
                    agendamentos[index].status = 'cancelado';
                    localStorage.setItem('agendamentos', JSON.stringify(agendamentos));
                    return true;
                }
                
                return false;
            }
        }

        // Interface do usuário
        class UI {
            constructor() {
                this.db = new Database();
                this.init();
            }

            init() {
                this.loadBarbearias();
                this.loadBarbeariasSelect();
                this.setupEventListeners();
                
                // Verificar se há e-mail no localStorage para carregar agendamentos
                const email = localStorage.getItem('currentEmail');
                if (email) {
                    document.getElementById('cliente-email').value = email;
                    this.loadAgendamentos(email);
                }
            }

            loadBarbearias() {
                const barbearias = this.db.getBarbearias();
                const barbeariasList = document.getElementById('barbearias-list');
                
                barbeariasList.innerHTML = barbearias.map(barbearia => `
                    <li>
                        <a href="#" data-id="${barbearia.id}">${barbearia.nome}</a> - ${barbearia.localizacao}
                        <p>${barbearia.descricao}</p>
                    </li>
                `).join('');
            }

            loadBarbeariasSelect() {
                const barbearias = this.db.getBarbearias();
                const select = document.getElementById('barbearia-select');
                
                select.innerHTML = `
                    <option value="">Selecione uma barbearia</option>
                    ${barbearias.map(b => `<option value="${b.id}">${b.nome} - ${b.localizacao}</option>`).join('')}
                `;
            }

            loadServicosSelect(barbeariaId) {
                const servicos = this.db.getServicosByBarbearia(barbeariaId);
                const select = document.getElementById('servico-select');
                
                select.innerHTML = `
                    <option value="">Selecione um serviço</option>
                    ${servicos.map(s => `<option value="${s.id}">${s.nome} - R$ ${s.preco.toFixed(2)} (${s.duracao_minutos} min)</option>`).join('')}
                `;
                
                select.disabled = false;
            }

            loadAgendamentos(email) {
                const agendamentos = this.db.getAgendamentosByEmail(email);
                const agendamentosList = document.getElementById('agendamentos-list');
                
                if (agendamentos.length === 0) {
                    agendamentosList.innerHTML = '<p>Nenhum agendamento encontrado.</p>';
                    return;
                }
                
                agendamentosList.innerHTML = `
                    <table>
                        <thead>
                            <tr>
                                <th>Barbearia</th>
                                <th>Serviço</th>
                                <th>Data/Hora</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${agendamentos.map(agendamento => {
                                const barbearia = this.db.getBarbearia(agendamento.barbearia_id);
                                const servico = this.db.getServico(agendamento.servico_id);
                                const dataHora = new Date(agendamento.data_hora).toLocaleString();
                                
                                return `
                                    <tr>
                                        <td>${barbearia.nome}</td>
                                        <td>${servico.nome} (R$ ${servico.preco.toFixed(2)})</td>
                                        <td>${dataHora}</td>
                                        <td>${this.getStatusBadge(agendamento.status)}</td>
                                        <td>
                                            ${agendamento.status === 'agendado' ? 
                                                `<button class="cancel-btn" data-id="${agendamento.id}">Cancelar</button>` : 
                                                ''}
                                        </td>
                                    </tr>
                                `;
                            }).join('')}
                        </tbody>
                    </table>
                `;
                
                // Adicionar event listeners aos botões de cancelamento
                document.querySelectorAll('.cancel-btn').forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        const id = parseInt(e.target.getAttribute('data-id'));
                        this.cancelAgendamento(id);
                    });
                });
            }

            getStatusBadge(status) {
                const badges = {
                    'agendado': '<span style="color: #28a745;">Agendado</span>',
                    'cancelado': '<span style="color: #dc3545;">Cancelado</span>',
                    'concluido': '<span style="color: #17a2b8;">Concluído</span>'
                };
                return badges[status] || status;
            }

            showMessage(text, type) {
                const messageDiv = document.getElementById('message');
                messageDiv.textContent = text;
                messageDiv.className = `message ${type}`;
                messageDiv.style.display = 'block';
                
                setTimeout(() => {
                    messageDiv.style.display = 'none';
                }, 5000);
            }

            setupEventListeners() {
                // Seleção de barbearia - carrega serviços
                document.getElementById('barbearia-select').addEventListener('change', (e) => {
                    const barbeariaId = parseInt(e.target.value);
                    if (barbeariaId) {
                        this.loadServicosSelect(barbeariaId);
                    } else {
                        document.getElementById('servico-select').innerHTML = '<option value="">Selecione um serviço</option>';
                        document.getElementById('servico-select').disabled = true;
                    }
                });

                // Formulário de agendamento
                document.getElementById('agendamento-form').addEventListener('submit', (e) => {
                    e.preventDefault();
                    
                    const barbeariaId = parseInt(document.getElementById('barbearia-select').value);
                    const servicoId = parseInt(document.getElementById('servico-select').value);
                    const clienteNome = document.getElementById('cliente-nome').value;
                    const clienteEmail = document.getElementById('cliente-email').value;
                    const dataHora = document.getElementById('data-hora').value;
                    
                    // Validação
                    if (!barbeariaId || !servicoId || !clienteNome || !clienteEmail || !dataHora) {
                        this.showMessage('Por favor, preencha todos os campos.', 'error');
                        return;
                    }
                    
                    // Criar agendamento
                    try {
                        const agendamento = {
                            barbearia_id: barbeariaId,
                            servico_id: servicoId,
                            cliente_nome: clienteNome,
                            cliente_email: clienteEmail,
                            data_hora: new Date(dataHora).toISOString()
                        };
                        
                        this.db.createAgendamento(agendamento);
                        this.showMessage('Agendamento realizado com sucesso!', 'success');
                        
                        // Salvar e-mail para futuros agendamentos
                        localStorage.setItem('currentEmail', clienteEmail);
                        
                        // Recarregar lista de agendamentos
                        this.loadAgendamentos(clienteEmail);
                        
                        // Limpar formulário
                        document.getElementById('agendamento-form').reset();
                        document.getElementById('servico-select').disabled = true;
                    } catch (error) {
                        this.showMessage('Erro ao realizar agendamento: ' + error.message, 'error');
                    }
                });
            }

            cancelAgendamento(id) {
                if (confirm('Tem certeza que deseja cancelar este agendamento?')) {
                    const success = this.db.cancelAgendamento(id);
                    if (success) {
                        this.showMessage('Agendamento cancelado com sucesso.', 'success');
                        const email = document.getElementById('cliente-email').value;
                        this.loadAgendamentos(email);
                    } else {
                        this.showMessage('Erro ao cancelar agendamento.', 'error');
                    }
                }
            }
        }

        // Inicializar a aplicação quando o DOM estiver pronto
        document.addEventListener('DOMContentLoaded', () => {
            new UI();
        });

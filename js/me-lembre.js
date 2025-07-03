// Me Lembre! - Sistema de Lembretes

document.addEventListener('DOMContentLoaded', function() {
    // Elementos do formulário
    const form = document.getElementById('formLembrete');
    const titulo = document.getElementById('titulo');
    const categoria = document.getElementById('categoria');
    const descricao = document.getElementById('descricao');
    const dataLembrete = document.getElementById('dataLembrete');
    const horaLembrete = document.getElementById('horaLembrete');
    const prioridade = document.getElementById('prioridade');
    const repetir = document.getElementById('repetir');
    const notificar = document.getElementById('notificar');
    
    // Botões
    const btnLimpar = document.getElementById('btnLimpar');
    const btnSalvar = document.getElementById('btnSalvar');
    
    // Filtros e busca
    const filtroStatus = document.getElementById('filtroStatus');
    const filtroCategoria = document.getElementById('filtroCategoria');
    const buscarLembrete = document.getElementById('buscarLembrete');
    
    // Modal de mensagens
    const messageModal = document.getElementById('messageModal');
    const messageText = document.getElementById('messageText');
    const closeMessage = document.getElementById('closeMessage');
    
    // Estatísticas
    const totalLembretes = document.getElementById('totalLembretes');
    const lembretesUrgentes = document.getElementById('lembretesUrgentes');
    const lembretesHoje = document.getElementById('lembretesHoje');
    const lembretesConcluidos = document.getElementById('lembretesConcluidos');
    
    // Paginação
    const itensPorPagina = 10;
    let paginaAtual = 1;
    let totalPaginas = 1;
    
    // Array para armazenar os lembretes
    let lembretes = [];
    // ID do lembrete em edição
    let editingId = null;
    
    // Definir data mínima como hoje
    const hoje = new Date().toISOString().split('T')[0];
    dataLembrete.min = hoje;
    dataLembrete.value = hoje;
    
    // Carregar dados do localStorage
    carregarDoLocalStorage();
    
    // Event listeners
    btnLimpar.addEventListener('click', limparFormulario);
    btnSalvar.addEventListener('click', salvarLembrete);
    filtroStatus.addEventListener('change', filtrarLembretes);
    filtroCategoria.addEventListener('change', filtrarLembretes);
    buscarLembrete.addEventListener('input', filtrarLembretes);
    closeMessage.addEventListener('click', fecharMensagem);
    
    // Verificar lembretes vencidos a cada minuto
    setInterval(verificarLembretesVencidos, 60000);
    
    // Verificar lembretes ao carregar a página
    verificarLembretesVencidos();
    
    // Função para limpar o formulário
    function limparFormulario() {
        form.reset();
        dataLembrete.value = hoje;
        editingId = null;
        
        // Remover classes de validação
        form.querySelectorAll('.is-invalid').forEach(el => {
            el.classList.remove('is-invalid');
        });
    }
    
    // Função para salvar lembrete
    function salvarLembrete() {
        if (!validarFormulario()) {
            mostrarMensagem('Por favor, preencha todos os campos obrigatórios.', 'error');
            return;
        }
        
        const lembrete = {
            id: editingId !== null ? editingId : Date.now(),
            titulo: titulo.value.trim(),
            categoria: categoria.value,
            descricao: descricao.value.trim(),
            dataHora: new Date(`${dataLembrete.value}T${horaLembrete.value}`),
            prioridade: prioridade.value,
            repetir: repetir.value,
            notificar: parseInt(notificar.value),
            status: 'Pendente',
            dataCriacao: editingId !== null ? lembretes.find(l => l.id === editingId).dataCriacao : new Date(),
            dataModificacao: new Date()
        };
        
        if (editingId !== null) {
            // Atualizar lembrete existente
            lembretes = lembretes.map(l => l.id === editingId ? lembrete : l);
            mostrarMensagem('Lembrete atualizado com sucesso!', 'success');
        } else {
            // Adicionar novo lembrete
            lembretes.push(lembrete);
            mostrarMensagem('Lembrete criado com sucesso!', 'success');
        }
        
        // Salvar no localStorage
        salvarNoLocalStorage();
        
        // Atualizar interface
        atualizarEstatisticas();
        atualizarListaLembretes();
        
        // Limpar formulário
        limparFormulario();
    }
    
    // Função para validar formulário
    function validarFormulario() {
        let valido = true;
        const campos = [titulo, categoria, dataLembrete, horaLembrete, prioridade];
        
        campos.forEach(campo => {
            if (!campo.value.trim()) {
                campo.classList.add('is-invalid');
                valido = false;
            } else {
                campo.classList.remove('is-invalid');
            }
        });
        
        // Validar se a data/hora não é no passado
        const dataHoraLembrete = new Date(`${dataLembrete.value}T${horaLembrete.value}`);
        const agora = new Date();
        
        if (dataHoraLembrete < agora && editingId === null) {
            dataLembrete.classList.add('is-invalid');
            horaLembrete.classList.add('is-invalid');
            mostrarMensagem('A data e hora do lembrete não podem ser no passado.', 'error');
            valido = false;
        }
        
        return valido;
    }
    
    // Função para mostrar mensagem
    function mostrarMensagem(texto, tipo) {
        messageText.textContent = texto;
        messageModal.classList.remove('success', 'error');
        messageModal.classList.add(tipo);
        
        const messageIcon = messageModal.querySelector('.message-icon i');
        if (tipo === 'success') {
            messageIcon.className = 'fas fa-check-circle';
        } else {
            messageIcon.className = 'fas fa-exclamation-circle';
        }
        
        messageModal.classList.add('show');
        
        setTimeout(() => {
            fecharMensagem();
        }, 5000);
    }
    
    // Função para fechar mensagem
    function fecharMensagem() {
        messageModal.classList.remove('show');
    }
    
    // Função para atualizar estatísticas
    function atualizarEstatisticas() {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const amanha = new Date(hoje);
        amanha.setDate(amanha.getDate() + 1);
        
        const stats = {
            total: lembretes.length,
            urgentes: lembretes.filter(l => l.prioridade === 'Urgente' && l.status === 'Pendente').length,
            hoje: lembretes.filter(l => {
                const dataLembrete = new Date(l.dataHora);
                return dataLembrete >= hoje && dataLembrete < amanha && l.status === 'Pendente';
            }).length,
            concluidos: lembretes.filter(l => l.status === 'Concluído').length
        };
        
        totalLembretes.textContent = stats.total;
        lembretesUrgentes.textContent = stats.urgentes;
        lembretesHoje.textContent = stats.hoje;
        lembretesConcluidos.textContent = stats.concluidos;
    }
    
    // Função para atualizar lista de lembretes
    function atualizarListaLembretes() {
        const container = document.getElementById('listaLembretes');
        container.innerHTML = '';
        
        // Aplicar filtros
        let lembretesFiltrados = aplicarFiltros();
        
        // Ordenar por data/hora
        lembretesFiltrados.sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora));
        
        // Calcular paginação
        totalPaginas = Math.ceil(lembretesFiltrados.length / itensPorPagina);
        if (totalPaginas === 0) totalPaginas = 1;
        
        if (paginaAtual > totalPaginas) {
            paginaAtual = totalPaginas;
        }
        
        const inicio = (paginaAtual - 1) * itensPorPagina;
        const fim = Math.min(inicio + itensPorPagina, lembretesFiltrados.length);
        
        // Exibir lembretes da página atual
        for (let i = inicio; i < fim; i++) {
            const lembrete = lembretesFiltrados[i];
            const lembreteEl = criarElementoLembrete(lembrete);
            container.appendChild(lembreteEl);
        }
        
        // Se não há lembretes, mostrar mensagem
        if (lembretesFiltrados.length === 0) {
            container.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-bell-slash fa-3x text-muted mb-3"></i>
                    <h5 class="text-muted">Nenhum lembrete encontrado</h5>
                    <p class="text-muted">Crie seu primeiro lembrete usando o formulário acima.</p>
                </div>
            `;
        }
        
        // Atualizar controles de paginação
        atualizarControlesPaginacao(lembretesFiltrados.length);
    }
    
    // Função para aplicar filtros
    function aplicarFiltros() {
        let filtrados = [...lembretes];
        
        // Filtro por status
        if (filtroStatus.value) {
            filtrados = filtrados.filter(l => l.status === filtroStatus.value);
        }
        
        // Filtro por categoria
        if (filtroCategoria.value) {
            filtrados = filtrados.filter(l => l.categoria === filtroCategoria.value);
        }
        
        // Filtro por busca
        const termo = buscarLembrete.value.toLowerCase();
        if (termo) {
            filtrados = filtrados.filter(l => 
                l.titulo.toLowerCase().includes(termo) ||
                l.descricao.toLowerCase().includes(termo)
            );
        }
        
        return filtrados;
    }
    
    // Função para criar elemento de lembrete
    function criarElementoLembrete(lembrete) {
        const div = document.createElement('div');
        div.className = 'card mb-3 lembrete-card';
        
        const dataHora = new Date(lembrete.dataHora);
        const agora = new Date();
        const isVencido = dataHora < agora && lembrete.status === 'Pendente';
        const isHoje = dataHora.toDateString() === agora.toDateString();
        
        let badgeClass = 'bg-secondary';
        switch(lembrete.prioridade) {
            case 'Baixa': badgeClass = 'bg-success'; break;
            case 'Normal': badgeClass = 'bg-primary'; break;
            case 'Alta': badgeClass = 'bg-warning'; break;
            case 'Urgente': badgeClass = 'bg-danger'; break;
        }
        
        let statusClass = lembrete.status === 'Concluído' ? 'text-success' : (isVencido ? 'text-danger' : 'text-primary');
        let statusIcon = lembrete.status === 'Concluído' ? 'fa-check-circle' : (isVencido ? 'fa-exclamation-triangle' : 'fa-clock');
        
        div.innerHTML = `
            <div class="card-body ${lembrete.status === 'Concluído' ? 'opacity-75' : ''}">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <div class="flex-grow-1">
                        <h6 class="card-title mb-1 ${lembrete.status === 'Concluído' ? 'text-decoration-line-through' : ''}">
                            ${lembrete.titulo}
                        </h6>
                        <div class="d-flex gap-2 mb-2">
                            <span class="badge ${badgeClass}">${lembrete.prioridade}</span>
                            <span class="badge bg-light text-dark">${lembrete.categoria}</span>
                            ${isHoje ? '<span class="badge bg-info">Hoje</span>' : ''}
                            ${isVencido ? '<span class="badge bg-danger">Vencido</span>' : ''}
                        </div>
                    </div>
                    <div class="d-flex gap-1">
                        ${lembrete.status === 'Pendente' ? `
                            <button class="btn btn-sm btn-success" onclick="marcarConcluido(${lembrete.id})" title="Marcar como concluído">
                                <i class="fas fa-check"></i>
                            </button>
                        ` : ''}
                        <button class="btn btn-sm btn-info" onclick="editarLembrete(${lembrete.id})" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="verDetalhes(${lembrete.id})" title="Ver detalhes">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="excluirLembrete(${lembrete.id})" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                
                ${lembrete.descricao ? `<p class="card-text text-muted mb-2">${lembrete.descricao}</p>` : ''}
                
                <div class="d-flex justify-content-between align-items-center">
                    <small class="${statusClass}">
                        <i class="fas ${statusIcon} me-1"></i>
                        ${formatarDataHora(dataHora)}
                    </small>
                    <small class="text-muted">
                        ${lembrete.repetir !== 'Não' ? `<i class="fas fa-repeat me-1"></i>${lembrete.repetir}` : ''}
                    </small>
                </div>
            </div>
        `;
        
        return div;
    }
    
    // Função para atualizar controles de paginação
    function atualizarControlesPaginacao(totalItens) {
        const paginacaoContainer = document.getElementById('paginacao');
        if (!paginacaoContainer) return;
        
        paginacaoContainer.innerHTML = '';
        
        if (totalItens === 0) return;
        
        // Informação sobre itens exibidos
        const infoEl = document.createElement('div');
        infoEl.className = 'pagination-info';
        const inicio = ((paginaAtual - 1) * itensPorPagina) + 1;
        const fim = Math.min(paginaAtual * itensPorPagina, totalItens);
        infoEl.textContent = `Mostrando ${inicio}-${fim} de ${totalItens} lembretes`;
        paginacaoContainer.appendChild(infoEl);
        
        // Controles de navegação
        const navEl = document.createElement('div');
        navEl.className = 'pagination-nav';
        
        // Botão anterior
        const btnAnterior = document.createElement('button');
        btnAnterior.className = 'btn btn-sm btn-outline-primary';
        btnAnterior.innerHTML = '<i class="fas fa-chevron-left"></i>';
        btnAnterior.disabled = paginaAtual === 1;
        btnAnterior.addEventListener('click', () => {
            if (paginaAtual > 1) {
                paginaAtual--;
                atualizarListaLembretes();
            }
        });
        navEl.appendChild(btnAnterior);
        
        // Números das páginas
        for (let i = 1; i <= totalPaginas; i++) {
            const btnPagina = document.createElement('button');
            btnPagina.className = `btn btn-sm ${i === paginaAtual ? 'btn-primary' : 'btn-outline-primary'}`;
            btnPagina.textContent = i;
            btnPagina.addEventListener('click', () => {
                paginaAtual = i;
                atualizarListaLembretes();
            });
            navEl.appendChild(btnPagina);
        }
        
        // Botão próximo
        const btnProximo = document.createElement('button');
        btnProximo.className = 'btn btn-sm btn-outline-primary';
        btnProximo.innerHTML = '<i class="fas fa-chevron-right"></i>';
        btnProximo.disabled = paginaAtual === totalPaginas;
        btnProximo.addEventListener('click', () => {
            if (paginaAtual < totalPaginas) {
                paginaAtual++;
                atualizarListaLembretes();
            }
        });
        navEl.appendChild(btnProximo);
        
        paginacaoContainer.appendChild(navEl);
    }
    
    // Função para filtrar lembretes
    function filtrarLembretes() {
        paginaAtual = 1;
        atualizarListaLembretes();
    }
    
    // Função para verificar lembretes vencidos
    function verificarLembretesVencidos() {
        const agora = new Date();
        
        lembretes.forEach(lembrete => {
            if (lembrete.status === 'Pendente') {
                const dataHoraLembrete = new Date(lembrete.dataHora);
                const minutosAntecedencia = lembrete.notificar;
                const dataNotificacao = new Date(dataHoraLembrete.getTime() - (minutosAntecedencia * 60000));
                
                if (agora >= dataNotificacao && agora <= dataHoraLembrete) {
                    // Verificar se já foi notificado
                    if (!lembrete.notificado) {
                        mostrarNotificacao(lembrete);
                        lembrete.notificado = true;
                        salvarNoLocalStorage();
                    }
                }
            }
        });
    }
    
    // Função para mostrar notificação
    function mostrarNotificacao(lembrete) {
        if (Notification.permission === 'granted') {
            new Notification(`Lembrete: ${lembrete.titulo}`, {
                body: lembrete.descricao || 'Você tem um lembrete agendado.',
                icon: 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.7.2/icons/bell.svg'
            });
        } else {
            mostrarMensagem(`Lembrete: ${lembrete.titulo}`, 'success');
        }
    }
    
    // Função para formatar data e hora
    function formatarDataHora(data) {
        return data.toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    
    // Função para carregar do localStorage
    function carregarDoLocalStorage() {
        const lembretesArmazenados = localStorage.getItem('lembretes');
        if (lembretesArmazenados) {
            lembretes = JSON.parse(lembretesArmazenados);
            // Converter strings de data de volta para objetos Date
            lembretes.forEach(lembrete => {
                lembrete.dataHora = new Date(lembrete.dataHora);
                lembrete.dataCriacao = new Date(lembrete.dataCriacao);
                lembrete.dataModificacao = new Date(lembrete.dataModificacao);
            });
        } else {
            // Dados de exemplo
            lembretes = [
                {
                    id: 1,
                    titulo: 'Revisar documentos de auditoria',
                    categoria: 'Auditoria',
                    descricao: 'Verificar todos os documentos antes da auditoria mensal',
                    dataHora: new Date(Date.now() + 24 * 60 * 60 * 1000), // Amanhã
                    prioridade: 'Alta',
                    repetir: 'Mensal',
                    notificar: 60,
                    status: 'Pendente',
                    dataCriacao: new Date(),
                    dataModificacao: new Date()
                },
                {
                    id: 2,
                    titulo: 'Reunião de equipe',
                    categoria: 'Reunião',
                    descricao: 'Reunião semanal da equipe de qualidade',
                    dataHora: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // Depois de amanhã
                    prioridade: 'Normal',
                    repetir: 'Semanal',
                    notificar: 30,
                    status: 'Pendente',
                    dataCriacao: new Date(),
                    dataModificacao: new Date()
                }
            ];
            salvarNoLocalStorage();
        }
        
        atualizarEstatisticas();
        atualizarListaLembretes();
    }
    
    // Função para salvar no localStorage
    function salvarNoLocalStorage() {
        localStorage.setItem('lembretes', JSON.stringify(lembretes));
    }
    
    // Solicitar permissão para notificações
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
    
    // Funções globais
    window.marcarConcluido = function(id) {
        const lembrete = lembretes.find(l => l.id === id);
        if (lembrete) {
            lembrete.status = 'Concluído';
            lembrete.dataModificacao = new Date();
            salvarNoLocalStorage();
            atualizarEstatisticas();
            atualizarListaLembretes();
            mostrarMensagem('Lembrete marcado como concluído!', 'success');
        }
    };
    
    window.editarLembrete = function(id) {
        const lembrete = lembretes.find(l => l.id === id);
        if (lembrete) {
            editingId = id;
            titulo.value = lembrete.titulo;
            categoria.value = lembrete.categoria;
            descricao.value = lembrete.descricao;
            
            const dataHora = new Date(lembrete.dataHora);
            dataLembrete.value = dataHora.toISOString().split('T')[0];
            horaLembrete.value = dataHora.toTimeString().slice(0, 5);
            
            prioridade.value = lembrete.prioridade;
            repetir.value = lembrete.repetir;
            notificar.value = lembrete.notificar;
            
            // Scroll para o formulário
            form.scrollIntoView({ behavior: 'smooth' });
        }
    };
    
    window.verDetalhes = function(id) {
        const lembrete = lembretes.find(l => l.id === id);
        if (lembrete) {
            const modalBody = document.getElementById('modalDetalhesBody');
            modalBody.innerHTML = `
                <div class="row">
                    <div class="col-md-6">
                        <strong>Título:</strong><br>
                        ${lembrete.titulo}
                    </div>
                    <div class="col-md-6">
                        <strong>Categoria:</strong><br>
                        <span class="badge bg-light text-dark">${lembrete.categoria}</span>
                    </div>
                </div>
                <hr>
                <div class="row">
                    <div class="col-md-6">
                        <strong>Data/Hora:</strong><br>
                        ${formatarDataHora(new Date(lembrete.dataHora))}
                    </div>
                    <div class="col-md-6">
                        <strong>Prioridade:</strong><br>
                        <span class="badge ${lembrete.prioridade === 'Urgente' ? 'bg-danger' : lembrete.prioridade === 'Alta' ? 'bg-warning' : lembrete.prioridade === 'Normal' ? 'bg-primary' : 'bg-success'}">${lembrete.prioridade}</span>
                    </div>
                </div>
                <hr>
                <div class="row">
                    <div class="col-md-6">
                        <strong>Status:</strong><br>
                        <span class="badge ${lembrete.status === 'Concluído' ? 'bg-success' : 'bg-warning'}">${lembrete.status}</span>
                    </div>
                    <div class="col-md-6">
                        <strong>Repetir:</strong><br>
                        ${lembrete.repetir}
                    </div>
                </div>
                ${lembrete.descricao ? `
                    <hr>
                    <div>
                        <strong>Descrição:</strong><br>
                        ${lembrete.descricao}
                    </div>
                ` : ''}
                <hr>
                <div class="row">
                    <div class="col-md-6">
                        <strong>Criado em:</strong><br>
                        <small class="text-muted">${formatarDataHora(new Date(lembrete.dataCriacao))}</small>
                    </div>
                    <div class="col-md-6">
                        <strong>Modificado em:</strong><br>
                        <small class="text-muted">${formatarDataHora(new Date(lembrete.dataModificacao))}</small>
                    </div>
                </div>
            `;
            
            const modal = new bootstrap.Modal(document.getElementById('modalDetalhes'));
            modal.show();
        }
    };
    
    window.excluirLembrete = function(id) {
        if (confirm('Tem certeza que deseja excluir este lembrete?')) {
            lembretes = lembretes.filter(l => l.id !== id);
            salvarNoLocalStorage();
            atualizarEstatisticas();
            atualizarListaLembretes();
            mostrarMensagem('Lembrete excluído com sucesso!', 'success');
        }
    };
});
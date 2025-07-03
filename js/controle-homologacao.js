// Controle de Homologação - Funcionalidades

document.addEventListener('DOMContentLoaded', function() {
    // Elementos do formulário
    const form = document.getElementById('formRegistroHomologacao');
    const numeroNF = document.getElementById('numeroNF');
    const codReferencia = document.getElementById('codReferencia');
    const tipo = document.getElementById('tipo');
    const outroTipo = document.getElementById('outroTipo');
    const campoOutroTipo = document.getElementById('campoOutroTipo');
    const dataRecebimento = document.getElementById('dataRecebimento');
    const dataInicioHomologacao = document.getElementById('dataInicioHomologacao');
    const dataFinalHomologacao = document.getElementById('dataFinalHomologacao');
    const fornecedor = document.getElementById('fornecedor');
    const responsavel = document.getElementById('responsavel');
    const situacaoHomologacao = document.getElementById('situacaoHomologacao');
    const observacaoResultado = document.getElementById('observacaoResultado');
    
    // Botões
    const btnLimpar = document.getElementById('btnLimpar');
    const btnSalvar = document.getElementById('btnSalvar');
    const btnImportar = document.getElementById('btnImportar');
    const btnExportar = document.getElementById('btnExportar');
    const buscarHomologacao = document.getElementById('buscarHomologacao');
    
    // Modais
    const modalEdicao = new bootstrap.Modal(document.getElementById('modalEdicao'));
    const modalExclusao = new bootstrap.Modal(document.getElementById('modalExclusao'));
    const modalDetalhes = new bootstrap.Modal(document.getElementById('modalDetalhes'));
    
    // Modal de mensagens
    const messageModal = document.getElementById('messageModal');
    const messageText = document.getElementById('messageText');
    const closeMessage = document.getElementById('closeMessage');
    
    // Arrays para armazenar dados
    let homologacoes = [];
    let fornecedores = [];
    let editingId = null;
    let deletingId = null;
    
    // Paginação
    const itensPorPagina = 10;
    let paginaAtual = 1;
    let totalPaginas = 1;
    
    // Definir data máxima como hoje
    const hoje = new Date().toISOString().split('T')[0];
    dataRecebimento.max = hoje;
    dataRecebimento.value = hoje;
    dataInicioHomologacao.value = hoje;
    
    // Carregar dados iniciais
    carregarDados();
    
    // Event listeners
    tipo.addEventListener('change', toggleOutroTipo);
    btnLimpar.addEventListener('click', limparFormulario);
    btnSalvar.addEventListener('click', salvarHomologacao);
    btnImportar.addEventListener('click', () => alert('Funcionalidade de importação será implementada em breve.'));
    btnExportar.addEventListener('click', () => alert('Funcionalidade de exportação será implementada em breve.'));
    buscarHomologacao.addEventListener('input', filtrarTabela);
    
    if (closeMessage) {
        closeMessage.addEventListener('click', fecharMensagem);
    }
    
    // Event listeners dos modais
    document.getElementById('btnSalvarEdicao').addEventListener('click', salvarEdicao);
    document.getElementById('btnConfirmarExclusao').addEventListener('click', confirmarExclusao);
    
    // Função para mostrar/esconder campo "Outro Tipo"
    function toggleOutroTipo() {
        if (tipo.value === 'outro') {
            campoOutroTipo.style.display = 'block';
            outroTipo.required = true;
        } else {
            campoOutroTipo.style.display = 'none';
            outroTipo.required = false;
            outroTipo.value = '';
        }
    }
    
    // Função para carregar dados iniciais
    function carregarDados() {
        // Carregar fornecedores do localStorage
        const fornecedoresArmazenados = localStorage.getItem('fornecedores');
        if (fornecedoresArmazenados) {
            fornecedores = JSON.parse(fornecedoresArmazenados);
        } else {
            // Fornecedores padrão
            fornecedores = [
                {
                    id: 1,
                    nome: 'Fornecedor ABC Ltda',
                    linkRMA: 'https://rma.fornecedorabc.com.br',
                    contato: '(11) 99999-9999 - João Silva',
                    observacao: 'Fornecedor principal de toners compatíveis',
                    dataCadastro: new Date().toISOString()
                },
                {
                    id: 2,
                    nome: 'Suprimentos XYZ S.A.',
                    linkRMA: 'https://garantia.suprimentosxyz.com',
                    contato: 'suporte@suprimentosxyz.com',
                    observacao: 'Especializado em toners originais',
                    dataCadastro: new Date().toISOString()
                }
            ];
        }
        
        // Carregar homologações registradas
        const homologacoesArmazenadas = localStorage.getItem('homologacoes');
        if (homologacoesArmazenadas) {
            homologacoes = JSON.parse(homologacoesArmazenadas);
        } else {
            // Dados de exemplo
            homologacoes = [
                {
                    id: 1,
                    numeroNF: '123456',
                    codReferencia: 'HP CF258A',
                    tipo: 'toner',
                    outroTipo: '',
                    dataRecebimento: '2024-01-15',
                    dataInicioHomologacao: '2024-01-16',
                    dataFinalHomologacao: '2024-01-30',
                    fornecedor: 'Fornecedor ABC Ltda',
                    responsavel: 'João Silva',
                    situacaoHomologacao: 'Aprovada',
                    observacaoResultado: 'Produto aprovado após testes de qualidade. Atende aos requisitos técnicos.',
                    dataRegistro: new Date().toISOString()
                },
                {
                    id: 2,
                    numeroNF: '789012',
                    codReferencia: 'Brother TN-217C',
                    tipo: 'toner',
                    outroTipo: '',
                    dataRecebimento: '2024-01-20',
                    dataInicioHomologacao: '2024-01-22',
                    dataFinalHomologacao: '',
                    fornecedor: 'Suprimentos XYZ S.A.',
                    responsavel: 'Maria Santos',
                    situacaoHomologacao: 'Em andamento',
                    observacaoResultado: 'Testes em andamento. Aguardando resultados finais.',
                    dataRegistro: new Date().toISOString()
                }
            ];
            salvarHomologacoes();
        }
        
        // Preencher selects
        preencherSelects();
        atualizarTabela();
    }
    
    // Função para preencher os selects
    function preencherSelects() {
        // Preencher fornecedores
        fornecedor.innerHTML = '<option value="">Selecione o fornecedor</option>';
        fornecedores.forEach(f => {
            const option = document.createElement('option');
            option.value = f.nome;
            option.textContent = f.nome;
            fornecedor.appendChild(option);
        });
    }
    
    // Função para validar formulário
    function validarFormulario() {
        let valido = true;
        const campos = [numeroNF, codReferencia, tipo, dataRecebimento, dataInicioHomologacao, 
                       fornecedor, responsavel, situacaoHomologacao];
        
        campos.forEach(campo => {
            if (!campo.value.trim()) {
                campo.classList.add('is-invalid');
                valido = false;
            } else {
                campo.classList.remove('is-invalid');
            }
        });
        
        // Validar campo "Outro Tipo" se necessário
        if (tipo.value === 'outro' && !outroTipo.value.trim()) {
            outroTipo.classList.add('is-invalid');
            valido = false;
        } else {
            outroTipo.classList.remove('is-invalid');
        }
        
        // Validar datas
        if (dataInicioHomologacao.value && dataRecebimento.value) {
            const dataInicio = new Date(dataInicioHomologacao.value);
            const dataReceb = new Date(dataRecebimento.value);
            
            if (dataInicio < dataReceb) {
                dataInicioHomologacao.classList.add('is-invalid');
                valido = false;
            }
        }
        
        if (dataFinalHomologacao.value && dataInicioHomologacao.value) {
            const dataFinal = new Date(dataFinalHomologacao.value);
            const dataInicio = new Date(dataInicioHomologacao.value);
            
            if (dataFinal < dataInicio) {
                dataFinalHomologacao.classList.add('is-invalid');
                valido = false;
            }
        }
        
        return valido;
    }
    
    // Função para mostrar mensagem
    function mostrarMensagem(texto, tipo) {
        if (!messageModal || !messageText) {
            alert(texto);
            return;
        }
        
        messageText.textContent = texto;
        messageModal.classList.remove('success', 'error');
        messageModal.classList.add(tipo);
        
        const messageIcon = messageModal.querySelector('.message-icon i');
        if (messageIcon) {
            if (tipo === 'success') {
                messageIcon.className = 'fas fa-check-circle';
            } else {
                messageIcon.className = 'fas fa-exclamation-circle';
            }
        }
        
        messageModal.classList.add('show');
        
        setTimeout(() => {
            fecharMensagem();
        }, 5000);
    }
    
    // Função para fechar mensagem
    function fecharMensagem() {
        if (messageModal) {
            messageModal.classList.remove('show');
        }
    }
    
    // Função para salvar homologação
    function salvarHomologacao() {
        if (!validarFormulario()) {
            mostrarMensagem('Por favor, preencha todos os campos obrigatórios corretamente.', 'error');
            return;
        }
        
        const homologacao = {
            id: Date.now(),
            numeroNF: numeroNF.value.trim(),
            codReferencia: codReferencia.value.trim(),
            tipo: tipo.value,
            outroTipo: tipo.value === 'outro' ? outroTipo.value.trim() : '',
            dataRecebimento: dataRecebimento.value,
            dataInicioHomologacao: dataInicioHomologacao.value,
            dataFinalHomologacao: dataFinalHomologacao.value,
            fornecedor: fornecedor.value,
            responsavel: responsavel.value.trim(),
            situacaoHomologacao: situacaoHomologacao.value,
            observacaoResultado: observacaoResultado.value.trim(),
            dataRegistro: new Date().toISOString()
        };
        
        homologacoes.push(homologacao);
        salvarHomologacoes();
        atualizarTabela();
        
        mostrarMensagem('Homologação registrada com sucesso!', 'success');
        limparFormulario();
    }
    
    // Função para limpar o formulário
    function limparFormulario() {
        form.reset();
        dataRecebimento.value = hoje;
        dataInicioHomologacao.value = hoje;
        campoOutroTipo.style.display = 'none';
        outroTipo.required = false;
        
        // Limpar todos os erros
        form.querySelectorAll('.is-invalid').forEach(campo => {
            campo.classList.remove('is-invalid');
        });
    }
    
    // Função para salvar homologações no localStorage
    function salvarHomologacoes() {
        localStorage.setItem('homologacoes', JSON.stringify(homologacoes));
    }
    
    // Função para atualizar tabela
    function atualizarTabela() {
        const tbody = document.getElementById('tabelaHomologacoes');
        tbody.innerHTML = '';
        
        let homologacoesFiltradas = aplicarFiltros();
        
        // Calcular paginação
        totalPaginas = Math.ceil(homologacoesFiltradas.length / itensPorPagina);
        if (totalPaginas === 0) totalPaginas = 1;
        
        if (paginaAtual > totalPaginas) {
            paginaAtual = totalPaginas;
        }
        
        const inicio = (paginaAtual - 1) * itensPorPagina;
        const fim = Math.min(inicio + itensPorPagina, homologacoesFiltradas.length);
        
        for (let i = inicio; i < fim; i++) {
            const homologacao = homologacoesFiltradas[i];
            const tr = document.createElement('tr');
            
            // Definir classe do status
            let statusClass = 'bg-secondary';
            switch(homologacao.situacaoHomologacao.toLowerCase()) {
                case 'aprovada':
                    statusClass = 'bg-success';
                    break;
                case 'reprovada':
                    statusClass = 'bg-danger';
                    break;
                case 'em andamento':
                    statusClass = 'bg-warning';
                    break;
            }
            
            // Determinar tipo para exibição
            let tipoExibicao = homologacao.tipo;
            if (homologacao.tipo === 'outro' && homologacao.outroTipo) {
                tipoExibicao = homologacao.outroTipo;
            }
            
            tr.innerHTML = `
                <td>${homologacao.numeroNF}</td>
                <td>${homologacao.codReferencia}</td>
                <td><span class="badge bg-info">${tipoExibicao}</span></td>
                <td>${homologacao.fornecedor}</td>
                <td>
                    <span class="badge ${statusClass}">
                        ${homologacao.situacaoHomologacao}
                    </span>
                </td>
                <td>${new Date(homologacao.dataInicioHomologacao).toLocaleDateString('pt-BR')}</td>
                <td>${homologacao.dataFinalHomologacao ? new Date(homologacao.dataFinalHomologacao).toLocaleDateString('pt-BR') : '-'}</td>
                <td>
                    <button class="btn btn-sm btn-info me-1" onclick="verDetalhes(${homologacao.id})" title="Ver Detalhes">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-warning me-1" onclick="editarHomologacao(${homologacao.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="excluirHomologacao(${homologacao.id})" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            tbody.appendChild(tr);
        }
        
        atualizarControlesPaginacao(homologacoesFiltradas.length);
    }
    
    // Função para aplicar filtros
    function aplicarFiltros() {
        let filtradas = [...homologacoes];
        
        // Filtro de busca
        const termo = buscarHomologacao.value.toLowerCase();
        if (termo) {
            filtradas = filtradas.filter(h => 
                h.numeroNF.toLowerCase().includes(termo) ||
                h.codReferencia.toLowerCase().includes(termo) ||
                h.fornecedor.toLowerCase().includes(termo) ||
                h.responsavel.toLowerCase().includes(termo) ||
                h.situacaoHomologacao.toLowerCase().includes(termo)
            );
        }
        
        return filtradas;
    }
    
    // Função para atualizar controles de paginação
    function atualizarControlesPaginacao(totalItens) {
        const paginacaoContainer = document.getElementById('paginacao');
        if (!paginacaoContainer) return;
        
        paginacaoContainer.innerHTML = '';
        
        if (totalItens === 0) return;
        
        const infoEl = document.createElement('div');
        infoEl.className = 'pagination-info';
        const inicio = ((paginaAtual - 1) * itensPorPagina) + 1;
        const fim = Math.min(paginaAtual * itensPorPagina, totalItens);
        infoEl.textContent = `Mostrando ${inicio}-${fim} de ${totalItens} homologações`;
        paginacaoContainer.appendChild(infoEl);
        
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
                atualizarTabela();
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
                atualizarTabela();
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
                atualizarTabela();
            }
        });
        navEl.appendChild(btnProximo);
        
        paginacaoContainer.appendChild(navEl);
    }
    
    // Função para filtrar tabela
    function filtrarTabela() {
        paginaAtual = 1;
        atualizarTabela();
    }
    
    // Função para salvar edição
    function salvarEdicao() {
        const editNumeroNF = document.getElementById('editNumeroNF');
        const editCodReferencia = document.getElementById('editCodReferencia');
        const editResponsavel = document.getElementById('editResponsavel');
        const editSituacaoHomologacao = document.getElementById('editSituacaoHomologacao');
        const editDataFinalHomologacao = document.getElementById('editDataFinalHomologacao');
        const editObservacaoResultado = document.getElementById('editObservacaoResultado');
        
        if (!editNumeroNF.value.trim() || !editCodReferencia.value.trim() || 
            !editResponsavel.value.trim() || !editSituacaoHomologacao.value) {
            mostrarMensagem('Por favor, preencha todos os campos obrigatórios.', 'error');
            return;
        }
        
        const homologacao = homologacoes.find(h => h.id === editingId);
        if (homologacao) {
            homologacao.numeroNF = editNumeroNF.value.trim();
            homologacao.codReferencia = editCodReferencia.value.trim();
            homologacao.responsavel = editResponsavel.value.trim();
            homologacao.situacaoHomologacao = editSituacaoHomologacao.value;
            homologacao.dataFinalHomologacao = editDataFinalHomologacao.value;
            homologacao.observacaoResultado = editObservacaoResultado.value.trim();
            
            salvarHomologacoes();
            atualizarTabela();
            modalEdicao.hide();
            mostrarMensagem('Homologação atualizada com sucesso!', 'success');
        }
    }
    
    // Função para confirmar exclusão
    function confirmarExclusao() {
        homologacoes = homologacoes.filter(h => h.id !== deletingId);
        salvarHomologacoes();
        atualizarTabela();
        modalExclusao.hide();
        mostrarMensagem('Homologação excluída com sucesso!', 'success');
    }
    
    // Funções globais para ações da tabela
    window.verDetalhes = function(id) {
        const homologacao = homologacoes.find(h => h.id === id);
        if (homologacao) {
            const modalBody = document.getElementById('modalDetalhesBody');
            
            // Determinar tipo para exibição
            let tipoExibicao = homologacao.tipo;
            if (homologacao.tipo === 'outro' && homologacao.outroTipo) {
                tipoExibicao = homologacao.outroTipo;
            }
            
            modalBody.innerHTML = `
                <div class="row">
                    <div class="col-md-6">
                        <h6>Informações Básicas</h6>
                        <table class="table table-sm">
                            <tr><td><strong>Número da NF:</strong></td><td>${homologacao.numeroNF}</td></tr>
                            <tr><td><strong>Cód. Referência:</strong></td><td>${homologacao.codReferencia}</td></tr>
                            <tr><td><strong>Tipo:</strong></td><td>${tipoExibicao}</td></tr>
                            <tr><td><strong>Fornecedor:</strong></td><td>${homologacao.fornecedor}</td></tr>
                        </table>
                    </div>
                    <div class="col-md-6">
                        <h6>Datas e Status</h6>
                        <table class="table table-sm">
                            <tr><td><strong>Data Recebimento:</strong></td><td>${new Date(homologacao.dataRecebimento).toLocaleDateString('pt-BR')}</td></tr>
                            <tr><td><strong>Início Homologação:</strong></td><td>${new Date(homologacao.dataInicioHomologacao).toLocaleDateString('pt-BR')}</td></tr>
                            <tr><td><strong>Data Final:</strong></td><td>${homologacao.dataFinalHomologacao ? new Date(homologacao.dataFinalHomologacao).toLocaleDateString('pt-BR') : 'Não definida'}</td></tr>
                            <tr><td><strong>Situação:</strong></td><td>
                                <span class="badge ${homologacao.situacaoHomologacao === 'Aprovada' ? 'bg-success' : 
                                    homologacao.situacaoHomologacao === 'Reprovada' ? 'bg-danger' : 'bg-warning'}">
                                    ${homologacao.situacaoHomologacao}
                                </span>
                            </td></tr>
                        </table>
                    </div>
                </div>
                <div class="row">
                    <div class="col-12">
                        <h6>Responsável e Observações</h6>
                        <p><strong>Responsável:</strong> ${homologacao.responsavel}</p>
                        <p><strong>Observação do Resultado:</strong></p>
                        <div class="border p-3 bg-light rounded">
                            ${homologacao.observacaoResultado || 'Nenhuma observação registrada.'}
                        </div>
                    </div>
                </div>
            `;
            
            modalDetalhes.show();
        }
    };
    
    window.editarHomologacao = function(id) {
        const homologacao = homologacoes.find(h => h.id === id);
        if (homologacao) {
            editingId = id;
            
            document.getElementById('editNumeroNF').value = homologacao.numeroNF;
            document.getElementById('editCodReferencia').value = homologacao.codReferencia;
            document.getElementById('editResponsavel').value = homologacao.responsavel;
            document.getElementById('editSituacaoHomologacao').value = homologacao.situacaoHomologacao;
            document.getElementById('editDataFinalHomologacao').value = homologacao.dataFinalHomologacao;
            document.getElementById('editObservacaoResultado').value = homologacao.observacaoResultado;
            
            modalEdicao.show();
        }
    };
    
    window.excluirHomologacao = function(id) {
        deletingId = id;
        modalExclusao.show();
    };
});
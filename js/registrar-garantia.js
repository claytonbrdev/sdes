// Registrar Garantia - Funcionalidades

document.addEventListener('DOMContentLoaded', function() {
    // Elementos do formulário
    const form = document.getElementById('formRegistroGarantia');
    const dataRecebimento = document.getElementById('dataRecebimento');
    const fornecedor = document.getElementById('fornecedor');
    const referenciaProduto = document.getElementById('referenciaProduto');
    const numeroNF = document.getElementById('numeroNF');
    const quantidadeRecebida = document.getElementById('quantidadeRecebida');
    const quantidadeTestada = document.getElementById('quantidadeTestada');
    const quantidadeDefeito = document.getElementById('quantidadeDefeito');
    const tipoDefeito = document.getElementById('tipoDefeito');
    const statusGarantia = document.getElementById('statusGarantia');
    const responsavel = document.getElementById('responsavel');
    const observacoes = document.getElementById('observacoes');
    
    // Elementos de cálculo
    const percentualDefeito = document.getElementById('percentualDefeito');
    
    // Botões
    const btnLimpar = document.getElementById('btnLimpar');
    const btnSalvar = document.getElementById('btnSalvar');
    const btnNovoFornecedor = document.getElementById('btnNovoFornecedor');
    const btnNovoDefeito = document.getElementById('btnNovoDefeito');
    const btnImportar = document.getElementById('btnImportar');
    const btnExportar = document.getElementById('btnExportar');
    const buscarGarantia = document.getElementById('buscarGarantia');
    
    // Modais
    const modalNovoFornecedor = new bootstrap.Modal(document.getElementById('modalNovoFornecedor'));
    const modalNovoDefeito = new bootstrap.Modal(document.getElementById('modalNovoDefeito'));
    const modalEdicao = new bootstrap.Modal(document.getElementById('modalEdicao'));
    const modalExclusao = new bootstrap.Modal(document.getElementById('modalExclusao'));
    
    // Modal de mensagens
    const messageModal = document.getElementById('messageModal');
    const messageText = document.getElementById('messageText');
    const closeMessage = document.getElementById('closeMessage');
    
    // Arrays para armazenar dados
    let garantias = [];
    let fornecedores = [];
    let tiposDefeito = [];
    let statusGarantias = [];
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
    
    // Carregar dados iniciais
    carregarDados();
    
    // Event listeners para cálculo automático
    quantidadeTestada.addEventListener('input', calcularPercentualDefeito);
    quantidadeDefeito.addEventListener('input', calcularPercentualDefeito);
    
    // Event listeners para botões
    btnLimpar.addEventListener('click', limparFormulario);
    btnSalvar.addEventListener('click', salvarGarantia);
    btnNovoFornecedor.addEventListener('click', () => modalNovoFornecedor.show());
    btnNovoDefeito.addEventListener('click', () => modalNovoDefeito.show());
    btnImportar.addEventListener('click', () => alert('Funcionalidade de importação será implementada em breve.'));
    btnExportar.addEventListener('click', () => alert('Funcionalidade de exportação será implementada em breve.'));
    buscarGarantia.addEventListener('input', filtrarTabela);
    
    if (closeMessage) {
        closeMessage.addEventListener('click', fecharMensagem);
    }
    
    // Event listeners dos modais
    document.getElementById('btnSalvarFornecedor').addEventListener('click', salvarNovoFornecedor);
    document.getElementById('btnSalvarDefeito').addEventListener('click', salvarNovoDefeito);
    document.getElementById('btnSalvarEdicao').addEventListener('click', salvarEdicao);
    document.getElementById('btnConfirmarExclusao').addEventListener('click', confirmarExclusao);
    
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
            localStorage.setItem('fornecedores', JSON.stringify(fornecedores));
        }
        
        // Carregar tipos de defeito do localStorage
        const tiposArmazenados = localStorage.getItem('tiposDefeito');
        if (tiposArmazenados) {
            tiposDefeito = JSON.parse(tiposArmazenados);
        } else {
            // Tipos de defeito padrão
            tiposDefeito = [
                'Vazamento de toner',
                'Impressão com falhas',
                'Não reconhecido pela impressora',
                'Qualidade de impressão ruim',
                'Toner vazio prematuramente',
                'Defeito no chip',
                'Peças quebradas',
                'Outros'
            ];
            localStorage.setItem('tiposDefeito', JSON.stringify(tiposDefeito));
        }
        
        // Carregar status de garantia do localStorage
        const statusArmazenados = localStorage.getItem('statusGarantia');
        if (statusArmazenados) {
            const statusData = JSON.parse(statusArmazenados);
            statusGarantias = statusData.map(s => s.status);
        } else {
            // Status padrão
            statusGarantias = ['Aprovado', 'Pendente', 'Rejeitado', 'Em Análise'];
        }
        
        // Carregar garantias registradas
        const garantiasArmazenadas = localStorage.getItem('garantiasRegistradas');
        if (garantiasArmazenadas) {
            garantias = JSON.parse(garantiasArmazenadas);
        } else {
            // Dados de exemplo
            garantias = [
                {
                    id: 1,
                    dataRecebimento: '2024-01-15',
                    fornecedor: 'Fornecedor ABC Ltda',
                    referenciaProduto: 'HP CF258A',
                    numeroNF: '123456',
                    quantidadeRecebida: 100,
                    quantidadeTestada: 95,
                    quantidadeDefeito: 5,
                    percentualDefeito: 5.26,
                    tipoDefeito: 'Vazamento de toner',
                    statusGarantia: 'Aprovado',
                    responsavel: 'João Silva',
                    observacoes: 'Lote com defeito de fabricação',
                    dataRegistro: new Date().toISOString()
                },
                {
                    id: 2,
                    dataRecebimento: '2024-01-20',
                    fornecedor: 'Suprimentos XYZ S.A.',
                    referenciaProduto: 'Brother TN-217C',
                    numeroNF: '789012',
                    quantidadeRecebida: 50,
                    quantidadeTestada: 48,
                    quantidadeDefeito: 3,
                    percentualDefeito: 6.25,
                    tipoDefeito: 'Impressão com falhas',
                    statusGarantia: 'Pendente',
                    responsavel: 'Maria Santos',
                    observacoes: 'Aguardando análise do fornecedor',
                    dataRegistro: new Date().toISOString()
                }
            ];
            salvarGarantias();
        }
        
        // Preencher selects
        preencherSelects();
        atualizarTabela();
    }
    
    // Função para preencher os selects
    function preencherSelects() {
        // Preencher fornecedores
        const selectsFornecedores = [fornecedor, document.getElementById('editFornecedor')];
        selectsFornecedores.forEach(select => {
            if (select) {
                select.innerHTML = '<option value="">Selecione o fornecedor</option>';
                fornecedores.forEach(f => {
                    const option = document.createElement('option');
                    option.value = f.nome;
                    option.textContent = f.nome;
                    select.appendChild(option);
                });
            }
        });
        
        // Preencher tipos de defeito
        tipoDefeito.innerHTML = '<option value="">Selecione o tipo de defeito</option>';
        tiposDefeito.forEach(tipo => {
            const option = document.createElement('option');
            option.value = tipo;
            option.textContent = tipo;
            tipoDefeito.appendChild(option);
        });
        
        // Preencher status de garantia
        const selectsStatus = [statusGarantia, document.getElementById('editStatusGarantia')];
        selectsStatus.forEach(select => {
            if (select) {
                select.innerHTML = '<option value="">Selecione o status</option>';
                statusGarantias.forEach(status => {
                    const option = document.createElement('option');
                    option.value = status;
                    option.textContent = status;
                    select.appendChild(option);
                });
            }
        });
    }
    
    // Função para calcular percentual de defeito automaticamente
    function calcularPercentualDefeito() {
        const testada = parseFloat(quantidadeTestada.value) || 0;
        const defeito = parseFloat(quantidadeDefeito.value) || 0;
        
        if (testada > 0 && defeito >= 0) {
            const percentual = (defeito / testada) * 100;
            percentualDefeito.textContent = percentual.toFixed(2) + '%';
            
            // Validar se quantidade com defeito não é maior que testada
            if (defeito > testada) {
                quantidadeDefeito.classList.add('is-invalid');
                percentualDefeito.textContent = '0.00%';
            } else {
                quantidadeDefeito.classList.remove('is-invalid');
            }
        } else {
            percentualDefeito.textContent = '0.00%';
        }
    }
    
    // Função para validar formulário
    function validarFormulario() {
        let valido = true;
        const campos = [dataRecebimento, fornecedor, referenciaProduto, numeroNF, 
                       quantidadeRecebida, quantidadeTestada, quantidadeDefeito, 
                       tipoDefeito, statusGarantia, responsavel];
        
        campos.forEach(campo => {
            if (!campo.value.trim()) {
                campo.classList.add('is-invalid');
                valido = false;
            } else {
                campo.classList.remove('is-invalid');
            }
        });
        
        // Validações específicas
        if (parseFloat(quantidadeDefeito.value) > parseFloat(quantidadeTestada.value)) {
            quantidadeDefeito.classList.add('is-invalid');
            valido = false;
        }
        
        if (parseFloat(quantidadeTestada.value) > parseFloat(quantidadeRecebida.value)) {
            quantidadeTestada.classList.add('is-invalid');
            valido = false;
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
    
    // Função para salvar novo fornecedor
    function salvarNovoFornecedor() {
        const novoNome = document.getElementById('novoNomeFornecedor').value.trim();
        const novoContato = document.getElementById('novoContatoFornecedor').value.trim();
        
        if (!novoNome) {
            alert('Por favor, digite o nome do fornecedor.');
            return;
        }
        
        if (fornecedores.find(f => f.nome === novoNome)) {
            alert('Este fornecedor já existe.');
            return;
        }
        
        const novoFornecedor = {
            id: Date.now(),
            nome: novoNome,
            linkRMA: '',
            contato: novoContato,
            observacao: '',
            dataCadastro: new Date().toISOString()
        };
        
        fornecedores.push(novoFornecedor);
        localStorage.setItem('fornecedores', JSON.stringify(fornecedores));
        
        // Atualizar select
        const option = document.createElement('option');
        option.value = novoNome;
        option.textContent = novoNome;
        fornecedor.appendChild(option);
        
        // Selecionar o novo fornecedor
        fornecedor.value = novoNome;
        
        modalNovoFornecedor.hide();
        document.getElementById('novoNomeFornecedor').value = '';
        document.getElementById('novoContatoFornecedor').value = '';
        mostrarMensagem('Novo fornecedor cadastrado com sucesso!', 'success');
    }
    
    // Função para salvar garantia
    function salvarGarantia() {
        if (!validarFormulario()) {
            mostrarMensagem('Por favor, preencha todos os campos obrigatórios corretamente.', 'error');
            return;
        }
        
        const garantia = {
            id: Date.now(),
            dataRecebimento: dataRecebimento.value,
            fornecedor: fornecedor.value,
            referenciaProduto: referenciaProduto.value.trim(),
            numeroNF: numeroNF.value.trim(),
            quantidadeRecebida: parseInt(quantidadeRecebida.value),
            quantidadeTestada: parseInt(quantidadeTestada.value),
            quantidadeDefeito: parseInt(quantidadeDefeito.value),
            percentualDefeito: parseFloat(percentualDefeito.textContent.replace('%', '')),
            tipoDefeito: tipoDefeito.value,
            statusGarantia: statusGarantia.value,
            responsavel: responsavel.value.trim(),
            observacoes: observacoes.value.trim(),
            dataRegistro: new Date().toISOString(),
            // Simular arquivos anexados
            nfCompras: document.getElementById('nfCompras').files[0]?.name || null,
            nfSimplesRemessa: document.getElementById('nfSimplesRemessa').files[0]?.name || null,
            nfDevolucao: document.getElementById('nfDevolucao').files[0]?.name || null
        };
        
        garantias.push(garantia);
        salvarGarantias();
        atualizarTabela();
        
        mostrarMensagem('Garantia registrada com sucesso!', 'success');
        limparFormulario();
    }
    
    // Função para limpar o formulário
    function limparFormulario() {
        form.reset();
        dataRecebimento.value = hoje;
        percentualDefeito.textContent = '0.00%';
        
        // Limpar todos os erros
        form.querySelectorAll('.is-invalid').forEach(campo => {
            campo.classList.remove('is-invalid');
        });
    }
    
    // Função para salvar novo tipo de defeito
    function salvarNovoDefeito() {
        const novoTipo = document.getElementById('novoTipoDefeito').value.trim();
        
        if (!novoTipo) {
            alert('Por favor, digite a descrição do defeito.');
            return;
        }
        
        if (tiposDefeito.includes(novoTipo)) {
            alert('Este tipo de defeito já existe.');
            return;
        }
        
        tiposDefeito.push(novoTipo);
        localStorage.setItem('tiposDefeito', JSON.stringify(tiposDefeito));
        
        // Atualizar select
        const option = document.createElement('option');
        option.value = novoTipo;
        option.textContent = novoTipo;
        tipoDefeito.appendChild(option);
        
        // Selecionar o novo tipo
        tipoDefeito.value = novoTipo;
        
        modalNovoDefeito.hide();
        document.getElementById('novoTipoDefeito').value = '';
        mostrarMensagem('Novo tipo de defeito cadastrado com sucesso!', 'success');
    }
    
    // Função para salvar garantias no localStorage
    function salvarGarantias() {
        localStorage.setItem('garantiasRegistradas', JSON.stringify(garantias));
    }
    
    // Função para atualizar tabela
    function atualizarTabela() {
        const tbody = document.getElementById('tabelaGarantias');
        tbody.innerHTML = '';
        
        let garantiasFiltradas = aplicarFiltros();
        
        // Calcular paginação
        totalPaginas = Math.ceil(garantiasFiltradas.length / itensPorPagina);
        if (totalPaginas === 0) totalPaginas = 1;
        
        if (paginaAtual > totalPaginas) {
            paginaAtual = totalPaginas;
        }
        
        const inicio = (paginaAtual - 1) * itensPorPagina;
        const fim = Math.min(inicio + itensPorPagina, garantiasFiltradas.length);
        
        for (let i = inicio; i < fim; i++) {
            const garantia = garantiasFiltradas[i];
            const tr = document.createElement('tr');
            
            // Definir classe do status
            let statusClass = 'bg-secondary';
            switch(garantia.statusGarantia.toLowerCase()) {
                case 'aprovado':
                    statusClass = 'bg-success';
                    break;
                case 'rejeitado':
                    statusClass = 'bg-danger';
                    break;
                case 'pendente':
                    statusClass = 'bg-warning';
                    break;
                case 'em análise':
                    statusClass = 'bg-info';
                    break;
            }
            
            tr.innerHTML = `
                <td>${garantia.fornecedor}</td>
                <td>${garantia.referenciaProduto}</td>
                <td>
                    <span class="fw-bold ${garantia.percentualDefeito > 10 ? 'text-danger' : garantia.percentualDefeito > 5 ? 'text-warning' : 'text-success'}">
                        ${garantia.percentualDefeito.toFixed(2)}%
                    </span>
                </td>
                <td>
                    <span class="badge ${statusClass}">
                        ${garantia.statusGarantia}
                    </span>
                </td>
                <td>${new Date(garantia.dataRecebimento).toLocaleDateString('pt-BR')}</td>
                <td>
                    <button class="btn btn-sm btn-info me-1" onclick="editarGarantia(${garantia.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-success me-1" onclick="verAnexos(${garantia.id})" title="Ver Anexos">
                        <i class="fas fa-paperclip"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="excluirGarantia(${garantia.id})" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            tbody.appendChild(tr);
        }
        
        atualizarControlesPaginacao(garantiasFiltradas.length);
    }
    
    // Função para aplicar filtros
    function aplicarFiltros() {
        let filtradas = [...garantias];
        
        // Filtro de busca
        const termo = buscarGarantia.value.toLowerCase();
        if (termo) {
            filtradas = filtradas.filter(g => 
                g.fornecedor.toLowerCase().includes(termo) ||
                g.referenciaProduto.toLowerCase().includes(termo) ||
                g.statusGarantia.toLowerCase().includes(termo) ||
                g.responsavel.toLowerCase().includes(termo)
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
        infoEl.textContent = `Mostrando ${inicio}-${fim} de ${totalItens} garantias`;
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
        const editFornecedor = document.getElementById('editFornecedor');
        const editReferenciaProduto = document.getElementById('editReferenciaProduto');
        const editStatusGarantia = document.getElementById('editStatusGarantia');
        const editResponsavel = document.getElementById('editResponsavel');
        const editObservacoes = document.getElementById('editObservacoes');
        
        if (!editFornecedor.value || !editReferenciaProduto.value.trim() || 
            !editStatusGarantia.value || !editResponsavel.value.trim()) {
            mostrarMensagem('Por favor, preencha todos os campos obrigatórios.', 'error');
            return;
        }
        
        const garantia = garantias.find(g => g.id === editingId);
        if (garantia) {
            garantia.fornecedor = editFornecedor.value;
            garantia.referenciaProduto = editReferenciaProduto.value.trim();
            garantia.statusGarantia = editStatusGarantia.value;
            garantia.responsavel = editResponsavel.value.trim();
            garantia.observacoes = editObservacoes.value.trim();
            
            salvarGarantias();
            atualizarTabela();
            modalEdicao.hide();
            mostrarMensagem('Garantia atualizada com sucesso!', 'success');
        }
    }
    
    // Função para confirmar exclusão
    function confirmarExclusao() {
        garantias = garantias.filter(g => g.id !== deletingId);
        salvarGarantias();
        atualizarTabela();
        modalExclusao.hide();
        mostrarMensagem('Garantia excluída com sucesso!', 'success');
    }
    
    // Funções globais para ações da tabela
    window.editarGarantia = function(id) {
        const garantia = garantias.find(g => g.id === id);
        if (garantia) {
            editingId = id;
            
            // Atualizar selects antes de preencher
            preencherSelects();
            
            document.getElementById('editFornecedor').value = garantia.fornecedor;
            document.getElementById('editReferenciaProduto').value = garantia.referenciaProduto;
            document.getElementById('editStatusGarantia').value = garantia.statusGarantia;
            document.getElementById('editResponsavel').value = garantia.responsavel;
            document.getElementById('editObservacoes').value = garantia.observacoes;
            modalEdicao.show();
        }
    };
    
    window.verAnexos = function(id) {
        const garantia = garantias.find(g => g.id === id);
        if (garantia) {
            const arquivos = [];
            if (garantia.nfCompras) arquivos.push('NF de Compras: ' + garantia.nfCompras);
            if (garantia.nfSimplesRemessa) arquivos.push('NF de Simples Remessa: ' + garantia.nfSimplesRemessa);
            if (garantia.nfDevolucao) arquivos.push('NF de Devolução: ' + garantia.nfDevolucao);
            
            if (arquivos.length > 0) {
                alert('Arquivos anexados:\n\n' + arquivos.join('\n'));
            } else {
                alert('Nenhum arquivo anexado para esta garantia.');
            }
        }
    };
    
    window.excluirGarantia = function(id) {
        deletingId = id;
        modalExclusao.show();
    };
});
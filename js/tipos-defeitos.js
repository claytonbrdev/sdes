// Tipos de Defeitos - Funcionalidades

document.addEventListener('DOMContentLoaded', function() {
    // Elementos do formulário
    const form = document.getElementById('formCadastroDefeito');
    const nomeDefeito = document.getElementById('nomeDefeito');
    
    // Botões
    const btnLimpar = document.getElementById('btnLimpar');
    const btnSalvar = document.getElementById('btnSalvar');
    const btnImportar = document.getElementById('btnImportar');
    const btnExportar = document.getElementById('btnExportar');
    const buscarDefeito = document.getElementById('buscarDefeito');
    
    // Modais
    const modalEdicao = new bootstrap.Modal(document.getElementById('modalEdicao'));
    const modalExclusao = new bootstrap.Modal(document.getElementById('modalExclusao'));
    const modalImportacao = new bootstrap.Modal(document.getElementById('modalImportacao'));
    const modalExportacao = new bootstrap.Modal(document.getElementById('modalExportacao'));
    
    // Modal de mensagens
    const messageModal = document.getElementById('messageModal');
    const messageText = document.getElementById('messageText');
    const closeMessage = document.getElementById('closeMessage');
    
    // Paginação
    const itensPorPagina = 10;
    let paginaAtual = 1;
    let totalPaginas = 1;
    
    // Array para armazenar os tipos de defeitos
    let tiposDefeito = [];
    let editingId = null;
    let deletingId = null;
    
    // Carregar dados do localStorage
    carregarDoLocalStorage();
    
    // Event listeners
    btnLimpar.addEventListener('click', limparFormulario);
    btnSalvar.addEventListener('click', salvarDefeito);
    btnImportar.addEventListener('click', () => modalImportacao.show());
    btnExportar.addEventListener('click', () => modalExportacao.show());
    buscarDefeito.addEventListener('input', filtrarTabela);
    
    if (closeMessage) {
        closeMessage.addEventListener('click', fecharMensagem);
    }
    
    // Event listeners dos modais
    document.getElementById('btnSalvarEdicao').addEventListener('click', salvarEdicao);
    document.getElementById('btnConfirmarExclusao').addEventListener('click', confirmarExclusao);
    document.getElementById('btnProcessarImportacao').addEventListener('click', processarImportacao);
    document.getElementById('btnProcessarExportacao').addEventListener('click', processarExportacao);
    document.getElementById('btnBaixarModelo').addEventListener('click', baixarModelo);
    
    // Função para limpar o formulário
    function limparFormulario() {
        form.reset();
        editingId = null;
        
        form.querySelectorAll('.is-invalid').forEach(el => {
            el.classList.remove('is-invalid');
        });
    }
    
    // Função para salvar tipo de defeito
    function salvarDefeito() {
        if (!validarFormulario()) {
            mostrarMensagem('Por favor, preencha todos os campos obrigatórios.', 'error');
            return;
        }
        
        const defeitoObj = {
            id: editingId !== null ? editingId : Date.now(),
            nome: nomeDefeito.value.trim(),
            dataCadastro: editingId !== null ? 
                tiposDefeito.find(d => d.id === editingId).dataCadastro : 
                new Date().toISOString()
        };
        
        if (editingId !== null) {
            tiposDefeito = tiposDefeito.map(d => d.id === editingId ? defeitoObj : d);
            mostrarMensagem('Tipo de defeito atualizado com sucesso!', 'success');
        } else {
            // Verificar se já existe
            if (tiposDefeito.find(d => d.nome.toLowerCase() === defeitoObj.nome.toLowerCase())) {
                mostrarMensagem('Este tipo de defeito já existe.', 'error');
                return;
            }
            
            tiposDefeito.push(defeitoObj);
            mostrarMensagem('Tipo de defeito cadastrado com sucesso!', 'success');
        }
        
        salvarNoLocalStorage();
        atualizarTabela();
        limparFormulario();
    }
    
    // Função para validar formulário
    function validarFormulario() {
        let valido = true;
        
        if (!nomeDefeito.value.trim()) {
            nomeDefeito.classList.add('is-invalid');
            valido = false;
        } else {
            nomeDefeito.classList.remove('is-invalid');
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
    
    // Função para atualizar tabela
    function atualizarTabela() {
        const tbody = document.getElementById('tabelaDefeitos');
        tbody.innerHTML = '';
        
        let defeitosFiltrados = aplicarFiltros();
        
        // Calcular paginação
        totalPaginas = Math.ceil(defeitosFiltrados.length / itensPorPagina);
        if (totalPaginas === 0) totalPaginas = 1;
        
        if (paginaAtual > totalPaginas) {
            paginaAtual = totalPaginas;
        }
        
        const inicio = (paginaAtual - 1) * itensPorPagina;
        const fim = Math.min(inicio + itensPorPagina, defeitosFiltrados.length);
        
        for (let i = inicio; i < fim; i++) {
            const defeito = defeitosFiltrados[i];
            const tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td><span class="badge bg-warning text-dark">${defeito.nome}</span></td>
                <td>
                    <button class="btn btn-sm btn-info me-1" onclick="editarDefeito(${defeito.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="excluirDefeito(${defeito.id})" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            tbody.appendChild(tr);
        }
        
        atualizarControlesPaginacao(defeitosFiltrados.length);
    }
    
    // Função para aplicar filtros
    function aplicarFiltros() {
        let filtrados = [...tiposDefeito];
        
        // Filtro de busca
        const termo = buscarDefeito.value.toLowerCase();
        if (termo) {
            filtrados = filtrados.filter(d => 
                d.nome.toLowerCase().includes(termo)
            );
        }
        
        return filtrados;
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
        infoEl.textContent = `Mostrando ${inicio}-${fim} de ${totalItens} tipos de defeitos`;
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
    
    // Função para carregar do localStorage
    function carregarDoLocalStorage() {
        const defeitosArmazenados = localStorage.getItem('tiposDefeito');
        if (defeitosArmazenados) {
            // Se for um array de strings (formato antigo), converter para objetos
            const dados = JSON.parse(defeitosArmazenados);
            if (Array.isArray(dados) && dados.length > 0 && typeof dados[0] === 'string') {
                tiposDefeito = dados.map((nome, index) => ({
                    id: index + 1,
                    nome: nome,
                    dataCadastro: new Date().toISOString()
                }));
                salvarNoLocalStorage(); // Salvar no novo formato
            } else {
                tiposDefeito = dados;
            }
        } else {
            // Dados de exemplo
            tiposDefeito = [
                {
                    id: 1,
                    nome: 'Vazamento de toner',
                    dataCadastro: new Date().toISOString()
                },
                {
                    id: 2,
                    nome: 'Impressão com falhas',
                    dataCadastro: new Date().toISOString()
                },
                {
                    id: 3,
                    nome: 'Não reconhecido pela impressora',
                    dataCadastro: new Date().toISOString()
                },
                {
                    id: 4,
                    nome: 'Qualidade de impressão ruim',
                    dataCadastro: new Date().toISOString()
                },
                {
                    id: 5,
                    nome: 'Toner vazio prematuramente',
                    dataCadastro: new Date().toISOString()
                },
                {
                    id: 6,
                    nome: 'Defeito no chip',
                    dataCadastro: new Date().toISOString()
                },
                {
                    id: 7,
                    nome: 'Peças quebradas',
                    dataCadastro: new Date().toISOString()
                },
                {
                    id: 8,
                    nome: 'Outros',
                    dataCadastro: new Date().toISOString()
                }
            ];
            salvarNoLocalStorage();
        }
        
        atualizarTabela();
    }
    
    // Função para salvar no localStorage
    function salvarNoLocalStorage() {
        localStorage.setItem('tiposDefeito', JSON.stringify(tiposDefeito));
    }
    
    // Função para salvar edição
    function salvarEdicao() {
        const editNomeDefeito = document.getElementById('editNomeDefeito');
        
        if (!editNomeDefeito.value.trim()) {
            editNomeDefeito.classList.add('is-invalid');
            return;
        }
        
        // Verificar se já existe outro com o mesmo nome
        const nomeExistente = tiposDefeito.find(d => 
            d.id !== editingId && 
            d.nome.toLowerCase() === editNomeDefeito.value.trim().toLowerCase()
        );
        
        if (nomeExistente) {
            mostrarMensagem('Este tipo de defeito já existe.', 'error');
            return;
        }
        
        const defeito = tiposDefeito.find(d => d.id === editingId);
        if (defeito) {
            defeito.nome = editNomeDefeito.value.trim();
            
            salvarNoLocalStorage();
            atualizarTabela();
            modalEdicao.hide();
            mostrarMensagem('Tipo de defeito atualizado com sucesso!', 'success');
        }
    }
    
    // Função para confirmar exclusão
    function confirmarExclusao() {
        tiposDefeito = tiposDefeito.filter(d => d.id !== deletingId);
        salvarNoLocalStorage();
        atualizarTabela();
        modalExclusao.hide();
        mostrarMensagem('Tipo de defeito excluído com sucesso!', 'success');
    }
    
    // Função para processar importação
    function processarImportacao() {
        const arquivo = document.getElementById('arquivoImportacao').files[0];
        if (!arquivo) {
            mostrarMensagem('Selecione um arquivo para importar.', 'error');
            return;
        }
        
        // Simular processamento
        mostrarMensagem('Importação processada com sucesso! (Simulação)', 'success');
        modalImportacao.hide();
    }
    
    // Função para processar exportação
    function processarExportacao() {
        const dataInicio = document.getElementById('dataInicio').value;
        const dataFim = document.getElementById('dataFim').value;
        const exportarTodos = document.getElementById('exportarTodos').checked;
        
        // Simular exportação
        mostrarMensagem('Arquivo Excel gerado com sucesso! (Simulação)', 'success');
        modalExportacao.hide();
    }
    
    // Função para baixar modelo
    function baixarModelo() {
        // Simular download do modelo
        mostrarMensagem('Modelo de planilha baixado! (Simulação)', 'success');
    }
    
    // Funções globais
    window.editarDefeito = function(id) {
        const defeito = tiposDefeito.find(d => d.id === id);
        if (defeito) {
            editingId = id;
            document.getElementById('editNomeDefeito').value = defeito.nome;
            modalEdicao.show();
        }
    };
    
    window.excluirDefeito = function(id) {
        deletingId = id;
        modalExclusao.show();
    };
});
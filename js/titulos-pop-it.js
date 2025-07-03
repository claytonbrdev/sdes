// Títulos de POP / IT - Funcionalidades

document.addEventListener('DOMContentLoaded', function() {
    // Elementos do formulário
    const form = document.getElementById('formCadastroTitulo');
    const titulo = document.getElementById('titulo');
    const setor = document.getElementById('setor');
    
    // Botões
    const btnLimpar = document.getElementById('btnLimpar');
    const btnSalvar = document.getElementById('btnSalvar');
    const btnImportar = document.getElementById('btnImportar');
    const btnExportar = document.getElementById('btnExportar');
    const buscarTitulo = document.getElementById('buscarTitulo');
    
    // Filtros
    const filtroColuna = document.getElementById('filtroColuna');
    const filtroValor = document.getElementById('filtroValor');
    
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
    
    // Array para armazenar os títulos
    let titulos = [];
    let setores = [];
    let editingId = null;
    let deletingId = null;
    
    // Carregar dados do localStorage
    carregarDoLocalStorage();
    carregarSetores();
    
    // Event listeners
    btnLimpar.addEventListener('click', limparFormulario);
    btnSalvar.addEventListener('click', salvarTitulo);
    btnImportar.addEventListener('click', () => modalImportacao.show());
    btnExportar.addEventListener('click', () => modalExportacao.show());
    buscarTitulo.addEventListener('input', filtrarTabela);
    filtroColuna.addEventListener('change', atualizarFiltroValor);
    filtroValor.addEventListener('change', filtrarTabela);
    closeMessage.addEventListener('click', fecharMensagem);
    
    // Event listeners dos modais
    document.getElementById('btnSalvarEdicao').addEventListener('click', salvarEdicao);
    document.getElementById('btnConfirmarExclusao').addEventListener('click', confirmarExclusao);
    document.getElementById('btnProcessarImportacao').addEventListener('click', processarImportacao);
    document.getElementById('btnProcessarExportacao').addEventListener('click', processarExportacao);
    document.getElementById('btnBaixarModelo').addEventListener('click', baixarModelo);
    
    // Função para carregar setores
    function carregarSetores() {
        const setoresArmazenados = localStorage.getItem('setores');
        if (setoresArmazenados) {
            setores = JSON.parse(setoresArmazenados);
        } else {
            // Setores padrão se não existirem
            setores = [
                { id: 1, nomeSetor: 'Recursos Humanos' },
                { id: 2, nomeSetor: 'Tecnologia da Informação' },
                { id: 3, nomeSetor: 'Financeiro' }
            ];
        }
        
        // Preencher select de setores
        preencherSelectSetores();
    }
    
    // Função para preencher select de setores
    function preencherSelectSetores() {
        const selects = [setor, document.getElementById('editSetor')];
        
        selects.forEach(select => {
            if (select) {
                // Limpar opções existentes (exceto a primeira)
                while (select.children.length > 1) {
                    select.removeChild(select.lastChild);
                }
                
                // Adicionar setores
                setores.forEach(s => {
                    const option = document.createElement('option');
                    option.value = s.nomeSetor;
                    option.textContent = s.nomeSetor;
                    select.appendChild(option);
                });
            }
        });
    }
    
    // Função para limpar o formulário
    function limparFormulario() {
        form.reset();
        editingId = null;
        
        form.querySelectorAll('.is-invalid').forEach(el => {
            el.classList.remove('is-invalid');
        });
    }
    
    // Função para salvar título
    function salvarTitulo() {
        if (!validarFormulario()) {
            mostrarMensagem('Por favor, preencha todos os campos obrigatórios.', 'error');
            return;
        }
        
        const tituloObj = {
            id: editingId !== null ? editingId : Date.now(),
            titulo: titulo.value.trim(),
            setor: setor.value,
            dataCadastro: editingId !== null ? 
                titulos.find(t => t.id === editingId).dataCadastro : 
                new Date().toISOString()
        };
        
        if (editingId !== null) {
            titulos = titulos.map(t => t.id === editingId ? tituloObj : t);
            mostrarMensagem('Título atualizado com sucesso!', 'success');
        } else {
            titulos.push(tituloObj);
            mostrarMensagem('Título cadastrado com sucesso!', 'success');
        }
        
        salvarNoLocalStorage();
        atualizarTabela();
        limparFormulario();
    }
    
    // Função para validar formulário
    function validarFormulario() {
        let valido = true;
        
        if (!titulo.value.trim()) {
            titulo.classList.add('is-invalid');
            valido = false;
        } else {
            titulo.classList.remove('is-invalid');
        }
        
        if (!setor.value) {
            setor.classList.add('is-invalid');
            valido = false;
        } else {
            setor.classList.remove('is-invalid');
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
    
    // Função para atualizar tabela
    function atualizarTabela() {
        const tbody = document.getElementById('tabelaTitulos');
        tbody.innerHTML = '';
        
        let titulosFiltrados = aplicarFiltros();
        
        // Calcular paginação
        totalPaginas = Math.ceil(titulosFiltrados.length / itensPorPagina);
        if (totalPaginas === 0) totalPaginas = 1;
        
        if (paginaAtual > totalPaginas) {
            paginaAtual = totalPaginas;
        }
        
        const inicio = (paginaAtual - 1) * itensPorPagina;
        const fim = Math.min(inicio + itensPorPagina, titulosFiltrados.length);
        
        for (let i = inicio; i < fim; i++) {
            const tituloObj = titulosFiltrados[i];
            const tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td>${tituloObj.titulo}</td>
                <td><span class="badge bg-primary">${tituloObj.setor}</span></td>
                <td>
                    <button class="btn btn-sm btn-info me-1" onclick="editarTitulo(${tituloObj.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="excluirTitulo(${tituloObj.id})" title="Excluir">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            tbody.appendChild(tr);
        }
        
        atualizarControlesPaginacao(titulosFiltrados.length);
    }
    
    // Função para aplicar filtros
    function aplicarFiltros() {
        let filtrados = [...titulos];
        
        // Filtro de busca
        const termo = buscarTitulo.value.toLowerCase();
        if (termo) {
            filtrados = filtrados.filter(t => 
                t.titulo.toLowerCase().includes(termo) ||
                t.setor.toLowerCase().includes(termo)
            );
        }
        
        // Filtro por coluna
        if (filtroColuna.value && filtroValor.value) {
            filtrados = filtrados.filter(t => 
                t[filtroColuna.value].toLowerCase().includes(filtroValor.value.toLowerCase())
            );
        }
        
        return filtrados;
    }
    
    // Função para atualizar filtro de valor
    function atualizarFiltroValor() {
        const coluna = filtroColuna.value;
        filtroValor.innerHTML = '<option value="">Selecione um valor</option>';
        
        if (!coluna) {
            filtroValor.disabled = true;
            filtroValor.innerHTML = '<option value="">Primeiro selecione uma coluna</option>';
            return;
        }
        
        filtroValor.disabled = false;
        
        // Obter valores únicos da coluna selecionada
        const valoresUnicos = [...new Set(titulos.map(t => t[coluna]).filter(v => v))];
        
        valoresUnicos.forEach(valor => {
            const option = document.createElement('option');
            option.value = valor;
            option.textContent = valor;
            filtroValor.appendChild(option);
        });
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
        infoEl.textContent = `Mostrando ${inicio}-${fim} de ${totalItens} títulos`;
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
        const titulosArmazenados = localStorage.getItem('titulosPopIt');
        if (titulosArmazenados) {
            titulos = JSON.parse(titulosArmazenados);
        } else {
            // Dados de exemplo
            titulos = [
                {
                    id: 1,
                    titulo: 'Procedimento de Backup de Dados',
                    setor: 'Tecnologia da Informação',
                    dataCadastro: new Date().toISOString()
                },
                {
                    id: 2,
                    titulo: 'Instrução de Trabalho - Admissão de Funcionários',
                    setor: 'Recursos Humanos',
                    dataCadastro: new Date().toISOString()
                }
            ];
            salvarNoLocalStorage();
        }
        
        atualizarTabela();
        atualizarFiltroValor();
    }
    
    // Função para salvar no localStorage
    function salvarNoLocalStorage() {
        localStorage.setItem('titulosPopIt', JSON.stringify(titulos));
    }
    
    // Função para salvar edição
    function salvarEdicao() {
        const editTitulo = document.getElementById('editTitulo');
        const editSetor = document.getElementById('editSetor');
        
        if (!editTitulo.value.trim() || !editSetor.value) {
            if (!editTitulo.value.trim()) editTitulo.classList.add('is-invalid');
            if (!editSetor.value) editSetor.classList.add('is-invalid');
            return;
        }
        
        const tituloObj = titulos.find(t => t.id === editingId);
        if (tituloObj) {
            tituloObj.titulo = editTitulo.value.trim();
            tituloObj.setor = editSetor.value;
            
            salvarNoLocalStorage();
            atualizarTabela();
            modalEdicao.hide();
            mostrarMensagem('Título atualizado com sucesso!', 'success');
        }
    }
    
    // Função para confirmar exclusão
    function confirmarExclusao() {
        titulos = titulos.filter(t => t.id !== deletingId);
        salvarNoLocalStorage();
        atualizarTabela();
        modalExclusao.hide();
        mostrarMensagem('Título excluído com sucesso!', 'success');
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
    window.editarTitulo = function(id) {
        const tituloObj = titulos.find(t => t.id === id);
        if (tituloObj) {
            editingId = id;
            document.getElementById('editTitulo').value = tituloObj.titulo;
            document.getElementById('editSetor').value = tituloObj.setor;
            modalEdicao.show();
        }
    };
    
    window.excluirTitulo = function(id) {
        deletingId = id;
        modalExclusao.show();
    };
});
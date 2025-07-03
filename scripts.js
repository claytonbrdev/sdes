// Registrar Garantia - JavaScript Moderno
document.addEventListener('DOMContentLoaded', function() {
    // Elementos do formulário
    const form = document.getElementById('garantiaForm');
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
    const btnNovoDefeito = document.getElementById('btnNovoDefeito');
    
    // Modal
    const modalNovoDefeito = document.getElementById('modalNovoDefeito');
    const btnFecharModal = document.getElementById('btnFecharModal');
    const btnCancelarDefeito = document.getElementById('btnCancelarDefeito');
    const btnSalvarDefeito = document.getElementById('btnSalvarDefeito');
    const novoTipoDefeito = document.getElementById('novoTipoDefeito');
    
    // Elementos de mensagem
    const mensagemSucesso = document.getElementById('mensagemSucesso');
    const mensagemErro = document.getElementById('mensagemErro');
    const textoErro = document.getElementById('textoErro');
    
    // Arrays para armazenar dados
    let garantias = [];
    let tiposDefeito = [];
    let statusGarantias = [];
    
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
    
    // Event listeners para validação em tempo real
    const campos = [dataRecebimento, fornecedor, referenciaProduto, numeroNF, 
                   quantidadeRecebida, quantidadeTestada, quantidadeDefeito, 
                   tipoDefeito, statusGarantia, responsavel];
    
    campos.forEach(campo => {
        campo.addEventListener('blur', () => validarCampo(campo));
        campo.addEventListener('input', () => limparErro(campo));
    });
    
    // Event listeners para botões
    btnLimpar.addEventListener('click', limparFormulario);
    btnSalvar.addEventListener('click', salvarGarantia);
    btnNovoDefeito.addEventListener('click', abrirModalDefeito);
    btnFecharModal.addEventListener('click', fecharModalDefeito);
    btnCancelarDefeito.addEventListener('click', fecharModalDefeito);
    btnSalvarDefeito.addEventListener('click', salvarNovoDefeito);
    
    // Submissão do formulário
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        salvarGarantia();
    });
    
    // Função para carregar dados iniciais
    function carregarDados() {
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
                    fornecedor: 'Fornecedor ABC',
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
        // Preencher tipos de defeito
        tipoDefeito.innerHTML = '<option value="">Selecione o tipo de defeito</option>';
        tiposDefeito.forEach(tipo => {
            const option = document.createElement('option');
            option.value = tipo;
            option.textContent = tipo;
            tipoDefeito.appendChild(option);
        });
        
        // Preencher status de garantia
        statusGarantia.innerHTML = '<option value="">Selecione o status</option>';
        statusGarantias.forEach(status => {
            const option = document.createElement('option');
            option.value = status;
            option.textContent = status;
            statusGarantia.appendChild(option);
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
                mostrarErroCampo(quantidadeDefeito, 'Quantidade com defeito não pode ser maior que a testada.');
                percentualDefeito.textContent = '0.00%';
            } else {
                limparErro(quantidadeDefeito);
            }
        } else {
            percentualDefeito.textContent = '0.00%';
        }
    }
    
    // Função para validar um campo específico
    function validarCampo(campo) {
        const valor = campo.value.trim();
        let valido = true;
        let mensagem = '';
        
        // Validação por tipo de campo
        switch(campo.id) {
            case 'dataRecebimento':
                if (!valor) {
                    valido = false;
                    mensagem = 'A data de recebimento é obrigatória.';
                } else {
                    const dataEscolhida = new Date(valor);
                    const dataAtual = new Date();
                    
                    if (dataEscolhida > dataAtual) {
                        valido = false;
                        mensagem = 'A data não pode ser no futuro.';
                    }
                }
                break;
                
            case 'fornecedor':
                if (!valor) {
                    valido = false;
                    mensagem = 'O fornecedor é obrigatório.';
                } else if (valor.length < 2) {
                    valido = false;
                    mensagem = 'O nome do fornecedor deve ter pelo menos 2 caracteres.';
                }
                break;
                
            case 'referenciaProduto':
                if (!valor) {
                    valido = false;
                    mensagem = 'A referência do produto é obrigatória.';
                }
                break;
                
            case 'numeroNF':
                if (!valor) {
                    valido = false;
                    mensagem = 'O número da nota fiscal é obrigatório.';
                }
                break;
                
            case 'quantidadeRecebida':
                if (!valor) {
                    valido = false;
                    mensagem = 'A quantidade recebida é obrigatória.';
                } else {
                    const quantidade = parseInt(valor);
                    if (isNaN(quantidade) || quantidade < 1) {
                        valido = false;
                        mensagem = 'Digite uma quantidade válida (mínimo 1).';
                    }
                }
                break;
                
            case 'quantidadeTestada':
                if (!valor) {
                    valido = false;
                    mensagem = 'A quantidade testada é obrigatória.';
                } else {
                    const testada = parseInt(valor);
                    const recebida = parseInt(quantidadeRecebida.value) || 0;
                    if (isNaN(testada) || testada < 0) {
                        valido = false;
                        mensagem = 'Digite uma quantidade válida.';
                    } else if (testada > recebida) {
                        valido = false;
                        mensagem = 'Quantidade testada não pode ser maior que a recebida.';
                    }
                }
                break;
                
            case 'quantidadeDefeito':
                if (!valor) {
                    valido = false;
                    mensagem = 'A quantidade com defeito é obrigatória.';
                } else {
                    const defeito = parseInt(valor);
                    const testada = parseInt(quantidadeTestada.value) || 0;
                    if (isNaN(defeito) || defeito < 0) {
                        valido = false;
                        mensagem = 'Digite uma quantidade válida.';
                    } else if (defeito > testada) {
                        valido = false;
                        mensagem = 'Quantidade com defeito não pode ser maior que a testada.';
                    }
                }
                break;
                
            case 'tipoDefeito':
                if (!valor) {
                    valido = false;
                    mensagem = 'O tipo de defeito é obrigatório.';
                }
                break;
                
            case 'statusGarantia':
                if (!valor) {
                    valido = false;
                    mensagem = 'O status da garantia é obrigatório.';
                }
                break;
                
            case 'responsavel':
                if (!valor) {
                    valido = false;
                    mensagem = 'O responsável é obrigatório.';
                } else if (valor.length < 2) {
                    valido = false;
                    mensagem = 'O nome do responsável deve ter pelo menos 2 caracteres.';
                }
                break;
        }
        
        // Aplicar estilo de erro ou sucesso
        if (!valido) {
            mostrarErroCampo(campo, mensagem);
        } else {
            limparErro(campo);
        }
        
        return valido;
    }
    
    // Função para validar todo o formulário
    function validarFormulario() {
        let formularioValido = true;
        
        campos.forEach(campo => {
            if (!validarCampo(campo)) {
                formularioValido = false;
            }
        });
        
        return formularioValido;
    }
    
    // Função para mostrar erro em um campo específico
    function mostrarErroCampo(campo, mensagem) {
        campo.classList.add('input-error');
        const errorSpan = campo.parentNode.querySelector('.error-message');
        if (errorSpan) {
            errorSpan.textContent = mensagem;
            errorSpan.classList.remove('hidden');
        }
    }
    
    // Função para limpar erro de um campo
    function limparErro(campo) {
        campo.classList.remove('input-error');
        const errorSpan = campo.parentNode.querySelector('.error-message');
        if (errorSpan) {
            errorSpan.classList.add('hidden');
        }
    }
    
    // Função para mostrar mensagem de erro geral
    function mostrarErro(mensagem) {
        esconderMensagens();
        textoErro.textContent = mensagem;
        mensagemErro.classList.remove('hidden');
        mensagemErro.classList.add('mensagem-animada');
        
        setTimeout(() => {
            mensagemErro.classList.add('hidden');
        }, 5000);
    }
    
    // Função para mostrar mensagem de sucesso
    function mostrarSucesso() {
        esconderMensagens();
        mensagemSucesso.classList.remove('hidden');
        mensagemSucesso.classList.add('mensagem-animada');
        
        setTimeout(() => {
            mensagemSucesso.classList.add('hidden');
        }, 3000);
    }
    
    // Função para esconder todas as mensagens
    function esconderMensagens() {
        mensagemSucesso.classList.add('hidden');
        mensagemErro.classList.add('hidden');
        mensagemSucesso.classList.remove('mensagem-animada');
        mensagemErro.classList.remove('mensagem-animada');
    }
    
    // Função para salvar garantia
    function salvarGarantia() {
        if (!validarFormulario()) {
            mostrarErro('Por favor, preencha todos os campos obrigatórios corretamente.');
            return;
        }
        
        // Mostrar loading no botão
        btnSalvar.classList.add('btn-loading');
        btnSalvar.disabled = true;
        
        // Simular delay de processamento
        setTimeout(() => {
            const garantia = {
                id: Date.now(),
                dataRecebimento: dataRecebimento.value,
                fornecedor: fornecedor.value.trim(),
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
            
            // Remover loading
            btnSalvar.classList.remove('btn-loading');
            btnSalvar.disabled = false;
            
            // Mostrar sucesso
            mostrarSucesso();
            
            // Limpar formulário
            setTimeout(() => {
                limparFormulario();
            }, 1000);
            
        }, 1500);
    }
    
    // Função para limpar o formulário
    function limparFormulario() {
        form.reset();
        dataRecebimento.value = hoje;
        percentualDefeito.textContent = '0.00%';
        
        // Limpar todos os erros
        campos.forEach(campo => {
            limparErro(campo);
        });
        
        // Esconder mensagens
        esconderMensagens();
        
        // Focar no primeiro campo
        dataRecebimento.focus();
    }
    
    // Função para abrir modal de novo defeito
    function abrirModalDefeito() {
        modalNovoDefeito.classList.remove('hidden');
        modalNovoDefeito.classList.add('flex');
        novoTipoDefeito.focus();
    }
    
    // Função para fechar modal de novo defeito
    function fecharModalDefeito() {
        modalNovoDefeito.classList.add('hidden');
        modalNovoDefeito.classList.remove('flex');
        novoTipoDefeito.value = '';
    }
    
    // Função para salvar novo tipo de defeito
    function salvarNovoDefeito() {
        const novoTipo = novoTipoDefeito.value.trim();
        
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
        
        fecharModalDefeito();
        mostrarSucesso();
    }
    
    // Função para salvar garantias no localStorage
    function salvarGarantias() {
        localStorage.setItem('garantiasRegistradas', JSON.stringify(garantias));
    }
    
    // Função para atualizar tabela
    function atualizarTabela() {
        const tbody = document.getElementById('tabelaGarantias');
        tbody.innerHTML = '';
        
        // Calcular paginação
        totalPaginas = Math.ceil(garantias.length / itensPorPagina);
        if (totalPaginas === 0) totalPaginas = 1;
        
        if (paginaAtual > totalPaginas) {
            paginaAtual = totalPaginas;
        }
        
        const inicio = (paginaAtual - 1) * itensPorPagina;
        const fim = Math.min(inicio + itensPorPagina, garantias.length);
        
        for (let i = inicio; i < fim; i++) {
            const garantia = garantias[i];
            const tr = document.createElement('tr');
            
            // Definir classe do status
            let statusClass = 'status-pendente';
            switch(garantia.statusGarantia.toLowerCase()) {
                case 'aprovado':
                    statusClass = 'status-aprovado';
                    break;
                case 'rejeitado':
                    statusClass = 'status-rejeitado';
                    break;
                case 'em análise':
                    statusClass = 'status-analise';
                    break;
            }
            
            // Criar lista de arquivos anexados
            const arquivos = [];
            if (garantia.nfCompras) arquivos.push('NF Compras');
            if (garantia.nfSimplesRemessa) arquivos.push('NF Simples Remessa');
            if (garantia.nfDevolucao) arquivos.push('NF Devolução');
            
            tr.innerHTML = `
                <td class="px-4 py-3 text-sm text-gray-900">${garantia.fornecedor}</td>
                <td class="px-4 py-3 text-sm text-gray-900">${garantia.referenciaProduto}</td>
                <td class="px-4 py-3 text-sm">
                    <span class="font-semibold ${garantia.percentualDefeito > 10 ? 'text-red-600' : garantia.percentualDefeito > 5 ? 'text-yellow-600' : 'text-green-600'}">
                        ${garantia.percentualDefeito.toFixed(2)}%
                    </span>
                </td>
                <td class="px-4 py-3 text-sm">
                    <span class="status-badge ${statusClass}">
                        ${garantia.statusGarantia}
                    </span>
                </td>
                <td class="px-4 py-3 text-sm text-gray-900">${new Date(garantia.dataRecebimento).toLocaleDateString('pt-BR')}</td>
                <td class="px-4 py-3 text-sm">
                    <div class="flex gap-2">
                        <button onclick="alterarStatus(${garantia.id})" class="btn-acao px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-xs" title="Alterar Status">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button onclick="verAnexos(${garantia.id})" class="btn-acao px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs" title="Ver Anexos">
                            <i class="fas fa-paperclip"></i>
                        </button>
                        <button onclick="editarGarantia(${garantia.id})" class="btn-acao px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs" title="Editar">
                            <i class="fas fa-pencil-alt"></i>
                        </button>
                        <button onclick="excluirGarantia(${garantia.id})" class="btn-acao px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs" title="Excluir">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            
            tbody.appendChild(tr);
        }
        
        atualizarControlesPaginacao();
    }
    
    // Função para atualizar controles de paginação
    function atualizarControlesPaginacao() {
        const paginacaoContainer = document.getElementById('paginacao');
        if (!paginacaoContainer) return;
        
        paginacaoContainer.innerHTML = '';
        
        if (garantias.length === 0) {
            paginacaoContainer.innerHTML = '<p class="text-gray-500 text-center">Nenhuma garantia registrada ainda.</p>';
            return;
        }
        
        const infoEl = document.createElement('div');
        infoEl.className = 'text-sm text-gray-700';
        const inicio = ((paginaAtual - 1) * itensPorPagina) + 1;
        const fim = Math.min(paginaAtual * itensPorPagina, garantias.length);
        infoEl.textContent = `Mostrando ${inicio}-${fim} de ${garantias.length} garantias`;
        
        const navEl = document.createElement('div');
        navEl.className = 'flex gap-2';
        
        // Botão anterior
        const btnAnterior = document.createElement('button');
        btnAnterior.className = 'px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50';
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
            btnPagina.className = `px-3 py-1 rounded ${i === paginaAtual ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`;
            btnPagina.textContent = i;
            btnPagina.addEventListener('click', () => {
                paginaAtual = i;
                atualizarTabela();
            });
            navEl.appendChild(btnPagina);
        }
        
        // Botão próximo
        const btnProximo = document.createElement('button');
        btnProximo.className = 'px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 disabled:opacity-50';
        btnProximo.innerHTML = '<i class="fas fa-chevron-right"></i>';
        btnProximo.disabled = paginaAtual === totalPaginas;
        btnProximo.addEventListener('click', () => {
            if (paginaAtual < totalPaginas) {
                paginaAtual++;
                atualizarTabela();
            }
        });
        navEl.appendChild(btnProximo);
        
        paginacaoContainer.appendChild(infoEl);
        paginacaoContainer.appendChild(navEl);
    }
    
    // Funções globais para ações da tabela
    window.alterarStatus = function(id) {
        const garantia = garantias.find(g => g.id === id);
        if (garantia) {
            const novoStatus = prompt('Digite o novo status:', garantia.statusGarantia);
            if (novoStatus && novoStatus.trim()) {
                garantia.statusGarantia = novoStatus.trim();
                salvarGarantias();
                atualizarTabela();
                mostrarSucesso();
            }
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
    
    window.editarGarantia = function(id) {
        alert('Funcionalidade de edição será implementada em breve.');
    };
    
    window.excluirGarantia = function(id) {
        if (confirm('Tem certeza que deseja excluir esta garantia?\n\nEsta ação não pode ser desfeita.')) {
            garantias = garantias.filter(g => g.id !== id);
            salvarGarantias();
            atualizarTabela();
            mostrarSucesso();
        }
    };
    
    // Prevenir envio duplo
    let enviando = false;
    
    form.addEventListener('submit', function(e) {
        if (enviando) {
            e.preventDefault();
            return false;
        }
        enviando = true;
        
        setTimeout(() => {
            enviando = false;
        }, 3000);
    });
    
    // Auto-focus no primeiro campo ao carregar
    setTimeout(() => {
        dataRecebimento.focus();
    }, 300);
});
// Cadastro de Toners - Funcionalidades

document.addEventListener('DOMContentLoaded', function() {
    // Elementos do formulário
    const form = document.getElementById('formCadastroToner');
    const modelo = document.getElementById('modelo');
    const capacidadeFolhas = document.getElementById('capacidadeFolhas');
    const pesoCheio = document.getElementById('pesoCheio');
    const pesoVazio = document.getElementById('pesoVazio');
    const valorToner = document.getElementById('valorToner');
    const cor = document.getElementById('cor');
    const tipo = document.getElementById('tipo');
    const gramaturaToner = document.getElementById('gramaturaToner');
    const gramaturaFolha = document.getElementById('gramaturaFolha');
    const custoPagina = document.getElementById('custoPagina');
    
    // Botões
    const btnLimpar = document.getElementById('btnLimpar');
    const btnSalvar = document.getElementById('btnSalvar');
    const buscarToner = document.getElementById('buscarToner');
    
    // Modal de mensagens
    const messageModal = document.getElementById('messageModal');
    const messageText = document.getElementById('messageText');
    const closeMessage = document.getElementById('closeMessage');
    
    // Paginação
    const itensPorPagina = 5;
    let paginaAtual = 1;
    let totalPaginas = 1;
    
    // Array para armazenar os toners
    let toners = [];
    // ID do toner em edição (null quando não está editando)
    let editingId = null;
    
    // Carregar dados do localStorage
    carregarDoLocalStorage();
    
    // Event listeners para cálculos automáticos
    pesoCheio.addEventListener('input', calcularGramaturaToner);
    pesoVazio.addEventListener('input', calcularGramaturaToner);
    valorToner.addEventListener('input', calcularCustoPagina);
    capacidadeFolhas.addEventListener('input', function() {
        calcularGramaturaFolha();
        calcularCustoPagina();
    });
    
    // Event listeners para botões
    btnLimpar.addEventListener('click', limparFormulario);
    btnSalvar.addEventListener('click', salvarToner);
    buscarToner.addEventListener('input', filtrarTabela);
    
    if (closeMessage) {
        closeMessage.addEventListener('click', fecharMensagem);
    }
    
    // Função para calcular a gramatura do toner
    function calcularGramaturaToner() {
        if (pesoCheio.value && pesoVazio.value) {
            const peso1 = parseFloat(pesoCheio.value);
            const peso2 = parseFloat(pesoVazio.value);
            
            if (!isNaN(peso1) && !isNaN(peso2) && peso1 >= peso2) {
                const gramatura = peso1 - peso2;
                gramaturaToner.value = gramatura.toFixed(2);
                
                // Recalcular gramatura por folha se a capacidade estiver preenchida
                calcularGramaturaFolha();
            } else {
                gramaturaToner.value = '';
                gramaturaFolha.value = '';
            }
        } else {
            gramaturaToner.value = '';
            gramaturaFolha.value = '';
        }
    }
    
    // Função para calcular a gramatura por folha
    function calcularGramaturaFolha() {
        if (gramaturaToner.value && capacidadeFolhas.value) {
            const gramatura = parseFloat(gramaturaToner.value);
            const capacidade = parseFloat(capacidadeFolhas.value);
            
            if (!isNaN(gramatura) && !isNaN(capacidade) && capacidade > 0) {
                const gramaturaFolhaCalc = gramatura / capacidade;
                gramaturaFolha.value = gramaturaFolhaCalc.toFixed(4);
            } else {
                gramaturaFolha.value = '';
            }
        } else {
            gramaturaFolha.value = '';
        }
    }
    
    // Função para calcular o custo por página
    function calcularCustoPagina() {
        if (valorToner.value && capacidadeFolhas.value) {
            const valor = parseFloat(valorToner.value);
            const capacidade = parseFloat(capacidadeFolhas.value);
            
            if (!isNaN(valor) && !isNaN(capacidade) && capacidade > 0) {
                const custo = valor / capacidade;
                custoPagina.value = custo.toFixed(4);
            } else {
                custoPagina.value = '';
            }
        } else {
            custoPagina.value = '';
        }
    }
    
    // Função para limpar o formulário
    function limparFormulario() {
        form.reset();
        gramaturaToner.value = '';
        gramaturaFolha.value = '';
        custoPagina.value = '';
        editingId = null;
        
        // Remover classes de validação
        form.querySelectorAll('.is-invalid').forEach(el => {
            el.classList.remove('is-invalid');
        });
    }
    
    // Função para salvar ou atualizar um toner
    function salvarToner() {
        if (!validarFormulario()) {
            mostrarMensagem('Por favor, preencha todos os campos corretamente.', 'error');
            return;
        }
        
        // Determinar se é criação ou edição
        let tonerId = editingId !== null ? editingId : Date.now();
        
        const toner = {
            id: tonerId,
            modelo: modelo.value.trim(),
            capacidadeFolhas: parseInt(capacidadeFolhas.value),
            pesoCheio: parseFloat(pesoCheio.value),
            pesoVazio: parseFloat(pesoVazio.value),
            valorToner: parseFloat(valorToner.value),
            cor: cor.value,
            tipo: tipo.value,
            gramaturaToner: parseFloat(gramaturaToner.value),
            gramaturaFolha: parseFloat(gramaturaFolha.value),
            custoPagina: parseFloat(custoPagina.value)
        };
        
        if (editingId !== null) {
            // Atualização: substituir objeto existente
            toners = toners.map(t => t.id === editingId ? toner : t);
        } else {
            // Criação: adicionar novo
            toners.push(toner);
        }
        
        // Salvar no localStorage
        salvarNoLocalStorage();
        
        // Atualizar tabela
        atualizarTabela();
        
        // Mostrar mensagem de sucesso
        const msg = editingId !== null ? 'Toner atualizado com sucesso!' : 'Toner cadastrado com sucesso!';
        mostrarMensagem(msg, 'success');
        
        // Limpar formulário e resetar estado de edição
        limparFormulario();
    }
    
    // Função para validar o formulário antes de salvar
    function validarFormulario() {
        const campos = ['modelo', 'capacidadeFolhas', 'pesoCheio', 'pesoVazio', 'valorToner', 'cor', 'tipo'];
        let valido = true;
        
        campos.forEach(campo => {
            const elemento = document.getElementById(campo);
            if (!elemento.value) {
                elemento.classList.add('is-invalid');
                valido = false;
            } else {
                elemento.classList.remove('is-invalid');
            }
        });
        
        // Validações específicas
        if (parseFloat(pesoCheio.value) <= parseFloat(pesoVazio.value)) {
            pesoCheio.classList.add('is-invalid');
            pesoVazio.classList.add('is-invalid');
            mostrarMensagem('O peso cheio deve ser maior que o peso vazio.', 'error');
            valido = false;
        }
        
        return valido;
    }
    
    // Função para mostrar mensagem modal
    function mostrarMensagem(texto, tipo) {
        if (!messageModal || !messageText) return;
        
        messageText.textContent = texto;
        
        // Remover classes anteriores
        messageModal.classList.remove('success', 'error');
        
        // Adicionar classe de acordo com o tipo
        messageModal.classList.add(tipo);
        
        // Atualizar ícone
        const messageIcon = messageModal.querySelector('.message-icon i');
        if (messageIcon) {
            if (tipo === 'success') {
                messageIcon.className = 'fas fa-check-circle';
            } else {
                messageIcon.className = 'fas fa-exclamation-circle';
            }
        }
        
        // Mostrar modal
        messageModal.classList.add('show');
        
        // Fechar automaticamente após 5 segundos
        setTimeout(() => {
            fecharMensagem();
        }, 5000);
    }
    
    // Função para fechar mensagem modal
    function fecharMensagem() {
        if (messageModal) {
            messageModal.classList.remove('show');
        }
    }
    
    // Função para atualizar a tabela de toners com paginação
    function atualizarTabela() {
        const tbody = document.getElementById('tabelaToners');
        tbody.innerHTML = '';
        
        // Filtrar toners se houver busca
        const termo = buscarToner.value.toLowerCase();
        const tonersFiltrados = toners.filter(toner => 
            toner.modelo.toLowerCase().includes(termo) || 
            toner.cor.toLowerCase().includes(termo) || 
            toner.tipo.toLowerCase().includes(termo)
        );
        
        // Calcular total de páginas
        totalPaginas = Math.ceil(tonersFiltrados.length / itensPorPagina);
        if (totalPaginas === 0) totalPaginas = 1;
        
        // Ajustar página atual se necessário
        if (paginaAtual > totalPaginas) {
            paginaAtual = totalPaginas;
        }
        
        // Calcular índices de início e fim para a página atual
        const inicio = (paginaAtual - 1) * itensPorPagina;
        const fim = Math.min(inicio + itensPorPagina, tonersFiltrados.length);
        
        // Exibir apenas os itens da página atual
        for (let i = inicio; i < fim; i++) {
            const toner = tonersFiltrados[i];
            const tr = document.createElement('tr');
            
            tr.innerHTML = `
                <td>${toner.modelo}</td>
                <td>${toner.capacidadeFolhas}</td>
                <td><span class="badge ${getBadgeColorClass(toner.cor)}">${toner.cor}</span></td>
                <td>${toner.tipo}</td>
                <td>${toner.gramaturaToner.toFixed(2)} g</td>
                <td>${toner.gramaturaFolha.toFixed(4)} g</td>
                <td>R$ ${toner.custoPagina.toFixed(4)}</td>
                <td>
                    <button class="btn btn-sm btn-info me-1" onclick="editarToner(${toner.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="excluirToner(${toner.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            
            tbody.appendChild(tr);
        }
        
        // Atualizar controles de paginação
        atualizarControlesPaginacao(tonersFiltrados.length);
    }
    
    // Função para atualizar os controles de paginação
    function atualizarControlesPaginacao(totalItens) {
        const paginacaoContainer = document.getElementById('paginacao');
        if (!paginacaoContainer) return;
        
        paginacaoContainer.innerHTML = '';
        
        // Informação sobre itens exibidos
        const infoEl = document.createElement('div');
        infoEl.className = 'pagination-info';
        const inicio = ((paginaAtual - 1) * itensPorPagina) + 1;
        const fim = Math.min(paginaAtual * itensPorPagina, totalItens);
        infoEl.textContent = `Mostrando ${inicio}-${fim} de ${totalItens} itens`;
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
    
    // Função para filtrar a tabela
    function filtrarTabela() {
        // Resetar para a primeira página quando filtrar
        paginaAtual = 1;
        atualizarTabela();
    }
    
    // Função para obter a classe de cor do badge
    function getBadgeColorClass(cor) {
        switch(cor) {
            case 'Black': return 'bg-dark';
            case 'Cyan': return 'bg-info';
            case 'Magenta': return 'bg-danger';
            case 'Yellow': return 'bg-warning';
            default: return 'bg-secondary';
        }
    }
    
    // Função para carregar dados do localStorage
    function carregarDoLocalStorage() {
        const tonersArmazenados = localStorage.getItem('toners');
        if (tonersArmazenados) {
            toners = JSON.parse(tonersArmazenados);
        } else {
            // Se não houver dados no localStorage, carrega dados de exemplo
            toners = [
                {
                    id: 1,
                    modelo: 'HP CF258A',
                    capacidadeFolhas: 3000,
                    pesoCheio: 950.50,
                    pesoVazio: 450.20,
                    valorToner: 320.00,
                    cor: 'Black',
                    tipo: 'Original',
                    gramaturaToner: 500.30,
                    gramaturaFolha: 0.1668,
                    custoPagina: 0.1067
                },
                {
                    id: 2,
                    modelo: 'Brother TN-217C',
                    capacidadeFolhas: 2300,
                    pesoCheio: 780.30,
                    pesoVazio: 380.10,
                    valorToner: 280.00,
                    cor: 'Cyan',
                    tipo: 'Compatível',
                    gramaturaToner: 400.20,
                    gramaturaFolha: 0.1740,
                    custoPagina: 0.1217
                }
            ];
            // Salva os dados de exemplo no localStorage
            salvarNoLocalStorage();
        }
        
        atualizarTabela();
    }
    
    // Função para salvar no localStorage
    function salvarNoLocalStorage() {
        localStorage.setItem('toners', JSON.stringify(toners));
    }
    
    // Funções globais para editar e excluir (definidas no escopo global para acessar via onclick)
    window.editarToner = function(id) {
        const toner = toners.find(t => t.id === id);
        if (toner) {
            editingId = id;
            modelo.value = toner.modelo;
            capacidadeFolhas.value = toner.capacidadeFolhas;
            pesoCheio.value = toner.pesoCheio;
            pesoVazio.value = toner.pesoVazio;
            valorToner.value = toner.valorToner;
            cor.value = toner.cor;
            tipo.value = toner.tipo;
            gramaturaToner.value = toner.gramaturaToner.toFixed(2);
            gramaturaFolha.value = toner.gramaturaFolha.toFixed(4);
            custoPagina.value = toner.custoPagina.toFixed(4);
        }
    };
    
    window.excluirToner = function(id) {
        if (confirm('Tem certeza que deseja excluir este toner?')) {
            toners = toners.filter(toner => toner.id !== id);
            salvarNoLocalStorage();
            atualizarTabela();
            mostrarMensagem('Toner excluído com sucesso!', 'success');
        }
    };
});
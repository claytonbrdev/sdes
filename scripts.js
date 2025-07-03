// Cadastro de Lembrete - JavaScript Moderno
document.addEventListener('DOMContentLoaded', function() {
    // Elementos do formulário
    const form = document.getElementById('lembreteForm');
    const descricao = document.getElementById('descricao');
    const dataEvento = document.getElementById('dataEvento');
    const diasAntecedencia = document.getElementById('diasAntecedencia');
    const email = document.getElementById('email');
    const btnSalvar = document.getElementById('btnSalvar');
    
    // Elementos de mensagem
    const mensagemSucesso = document.getElementById('mensagemSucesso');
    const mensagemErro = document.getElementById('mensagemErro');
    const textoErro = document.getElementById('textoErro');
    
    // Definir data mínima como hoje
    const hoje = new Date().toISOString().split('T')[0];
    dataEvento.min = hoje;
    
    // Validação em tempo real
    const campos = [descricao, dataEvento, diasAntecedencia, email];
    
    campos.forEach(campo => {
        campo.addEventListener('blur', () => validarCampo(campo));
        campo.addEventListener('input', () => limparErro(campo));
    });
    
    // Submissão do formulário
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validarFormulario()) {
            simularEnvio();
        } else {
            mostrarErro('Por favor, preencha todos os campos obrigatórios corretamente.');
        }
    });
    
    // Função para validar um campo específico
    function validarCampo(campo) {
        const valor = campo.value.trim();
        let valido = true;
        let mensagem = '';
        
        // Validação por tipo de campo
        switch(campo.id) {
            case 'descricao':
                if (!valor) {
                    valido = false;
                    mensagem = 'A descrição é obrigatória.';
                } else if (valor.length < 3) {
                    valido = false;
                    mensagem = 'A descrição deve ter pelo menos 3 caracteres.';
                } else if (valor.length > 200) {
                    valido = false;
                    mensagem = 'A descrição deve ter no máximo 200 caracteres.';
                }
                break;
                
            case 'dataEvento':
                if (!valor) {
                    valido = false;
                    mensagem = 'A data do evento é obrigatória.';
                } else {
                    const dataEscolhida = new Date(valor);
                    const dataAtual = new Date();
                    dataAtual.setHours(0, 0, 0, 0);
                    
                    if (dataEscolhida < dataAtual) {
                        valido = false;
                        mensagem = 'A data do evento não pode ser no passado.';
                    }
                }
                break;
                
            case 'diasAntecedencia':
                if (!valor) {
                    valido = false;
                    mensagem = 'Os dias de antecedência são obrigatórios.';
                } else {
                    const dias = parseInt(valor);
                    if (isNaN(dias) || dias < 0) {
                        valido = false;
                        mensagem = 'Digite um número válido de dias.';
                    } else if (dias > 365) {
                        valido = false;
                        mensagem = 'O máximo é 365 dias de antecedência.';
                    }
                }
                break;
                
            case 'email':
                if (!valor) {
                    valido = false;
                    mensagem = 'O e-mail é obrigatório.';
                } else if (!validarEmail(valor)) {
                    valido = false;
                    mensagem = 'Digite um e-mail válido.';
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
    
    // Função para validar e-mail
    function validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
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
        
        // Scroll para a mensagem
        mensagemErro.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    // Função para mostrar mensagem de sucesso
    function mostrarSucesso() {
        esconderMensagens();
        mensagemSucesso.classList.remove('hidden');
        mensagemSucesso.classList.add('mensagem-animada');
        
        // Scroll para a mensagem
        mensagemSucesso.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    // Função para esconder todas as mensagens
    function esconderMensagens() {
        mensagemSucesso.classList.add('hidden');
        mensagemErro.classList.add('hidden');
        mensagemSucesso.classList.remove('mensagem-animada');
        mensagemErro.classList.remove('mensagem-animada');
    }
    
    // Função para simular o envio do formulário
    function simularEnvio() {
        // Mostrar loading no botão
        btnSalvar.classList.add('btn-loading');
        btnSalvar.disabled = true;
        
        // Simular delay de envio
        setTimeout(() => {
            // Remover loading
            btnSalvar.classList.remove('btn-loading');
            btnSalvar.disabled = false;
            
            // Mostrar sucesso
            mostrarSucesso();
            
            // Limpar formulário após sucesso
            setTimeout(() => {
                limparFormulario();
            }, 2000);
            
        }, 1500); // Simula 1.5 segundos de processamento
    }
    
    // Função para limpar o formulário
    function limparFormulario() {
        form.reset();
        dataEvento.min = hoje;
        
        // Limpar todos os erros
        campos.forEach(campo => {
            limparErro(campo);
        });
        
        // Esconder mensagens
        esconderMensagens();
        
        // Focar no primeiro campo
        descricao.focus();
    }
    
    // Função para formatar entrada de dias (apenas números)
    diasAntecedencia.addEventListener('input', function(e) {
        // Remove caracteres não numéricos
        this.value = this.value.replace(/[^0-9]/g, '');
    });
    
    // Adicionar efeitos visuais de feedback
    campos.forEach(campo => {
        campo.addEventListener('focus', function() {
            this.parentNode.classList.add('focused');
        });
        
        campo.addEventListener('blur', function() {
            this.parentNode.classList.remove('focused');
        });
    });
    
    // Auto-focus no primeiro campo ao carregar
    setTimeout(() => {
        descricao.focus();
    }, 300);
    
    // Função para calcular e mostrar data do lembrete
    function atualizarDataLembrete() {
        const dataEventoValue = dataEvento.value;
        const diasValue = diasAntecedencia.value;
        
        if (dataEventoValue && diasValue) {
            const dataEventoObj = new Date(dataEventoValue);
            const diasNum = parseInt(diasValue);
            
            if (!isNaN(diasNum)) {
                const dataLembrete = new Date(dataEventoObj);
                dataLembrete.setDate(dataLembrete.getDate() - diasNum);
                
                // Mostrar informação adicional (opcional)
                console.log(`Lembrete será enviado em: ${dataLembrete.toLocaleDateString('pt-BR')}`);
            }
        }
    }
    
    // Atualizar data do lembrete quando os campos mudarem
    dataEvento.addEventListener('change', atualizarDataLembrete);
    diasAntecedencia.addEventListener('input', atualizarDataLembrete);
    
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
});
// Inicialização dos gráficos Chart.js - apenas para o dashboard

document.addEventListener('DOMContentLoaded', function() {
  // Verificar se Chart.js está disponível
  if (typeof Chart === 'undefined') {
    console.warn('Chart.js não está carregado');
    return;
  }

  // Gráfico de Auditorias
  const chartAuditorias = document.getElementById('chartAuditorias');
  if (chartAuditorias) {
    new Chart(chartAuditorias, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Fev', 'Mar', 'Abr'],
        datasets: [{
          label: 'Auditorias',
          data: [5, 8, 4, 6],
          backgroundColor: '#0d6efd'
        }]
      }
    });
  }

  // Gráfico de Retornos
  const chartRetornos = document.getElementById('chartRetornos');
  if (chartRetornos) {
    new Chart(chartRetornos, {
      type: 'line',
      data: {
        labels: ['Jan', 'Fev', 'Mar', 'Abr'],
        datasets: [{
          label: 'Toners Retornados',
          data: [12, 9, 14, 10],
          borderColor: '#6610f2',
          fill: false
        }]
      }
    });
  }

  // Gráfico de Garantias
  const chartGarantias = document.getElementById('chartGarantias');
  if (chartGarantias) {
    new Chart(chartGarantias, {
      type: 'pie',
      data: {
        labels: ['Aprovadas', 'Pendentes', 'Rejeitadas'],
        datasets: [{
          data: [10, 5, 2],
          backgroundColor: ['#198754', '#ffc107', '#dc3545']
        }]
      }
    });
  }

  // Gráfico de Documentos
  const chartDocumentos = document.getElementById('chartDocumentos');
  if (chartDocumentos) {
    new Chart(chartDocumentos, {
      type: 'doughnut',
      data: {
        labels: ['POP', 'IT', 'BPMN'],
        datasets: [{
          data: [30, 20, 10],
          backgroundColor: ['#0d6efd', '#20c997', '#6f42c1']
        }]
      }
    });
  }

  // Gráfico de Garantias por Fornecedor
  const chartGarantiasFornecedor = document.getElementById('chartGarantiasFornecedor');
  if (chartGarantiasFornecedor) {
    new Chart(chartGarantiasFornecedor, {
      type: 'bar',
      data: {
        labels: ['Fornecedor A', 'Fornecedor B', 'Fornecedor C'],
        datasets: [{
          label: 'Garantias',
          data: [12, 7, 5],
          backgroundColor: ['#0d6efd', '#6f42c1', '#20c997']
        }]
      }
    });
  }

  // Gráfico de Toners Recuperados
  const chartTonersRecuperados = document.getElementById('chartTonersRecuperados');
  if (chartTonersRecuperados) {
    new Chart(chartTonersRecuperados, {
      type: 'bar',
      data: {
        labels: ['Jan', 'Fev', 'Mar', 'Abr'],
        datasets: [
          {
            label: 'Quantidade',
            data: [40, 55, 60, 70],
            backgroundColor: '#198754'
          },
          {
            label: 'Valor R$',
            data: [800, 1200, 1500, 1800],
            backgroundColor: '#ffc107'
          }
        ]
      }
    });
  }
});
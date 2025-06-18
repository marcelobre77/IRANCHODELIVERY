// Testar API
async function testarAPI() {
    try {
        const response = await fetch('/api/test');
        const data = await response.json();
        
        document.getElementById('api-status').innerHTML = `
            <strong>✅ API Funcionando!</strong><br>
            Mensagem: ${data.message}<br>
            Timestamp: ${data.timestamp}
        `;
    } catch (error) {
        document.getElementById('api-status').innerHTML = `
            <strong>❌ Erro na API:</strong><br>
            ${error.message}
        `;
    }
}

// Carregar status ao iniciar
window.addEventListener('load', () => {
    testarAPI();
});

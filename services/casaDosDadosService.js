const axios = require('axios');

class CasaDosDadosService {
  constructor() {
    this.baseURL = 'https://api.casadosdados.com.br/v5/cnpj/pesquisa';
  }

  /**
   * Consulta empresas por CNAE na API da Casa dos Dados
   * @param {string} apiKey - Chave da API da Casa dos Dados
   * @param {string} cnae - Código CNAE para pesquisa
   * @param {string} tipoResultado - Tipo do resultado (simple ou completo)
   * @returns {Promise<Object>} Resposta da API externa
   */
  async consultarPorCnae(apiKey, cnae, tipoResultado = 'simple') {
    try {
      console.log(`🔍 Consultando CNAE: ${cnae} | Tipo: ${tipoResultado}`);
      
      // Preparar headers
      const headers = {
        'Content-Type': 'application/json',
        'api-key': apiKey
      };

      // Preparar query params
      const params = {};
      if (tipoResultado && (tipoResultado === 'simple' || tipoResultado === 'completo')) {
        params.tipo_resultado = tipoResultado;
      }

      // Preparar corpo da requisição
      const body = {
        codigo_atividade_principal: [cnae]
      };

      console.log('📤 Enviando requisição para Casa dos Dados...');
      console.log('Headers:', { ...headers, 'api-key': '***' }); // Log sem expor a chave
      console.log('Params:', params);
      console.log('Body:', body);

      const response = await axios.post(this.baseURL, body, {
        headers,
        params,
        timeout: 30000 // 30 segundos de timeout
      });

      console.log(`✅ Sucesso! Status: ${response.status}`);
      console.log('📦 Dados recebidos:', JSON.stringify(response.data, null, 2).substring(0, 500) + '...');

      return {
        success: true,
        data: response.data,
        status: response.status
      };

    } catch (error) {
      console.error('❌ Erro na requisição:', error.message);

      if (error.response) {
        // Erro com resposta da API
        const { status, data } = error.response;
        console.error(`Status: ${status}`, data);
        
        let mensagemErro = 'Erro na API da Casa dos Dados';
        
        switch (status) {
          case 400:
            mensagemErro = 'Dados inválidos enviados para a API';
            break;
          case 401:
            mensagemErro = 'API Key inválida ou não fornecida';
            break;
          case 403:
            mensagemErro = 'Acesso negado - verifique sua API Key e saldo';
            break;
          case 404:
            mensagemErro = 'Endpoint não encontrado';
            break;
          case 429:
            mensagemErro = 'Limite de requisições excedido';
            break;
          case 500:
            mensagemErro = 'Erro interno da API da Casa dos Dados';
            break;
        }

        return {
          success: false,
          error: mensagemErro,
          status: status,
          details: data
        };

      } else if (error.request) {
        // Erro de conexão
        console.error('Erro de conexão:', error.request);
        return {
          success: false,
          error: 'Erro de conexão com a API da Casa dos Dados',
          status: 503,
          details: 'Verifique sua conexão com a internet'
        };

      } else {
        // Outro erro
        console.error('Erro desconhecido:', error.message);
        return {
          success: false,
          error: 'Erro interno do serviço',
          status: 500,
          details: error.message
        };
      }
    }
  }

  /**
   * Valida se o CNAE está no formato correto
   * @param {string} cnae - Código CNAE
   * @returns {boolean} Se é válido
   */
  validarCnae(cnae) {
    if (!cnae) return false;
    
    // Remove caracteres não numéricos
    const cnaeNumerico = cnae.replace(/\D/g, '');
    
    // CNAE deve ter 7 dígitos
    return cnaeNumerico.length === 7;
  }

  /**
   * Valida se a API Key está presente
   * @param {string} apiKey - Chave da API
   * @returns {boolean} Se é válida
   */
  validarApiKey(apiKey) {
    return apiKey && typeof apiKey === 'string' && apiKey.trim().length > 0;
  }
}

module.exports = new CasaDosDadosService(); 
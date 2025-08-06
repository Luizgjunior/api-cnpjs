const axios = require('axios');

class CasaDosDadosService {
  constructor() {
    this.baseURL = 'https://api.casadosdados.com.br/v5/cnpj/pesquisa';
  }

  /**
   * Consulta empresas por CNAE na API da Casa dos Dados
   * @param {string} apiKey - Chave da API da Casa dos Dados
   * @param {string|string[]} cnae - Código CNAE ou array de códigos para pesquisa
   * @param {string} tipoResultado - Tipo do resultado (simple ou completo)
   * @param {number} limitePorCnae - Número máximo de empresas por CNAE (padrão: 100)
   * @returns {Promise<Object>} Resposta da API externa
   */
  async consultarPorCnae(apiKey, cnae, tipoResultado = 'simple', limitePorCnae = 100) {
    try {
      // Converter para array se for string única
      const cnaes = Array.isArray(cnae) ? cnae : [cnae];
      
      console.log(`🔍 Consultando CNAEs: ${cnaes.join(', ')} | Tipo: ${tipoResultado} | Limite por CNAE: ${limitePorCnae}`);
      
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

      // Adicionar limite se especificado
      if (limitePorCnae && limitePorCnae > 0) {
        params.limite = limitePorCnae;
      }

      // Preparar corpo da requisição com todos os CNAEs
      const body = {
        codigo_atividade_principal: cnaes
      };

      console.log('📤 Enviando requisição para Casa dos Dados...');
      console.log('Headers:', { ...headers, 'api-key': '***' }); // Log sem expor a chave
      console.log('Params:', params);
      console.log('Body:', body);

      const response = await axios.post(this.baseURL, body, {
        headers,
        params,
        timeout: 60000 // 60 segundos de timeout para múltiplas consultas
      });

      console.log(`✅ Sucesso! Status: ${response.status}`);
      console.log('📦 Dados recebidos:', JSON.stringify(response.data, null, 2).substring(0, 500) + '...');

      return {
        success: true,
        data: response.data,
        status: response.status,
        total_cnaes_consultados: cnaes.length,
        limite_por_cnae: limitePorCnae
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
   * Processa e consolida os resultados em um único output
   * @param {Object} dadosOriginais - Dados da API da Casa dos Dados
   * @param {string[]} cnaesConsultados - Lista dos CNAEs consultados
   * @param {number} limitePorCnae - Limite aplicado por CNAE
   * @returns {Object} Dados consolidados em formato único
   */
  consolidarResultados(dadosOriginais, cnaesConsultados, limitePorCnae) {
    try {
      console.log('🔄 Consolidando resultados em output único...');
      
      const empresasConsolidadas = [];
      let totalEmpresas = 0;
      const resumoPorCnae = {};

      // Processar dados por CNAE (formato depende da resposta da Casa dos Dados)
      cnaesConsultados.forEach((cnae, index) => {
        const dadosCnae = dadosOriginais.data?.[index] || dadosOriginais[index] || [];
        const empresasCnae = Array.isArray(dadosCnae) ? dadosCnae : dadosCnae.empresas || [];
        
        // Limitar empresas por CNAE se necessário
        const empresasLimitadas = limitePorCnae > 0 
          ? empresasCnae.slice(0, limitePorCnae)
          : empresasCnae;

        // Adicionar CNAE aos dados de cada empresa
        const empresasComCnae = empresasLimitadas.map(empresa => ({
          ...empresa,
          cnae_consultado: cnae,
          indice_cnae: index + 1
        }));

        empresasConsolidadas.push(...empresasComCnae);
        totalEmpresas += empresasLimitadas.length;

        // Resumo por CNAE
        resumoPorCnae[cnae] = {
          total_encontradas: empresasCnae.length,
          total_retornadas: empresasLimitadas.length,
          limitado: empresasCnae.length > limitePorCnae,
          empresas_omitidas: Math.max(0, empresasCnae.length - limitePorCnae)
        };
      });

      const resultado = {
        // Dados consolidados
        empresas: empresasConsolidadas,
        
        // Estatísticas gerais
        estatisticas: {
          total_empresas: totalEmpresas,
          total_cnaes_consultados: cnaesConsultados.length,
          limite_por_cnae: limitePorCnae,
          cnaes_consultados: cnaesConsultados
        },
        
        // Resumo detalhado por CNAE
        resumo_por_cnae: resumoPorCnae,
        
        // Meta informações
        meta: {
          timestamp: new Date().toISOString(),
          formato: 'consolidado_unico',
          versao_api: '1.0.0'
        }
      };

      console.log(`✅ Consolidação concluída: ${totalEmpresas} empresas de ${cnaesConsultados.length} CNAEs`);
      
      return resultado;

    } catch (error) {
      console.error('❌ Erro na consolidação:', error.message);
      
      // Retorno de fallback em caso de erro
      return {
        empresas: [],
        estatisticas: {
          total_empresas: 0,
          total_cnaes_consultados: cnaesConsultados.length,
          limite_por_cnae: limitePorCnae,
          cnaes_consultados: cnaesConsultados
        },
        erro_consolidacao: error.message,
        dados_originais: dadosOriginais,
        meta: {
          timestamp: new Date().toISOString(),
          formato: 'consolidado_com_erro',
          versao_api: '1.0.0'
        }
      };
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
   * Valida múltiplos CNAEs
   * @param {string|string[]} cnaes - CNAE ou array de CNAEs
   * @returns {Object} Resultado da validação
   */
  validarCnaes(cnaes) {
    const cnaeArray = Array.isArray(cnaes) ? cnaes : [cnaes];
    const invalidos = [];
    const validos = [];

    cnaeArray.forEach(cnae => {
      if (this.validarCnae(cnae)) {
        validos.push(cnae.replace(/\D/g, ''));
      } else {
        invalidos.push(cnae);
      }
    });

    return {
      validos,
      invalidos,
      todosSaoValidos: invalidos.length === 0,
      totalValidos: validos.length,
      totalInvalidos: invalidos.length
    };
  }

  /**
   * Valida o limite por CNAE
   * @param {number} limite - Limite de empresas por CNAE
   * @returns {Object} Resultado da validação
   */
  validarLimite(limite) {
    if (!limite && limite !== 0) {
      return { valido: true, limite: 100 }; // Padrão
    }

    const limiteNum = parseInt(limite);
    
    if (isNaN(limiteNum) || limiteNum < 0) {
      return { 
        valido: false, 
        erro: 'Limite deve ser um número inteiro maior ou igual a 0'
      };
    }

    if (limiteNum > 1000) {
      return { 
        valido: false, 
        erro: 'Limite máximo é 1000 empresas por CNAE'
      };
    }

    return { valido: true, limite: limiteNum };
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
const express = require('express');
const casaDosDadosService = require('../services/casaDosDadosService');

const router = express.Router();

/**
 * POST /consultar-empresa
 * Consulta empresas por CNAE usando a API da Casa dos Dados
 * Aceita CNAE único ou múltiplos CNAEs com limite por CNAE
 * Retorna um único output consolidado
 */
router.post('/', async (req, res) => {
  try {
    console.log('📥 Nova requisição recebida');
    console.log('Body:', req.body);
    console.log('Query params:', req.query);

    // Extrair dados do corpo da requisição
    const { apiKey, cnae, cnaes, tipo_resultado, limite_por_cnae } = req.body;

    // Validações obrigatórias
    if (!apiKey) {
      console.log('❌ API Key não fornecida');
      return res.status(400).json({
        erro: 'API Key é obrigatória',
        campo: 'apiKey',
        exemplo_cnae_unico: {
          apiKey: "sua_chave_aqui",
          cnae: "7112000",
          tipo_resultado: "simples",
          limite_por_cnae: 50
        },
        exemplo_multiplos_cnaes: {
          apiKey: "sua_chave_aqui",
          cnaes: ["7112000", "6201500", "6204000"],
          tipo_resultado: "simples",
          limite_por_cnae: 25
        }
      });
    }

    // Aceitar tanto 'cnae' quanto 'cnaes'
    const cnaeInput = cnaes || cnae;
    
    if (!cnaeInput) {
      console.log('❌ CNAE não fornecido');
      return res.status(400).json({
        erro: 'CNAE é obrigatório. Use "cnae" para um único código ou "cnaes" para múltiplos',
        campos_aceitos: ['cnae', 'cnaes'],
        exemplo_cnae_unico: {
          apiKey: "sua_chave_aqui",
          cnae: "7112000",
          tipo_resultado: "simples",
          limite_por_cnae: 50
        },
        exemplo_multiplos_cnaes: {
          apiKey: "sua_chave_aqui",
          cnaes: ["7112000", "6201500", "6204000"],
          tipo_resultado: "simples",
          limite_por_cnae: 25
        }
      });
    }

    // Validar formato da API Key
    if (!casaDosDadosService.validarApiKey(apiKey)) {
      console.log('❌ API Key inválida');
      return res.status(400).json({
        erro: 'API Key deve ser uma string não vazia',
        campo: 'apiKey'
      });
    }

    // Validar CNAEs
    const validacao = casaDosDadosService.validarCnaes(cnaeInput);
    
    if (!validacao.todosSaoValidos) {
      console.log('❌ CNAEs inválidos encontrados:', validacao.invalidos);
      return res.status(400).json({
        erro: 'Um ou mais CNAEs são inválidos',
        cnaes_invalidos: validacao.invalidos,
        cnaes_validos: validacao.validos,
        total_invalidos: validacao.totalInvalidos,
        total_validos: validacao.totalValidos,
        regra: 'CNAE deve ter 7 dígitos numéricos',
        exemplo: 'CNAE válido: 7112000'
      });
    }

    // Validar limite por CNAE
    const validacaoLimite = casaDosDadosService.validarLimite(limite_por_cnae);
    
    if (!validacaoLimite.valido) {
      console.log('❌ Limite por CNAE inválido:', validacaoLimite.erro);
      return res.status(400).json({
        erro: validacaoLimite.erro,
        campo: 'limite_por_cnae',
        valor_recebido: limite_por_cnae,
        regras: [
          'Deve ser um número inteiro',
          'Maior ou igual a 0',
          'Máximo 1000 empresas por CNAE',
          'Se não informado, padrão é 100'
        ],
        exemplos: [0, 10, 25, 50, 100, 500]
      });
    }

    const limiteValidado = validacaoLimite.limite;

    // Se chegou até aqui, todos os CNAEs são válidos
    console.log(`✅ ${validacao.totalValidos} CNAE(s) válido(s):`, validacao.validos);
    console.log(`✅ Limite por CNAE: ${limiteValidado}`);

    // Validar tipo_resultado se fornecido
    const tiposValidos = ['simples', 'completo', 'simple', 'completo'];
    if (tipo_resultado && !tiposValidos.includes(tipo_resultado)) {
      console.log('❌ Tipo de resultado inválido');
      return res.status(400).json({
        erro: 'tipo_resultado deve ser "simples", "completo", "simple" ou "completo"',
        campo: 'tipo_resultado',
        valores_aceitos: tiposValidos
      });
    }

    // Normalizar tipo_resultado (converter para formato da API)
    let tipoNormalizado = tipo_resultado;
    if (tipo_resultado === 'simples') {
      tipoNormalizado = 'simple';
    }

    console.log(`✅ Validações passaram, consultando API externa com ${validacao.totalValidos} CNAE(s) e limite de ${limiteValidado} empresas por CNAE...`);

    // Chamar o serviço da Casa dos Dados com todos os CNAEs e limite
    const resultado = await casaDosDadosService.consultarPorCnae(
      apiKey,
      validacao.validos,
      tipoNormalizado,
      limiteValidado
    );

    // Verificar se houve sucesso
    if (resultado.success) {
      console.log('✅ Consulta realizada com sucesso, consolidando resultados...');
      
      // Consolidar todos os resultados em um único output
      const resultadoConsolidado = casaDosDadosService.consolidarResultados(
        resultado.data,
        validacao.validos,
        limiteValidado
      );
      
      // Retornar dados consolidados
      return res.status(200).json(resultadoConsolidado);
      
    } else {
      console.log('❌ Erro na consulta externa');
      
      // Retornar erro da API externa
      return res.status(resultado.status || 500).json({
        erro: resultado.error,
        detalhes: resultado.details,
        origem: 'Casa dos Dados API',
        cnaes_tentados: validacao.validos,
        limite_por_cnae: limiteValidado
      });
    }

  } catch (error) {
    console.error('💥 Erro inesperado na rota:', error);
    
    return res.status(500).json({
      erro: 'Erro interno do servidor',
      detalhes: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * GET /consultar-empresa
 * Endpoint para mostrar informações sobre como usar a API
 */
router.get('/', (req, res) => {
  res.json({
    endpoint: 'POST /consultar-empresa',
    descrição: 'Consulta empresas por CNAE usando a API da Casa dos Dados',
    suporte: 'CNAE único ou múltiplos CNAEs com limite personalizável por CNAE',
    formato_resposta: 'Único output consolidado com todas as empresas',
    parametros_obrigatórios: {
      apiKey: 'Sua chave da API da Casa dos Dados',
      cnae: 'Código CNAE de 7 dígitos (para consulta única)',
      cnaes: 'Array de códigos CNAE (para múltiplas consultas)'
    },
    parametros_opcionais: {
      tipo_resultado: 'Tipo do resultado: "simples", "completo", "simple" ou "completo" (padrão: "simple")',
      limite_por_cnae: 'Número máximo de empresas por CNAE (padrão: 100, máximo: 1000)'
    },
    exemplos: {
      cnae_unico: {
        método: 'POST',
        url: '/consultar-empresa',
        body: {
          apiKey: 'sua_chave_aqui',
          cnae: '7112000',
          tipo_resultado: 'simples',
          limite_por_cnae: 50
        }
      },
      multiplos_cnaes: {
        método: 'POST',
        url: '/consultar-empresa',
        body: {
          apiKey: 'sua_chave_aqui',
          cnaes: ['7112000', '6201500', '6204000'],
          tipo_resultado: 'simples',
          limite_por_cnae: 25
        }
      },
      sem_limite: {
        método: 'POST',
        url: '/consultar-empresa',
        body: {
          apiKey: 'sua_chave_aqui',
          cnaes: ['7112000', '6201500'],
          tipo_resultado: 'simples',
          limite_por_cnae: 0
        },
        observacao: 'limite_por_cnae: 0 retorna todas as empresas encontradas'
      }
    },
    exemplo_resposta_consolidada: {
      empresas: [
        {
          cnpj: '00000000000000',
          razao_social: 'Empresa Exemplo Ltda',
          nome_fantasia: 'Exemplo',
          cnae_consultado: '7112000',
          indice_cnae: 1
        }
      ],
      estatisticas: {
        total_empresas: 150,
        total_cnaes_consultados: 3,
        limite_por_cnae: 50,
        cnaes_consultados: ['7112000', '6201500', '6204000']
      },
      resumo_por_cnae: {
        '7112000': {
          total_encontradas: 200,
          total_retornadas: 50,
          limitado: true,
          empresas_omitidas: 150
        }
      },
      meta: {
        timestamp: '2025-08-06T14:30:00.000Z',
        formato: 'consolidado_unico',
        versao_api: '1.0.0'
      }
    },
    exemplos_curl: {
      multiplos_com_limite: `curl -X POST http://localhost:3000/consultar-empresa \\
-H "Content-Type: application/json" \\
-d '{
  "apiKey": "sua_chave_aqui",
  "cnaes": ["7112000", "6201500", "6204000"],
  "tipo_resultado": "simples",
  "limite_por_cnae": 25
}'`,
      sem_limite: `curl -X POST http://localhost:3000/consultar-empresa \\
-H "Content-Type: application/json" \\
-d '{
  "apiKey": "sua_chave_aqui",
  "cnaes": ["7112000", "6201500"],
  "limite_por_cnae": 0
}'`
    },
    vantagens: [
      "Todos os resultados em uma única resposta consolidada",
      "Controle do número de empresas por CNAE",
      "Estatísticas detalhadas por CNAE",
      "Formato otimizado para automações",
      "Indicação de quantas empresas foram omitidas",
      "Meta-informações para controle e auditoria"
    ]
  });
});

module.exports = router; 
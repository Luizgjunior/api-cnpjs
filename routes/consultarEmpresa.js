const express = require('express');
const casaDosDadosService = require('../services/casaDosDadosService');

const router = express.Router();

/**
 * POST /consultar-empresa
 * Consulta empresas por CNAE usando a API da Casa dos Dados
 * Aceita CNAE único ou múltiplos CNAEs
 */
router.post('/', async (req, res) => {
  try {
    console.log('📥 Nova requisição recebida');
    console.log('Body:', req.body);
    console.log('Query params:', req.query);

    // Extrair dados do corpo da requisição
    const { apiKey, cnae, cnaes, tipo_resultado } = req.body;

    // Validações obrigatórias
    if (!apiKey) {
      console.log('❌ API Key não fornecida');
      return res.status(400).json({
        erro: 'API Key é obrigatória',
        campo: 'apiKey',
        exemplo_cnae_unico: {
          apiKey: "sua_chave_aqui",
          cnae: "7112000",
          tipo_resultado: "simples"
        },
        exemplo_multiplos_cnaes: {
          apiKey: "sua_chave_aqui",
          cnaes: ["7112000", "6201500", "6204000"],
          tipo_resultado: "simples"
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
          tipo_resultado: "simples"
        },
        exemplo_multiplos_cnaes: {
          apiKey: "sua_chave_aqui",
          cnaes: ["7112000", "6201500", "6204000"],
          tipo_resultado: "simples"
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

    // Se chegou até aqui, todos os CNAEs são válidos
    console.log(`✅ ${validacao.totalValidos} CNAE(s) válido(s):`, validacao.validos);

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

    console.log(`✅ Validações passaram, consultando API externa com ${validacao.totalValidos} CNAE(s)...`);

    // Chamar o serviço da Casa dos Dados com todos os CNAEs
    const resultado = await casaDosDadosService.consultarPorCnae(
      apiKey,
      validacao.validos,
      tipoNormalizado
    );

    // Verificar se houve sucesso
    if (resultado.success) {
      console.log('✅ Consulta realizada com sucesso');
      
      // Adicionar informações extras ao retorno
      const resposta = {
        ...resultado.data,
        meta_informacoes: {
          total_cnaes_consultados: resultado.total_cnaes_consultados,
          cnaes_consultados: validacao.validos,
          tipo_resultado: tipoNormalizado,
          timestamp: new Date().toISOString()
        }
      };
      
      // Retornar os dados originais da API externa com informações extras
      return res.status(200).json(resposta);
      
    } else {
      console.log('❌ Erro na consulta externa');
      
      // Retornar erro da API externa
      return res.status(resultado.status || 500).json({
        erro: resultado.error,
        detalhes: resultado.details,
        origem: 'Casa dos Dados API',
        cnaes_tentados: validacao.validos
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
    suporte: 'CNAE único ou múltiplos CNAEs em uma única requisição',
    parametros_obrigatórios: {
      apiKey: 'Sua chave da API da Casa dos Dados',
      cnae: 'Código CNAE de 7 dígitos (para consulta única)',
      cnaes: 'Array de códigos CNAE (para múltiplas consultas)'
    },
    parametros_opcionais: {
      tipo_resultado: 'Tipo do resultado: "simples", "completo", "simple" ou "completo"'
    },
    exemplos: {
      cnae_unico: {
        método: 'POST',
        url: '/consultar-empresa',
        body: {
          apiKey: 'sua_chave_aqui',
          cnae: '7112000',
          tipo_resultado: 'simples'
        }
      },
      multiplos_cnaes: {
        método: 'POST',
        url: '/consultar-empresa',
        body: {
          apiKey: 'sua_chave_aqui',
          cnaes: ['7112000', '6201500', '6204000'],
          tipo_resultado: 'simples'
        }
      }
    },
    exemplos_curl: {
      cnae_unico: `curl -X POST http://localhost:3000/consultar-empresa \\
-H "Content-Type: application/json" \\
-d '{
  "apiKey": "sua_chave_aqui",
  "cnae": "7112000",
  "tipo_resultado": "simples"
}'`,
      multiplos_cnaes: `curl -X POST http://localhost:3000/consultar-empresa \\
-H "Content-Type: application/json" \\
-d '{
  "apiKey": "sua_chave_aqui",
  "cnaes": ["7112000", "6201500", "6204000"],
  "tipo_resultado": "simples"
}'`
    },
    vantagens_multiplos: [
      "Todos os resultados em uma única resposta",
      "Menor uso de requests da API",
      "Mais eficiente para automações",
      "Ideal para uso no n8n"
    ]
  });
});

module.exports = router; 
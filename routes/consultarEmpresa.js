const express = require('express');
const casaDosDadosService = require('../services/casaDosDadosService');

const router = express.Router();

/**
 * POST /consultar-empresa
 * Consulta empresas por CNAE usando a API da Casa dos Dados
 */
router.post('/', async (req, res) => {
  try {
    console.log('📥 Nova requisição recebida');
    console.log('Body:', req.body);
    console.log('Query params:', req.query);

    // Extrair dados do corpo da requisição
    const { apiKey, cnae, tipo_resultado } = req.body;

    // Validações obrigatórias
    if (!apiKey) {
      console.log('❌ API Key não fornecida');
      return res.status(400).json({
        erro: 'API Key é obrigatória',
        campo: 'apiKey',
        exemplo: {
          apiKey: "sua_chave_aqui",
          cnae: "7112000",
          tipo_resultado: "simples"
        }
      });
    }

    if (!cnae) {
      console.log('❌ CNAE não fornecido');
      return res.status(400).json({
        erro: 'CNAE é obrigatório',
        campo: 'cnae',
        exemplo: {
          apiKey: "sua_chave_aqui",
          cnae: "7112000",
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

    // Validar formato do CNAE
    if (!casaDosDadosService.validarCnae(cnae)) {
      console.log('❌ CNAE inválido');
      return res.status(400).json({
        erro: 'CNAE deve ter 7 dígitos numéricos',
        campo: 'cnae',
        exemplo: 'CNAE válido: 7112000'
      });
    }

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

    console.log('✅ Validações passaram, consultando API externa...');

    // Chamar o serviço da Casa dos Dados
    const resultado = await casaDosDadosService.consultarPorCnae(
      apiKey,
      cnae,
      tipoNormalizado
    );

    // Verificar se houve sucesso
    if (resultado.success) {
      console.log('✅ Consulta realizada com sucesso');
      
      // Retornar os dados originais da API externa
      return res.status(200).json(resultado.data);
      
    } else {
      console.log('❌ Erro na consulta externa');
      
      // Retornar erro da API externa
      return res.status(resultado.status || 500).json({
        erro: resultado.error,
        detalhes: resultado.details,
        origem: 'Casa dos Dados API'
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
    parametros_obrigatórios: {
      apiKey: 'Sua chave da API da Casa dos Dados',
      cnae: 'Código CNAE de 7 dígitos (ex: 7112000)'
    },
    parametros_opcionais: {
      tipo_resultado: 'Tipo do resultado: "simples", "completo", "simple" ou "completo"'
    },
    exemplo: {
      método: 'POST',
      url: '/consultar-empresa',
      body: {
        apiKey: 'sua_chave_aqui',
        cnae: '7112000',
        tipo_resultado: 'simples'
      }
    },
    exemplo_curl: `curl -X POST http://localhost:3000/consultar-empresa \\
-H "Content-Type: application/json" \\
-d '{
  "apiKey": "sua_chave_aqui",
  "cnae": "7112000",
  "tipo_resultado": "simples"
}'`
  });
});

module.exports = router; 
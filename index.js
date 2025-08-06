const express = require('express');
const cors = require('cors');
const consultarEmpresaRoutes = require('./routes/consultarEmpresa');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Log de requests para debug
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Rotas
app.use('/consultar-empresa', consultarEmpresaRoutes);

// Rota de health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'API CNAE Empresas - Casa dos Dados',
    status: 'ativo',
    endpoints: {
      consulta: 'POST /consultar-empresa'
    }
  });
});

// Middleware de erro global
app.use((err, req, res, next) => {
  console.error('Erro:', err);
  res.status(500).json({ 
    erro: 'Erro interno do servidor',
    detalhes: err.message 
  });
});

// Rota 404
app.use('*', (req, res) => {
  res.status(404).json({ 
    erro: 'Rota não encontrada',
    endpoints_disponíveis: ['GET /', 'POST /consultar-empresa']
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 Acesse: http://localhost:${PORT}`);
}); 
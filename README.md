# 🏢 API CNAE Empresas

API REST em Node.js para consultar empresas por código CNAE usando a [Casa dos Dados](https://casadosdados.com.br/).

## 🚀 Deploy Rápido

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template/nodejs)

## 📋 Funcionalidades

- ✅ Consulta empresas por código CNAE (único ou múltiplos)
- ✅ **Múltiplas consultas em uma única requisição**
- ✅ Suporte a diferentes tipos de resultado (simples/completo)
- ✅ Validação robusta de parâmetros
- ✅ Tratamento de erros da API externa
- ✅ Logs detalhados para debug
- ✅ Pronto para deploy com Docker
- ✅ **Ideal para automações e n8n**

## 🛠️ Tecnologias

- **Node.js** 18+
- **Express.js** - Framework web
- **Axios** - Cliente HTTP
- **CORS** - Habilitado para requisições cross-origin

## 📦 Instalação Local

### 1. Clone o repositório
```bash
git clone https://github.com/Luizgjunior/api-cnpjs.git
cd api-cnpjs
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Inicie o servidor
```bash
npm start
```

**Servidor local:** `http://localhost:3000`  
**Produção (Railway):** `https://web-production-720d.up.railway.app`

## 🔑 Como Usar

### Endpoint Principal
```
POST /consultar-empresa
```

### Parâmetros Obrigatórios

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `apiKey` | string | Sua chave de API da Casa dos Dados |
| `cnae` | string | Código CNAE de 7 dígitos (para consulta única) |
| `cnaes` | array | Array de códigos CNAE (para múltiplas consultas) |

**Nota:** Use `cnae` para consulta única ou `cnaes` para múltiplas consultas.

### Parâmetros Opcionais

| Parâmetro | Tipo | Descrição | Valores Aceitos |
|-----------|------|-----------|-----------------|
| `tipo_resultado` | string | Tipo de resposta desejada | "simples", "completo", "simple", "completo" |
| `limite_por_cnae` | number | Máximo de empresas por CNAE | 0-1000 (padrão: 100) |

## 📚 Tutorial Completo

### 🚀 **Passo 1: Obter API Key da Casa dos Dados**
1. Acesse [Casa dos Dados](https://casadosdados.com.br/)
2. Faça seu cadastro/login
3. Obtenha sua API Key no painel
4. Guarde a chave com segurança

### 🎯 **Passo 2: Entender os Parâmetros**

| Parâmetro | Obrigatório | Descrição | Exemplo |
|-----------|-------------|-----------|---------|
| `apiKey` | ✅ Sim | Sua chave da Casa dos Dados | `"abc123xyz"` |
| `cnae` | ✅ Sim* | CNAE único (7 dígitos) | `"7112000"` |
| `cnaes` | ✅ Sim* | Array de CNAEs | `["7112000", "6201500"]` |
| `tipo_resultado` | ❌ Não | Tipo de dados | `"simples"` ou `"completo"` |
| `limite_por_cnae` | ❌ Não | Máximo por CNAE | `25` (padrão: 100) |

*Use `cnae` para 1 código OU `cnaes` para múltiplos

### 🧪 **Passo 3: Primeiro Teste (Health Check)**
```bash
curl https://web-production-720d.up.railway.app/
```
**Resposta esperada:**
```json
{
  "message": "API CNAE Empresas - Casa dos Dados",
  "status": "ativo",
  "endpoints": {
    "consulta": "POST /consultar-empresa"
  }
}
```

### 🎲 **Passo 4: Teste Básico (CNAE Único)**
```bash
curl -X POST https://web-production-720d.up.railway.app/consultar-empresa \
-H "Content-Type: application/json" \
-d '{
  "apiKey": "SUA_CHAVE_AQUI",
  "cnae": "7112000",
  "limite_por_cnae": 10
}'
```

### 🎯 **Passo 5: Teste Avançado (Múltiplos CNAEs)**
```bash
curl -X POST https://web-production-720d.up.railway.app/consultar-empresa \
-H "Content-Type: application/json" \
-d '{
  "apiKey": "SUA_CHAVE_AQUI",
  "cnaes": ["7112000", "6201500", "6204000"],
  "tipo_resultado": "simples",
  "limite_por_cnae": 25
}'
```

### 📊 **Passo 6: Entender a Resposta**

**Estrutura da resposta consolidada:**
```json
{
  "empresas": [
    {
      "cnpj": "12345678000190",
      "razao_social": "Tech Solutions Ltda",
      "nome_fantasia": "TechSol",
      "cnae_consultado": "7112000",
      "indice_cnae": 1
    }
  ],
  "estatisticas": {
    "total_empresas": 75,
    "total_cnaes_consultados": 3,
    "limite_por_cnae": 25,
    "cnaes_consultados": ["7112000", "6201500", "6204000"]
  },
  "resumo_por_cnae": {
    "7112000": {
      "total_encontradas": 150,
      "total_retornadas": 25,
      "limitado": true,
      "empresas_omitidas": 125
    }
  },
  "meta": {
    "timestamp": "2025-08-06T14:30:00.000Z",
    "formato": "consolidado_unico",
    "versao_api": "1.0.0"
  }
}
```

**Explicação dos campos:**
- `empresas[]`: Array com todas as empresas consolidadas
- `estatisticas{}`: Totais gerais da consulta
- `resumo_por_cnae{}`: Detalhes específicos por CNAE
- `meta{}`: Informações de controle e timestamp

## 📝 Exemplos de Uso

### 🔸 Consulta Única (CNAE Simples)
```bash
# Produção (Railway)
curl -X POST https://web-production-720d.up.railway.app/consultar-empresa \
-H "Content-Type: application/json" \
-d '{
  "apiKey": "sua_chave_da_casa_dos_dados",
  "cnae": "7112000",
  "tipo_resultado": "simples"
}'

# Local
curl -X POST http://localhost:3000/consultar-empresa \
-H "Content-Type: application/json" \
-d '{
  "apiKey": "sua_chave_da_casa_dos_dados",
  "cnae": "7112000",
  "tipo_resultado": "simples"
}'
```

### 🔸 Múltiplas Consultas com Limite (25 empresas por CNAE)
```bash
# Produção (Railway)
curl -X POST https://web-production-720d.up.railway.app/consultar-empresa \
-H "Content-Type: application/json" \
-d '{
  "apiKey": "sua_chave_da_casa_dos_dados",
  "cnaes": ["7112000", "6201500", "6204000", "8599604"],
  "tipo_resultado": "simples",
  "limite_por_cnae": 25
}'
```

### 🔸 Todas as Empresas (Sem limite)
```bash
# Produção (Railway)
curl -X POST https://web-production-720d.up.railway.app/consultar-empresa \
-H "Content-Type: application/json" \
-d '{
  "apiKey": "sua_chave_da_casa_dos_dados",
  "cnaes": ["7112000", "6201500"],
  "tipo_resultado": "completo",
  "limite_por_cnae": 0
}'
```

### 🔸 JavaScript/Fetch (Múltiplos CNAEs)
```javascript
// Produção (Railway)
const response = await fetch('https://web-production-720d.up.railway.app/consultar-empresa', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    apiKey: 'sua_chave_da_casa_dos_dados',
    cnaes: ['7112000', '6201500', '6204000'], // Múltiplos CNAEs
    tipo_resultado: 'simples',
    limite_por_cnae: 30 // Máximo 30 empresas por CNAE
  })
});

const dados = await response.json();
console.log('Total de empresas:', dados.estatisticas.total_empresas);
console.log('CNAEs consultados:', dados.estatisticas.cnaes_consultados);
console.log('Empresas consolidadas:', dados.empresas);
```

## 🎯 Controle de Limite por CNAE

### 📊 **Parâmetro `limite_por_cnae`**
- **Padrão:** 100 empresas por CNAE
- **Mínimo:** 0 (retorna todas as empresas)
- **Máximo:** 1000 empresas por CNAE
- **Flexível:** Cada CNAE respeitará o mesmo limite

### 💡 **Casos de Uso**
```json
{
  "limite_por_cnae": 10,    // Apenas 10 empresas por CNAE
  "limite_por_cnae": 50,    // 50 empresas por CNAE
  "limite_por_cnae": 0,     // Todas as empresas (sem limite)
  "limite_por_cnae": 1000   // Máximo permitido
}
```

## 🚀 Vantagens das Múltiplas Consultas

### ✅ **Eficiência e Controle Máximo**
- **Uma única requisição** para múltiplos CNAEs
- **Controle preciso** do número de empresas por CNAE
- **Reduz custos** da API da Casa dos Dados
- **Perfeito para automações** (n8n, Zapier, etc.)
- **Todos os resultados consolidados** em uma resposta
- **Estatísticas detalhadas** por CNAE

### 📊 **Exemplo de Resposta Consolidada**
```json
{
  "empresas": [
    {
      "cnpj": "12345678000190",
      "razao_social": "Tech Solutions Ltda",
      "nome_fantasia": "TechSol",
      "cnae_consultado": "7112000",
      "indice_cnae": 1
    },
    {
      "cnpj": "98765432000111",
      "razao_social": "Dev Company SA",
      "nome_fantasia": "DevCorp",
      "cnae_consultado": "6201500",
      "indice_cnae": 2
    }
  ],
  "estatisticas": {
    "total_empresas": 150,
    "total_cnaes_consultados": 3,
    "limite_por_cnae": 50,
    "cnaes_consultados": ["7112000", "6201500", "6204000"]
  },
  "resumo_por_cnae": {
    "7112000": {
      "total_encontradas": 200,
      "total_retornadas": 50,
      "limitado": true,
      "empresas_omitidas": 150
    },
    "6201500": {
      "total_encontradas": 45,
      "total_retornadas": 45,
      "limitado": false,
      "empresas_omitidas": 0
    }
  },
  "meta": {
    "timestamp": "2025-08-06T14:30:00.000Z",
    "formato": "consolidado_unico",
    "versao_api": "1.0.0"
  }
}
```

## 📊 Códigos CNAE Comuns

| Código | Descrição |
|--------|-----------|
| 7112000 | Serviços de engenharia |
| 6201500 | Desenvolvimento de programas de computador sob encomenda |
| 6204000 | Consultoria em tecnologia da informação |
| 8599604 | Treinamento em desenvolvimento profissional e gerencial |

## 🚨 Tratamento de Erros

### 400 - Bad Request
```json
{
  "erro": "API Key é obrigatória",
  "campo": "apiKey",
  "exemplo": {
    "apiKey": "sua_chave_aqui",
    "cnae": "7112000",
    "tipo_resultado": "simples"
  }
}
```

### 401 - Unauthorized
```json
{
  "erro": "API Key inválida ou não fornecida",
  "origem": "Casa dos Dados API"
}
```

### 403 - Forbidden
```json
{
  "erro": "Acesso negado - verifique sua API Key e saldo",
  "origem": "Casa dos Dados API"
}
```

## 📋 Endpoints Disponíveis

### GET /
```
Informações sobre a API e status
```

### GET /consultar-empresa
```
Instruções sobre como usar o endpoint POST
```

### POST /consultar-empresa
```
Consulta empresas por CNAE
```

## 🐳 Docker

### Construir a imagem
```bash
docker build -t api-cnae-empresas .
```

### Executar o container
```bash
docker run -p 3000:3000 api-cnae-empresas
```

## 🌐 Deploy

### Railway
1. Clique no botão "Deploy on Railway" acima
2. Conecte seu GitHub
3. A aplicação será implantada automaticamente

### Heroku
```bash
heroku create api-cnae-empresas
git push heroku main
```

### Docker Hub
```bash
docker build -t seu-usuario/api-cnae-empresas .
docker push seu-usuario/api-cnae-empresas
```

## 🔧 Configuração

### Variáveis de Ambiente

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `PORT` | 3000 | Porta do servidor |

## 📝 Logs

A API gera logs detalhados para debug:

```
🔍 Consultando CNAE: 7112000 | Tipo: simples
📤 Enviando requisição para Casa dos Dados...
✅ Sucesso! Status: 200
📦 Dados recebidos: {...}
```

## 🛡️ Segurança

- ✅ API Key não é armazenada no servidor
- ✅ Validação de todos os parâmetros de entrada
- ✅ Logs não expõem a API Key completa
- ✅ Container Docker roda com usuário não-root
- ✅ CORS habilitado para uso em frontends

## 🧪 Testando a API

### Health Check
```bash
# Produção
curl https://web-production-720d.up.railway.app/

# Local
curl http://localhost:3000/
```

### Teste com CNAE inválido
```bash
# Produção
curl -X POST https://web-production-720d.up.railway.app/consultar-empresa \
-H "Content-Type: application/json" \
-d '{"apiKey": "teste", "cnae": "123"}'
```

## 📚 Documentação da Casa dos Dados

Para obter sua API Key e ver a documentação completa:
- 🌐 [Site oficial](https://casadosdados.com.br/)
- 📖 [Documentação da API](https://docs.casadosdados.com.br/)

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Autor

Desenvolvido com ❤️ para facilitar consultas de empresas por CNAE.

---

## 🎓 Tutorial n8n Completo

### **Passo 1: Configurar Workflow**
1. Crie um novo workflow no n8n
2. Adicione um **Manual Trigger**
3. Conecte um **Set Node**
4. Conecte um **HTTP Request Node**
5. Adicione um **Function Node** (opcional)

### **Passo 2: Configurar Set Node**
```json
{
  "apiKey": "sua_chave_da_casa_dos_dados",
  "cnaes": ["7112000", "6201500", "6204000"],
  "limite": 30,
  "tipo": "simples"
}
```

### **Passo 3: Configurar HTTP Request Node**
- **Method:** POST
- **URL:** `https://web-production-720d.up.railway.app/consultar-empresa`
- **Headers:** 
  ```json
  {
    "Content-Type": "application/json"
  }
  ```
- **Body:**
  ```json
  {
    "apiKey": "{{ $json.apiKey }}",
    "cnaes": "{{ $json.cnaes }}",
    "tipo_resultado": "{{ $json.tipo }}",
    "limite_por_cnae": "{{ $json.limite }}"
  }
  ```

### **Passo 4: Function Node (Processar Dados)**
```javascript
// Extrair dados da resposta consolidada
const response = $input.first().json;
const empresas = response.empresas || [];

console.log(`📊 ${response.estatisticas.total_empresas} empresas encontradas`);
console.log(`🎯 ${response.estatisticas.total_cnaes_consultados} CNAEs consultados`);

// Processar cada empresa
return empresas.map((empresa, index) => ({
  json: {
    id: index + 1,
    cnpj: empresa.cnpj,
    nome: empresa.razao_social,
    fantasia: empresa.nome_fantasia,
    cnae: empresa.cnae_consultado,
    processado_em: new Date().toISOString()
  }
}));
```

### **Passo 5: Executar e Verificar**
1. Execute o workflow manualmente
2. Verifique os logs no Function Node
3. Confirme os dados processados

## 🛠️ Exemplos cURL Completos

### **🔥 Comando Mais Usado**
```bash
curl -X POST https://web-production-720d.up.railway.app/consultar-empresa \
-H "Content-Type: application/json" \
-d '{
  "apiKey": "SUA_CHAVE_AQUI",
  "cnaes": ["7112000", "6201500", "6204000"],
  "limite_por_cnae": 50
}'
```

### **🎯 Para Automações**
```bash
# Múltiplos CNAEs com limite baixo (ideal para testes)
curl -X POST https://web-production-720d.up.railway.app/consultar-empresa \
-H "Content-Type: application/json" \
-d '{
  "apiKey": "SUA_CHAVE_AQUI",
  "cnaes": ["7112000", "6201500", "6204000", "8599604"],
  "tipo_resultado": "simples",
  "limite_por_cnae": 10
}'
```

### **🚀 Para Grandes Volumes**
```bash
# Sem limite (todas as empresas)
curl -X POST https://web-production-720d.up.railway.app/consultar-empresa \
-H "Content-Type: application/json" \
-d '{
  "apiKey": "SUA_CHAVE_AQUI",
  "cnaes": ["7112000", "6201500"],
  "tipo_resultado": "completo",
  "limite_por_cnae": 0
}'
```

### **🧪 Para Testes**
```bash
# Health Check
curl https://web-production-720d.up.railway.app/

# Documentação
curl https://web-production-720d.up.railway.app/consultar-empresa

# Teste de erro (CNAE inválido)
curl -X POST https://web-production-720d.up.railway.app/consultar-empresa \
-H "Content-Type: application/json" \
-d '{
  "apiKey": "teste",
  "cnae": "123"
}'
```

## 🔗 Uso no n8n com Railway

### **HTTP Request Node (Produção)**
```json
{
  "method": "POST", 
  "url": "https://web-production-720d.up.railway.app/consultar-empresa",
  "headers": {
    "Content-Type": "application/json"
  },
  "body": {
    "apiKey": "{{ $json.apiKey }}",
    "cnaes": "{{ $json.cnaes }}",
    "limite_por_cnae": "{{ $json.limite || 50 }}"
  }
}
```

### **Set Node (Entrada)**
```json
{
  "apiKey": "sua_chave_da_casa_dos_dados",
  "cnaes": ["7112000", "6201500", "6204000"],
  "limite": 25
}
```

### **Function Node (Processar)**
```javascript
// Processar resposta consolidada
const dados = $input.first().json;

console.log(`✅ ${dados.estatisticas.total_empresas} empresas encontradas`);
console.log(`📊 ${dados.estatisticas.total_cnaes_consultados} CNAEs consultados`);

// Retornar empresas processadas
return dados.empresas.map(empresa => ({
  json: {
    cnpj: empresa.cnpj,
    razao_social: empresa.razao_social,
    cnae: empresa.cnae_consultado,
    processado_em: new Date().toISOString()
  }
}));
```

---

## ❓ FAQ e Troubleshooting

### **🔥 Perguntas Frequentes**

**Q: Quantos CNAEs posso consultar por vez?**
A: Não há limite de CNAEs, mas cada CNAE respeita o `limite_por_cnae` (padrão: 100 empresas).

**Q: Qual a diferença entre "simples" e "completo"?**
A: Depende da API da Casa dos Dados. "simples" retorna dados básicos, "completo" inclui mais detalhes.

**Q: Como sei se minha API Key está válida?**
A: Faça um teste com um CNAE válido. Se retornar erro 401, a chave está inválida.

**Q: Posso usar `limite_por_cnae: 0`?**
A: Sim! Zero significa "sem limite" - retorna todas as empresas encontradas.

**Q: O que significa "empresas_omitidas"?**
A: É quantas empresas foram encontradas mas não retornadas devido ao limite.

### **🔧 Soluções de Problemas**

**❌ Erro 400 - "CNAE é obrigatório"**
```bash
# ❌ ERRADO
{"apiKey": "abc123"}

# ✅ CORRETO  
{"apiKey": "abc123", "cnae": "7112000"}
# OU
{"apiKey": "abc123", "cnaes": ["7112000"]}
```

**❌ Erro 400 - "CNAE inválido"**
```bash
# ❌ ERRADO
{"cnae": "123"}

# ✅ CORRETO (7 dígitos)
{"cnae": "7112000"}
```

**❌ Erro 401 - "API Key inválida"**
- Verifique se a chave está correta
- Confirme se tem saldo na Casa dos Dados
- Teste no site da Casa dos Dados primeiro

**❌ Erro 403 - "Acesso negado"**
- Saldo insuficiente na Casa dos Dados
- Plano expirado
- Limite de requisições excedido

**❌ "Timeout" ou sem resposta**
- Reduza o número de CNAEs
- Reduza o `limite_por_cnae`
- Verifique sua conexão

### **📊 Códigos de Resposta**

| Código | Significado | Ação |
|--------|-------------|------|
| 200 | ✅ Sucesso | Dados retornados |
| 400 | ❌ Dados inválidos | Verificar parâmetros |
| 401 | ❌ API Key inválida | Verificar chave |
| 403 | ❌ Acesso negado | Verificar saldo |
| 500 | ❌ Erro interno | Tentar novamente |

### **🎯 Dicas de Performance**

1. **Para testes:** `limite_por_cnae: 10`
2. **Para produção:** `limite_por_cnae: 50-100`
3. **Para análises:** `limite_por_cnae: 0` (sem limite)
4. **Múltiplos CNAEs:** Máximo 5-10 por vez
5. **Use cache:** Salve resultados para evitar repetir consultas

### **📞 Suporte**

- **Bug no código:** Abra uma issue no GitHub
- **Dúvidas da API Casa dos Dados:** Contato direto com eles
- **Deploy Railway:** Documentação oficial do Railway

---

⭐ Se este projeto te ajudou, considere dar uma estrela no GitHub! 
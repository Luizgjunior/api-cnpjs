# 🏢 API CNAE Empresas

API REST em Node.js para consultar empresas por código CNAE usando a [Casa dos Dados](https://casadosdados.com.br/).

## 🚀 Deploy Rápido

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/VWy6I1?referralCode=DElEMs)

## 📋 Funcionalidades

- ✅ Consulta empresas por código CNAE
- ✅ Suporte a diferentes tipos de resultado (simples/completo)
- ✅ Validação robusta de parâmetros
- ✅ Tratamento de erros da API externa
- ✅ Logs detalhados para debug
- ✅ Pronto para deploy com Docker

## 🛠️ Tecnologias

- **Node.js** 18+
- **Express.js** - Framework web
- **Axios** - Cliente HTTP
- **CORS** - Habilitado para requisições cross-origin

## 📦 Instalação Local

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/api-cnae-empresas.git
cd api-cnae-empresas
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Inicie o servidor
```bash
npm start
```

O servidor estará rodando em `http://localhost:3000`

## 🔑 Como Usar

### Endpoint Principal
```
POST /consultar-empresa
```

### Parâmetros Obrigatórios

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `apiKey` | string | Sua chave de API da Casa dos Dados |
| `cnae` | string | Código CNAE de 7 dígitos (ex: "7112000") |

### Parâmetros Opcionais

| Parâmetro | Tipo | Descrição | Valores Aceitos |
|-----------|------|-----------|-----------------|
| `tipo_resultado` | string | Tipo de resposta desejada | "simples", "completo", "simple", "completo" |

## 📝 Exemplos de Uso

### Consulta Simples
```bash
curl -X POST http://localhost:3000/consultar-empresa \
-H "Content-Type: application/json" \
-d '{
  "apiKey": "sua_chave_da_casa_dos_dados",
  "cnae": "7112000",
  "tipo_resultado": "simples"
}'
```

### Consulta Completa
```bash
curl -X POST http://localhost:3000/consultar-empresa \
-H "Content-Type: application/json" \
-d '{
  "apiKey": "sua_chave_da_casa_dos_dados",
  "cnae": "7112000",
  "tipo_resultado": "completo"
}'
```

### JavaScript/Fetch
```javascript
const response = await fetch('http://localhost:3000/consultar-empresa', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    apiKey: 'sua_chave_da_casa_dos_dados',
    cnae: '7112000',
    tipo_resultado: 'simples'
  })
});

const dados = await response.json();
console.log(dados);
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
curl http://localhost:3000/
```

### Teste com CNAE inválido
```bash
curl -X POST http://localhost:3000/consultar-empresa \
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

⭐ Se este projeto te ajudou, considere dar uma estrela no GitHub! 
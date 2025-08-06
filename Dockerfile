# Use Node.js 18 com Alpine Linux (imagem leve)
FROM node:18-alpine

# Criar diretório da aplicação
WORKDIR /usr/src/app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production && npm cache clean --force

# Copiar código da aplicação
COPY . .

# Criar usuário não-root para segurança
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Mudar proprietário dos arquivos
RUN chown -R nodejs:nodejs /usr/src/app
USER nodejs

# Expor a porta
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["node", "index.js"] 
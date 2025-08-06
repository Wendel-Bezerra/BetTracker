# BetTracker - Sistema de Gestão de Apostas

Um sistema completo para gerenciar suas apostas esportivas com banco de dados local SQLite.

## 🌟 Funcionalidades

- ✅ **Gestão de apostas**: Adicione, edite e remova apostas
- ✅ **Cálculo automático**: Lucros e prejuízos calculados automaticamente
- ✅ **Configuração de banca**: Defina sua banca inicial
- ✅ **Estatísticas**: Taxa de acerto, total investido, etc.
- ✅ **Banco local**: Dados salvos localmente em SQLite
- ✅ **Backup/Restore**: Exporte e importe seus dados
- ✅ **Interface responsiva**: Funciona em desktop e mobile
- ✅ **Modo offline**: Funciona sem internet

## 🚀 Como usar

### 1. Clone o repositório
```bash
git clone https://github.com/seu-usuario/bettracker.git
cd bettracker
```

### 2. Instale as dependências
```bash
npm install
```

### 3. Execute o projeto
```bash
npm run dev
```

### 4. Acesse o aplicativo
Abra http://localhost:3000 no seu navegador

### 5. Crie uma conta
- Digite seu email e nome
- Configure sua banca inicial
- Comece a adicionar apostas!

## 💾 Banco de Dados Local

O sistema usa SQLite para armazenar dados localmente:

- **Localização**: `data/bettracker.db`
- **Tabelas**: users, bets, user_settings
- **Backup**: Exporta para arquivo JSON
- **Restore**: Importa de arquivo JSON

## 🔧 Tecnologias

- **Frontend**: Next.js 15, React 19, TypeScript
- **UI**: Tailwind CSS, Radix UI
- **Banco**: SQLite (better-sqlite3)
- **Formulários**: React Hook Form + Zod
- **Ícones**: Lucide React

## 📊 Estrutura do Projeto

```
bettracker/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── users/         # Gerenciamento de usuários
│   │   ├── bets/          # Gerenciamento de apostas
│   │   ├── settings/      # Configurações do usuário
│   │   └── backup/        # Backup/restore de dados
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página inicial
├── components/            # Componentes React
│   ├── ui/               # Componentes base (shadcn/ui)
│   ├── betting-dashboard.tsx
│   ├── login-form.tsx
│   └── ...
├── hooks/                # Hooks customizados
│   ├── use-betting-local.ts
│   └── use-toast.ts
├── lib/                  # Utilitários
│   ├── database.ts       # Classe do banco SQLite
│   └── utils.ts
├── types/                # Tipos TypeScript
│   └── betting.ts
├── data/                 # Banco de dados local (criado automaticamente)
│   └── bettracker.db
└── scripts/              # Scripts SQL (para referência)
```

## 🔄 Backup e Restore

### Exportar dados
1. Clique no botão "Backup" no header
2. Um arquivo JSON será baixado automaticamente
3. Guarde este arquivo em local seguro

### Importar dados
1. Clique no botão "Restore" no header
2. Selecione o arquivo JSON de backup
3. Os dados serão importados automaticamente

## 🎯 Como funciona

1. **Login/Registro**: Crie uma conta com email
2. **Configuração**: Defina sua banca inicial
3. **Adicionar apostas**: Preencha os dados da aposta
4. **Acompanhar**: Veja estatísticas e resultados
5. **Editar**: Modifique apostas quando necessário
6. **Backup**: Exporte dados regularmente

## 📱 Interface

- **Dashboard**: Visão geral das apostas
- **Filtros**: Por esporte e resultado
- **Estatísticas**: Cards com métricas importantes
- **Tabela**: Lista completa das apostas
- **Responsivo**: Funciona em qualquer dispositivo

## 🔒 Segurança

- **Dados locais**: Tudo salvo no seu computador
- **Sem internet**: Funciona offline
- **Backup**: Controle total dos seus dados
- **Privacidade**: Nenhum dado enviado para servidores externos

## 🆘 Suporte

Se encontrar algum problema:

1. Verifique se todas as dependências estão instaladas
2. Confirme que o Node.js está atualizado
3. Tente deletar a pasta `data/` e reiniciar
4. Abra uma issue no GitHub

---

**Desenvolvido com ❤️ para a comunidade de apostas esportivas** 

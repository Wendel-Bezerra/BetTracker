# Guia de Migração - Campo Casa de Apostas

## Resumo das Mudanças

Foi adicionado um novo campo `bookmaker` (casa de apostas) ao sistema de apostas. Este campo permite que os usuários especifiquem em qual casa de apostas fizeram cada aposta.

## Casas de Apostas Disponíveis

- **Bet365**
- **Superbet**
- **Betano**
- **Novibet**
- **Outras**

## Arquivos Modificados

### 1. Banco de Dados
- `scripts/01-create-tables.sql` - Adicionada coluna `bookmaker` na tabela `bets`
- `scripts/06-add-bookmaker-column.sql` - Script para adicionar coluna em tabelas existentes
- `scripts/07-migrate-existing-bets.sql` - Script para migrar dados existentes
- `lib/database.ts` - Atualizado para incluir o campo `bookmaker`

### 2. Tipos TypeScript
- `types/betting.ts` - Adicionado campo `bookmaker` em todas as interfaces e criada constante `BOOKMAKERS`

### 3. Componentes React
- `components/add-bet-dialog.tsx` - Adicionado campo de seleção de casa de apostas
- `components/edit-bet-dialog.tsx` - Adicionado campo de seleção de casa de apostas
- `components/betting-dashboard.tsx` - Adicionada coluna na tabela e filtro por casa de apostas

### 4. API
- `app/api/bets/route.ts` - Atualizada validação para incluir campo obrigatório

## Como Migrar Dados Existentes

### Opção 1: Usando Script SQL (Recomendado)

Execute o script de migração no seu banco de dados:

```sql
-- Execute o arquivo scripts/07-migrate-existing-bets.sql
```

### Opção 2: Manualmente

Se preferir fazer manualmente:

```sql
-- Adicionar coluna bookmaker
ALTER TABLE bets ADD COLUMN bookmaker VARCHAR(100) NOT NULL DEFAULT 'Outras';

-- Verificar se a migração foi bem-sucedida
SELECT COUNT(*) as total_bets FROM bets;
SELECT COUNT(*) as bets_with_bookmaker FROM bets WHERE bookmaker IS NOT NULL;
```

## Validação da Migração

Após executar a migração, verifique se:

1. ✅ A coluna `bookmaker` foi adicionada à tabela `bets`
2. ✅ Todas as apostas existentes têm o valor `'Outras'` como casa de apostas padrão
3. ✅ O formulário de adicionar aposta mostra o campo de seleção de casa de apostas
4. ✅ O formulário de editar aposta mostra o campo de seleção de casa de apostas
5. ✅ A tabela de apostas exibe a coluna "Casa de Apostas"
6. ✅ O filtro por casa de apostas funciona corretamente

## Testando as Funcionalidades

1. **Adicionar Nova Aposta**: Verifique se o campo "Casa de Apostas" aparece no formulário
2. **Editar Aposta Existente**: Verifique se o campo é preenchido corretamente
3. **Filtrar por Casa de Apostas**: Use o filtro no dashboard para testar
4. **Exibir na Tabela**: Verifique se a coluna aparece corretamente

## Rollback (Se Necessário)

Se precisar reverter as mudanças:

```sql
-- Remover coluna bookmaker (CUIDADO: isso apagará os dados)
ALTER TABLE bets DROP COLUMN bookmaker;
```

## Notas Importantes

- O valor padrão para apostas existentes é `'Outras'`
- O campo é obrigatório para novas apostas
- A migração é segura e não apaga dados existentes
- Todos os componentes foram atualizados para suportar o novo campo

## Suporte

Se encontrar problemas durante a migração:

1. Verifique os logs do console para erros
2. Confirme se todos os arquivos foram atualizados
3. Execute os scripts de migração na ordem correta
4. Teste as funcionalidades após a migração 
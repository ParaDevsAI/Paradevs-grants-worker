# Scheduler Setup

## Como configurar o cron job

### 1. Abrir o crontab
```bash
crontab -e
```

### 2. Adicionar a linha (roda 2x ao dia: 9h e 21h)
```bash
0 9,21 * * * cd /home/f0ntz/Documents/BOT-GRANTS-PARADEVS && npm start >> logs/cron.log 2>&1
```

### 3. Salvar e sair

### 4. Verificar se está ativo
```bash
crontab -l
```

## Verificar logs
```bash
cat logs/cron.log
```

## Testar manualmente
```bash
npm start
```

## Build antes de usar em produção
```bash
npm run build
```

## Estrutura
- `npm run dev` - desenvolvimento (ts-node)
- `npm run build` - compila TypeScript
- `npm start` - produção (node dist/)

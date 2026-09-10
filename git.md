# Git Aprendizagem — Manual 

> **Objetivo:** Ao final deste guia, você vai `git add .` + `commit` + `push` + `pull` + criar `branch` + `switch` sem quebrar o código do colega. Tudo com **apenas 6 comandos**.

---

## 0. O que é Git e por que usar branch?

- **Git** = máquina do tempo do código. Cada `commit` é uma foto do projeto. Se quebrar, volta.
- **GitHub** = nuvem onde as fotos ficam. `push` envia, `pull` baixa.
- **Branch** = linha do tempo paralela. `main` é a linha oficial. Cada pessoa cria sua branch `feature/nome` para mexer sem atrapalhar o colega. Depois junta (`merge`).

**Regra de ouro da equipe (4 pessoas):** **Nunca commit direto na `main`**. Sempre crie sua branch, commit lá, faça `push` e peça para juntar.

---

## 1. Setup inicial (1 vez por PC)

```bash
git --version
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
git config --global init.defaultBranch main
```

Explicação linha a linha:
- `user.name/email` = carimbo de quem fez o commit (aparece no GitHub).
- `defaultBranch main` = garante que a branch principal chama `main` (padrão da Vercel/GitHub).

Para clonar o projeto da casca:

```bash
git clone https://github.com/seu-usuario/atividadengx.git
cd atividadengx
cp .env.example .env
npm install
```

---

## 2. Os 6 comandos que você vai usar todo dia

### 2.1. `git status` — raio-X (use antes de tudo)

```bash
git status
```

Mostra:
- `?? arquivo` = não rastreado (novo)
- `M arquivo` = modificado
- `A arquivo` = preparado para commit
- `nothing to commit` = tudo limpo

**Hábito:** Rode `git status` antes de `add` e antes de `pull`.

### 2.2. `git add .` — coloca na caixa

```bash
git add .
git status
```

- `add .` = pega **tudo** que mudou na pasta e coloca na "caixa" para o próximo commit. `.` = diretório atual.
- Alternativas: `git add src/app/features/project-list/` (só uma pasta), `git add README.md` (só um arquivo).

**Para equipe de 4:** Cada um só dá `add` nos arquivos que mexeu. Se `Pessoa B` só mexeu em `*.css`, pode fazer `git add src/app/features/project-list/*.css` para não levar lixo.

**O que NÃO vai (graças ao `.gitignore`):** `node_modules/`, `dist/`, `.env` são ignorados — `add .` não leva.

### 2.3. `git commit -m "mensagem"` — tira a foto

```bash
git commit -m "feat: cria form de projetos com validacao"
```

- `commit` = salva a caixa como foto com mensagem. Sem `-m` abre editor (confuso).
- Mensagem curta e direta, use padrão: `feat:`, `fix:`, `chore:`, `docs:` (Conventional Commits que o mentor cobra).

**Exemplos didáticos para seu CRUD:**

```bash
git commit -m "feat: CRUD local de projects com array"
git commit -m "feat: adiciona json-server e ProjectService"
git commit -m "feat: transforma em Web Component project-list"
git commit -m "fix: corrige validacao de name vazio"
```

**Nunca faça:** `git commit -m "aaa"` ou `git commit -m "teste"` — o professor vai cobrar.

### 2.4. `git push` — envia para a nuvem

```bash
git push
# primeira vez da branch:
git push -u origin minha-branch
```

- `push` = envia seus commits locais para o GitHub. `-u` (upstream) liga sua branch local à remota, depois só `git push`.
- Se der `rejected` = alguém enviou antes, faça `pull` primeiro.

### 2.5. `git pull` — baixa o que o colega enviou

```bash
git pull
# equivale a:
git fetch   # baixa
git merge   # junta
```

- **Hábito da equipe:** Todo dia antes de começar: `git switch main` -> `git pull` -> `git switch sua-branch` -> `git merge main`. Assim sua branch fica atualizada e evita conflito gigante.

### 2.6. `git switch` + `git branch` — troca e cria linhas do tempo

```bash
# ver branches
git branch          # locais (* = atual)
git branch -a       # todas (inclui remotas)

# criar e já trocar
git switch -c feature/form-projetos
# ou duas etapas:
git branch feature/form-projetos
git switch feature/form-projetos

# trocar de volta
git switch main
```

- `switch -c` = create + switch. Nomeie como `feature/nome`, `fix/bug`, `task/seu-nome`.
- **Para 4 pessoas:** `feature/project-list-a-ana`, `feature/style-b-bruno`, `feature/logic-c-carlos`, `feature/deploy-d-diana`.

**Alternativa antiga:** `git checkout` faz o mesmo, mas `switch` é mais claro (use `switch`).

---

## 3. Como criar e usar uma branch (passo a passo mão beijada)

**Cenário:** Pessoa C vai implementar a lógica do CRUD.

```bash
# 1. Garanta que está na main atualizada
git switch main
git pull

# 2. Crie sua branch
git switch -c feature/logic-crud

# 3. Mexa nos arquivos (ex: src/app/features/project-list/project-list.component.ts)

# 4. Confira
git status

# 5. Caixa + foto
git add .
git commit -m "feat: logica CRUD array com add/edit/delete"

# 6. Envie
git push -u origin feature/logic-crud
```

Depois, no GitHub, clique em `Compare & pull request` -> `Create pull request` -> peça para o colega revisar -> `Merge`. Ou se o time é iniciante e não usa PR, o Dono do repo pode fazer local:

```bash
git switch main
git merge feature/logic-crud
git push
```

---

## 4. Fluxo completo de equipe (4 pessoas sem se atropelar)

**Dia 09/09 (Pessoa A cria projeto):**

```bash
# Pessoa A
npx @angular/cli@21 new project-list --standalone --style=css --routing=false
cd project-list
git init
git add .
git commit -m "chore: initial Angular project"
git branch -M main
git remote add origin https://github.com/time/equipe1-project-list.git
git push -u origin main
```

**Dia 10/09 (todos clonam e criam branches):**

```bash
# Pessoa B, C, D (cada um no seu PC)
git clone https://github.com/time/equipe1-project-list.git
cd equipe1-project-list
git switch -c feature/html-css-b
# ... mexe só em .html/.css ...
git add src/app/features/project-list/project-list.component.html src/app/features/project-list/project-list.component.css
git commit -m "feat: layout form + tabela"
git push -u origin feature/html-css-b
```

**Regra para não dar conflito:** Cada pessoa só mexe nos arquivos combinados na divisão do `GUIA-CRUD1-PROJECT-LIST.md:2`. Se dois mexem no mesmo `.ts` ao mesmo tempo, vai dar **conflito** — veja seção 5.

**Sincronizar todo dia:**

```bash
git switch main
git pull
git switch feature/html-css-b
git merge main   # traz o que os outros já mergearam na main
# resolva conflitos se houver, depois:
git push
```

---

## 5. Conflito — o que é e como resolver (sem pânico)

Conflito acontece quando dois mexem na mesma linha e tentam juntar.

```bash
git merge main
# Auto-merging src/app/features/project-list/project-list.component.ts
# CONFLICT (content): Merge conflict in ...
```

Abra o arquivo, vai ver:

```
<<<<<<< HEAD
  name = 'meu';
=======
  name = 'seu';
>>>>>>> main
```

- `<<<<<<< HEAD` = seu código, `=======` meio, `>>>>>>> main` = código da main.
- **Escolha** qual fica, apague os marcadores `<<<<` `====` `>>>>`, salve, depois:

```bash
git add src/app/features/project-list/project-list.component.ts
git commit -m "fix: resolve conflito name"
git push
```

**Dica para evitar:** `pull` + `merge main` todo dia, e cada um mexe em arquivos diferentes.

---

## 6. Comandos que você NÃO precisa agora (mas existem)

- `git log --oneline -5` = vê últimas 5 fotos.
- `git diff` = vê o que mudou antes do add.
- `git restore arquivo` = desfaz mudança não commitada.
- `git reset --soft HEAD~1` = desfaz último commit mas mantém arquivos (use com cuidado).

---

## 7. Checklist diário (cole na parede)

```bash
git status
git switch main
git pull
git switch sua-branch
git merge main
# ... codar ...
git add .
git commit -m "feat: o que fez hoje"
git push
```

**Entrega final 29/09:** Cada equipe faz `git push` da branch `main` com URL da Vercel no `README.md` e avisa no Trello. A casca só precisa da URL `https://.../main.js`.

---

## 8. Mini-guia `add .` vs `add arquivo`

- `git add .` = rápido, leva tudo (recomendado para iniciantes, `.gitignore` já protege).
- `git add src/app/features/member-manager/member.service.ts` = cirúrgico, quando quer commitar só uma parte.

Para equipe iniciante, use `add .` sempre após `git status` confirmar que só tem arquivos seus.

---

Qualquer dúvida, rode `git status` e mande o print para o `Deploy Master` da equipe.

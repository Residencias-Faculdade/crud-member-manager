# crud-member-manager
Web Component Angular para controle de acesso (RBAC). Atua como entidade filha, consumindo o ID do projeto via atributo HTML para gerenciar permissões na tag &lt;member-manager>.

## Documentação

- [Como usar o git](./git.md)

# GUIA CRUD 2 — <member-manager> (Filho) — Gerenciador de Membros

> **Equipe 2 | 4 pessoas | Objetivo: entregar URL funcionando em 29/09/2026**
> **Stack:** Angular 21 + CSS + MockServer + Permissões + Web Component + Vercel (Docker opcional)
> **Entrega final:** `https://sua-url.vercel.app/main.js` registrando `customElements.define('member-manager')` e plugando na casca, recebendo `project-id` do <project-list>

---

## 0. Visão Geral — O que vocês vão construir

Vocês são a **Equipe Filha**. Vocês **dependem** da Equipe 1. Vocês gerenciam **quem tem acesso** ao projeto selecionado.

**Dados obrigatórios:**

```ts
interface Member { id: number; projectId: number; email: string; role: 'Admin' | 'Operator' | 'Viewer'; }
```

**Ações:** Adicionar membro, **Trocar permissão** (Admin/Operator/Viewer), Remover membro, Listar só do projeto selecionado.

**Comunicação (inverso do CRUD 1):**

```html
<!-- A página passa o ID para vocês via ATRIBUTO HTML -->
<member-manager project-id="123"></member-manager>
```

```ts
// No componente de vocês, leiam o atributo:
@Input() set projectId(value: string | number) { this._projectId = Number(value); this.loadMembers(); }
// Se não houver ID, fiquem DESABILITADOS (mostrem "Selecione um projeto")
```

**Fluxo completo:**
`Usuário clica projeto em <project-list>` -> `evento project-selected` -> `página faz <member-manager>.setAttribute('project-id', '123')` -> `vocês filtram e mostram só membros daquele projeto`.

**5 fases (em 3 entregas):**

| Fase | O que é | Quando |
|---|---|---|
| 1. CRUD | Form + tabela de membros (array local) | Semana 1 |
| 2. MockServer | `json-server` com `db.json: {members:[]}` | Semana 2 |
| 3. Permissões | Roles Admin/Operator/Viewer + select para trocar | Semana 2 |
| 4. Web Component | `@angular/elements` + `customElements.define('member-manager')` + `project-id` attribute | Semana 3 |
| 5. Deploy | Vercel + CORS * | Semana 3 |

**Cronograma:**

- **Dia 1: 09/09/2026**
- **Entrega 1 — 15/09:** CRUD local (sem servidor, desabilitado se sem projectId já funciona)
- **Entrega 2 — 22/09:** MockServer + Permissões (trocar role)
- **Entrega 3 — 29/09:** Web Component + URL Vercel

> **Minigame:** Level 1 = form local, Level 2 = API + roles, Boss = receber `project-id` e filtrar certo. Se o <member-manager> ficar cinza quando sem projeto, ganham vida extra.

---

## 1. Arquitetura SUPER Simples (não usem Clean complexa)

```
member-manager/
  src/app/
    app.component.ts
    app.config.ts
    features/member-manager/
      member.model.ts
      member.service.ts
      member-manager.component.ts/html/css
  db.json
  vercel.json
```

**Por que simples?** Vocês 4 não se atropelam.

---

## 2. Divisão de Tarefas para 4 Pessoas

| Pessoa | Apelido | Foco | Entregáveis |
|---|---|---|---|
| **A** | `Arquiteto` | Setup + Modelo + Atributo | `ng new`, `member.model.ts`, `@Input() projectId` + `attributeChangedCallback` |
| **B** | `Designer` | HTML + CSS | Form (email + role select) + tabela + estado desabilitado |
| **C** | `Lógica` | CRUD + Filtro por projectId | `member-manager.component.ts` (add/update/delete + filter) |
| **D** | `Deploy` | MockServer + Web Component + Vercel | `db.json`, `json-server`, `@angular/elements`, `vercel.json` |

**Regra de trabalho:** `A` cria projeto e commita, `B` só `.html/.css`, `C` só `.ts`, `D` só `db.json/vercel.json`. `git pull` diário.

---

## 3. SEMANA 1 — Entrega 15/09: CRUD Local com project-id (Level 1)

### Passo 0 — Pessoa A (30 min, 09/09)

```bash
npx @angular/cli@21 new member-manager --standalone --style=css --routing=false
cd member-manager
npm install
```

`member.model.ts`:

```ts
export type Role = 'Admin' | 'Operator' | 'Viewer';
export interface Member {
  id: number;
  projectId: number; // ID do projeto pai (vem do <project-list>)
  email: string;
  role: Role;
}
```

### Passo 1 — Pessoa A + C — Atributo project-id

O pulo do gato: o componente precisa **receber** o ID via atributo HTML e reagir.

`member-manager.component.ts` esqueleto Semana 1:

```ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Member, Role } from './member.model';

@Component({
  selector: 'app-member-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './member-manager.component.html',
  styleUrls: ['./member-manager.component.css']
})
export class MemberManagerComponent {
  // ATRIBUTO: quando a página faz <member-manager project-id="123">, cai aqui
  private _projectId: number | null = null;
  @Input() set projectId(value: string | number | null) {
    // Angular converte attribute string para number
    this._projectId = value ? Number(value) : null;
    this.filterMembers(); // sempre filtra ao mudar projeto
  }
  get projectId() { return this._projectId; }
  get hasProject() { return this._projectId !== null; } // para desabilitar

  // Dados locais Semana 1
  members: Member[] = [
    { id: 1, projectId: 1, email: 'ana@exemplo.com', role: 'Admin' },
    { id: 2, projectId: 1, email: 'carlos@exemplo.com', role: 'Viewer' },
    { id: 3, projectId: 2, email: 'bia@exemplo.com', role: 'Operator' }
  ];
  filtered: Member[] = [];
  nextId = 4;
  email = '';
  role: Role = 'Viewer';
  editing: Member | null = null;

  ngOnInit(){ this.filterMembers(); }

  filterMembers(){
    if (!this.hasProject) { this.filtered = []; return; }
    this.filtered = this.members.filter(m => m.projectId === this._projectId);
  }

  addMember(){
    if (!this.hasProject || !this.email.trim()) return;
    // Validação simples de email
    if (!this.email.includes('@')) { alert('Email inválido'); return; }
    const m: Member = { id: this.nextId++, projectId: this._projectId!, email: this.email.trim(), role: this.role };
    this.members.push(m);
    this.filterMembers();
    this.email = ''; this.role='Viewer';
  }
  changeRole(m: Member, newRole: Role){ m.role = newRole; }
  deleteMember(id: number){
    if(!confirm(`Remover membro #${id}?`)) return;
    this.members = this.members.filter(m=>m.id!==id);
    this.filterMembers();
  }
  editMember(m: Member){ this.editing=m; this.email=m.email; this.role=m.role; }
  updateMember(){
    if(!this.editing || !this.email.trim()) return;
    this.editing.email=this.email.trim(); this.editing.role=this.role;
    this.editing=null; this.email=''; this.role='Viewer';
  }
}
```

**Explicação para iniciantes:**
- `@Input() projectId` é o **canal de entrada**. A casca faz `element.setAttribute('project-id','123')` e o Angular chama o `set`.
- `hasProject` controla se mostra "Selecione um projeto" ou a tabela.
- `filterMembers` é o **coração**: só mostra `members` onde `projectId === _projectId`.

### Passo 2 — Pessoa B — HTML + CSS (10-11/09)

`member-manager.component.html`:

```html
<h2>Gerenciador de Membros</h2>

<div *ngIf="!hasProject" class="disabled">
  <p>Selecione um projeto no &lt;project-list&gt; para gerenciar membros.</p>
</div>

<div *ngIf="hasProject">
  <p>Projeto selecionado: #{{projectId}}</p>
  <div class="form">
    <input [(ngModel)]="email" placeholder="email@exemplo.com" [disabled]="!hasProject" />
    <select [(ngModel)]="role" [disabled]="!hasProject">
      <option value="Admin">Admin</option>
      <option value="Operator">Operator</option>
      <option value="Viewer">Viewer</option>
    </select>
    <button (click)="addMember()" [disabled]="!hasProject || !email.trim()">Adicionar</button>
    <button *ngIf="editing" (click)="updateMember()">Salvar</button>
  </div>

  <table>
    <tr *ngFor="let m of filtered">
      <td>#{{m.id}} {{m.email}}</td>
      <td>
        <select [value]="m.role" (change)="changeRole(m, $any($event.target).value)">
          <option value="Admin">Admin</option>
          <option value="Operator">Operator</option>
          <option value="Viewer">Viewer</option>
        </select>
      </td>
      <td>
        <button (click)="editMember(m)">Editar</button>
        <button (click)="deleteMember(m.id)">Remover</button>
      </td>
    </tr>
  </table>
  <p *ngIf="filtered.length===0">Nenhum membro neste projeto.</p>
</div>
```

`member-manager.component.css`:

```css
.form { display:grid; gap:8px; max-width:400px; margin:12px 0; }
input, select { padding:8px; border:1px solid #e5e7eb; border-radius:8px; }
button { padding:6px 12px; border-radius:8px; cursor:pointer; }
.disabled { padding:16px; background:#f9fafb; border:1px dashed #d1d5db; border-radius:8px; color:#6b7280; text-align:center; }
table { width:100%; border-collapse:collapse; }
td { padding:8px; border-bottom:1px solid #eee; }
```

**Entrega Semana 1:** `ng serve` -> sem `project-id` mostra disabled, com `project-id="1"` (teste manual no `app.component.html` `<app-member-manager [projectId]="1">`) mostra só Ana e Carlos. **Print dos dois estados.**

---

## 4. SEMANA 2 — Entrega 22/09: MockServer + Permissões (Level 2)

### Pessoa D — MockServer (16/09)

```bash
npm i -g json-server
```

`db.json`:

```json
{
  "members": [
    { "id": 1, "projectId": 1, "email": "ana@exemplo.com", "role": "Admin" },
    { "id": 2, "projectId": 1, "email": "carlos@exemplo.com", "role": "Viewer" },
    { "id": 3, "projectId": 2, "email": "bia@exemplo.com", "role": "Operator" }
  ]
}
```

```bash
json-server --watch db.json --port 3002
# teste: http://localhost:3002/members?projectId=1  (filtra)
```

### Pessoa C — Service + Permissões (17-19/09)

`member.service.ts`:

```ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Member } from './member.model';
@Injectable({ providedIn: 'root' })
export class MemberService {
  private api='http://localhost:3002/members';
  constructor(private http: HttpClient){}
  getByProject(projectId:number){ return this.http.get<Member[]>(`${this.api}?projectId=${projectId}`); }
  add(m: Omit<Member,'id'>){ return this.http.post<Member>(this.api, m); }
  update(m: Member){ return this.http.put<Member>(`${this.api}/${m.id}`, m); }
  remove(id:number){ return this.http.delete(`${this.api}/${id}`); }
}
```

No componente, troque `filterMembers` para buscar na API:

```ts
filterMembers(){
  if(!this.hasProject){ this.filtered=[]; return; }
  this.service.getByProject(this._projectId!).subscribe(data=> this.filtered=data);
}
addMember(){
  if(!this.hasProject || !this.email.trim()) return;
  this.service.add({projectId:this._projectId!, email:this.email.trim(), role:this.role}).subscribe(created=>{
    this.filtered.push(created); this.email='';
  });
}
changeRole(m: Member, newRole: Role){
  const updated={...m, role:newRole};
  this.service.update(updated).subscribe(()=> m.role=newRole);
}
```

**Permissões (regra de negócio):** `role` só pode ser `Admin/Operator/Viewer`. O `select` já garante. Se quiser regra extra, valide `if(!['Admin','Operator','Viewer'].includes(newRole)) return;`.

**Validação extra:** `if(!email.includes('@')) alert('Email inválido')` e `confirm` antes de `delete`.

**Entrega Semana 2:** `db.json` + service filtrando por `projectId`, trocar role via `select` e ver `PUT` no `json-server` log. **Print do `?projectId=1` vs `?projectId=2`.**

---

## 5. SEMANA 3 — Entrega 29/09: Web Component + Deploy Vercel (Boss Final) — OBRIGATÓRIO

### 5.1. Web Component com `project-id` attribute (Pessoa A + D, 23-25/09)

```bash
ng add @angular/elements
```

`src/main.ts`:

```ts
import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { appConfig } from './app/app.config';
import { MemberManagerComponent } from './app/features/member-manager/member-manager.component';

const tag='member-manager';
async function defineElement(){
  if(customElements.get(tag)) return;
  const app=await createApplication(appConfig);
  const el=createCustomElement(MemberManagerComponent, {injector:app.injector});
  customElements.define(tag, el);
}
if(document.querySelector(tag) || location.search.includes('element')) void defineElement();
else { import('./app/app.component').then(m=>import('@angular/platform-browser').then(({bootstrapApplication})=>bootstrapApplication(m.AppComponent, appConfig))); void defineElement(); }
```

**Detalhe crucial para `project-id` funcionar como Web Component:** Angular Elements converte `@Input() projectId` em **atributo observado**. Mas `project-id` (kebab-case) vira `projectId` (camelCase). Para garantir, adicione no componente:

```ts
@Component({
  selector: 'app-member-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './member-manager.component.html',
  encapsulation: ViewEncapsulation.ShadowDom // isola CSS da casca
})
```

E no `defineElement`, o Angular já observa `projectId`. Para teste vanilla, a casca fará `element.setAttribute('project-id','123')` e o `set projectId` dispara.

### 5.2. Deploy Vercel (Pessoa D, 26-27/09) — OBRIGATÓRIO URL até 29/09

`vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    { "source": "/main.js", "headers": [{ "key": "Access-Control-Allow-Origin", "value": "*" }] },
    { "source": "/(.*).js", "headers": [{ "key": "Access-Control-Allow-Origin", "value": "*" }] }
  ]
}
```

`ng build --configuration production` → `dist/member-manager/browser`.

Push para GitHub → Vercel Import → `https://seu-member-manager.vercel.app/main.js` deve dar `200` + `CORS *`.

**Build estável:** Se `angular.json` tem `outputHashing: all`, copie `main-*.js` para `main.js` (ver `Requisitos-Microfrontend.md:72`).

### 5.3. Docker Opcional

Copie `Dockerfile`/`nginx.conf` da casca se quiser aprender Docker. Não é necessário para Vercel.

---

## 6. Como testar na Casca (integração com Equipe 1)

A página que junta os dois (ex: `index.html` da casca ou teste local):

```html
<project-list></project-list>
<member-manager></member-manager>
<script type="module" src="https://seu-project-list.vercel.app/main.js"></script>
<script type="module" src="https://seu-member-manager.vercel.app/main.js"></script>
<script>
  document.addEventListener('project-selected', e => {
    const id = e.detail.projectId;
    document.querySelector('member-manager').setAttribute('project-id', id);
  });
</script>
```

Informe à casca:

```json
{ "tag": "member-manager", "title": "Membros", "url": "https://seu-member-manager.vercel.app/main.js" }
```

Eles adicionam em `atividadengx/public/microfrontends.json`.

Teste local sem casca:

```html
<member-manager project-id="1"></member-manager>
<script type="module" src="http://localhost:4201/main.js"></script>
<!-- deve mostrar só membros do projeto 1; sem attribute deve ficar desabilitado -->
```

---

## 7. Checklist Entrega Final 29/09

- [ ] `https://sua-url.vercel.app/` abre CRUD
- [ ] `https://sua-url.vercel.app/main.js` 200 + CORS *
- [ ] `customElements.get('member-manager')` existe
- [ ] Sem `project-id` → mostra "Selecione um projeto" desabilitado
- [ ] Com `project-id="1"` → lista só membros `projectId=1`
- [ ] Adicionar/Trocar role/Remover funciona (via json-server)
- [ ] Shadow DOM isolado
- [ ] `vercel.json` com rewrites + headers
- [ ] URL entregue

---

## 8. Dicas Minigame

- **Level 1 (15/09):** Se `hasProject` já desabilita form, ganham bônus.
- **Level 2 (22/09):** Se `?projectId=1` filtra certo no `json-server`, passaram.
- **Boss (29/09):** Se `<member-manager project-id="123">` atualiza sozinho ao trocar projeto na casca, **ZERARAM**.

Leiam `CONEXAO-MICROFRONTEND.md` seção 1.1 e `GUIA-CRUD1-PROJECT-LIST.md` da equipe irmã para entender o fluxo pai→filho.


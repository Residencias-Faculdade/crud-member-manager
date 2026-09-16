import { Component, Input, ChangeDetectorRef} from '@angular/core';
import { Member, Role } from './member-model';
import { CommonModule } from '@angular/common';
import { FormsModule, FormControl, Validators } from '@angular/forms';
import { MatFormFieldModule} from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MemberService } from './member.service';



@Component({
  selector: 'app-member-manager',
  imports: [
    CommonModule, 
    FormsModule, 
    MatFormFieldModule, 
    MatSelectModule, 
    MatInputModule, MatButtonModule,
    MatTableModule
  ],
  templateUrl: './member-manager.html',
  styleUrl: './member-manager.css',
})
export class MemberManager {

  constructor(
    private memberService: MemberService,
    private cdr: ChangeDetectorRef
  
  ) {}

 displayedColumns: string[] = [
    'id',
    'email',
    'role',
    'actions'
  ];

private _projectId: number | null = null;

@Input() set projectId (value: string | number | null ) {

  let newValue;

  if(value == null) {
    newValue = null;
  } 
  else {
    newValue = Number(value);
  }

  if(newValue != this._projectId) {

    this.editing = null;
    this.email = '';
    this.role = 'Viewer';
  
  }
  this._projectId = newValue;
  this.filterMembers();
} 

get projectId() {
  return this._projectId;
}
get hasProject() {
  return this._projectId !== null ;
}

members: Member[] =  [

  {
    id: 1, 
    projectId: 999, 
    email: 'leones@gmail.com', 
    role: 'Viewer'
  },
  {
    id: 2, 
    projectId: 181, 
    email: 'roberto@gmail.com', 
    role: 'Admin'
  },
  {
    id: 3, 
    projectId: 190, 
    email: 'lana@gmail.com', 
    role: 'Operator'
  }
];
filtered: Member[] = [];
email = '';
nextId = 4;
role: Role = 'Viewer';
editing: Member | null = null;

filterMembers() { 

  
  if(!this.hasProject) {
    this.filtered = [];
    return;
  }
  this.memberService.getByProject(this._projectId!)
  .subscribe(data => {
    this.filtered=data;
    this.cdr.markForCheck();

  })};

changeRole(m: Member, newRole: Role) {

  if(!['Admin','Operator','Viewer'].includes(newRole)) {
    return;
  }

  const updated = {...m, role:newRole}
  this.memberService.update(updated).subscribe(() => m.role= newRole);
}

addMembers() {
  const projectId = this._projectId;
  const email = this.email.trim();

  if(projectId === null) {
    return;
  }
  const emailControl = new FormControl(email, [Validators.required, Validators.email])
  if(emailControl.invalid) {
    alert('informe um e-mail válido.')
    return;
  }
   this.memberService.add({ projectId, 
    email, role: this.role}) 
    .subscribe(newMember => { this.filtered = [...this.filtered, newMember];
    this.email = '';
    this.cdr.markForCheck();
  });

  
}
  

deleteMembers(id: number){
  if(!confirm(`Remover membro ${id}?`)) return;
  
  
  this.memberService.delete(id).subscribe(() => {
    if (this.editing?.id === id) {
      this.editing = null;
      this.email = '';
      this.role = 'Viewer';
      this.cdr.markForCheck();
    }
    this.filterMembers();
  });
  

}

editMembers(m: Member) {
  this.editing = m,
  this.email = m.email,
  this.role = m.role
}
updateMembers(){

  if(!this.editing) {
    return;
  }

  if(!this.email.includes('@') || !this.email.trim()) {
    alert('E-mail inválido.');
    return;
  }
  this.memberService.update
  this.editing.email = this.email.trim();
  this.editing.role = this.role;
  this.email = '';
  this.role = 'Viewer';

  this.editing = null;

}

}

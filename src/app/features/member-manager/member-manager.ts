import { Component, Input } from '@angular/core';
import { Member, Role } from './member-model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { range } from 'rxjs';
import { email } from '@angular/forms/signals';

@Component({
  selector: 'app-member-manager',
  imports: [CommonModule, FormsModule],
  templateUrl: './member-manager.html',
  styleUrl: './member-manager.css',
})
export class MemberManager {

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
  this.filtered = this.members.filter (m => m.projectId === this._projectId);
}
changeRole(m: Member, newRole: Role) {
  m.role = newRole;
}

addMembers() {


  if(!this.hasProject || !this.email.trim() ) {
    return;
  }
  if(!this.email.includes('@')) {
    alert('E-mail inválido.');
    return;
  }
  
   const newMember = {

    id: this.nextId++,
    projectId: this._projectId!,
    email: this.email.trim(),
    role: this.role

  };

  this.members.push(newMember);
  this.filterMembers();
  this.email = '';
  this.role = 'Viewer';
}
  

deleteMembers(id: number){
  if(!confirm(`Remover membro ${id}?`)) return;
  
  this.members = this.members.filter(m => m.id !== id);
  this.filterMembers();
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
 
  this.editing.email = this.email.trim();
  this.editing.role = this.role;
  this.email = '';
  this.role = 'Viewer';

  this.editing = null;

}

}


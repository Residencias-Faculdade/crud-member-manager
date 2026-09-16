import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Member } from "./member-model";

@Injectable ({providedIn: 'root'})
export class MemberService {

    private api= 'http://localhost:3002/members';

    constructor(private http: HttpClient){}

    getByProject(projectId: number) {

        return this.http.get<Member[]> (`${this.api}?projectId=${projectId}`)
    
    }
    add (m: Omit <Member,'id'>) {
            return this.http.post<Member>(this.api, m);
        }
    update (m: Member) {
        return this.http.put<Member>(`${this.api}/${m.id}`, m);
    }
    delete (id: number) {
        return this.http.delete(`${this.api}/${id}`);
    }


}

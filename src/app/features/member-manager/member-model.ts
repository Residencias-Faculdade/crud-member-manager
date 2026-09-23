export type Role = 'Admin' | 'Viewer' | 'Operator'

export interface Member {
    id: number,
    projectId: number,
    email: string,
    role: Role,
    
};

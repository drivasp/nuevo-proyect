import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type Rol = 'ADMIN' | 'DOCENTE' | 'ESTUDIANTE';

export interface UsuarioDTO {
  idUsuario: number;
  username: string;
  nombres: string;
  apellidos: string;
  rol: Rol;
  activo: boolean;
}

export interface UsuarioCreateRequest {
  cedula: string;
  correoInstitucional: string;
  username: string;
  password: string;
  nombres: string;
  apellidos: string;
  rol: Rol;
  activo?: boolean;
}

export interface UsuarioUpdateRequest {
  nombres?: string;
  apellidos?: string;
  rol?: Rol;
  activo?: boolean;
  password?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminUsuariosService {

  // ✅ URL FIJA A MANO (COMO QUIERES)
  private baseUrl = 'http://localhost:8080/admin/usuarios';

  constructor(private http: HttpClient) {}

  // LISTAR
  listar(): Observable<UsuarioDTO[]> {
    return this.http.get<UsuarioDTO[]>(this.baseUrl);
  }

  // CREAR
  crear(req: UsuarioCreateRequest): Observable<UsuarioDTO> {
    return this.http.post<UsuarioDTO>(this.baseUrl, req);
  }

  // EDITAR
  editar(id: number, req: UsuarioUpdateRequest): Observable<UsuarioDTO> {
    return this.http.put<UsuarioDTO>(`${this.baseUrl}/${id}`, req);
  }

  // ACTIVAR / DESACTIVAR
  cambiarEstado(id: number, activo: boolean): Observable<UsuarioDTO> {
    return this.http.patch<UsuarioDTO>(
      `${this.baseUrl}/${id}/estado`,
      { activo }
    );
  }
}

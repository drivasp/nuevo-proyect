import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export type Rol = 'ADMIN' | 'DOCENTE' | 'ESTUDIANTE';

export interface UsuarioDto {
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
  activo: boolean;
}

export interface UsuarioUpdateRequest {
  nombres?: string;
  apellidos?: string;
  rol?: Rol;
  password?: string; // si decides permitir cambio de clave
  activo?: boolean;  // no lo usaremos aquí, porque estado lo maneja PATCH
}

export interface UsuarioEstadoRequest {
  activo: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminUsuariosService {
  private baseUrl = 'http://localhost:8080/admin/usuarios';

  constructor(private http: HttpClient) {}

  listar(): Observable<UsuarioDto[]> {
    return this.http.get<UsuarioDto[]>(this.baseUrl);
  }

  crear(body: UsuarioCreateRequest): Observable<UsuarioDto> {
    return this.http.post<UsuarioDto>(this.baseUrl, body);
  }

  editar(id: number, body: UsuarioUpdateRequest): Observable<UsuarioDto> {
    return this.http.put<UsuarioDto>(`${this.baseUrl}/${id}`, body);
  }

  cambiarEstado(id: number, body: UsuarioEstadoRequest): Observable<UsuarioDto> {
    return this.http.patch<UsuarioDto>(`${this.baseUrl}/${id}/estado`, body);
  }
}

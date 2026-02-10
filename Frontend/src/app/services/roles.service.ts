import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PermisoDto {
  idPermiso: number;
  codigo: string;
  descripcion: string;
  activo: boolean;
}

export interface RolDto {
  idRol: number;
  nombreRol: string;
  activo: boolean;
  permisos: string[];
}

export interface RolCreateRequest {
  nombreRol: string;
  activo: boolean;
  permisos: number[];
}

export interface RolUpdateRequest {
  nombreRol?: string;
  activo?: boolean;
}

export interface RolEstadoRequest {
  activo: boolean;
}

export interface RolPermisosRequest {
  permisos: number[];
}

@Injectable({ providedIn: 'root' })
export class RolesService {
  private rolesUrl = 'http://localhost:8080/roles';
  private permisosUrl = 'http://localhost:8080/permisos';

  constructor(private http: HttpClient) {}

  listarRoles(): Observable<RolDto[]> {
    return this.http.get<RolDto[]>(this.rolesUrl);
  }

  crearRol(body: RolCreateRequest): Observable<RolDto> {
    return this.http.post<RolDto>(this.rolesUrl, body);
  }

  editarRol(id: number, body: RolUpdateRequest): Observable<RolDto> {
    return this.http.put<RolDto>(`${this.rolesUrl}/${id}`, body);
  }

  cambiarEstado(id: number, body: RolEstadoRequest): Observable<RolDto> {
    return this.http.patch<RolDto>(`${this.rolesUrl}/${id}/estado`, body);
  }

  asignarPermisos(id: number, body: RolPermisosRequest): Observable<RolDto> {
    return this.http.post<RolDto>(`${this.rolesUrl}/${id}/permisos`, body);
  }

  listarPermisos(): Observable<PermisoDto[]> {
    return this.http.get<PermisoDto[]>(this.permisosUrl);
  }
}

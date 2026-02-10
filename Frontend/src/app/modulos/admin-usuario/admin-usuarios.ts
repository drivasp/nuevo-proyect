import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { AdminUsuariosService } from '../../services/admin-usuarios.service';
import { RolesService, RolDto, PermisoDto } from '../../services/roles.service';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-usuarios.html',
  styleUrls: ['./admin-usuarios.scss']
})
export class AdminUsuariosComponent implements OnInit {

  // ================= USUARIOS =================
  usuarios: any[] = [];
  usuariosFiltrados: any[] = [];
  rolesUsuario: string[] = [];

  filtro = '';
  cargando = false;
  errorMsg = '';

  modalAbierto = false;
  modoEdicion = false;

  formCreate = {
    cedula: '',
    correoInstitucional: '',
    username: '',
    password: '',
    nombres: '',
    apellidos: '',
    rol: '',
    activo: true
  };

  formUpdate = {
    nombres: '',
    apellidos: '',
    rol: '',
    activo: true,
    password: ''
  };

  // ================= ROLES =================
  rolesSistema: RolDto[] = [];
  permisos: PermisoDto[] = [];

  cargandoRoles = false;
  cargandoPermisos = false;
  rolModoEdicion = false;

  rolForm = {
    idRol: null as number | null,
    nombreRol: '',
    activo: true,
    permisos: [] as number[]
  };

  constructor(
    private usuariosService: AdminUsuariosService,
    private rolesService: RolesService
  ) {}

  ngOnInit(): void {
    this.cargarUsuarios();
    this.cargarRoles();
    this.cargarPermisos();
  }

  // ========== USUARIOS ==========
  cargarUsuarios() {
    this.cargando = true;
    this.usuariosService.listar().subscribe({
      next: (data) => {
        this.usuarios = data;
        this.usuariosFiltrados = data;
        this.rolesUsuario = [...new Set(data.map(u => u.rol))];
        this.cargando = false;
      },
      error: () => {
        this.errorMsg = 'Error al cargar usuarios';
        this.cargando = false;
      }
    });
  }

  recargar() {
    this.cargarUsuarios();
  }

  badgeEstado(u: any) {
    return u.activo ? 'ACTIVO' : 'INACTIVO';
  }

  abrirNuevo() {
    this.modoEdicion = false;
    this.modalAbierto = true;
  }

  abrirEditar(u: any) {
    this.modoEdicion = true;
    this.formUpdate = { ...u };
    this.modalAbierto = true;
  }

  toggleActivo(u: any): void {
    this.usuariosService
      .cambiarEstado(u.idUsuario, !u.activo)
      .subscribe({
        next: () => {
          u.activo = !u.activo;
        },
        error: (err) => {
          console.error('Error al cambiar estado', err);
        }
      });
  }


  guardar() {
    this.modalAbierto = false;
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  volver() {
    history.back();
  }

  // ========== ROLES ==========
  cargarRoles() {
    this.cargandoRoles = true;
    this.rolesService.listarRoles().subscribe(data => {
      this.rolesSistema = data;
      this.cargandoRoles = false;
    });
  }

  cargarPermisos() {
    this.cargandoPermisos = true;
    this.rolesService.listarPermisos().subscribe(data => {
      this.permisos = data;
      this.cargandoPermisos = false;
    });
  }

  abrirNuevoRol() {
    this.rolModoEdicion = false;
    this.rolForm = {
      idRol: null,
      nombreRol: '',
      activo: true,
      permisos: []
    };
  }

  editarRol(rol: RolDto) {
    this.rolModoEdicion = true;
    this.rolForm = {
      idRol: rol.idRol,
      nombreRol: rol.nombreRol,
      activo: rol.activo,
      permisos: []
    };
  }

  permisoSeleccionado(id: number): boolean {
    return this.rolForm.permisos.includes(id);
  }

  togglePermiso(id: number, checked: boolean) {
    if (checked) {
      this.rolForm.permisos.push(id);
    } else {
      this.rolForm.permisos =
        this.rolForm.permisos.filter(p => p !== id);
    }
  }

  guardarRol() {
    if (this.rolModoEdicion && this.rolForm.idRol) {
      this.rolesService.editarRol(this.rolForm.idRol, {
        nombreRol: this.rolForm.nombreRol,
        activo: this.rolForm.activo
      }).subscribe(() => this.cargarRoles());
    } else {
      this.rolesService.crearRol({
        nombreRol: this.rolForm.nombreRol,
        activo: this.rolForm.activo,
        permisos: this.rolForm.permisos
      }).subscribe(() => this.cargarRoles());
    }
    this.abrirNuevoRol();
  }

  cambiarEstadoRol(rol: RolDto) {
    this.rolesService.cambiarEstado(rol.idRol, {
      activo: !rol.activo
    }).subscribe(() => {
      rol.activo = !rol.activo;
    });
  }
}

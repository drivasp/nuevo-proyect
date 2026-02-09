import { Component, OnInit, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  AdminUsuariosService,
  Rol,
  UsuarioDTO,
  UsuarioCreateRequest,
  UsuarioUpdateRequest
} from '../../services/admin-usuarios.service';
import { finalize, take } from 'rxjs/operators';

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-usuarios.html',
  styleUrls: ['./admin-usuarios.scss']
})
export class AdminUsuariosComponent implements OnInit {

  usuarios: UsuarioDTO[] = [];
  cargando = false;
  errorMsg = '';
  filtro = '';

  // modal
  modalAbierto = false;
  modoEdicion = false;

  // formulario
  formCreate: UsuarioCreateRequest = this.nuevoFormCreate();
  formUpdate: UsuarioUpdateRequest = this.nuevoFormUpdate();
  editId: number | null = null;

  roles: Rol[] = ['ADMIN', 'DOCENTE', 'ESTUDIANTE'];

  constructor(
    private router: Router,
    private api: AdminUsuariosService,
    private cdr: ChangeDetectorRef,
    private zone: NgZone
  ) {}

  ngOnInit(): void {
    // ✅ Carga automática al entrar
    this.recargar();
  }

  volver() {
    this.router.navigate(['/login']);
  }

  // ====== UI ======
  get usuariosFiltrados(): UsuarioDTO[] {
    const t = this.filtro.trim().toLowerCase();
    if (!t) return this.usuarios;

    return this.usuarios.filter(u =>
      String(u.idUsuario).includes(t) ||
      u.username.toLowerCase().includes(t) ||
      u.nombres.toLowerCase().includes(t) ||
      u.apellidos.toLowerCase().includes(t) ||
      u.rol.toLowerCase().includes(t) ||
      (u.activo ? 'activo' : 'inactivo').includes(t)
    );
  }

  badgeEstado(u: UsuarioDTO) {
    return u.activo ? 'ACTIVO' : 'INACTIVO';
  }

  // ====== Backend ======
  recargar() {
    this.cargando = true;
    this.errorMsg = '';

    this.api.listar()
      .pipe(
        take(1),
        finalize(() => {
          this.cargando = false;

          // ✅ fuerza refresco visual (soluciona “no aparece hasta darle click”)
          this.zone.run(() => {
            this.cdr.detectChanges();
          });
        })
      )
      .subscribe({
        next: (data) => {
          this.usuarios = data ?? [];

          // ✅ refresco inmediato
          this.zone.run(() => {
            this.cdr.detectChanges();
          });
        },
        error: (err) => {
          this.errorMsg = err?.error?.message || 'No se pudo cargar usuarios';

          this.zone.run(() => {
            this.cdr.detectChanges();
          });
        }
      });
  }

  // ====== Modal ======
  abrirNuevo() {
    this.modoEdicion = false;
    this.modalAbierto = true;
    this.editId = null;
    this.formCreate = this.nuevoFormCreate();
  }

  abrirEditar(u: UsuarioDTO) {
    this.modoEdicion = true;
    this.modalAbierto = true;
    this.editId = u.idUsuario;

    this.formUpdate = {
      nombres: u.nombres,
      apellidos: u.apellidos,
      rol: u.rol,
      activo: u.activo,
      password: ''
    };
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  guardar() {
    if (!this.modoEdicion) {
      // CREAR
      if (!this.formCreate.cedula?.trim()) return alert('Cédula requerida');
      if (!this.formCreate.correoInstitucional?.trim()) return alert('Correo institucional requerido');
      if (!this.formCreate.username?.trim()) return alert('Username requerido');
      if (!this.formCreate.password?.trim()) return alert('Password requerido');
      if (!this.formCreate.nombres?.trim()) return alert('Nombres requeridos');
      if (!this.formCreate.apellidos?.trim()) return alert('Apellidos requeridos');

      const payload: UsuarioCreateRequest = {
        ...this.formCreate,
        rol: (this.formCreate.rol || 'ESTUDIANTE').toUpperCase() as Rol,
        activo: this.formCreate.activo ?? true
      };

      this.api.crear(payload).pipe(take(1)).subscribe({
        next: () => {
          this.modalAbierto = false;
          this.recargar();
        },
        error: (err) => alert(err?.error?.message || 'No se pudo crear usuario')
      });

      return;
    }

    // EDITAR
    if (!this.editId) return;

    const payload: UsuarioUpdateRequest = {
      ...this.formUpdate,
      rol: (this.formUpdate.rol || 'ESTUDIANTE').toUpperCase() as Rol
    };

    if (payload.password?.trim() === '') delete payload.password;

    this.api.editar(this.editId, payload).pipe(take(1)).subscribe({
      next: () => {
        this.modalAbierto = false;
        this.recargar();
      },
      error: (err) => alert(err?.error?.message || 'No se pudo editar usuario')
    });
  }

  toggleActivo(u: UsuarioDTO) {
    const ok = confirm(`¿Seguro que desea ${u.activo ? 'desactivar' : 'activar'} al usuario "${u.username}"?`);
    if (!ok) return;

    this.api.cambiarEstado(u.idUsuario, !u.activo).pipe(take(1)).subscribe({
      next: () => this.recargar(),
      error: (err) => alert(err?.error?.message || 'No se pudo cambiar estado')
    });
  }

  private nuevoFormCreate(): UsuarioCreateRequest {
    return {
      cedula: '',
      correoInstitucional: '',
      username: '',
      password: '',
      nombres: '',
      apellidos: '',
      rol: 'ESTUDIANTE',
      activo: true
    };
  }

  private nuevoFormUpdate(): UsuarioUpdateRequest {
    return {
      nombres: '',
      apellidos: '',
      rol: 'ESTUDIANTE',
      activo: true,
      password: ''
    };
  }
}

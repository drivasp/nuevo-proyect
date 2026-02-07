import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

type Rol = 'ADMIN' | 'DOCENTE' | 'ESTUDIANTE';

interface UsuarioUI {
  idUsuario: number;
  usuarioLogin: string;
  nombres: string;
  apellidos: string;
  rolAsignado: Rol;
  activo: boolean;
}

@Component({
  selector: 'app-admin-usuarios',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-usuarios.html',
  styleUrls: ['./admin-usuarios.scss']
})
export class AdminUsuariosComponent {

  // ✅ Lista (por ahora MOCK, luego backend)
  usuarios: UsuarioUI[] = [
    { idUsuario: 1, usuarioLogin: 'admin', nombres: 'Administrador', apellidos: 'Sistema', rolAsignado: 'ADMIN', activo: true },
    { idUsuario: 2, usuarioLogin: 'docente1', nombres: 'Erwin', apellidos: 'Docente', rolAsignado: 'DOCENTE', activo: true },
    { idUsuario: 3, usuarioLogin: 'estudiante1', nombres: 'Juan', apellidos: 'Pérez', rolAsignado: 'ESTUDIANTE', activo: false },
  ];

  filtro = '';

  // ✅ Modal
  modalAbierto = false;
  modoEdicion = false;

  // ✅ Form
  form: UsuarioUI = this.nuevoForm();

  constructor(private router: Router) {}

  volver() {
    this.router.navigate(['/login']); // luego lo cambias al dashboard admin real
  }

  // ====== UI helpers ======
  get usuariosFiltrados(): UsuarioUI[] {
    const t = this.filtro.trim().toLowerCase();
    if (!t) return this.usuarios;

    return this.usuarios.filter(u =>
      String(u.idUsuario).includes(t) ||
      u.usuarioLogin.toLowerCase().includes(t) ||
      u.nombres.toLowerCase().includes(t) ||
      u.apellidos.toLowerCase().includes(t) ||
      u.rolAsignado.toLowerCase().includes(t) ||
      (u.activo ? 'activo' : 'inactivo').includes(t)
    );
  }

  badgeEstado(u: UsuarioUI) {
    return u.activo ? 'ACTIVO' : 'INACTIVO';
  }

  // ====== Acciones ======
  recargar() {
    // por ahora solo simula recargar
    // luego aquí llamaremos al backend
    this.filtro = '';
  }

  abrirNuevo() {
    this.modoEdicion = false;
    this.form = this.nuevoForm();
    this.modalAbierto = true;
  }

  abrirEditar(u: UsuarioUI) {
    this.modoEdicion = true;
    this.form = { ...u };
    this.modalAbierto = true;
  }

  cerrarModal() {
    this.modalAbierto = false;
  }

  guardar() {
    // Validación mínima
    if (!this.form.usuarioLogin.trim() || !this.form.nombres.trim() || !this.form.apellidos.trim()) {
      alert('Complete usuario, nombres y apellidos');
      return;
    }

    if (this.modoEdicion) {
      // editar
      const idx = this.usuarios.findIndex(x => x.idUsuario === this.form.idUsuario);
      if (idx >= 0) this.usuarios[idx] = { ...this.form };
    } else {
      // crear
      const nuevoId = Math.max(...this.usuarios.map(x => x.idUsuario), 0) + 1;
      this.usuarios.push({ ...this.form, idUsuario: nuevoId });
    }

    this.modalAbierto = false;
  }

  toggleActivo(u: UsuarioUI) {
    const ok = confirm(`¿Seguro que desea ${u.activo ? 'desactivar' : 'activar'} al usuario "${u.usuarioLogin}"?`);
    if (!ok) return;

    u.activo = !u.activo;
  }

  private nuevoForm(): UsuarioUI {
    return {
      idUsuario: 0,
      usuarioLogin: '',
      nombres: '',
      apellidos: '',
      rolAsignado: 'ESTUDIANTE',
      activo: true
    };
  }
}

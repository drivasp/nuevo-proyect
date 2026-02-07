package com.erwin.backend.service;

import com.erwin.backend.dtos.*;
import com.erwin.backend.entities.Usuario;
import com.erwin.backend.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminUsuarioService {

    private final UsuarioRepository usuarioRepo;

    public AdminUsuarioService(UsuarioRepository usuarioRepo) {
        this.usuarioRepo = usuarioRepo;
    }

    public List<UsuarioAdminDto> listar() {
        return usuarioRepo.findAll().stream().map(this::toDto).toList();
    }

    @Transactional
    public UsuarioAdminDto crear(UsuarioCreateRequest req) {
        validarCreate(req);

        String username = req.getUsername().trim();

        if (usuarioRepo.existsByUsername(username)) {
            throw new RuntimeException("El usuario ya existe");
        }

        Usuario u = new Usuario();

        // obligatorios por tu BD
        u.setCedula(req.getCedula().trim());
        u.setCorreoInstitucional(req.getCorreoInstitucional() != null ? req.getCorreoInstitucional().trim() : null);

        u.setUsername(username);
        u.setNombres(req.getNombres().trim());
        u.setApellidos(req.getApellidos().trim());

        String rol = normalizarRol(req.getRol());
        u.setRol(rol);          // ✅ columna "rol" NOT NULL
        u.setRolAsignado(rol);  // ✅ tu columna "rol_asignado"

        u.setActivo(req.getActivo() != null ? req.getActivo() : true);

        // por ahora igual a tu login actual (texto plano si así lo tienes)
        u.setPasswordHash(req.getPassword());

        return toDto(usuarioRepo.save(u));
    }

    @Transactional
    public UsuarioAdminDto editar(Integer id, UsuarioUpdateRequest req) {
        Usuario u = usuarioRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no existe"));

        if (req.getNombres() != null && !req.getNombres().trim().isEmpty()) u.setNombres(req.getNombres().trim());
        if (req.getApellidos() != null && !req.getApellidos().trim().isEmpty()) u.setApellidos(req.getApellidos().trim());

        if (req.getRol() != null && !req.getRol().trim().isEmpty()) {
            String rol = normalizarRol(req.getRol());
            u.setRol(rol);          // ✅
            u.setRolAsignado(rol);  // ✅
        }

        if (req.getActivo() != null) u.setActivo(req.getActivo());

        if (req.getPassword() != null && !req.getPassword().trim().isEmpty()) {
            u.setPasswordHash(req.getPassword());
        }

        return toDto(usuarioRepo.save(u));
    }

    @Transactional
    public UsuarioAdminDto cambiarEstado(Integer id, UsuarioEstadoRequest req) {
        if (req == null || req.getActivo() == null) {
            throw new RuntimeException("Debe enviar activo=true/false");
        }

        Usuario u = usuarioRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no existe"));

        u.setActivo(req.getActivo());
        return toDto(usuarioRepo.save(u));
    }

    private UsuarioAdminDto toDto(Usuario u) {
        return new UsuarioAdminDto(
                u.getIdUsuario(),
                u.getUsername(),
                u.getNombres(),
                u.getApellidos(),
                u.getRol(),        // puedes devolver u.getRol() o u.getRolAsignado()
                u.getActivo()
        );
    }

    private void validarCreate(UsuarioCreateRequest req) {
        if (req == null) throw new RuntimeException("Body requerido");
        if (vacio(req.getCedula())) throw new RuntimeException("Cédula requerida");
        if (vacio(req.getUsername())) throw new RuntimeException("Username requerido");
        if (vacio(req.getPassword())) throw new RuntimeException("Password requerida");
        if (vacio(req.getNombres())) throw new RuntimeException("Nombres requeridos");
        if (vacio(req.getApellidos())) throw new RuntimeException("Apellidos requeridos");
        if (vacio(req.getRol())) throw new RuntimeException("Rol requerido");
    }

    private boolean vacio(String s) {
        return s == null || s.trim().isEmpty();
    }

    private String normalizarRol(String rol) {
        String r = rol.trim().toUpperCase();

        // por si te llega ROLE_...
        if (r.equals("ROLE_ADMIN")) return "ADMIN";
        if (r.equals("ROLE_DOCENTE")) return "DOCENTE";
        if (r.equals("ROLE_ESTUDIANTE")) return "ESTUDIANTE";

        if (!r.equals("ADMIN") && !r.equals("DOCENTE") && !r.equals("ESTUDIANTE")) {
            throw new RuntimeException("Rol inválido. Use ADMIN, DOCENTE o ESTUDIANTE");
        }
        return r;
    }
}

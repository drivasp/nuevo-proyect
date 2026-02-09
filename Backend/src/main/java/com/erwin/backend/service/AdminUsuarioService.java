package com.erwin.backend.service;

import com.erwin.backend.dtos.*;
import com.erwin.backend.repository.UsuarioSpRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminUsuarioService {

    private final UsuarioSpRepository usuarioSp;

    public AdminUsuarioService(UsuarioSpRepository usuarioSp) {
        this.usuarioSp = usuarioSp;
    }

    public List<UsuarioAdminDto> listar() {
        return usuarioSp.listar();
    }

    @Transactional
    public UsuarioAdminDto crear(UsuarioCreateRequest req) {
        validarCreate(req);

        // normaliza rol antes de mandar al SP
        req.setRol(normalizarRol(req.getRol()));
        if (req.getActivo() == null) req.setActivo(true);

        Integer newId = usuarioSp.crear(req);

        // luego de crear, volvemos a listar y buscamos el creado (simple)
        // (si quieres, luego hacemos un sp_get_usuario_por_id)
        return usuarioSp.listar().stream()
                .filter(u -> u.getIdUsuario().equals(newId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Usuario creado pero no se pudo recuperar"));
    }

    @Transactional
    public UsuarioAdminDto editar(Integer id, UsuarioUpdateRequest req) {

        if (req.getRol() != null && !req.getRol().trim().isEmpty()) {
            req.setRol(normalizarRol(req.getRol()));
        }

        usuarioSp.editar(id, req);

        return usuarioSp.listar().stream()
                .filter(u -> u.getIdUsuario().equals(id))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Usuario editado pero no se pudo recuperar"));
    }

    @Transactional
    public UsuarioAdminDto cambiarEstado(Integer id, UsuarioEstadoRequest req) {
        if (req == null || req.getActivo() == null) {
            throw new RuntimeException("Debe enviar activo=true/false");
        }

        usuarioSp.cambiarEstado(id, req);

        return usuarioSp.listar().stream()
                .filter(u -> u.getIdUsuario().equals(id))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Estado cambiado pero no se pudo recuperar"));
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

        if (r.equals("ROLE_ADMIN")) return "ADMIN";
        if (r.equals("ROLE_DOCENTE")) return "DOCENTE";
        if (r.equals("ROLE_ESTUDIANTE")) return "ESTUDIANTE";

        if (!r.equals("ADMIN") && !r.equals("DOCENTE") && !r.equals("ESTUDIANTE")) {
            throw new RuntimeException("Rol inválido. Use ADMIN, DOCENTE o ESTUDIANTE");
        }
        return r;
    }
}

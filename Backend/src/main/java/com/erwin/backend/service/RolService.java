package com.erwin.backend.service;

import com.erwin.backend.dtos.*;
import com.erwin.backend.repository.RolSpRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RolService {

    private final RolSpRepository rolSpRepository;

    public RolService(RolSpRepository rolSpRepository) {
        this.rolSpRepository = rolSpRepository;
    }

    public List<RolDto> listarRoles() {
        return rolSpRepository.listarRoles();
    }

    public List<PermisoDto> listarPermisos() {
        return rolSpRepository.listarPermisos();
    }

    @Transactional
    public RolDto crear(RolCreateRequest req) {
        validarCreate(req);

        String nombreRol = normalizarNombreRol(req.getNombreRol());
        Integer id = rolSpRepository.crearRol(nombreRol, req.getActivo(), req.getPermisos());

        return rolSpRepository.listarRoles().stream()
                .filter(r -> r.getIdRol().equals(id))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Rol no existe"));
    }

    @Transactional
    public RolDto editar(Integer id, RolUpdateRequest req) {
        String nombreRol = req.getNombreRol() != null ? normalizarNombreRol(req.getNombreRol()) : null;
        rolSpRepository.editarRol(id, nombreRol, req.getActivo());

        return rolSpRepository.listarRoles().stream()
                .filter(r -> r.getIdRol().equals(id))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Rol no existe"));
    }

    @Transactional
    public RolDto cambiarEstado(Integer id, RolEstadoRequest req) {
        if (req == null || req.getActivo() == null) {
            throw new RuntimeException("Debe enviar activo=true/false");
        }
        rolSpRepository.cambiarEstado(id, req.getActivo());
        return rolSpRepository.listarRoles().stream()
                .filter(r -> r.getIdRol().equals(id))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Rol no existe"));
    }

    @Transactional
    public RolDto asignarPermisos(Integer id, RolPermisosRequest req) {
        rolSpRepository.asignarPermisos(id, req != null ? req.getPermisos() : null);
        return rolSpRepository.listarRoles().stream()
                .filter(r -> r.getIdRol().equals(id))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Rol no existe"));
    }

    private void validarCreate(RolCreateRequest req) {
        if (req == null) throw new RuntimeException("Body requerido");
        if (req.getNombreRol() == null || req.getNombreRol().trim().isEmpty()) {
            throw new RuntimeException("Nombre de rol requerido");
        }
    }

    private String normalizarNombreRol(String nombreRol) {
        String r = nombreRol.trim().toUpperCase();
        if (r.startsWith("ROLE_")) {
            return r;
        }
        return "ROLE_" + r;
    }
}

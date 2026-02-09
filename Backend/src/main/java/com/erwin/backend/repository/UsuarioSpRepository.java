package com.erwin.backend.repository;

import com.erwin.backend.dtos.UsuarioAdminDto;
import com.erwin.backend.dtos.UsuarioCreateRequest;
import com.erwin.backend.dtos.UsuarioEstadoRequest;
import com.erwin.backend.dtos.UsuarioUpdateRequest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class UsuarioSpRepository {

    private final JdbcTemplate jdbc;

    public UsuarioSpRepository(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // ✅ LISTAR (sp_listar_usuarios)
    public List<UsuarioAdminDto> listar() {
        return jdbc.query(
                "SELECT * FROM sp_listar_usuarios()",
                (rs, rowNum) -> new UsuarioAdminDto(
                        rs.getInt("id_usuario"),
                        rs.getString("username"),
                        rs.getString("nombres"),
                        rs.getString("apellidos"),
                        rs.getString("rol"),
                        rs.getBoolean("activo")
                )
        );
    }

    // ✅ CREAR (sp_crear_usuario)
    public Integer crear(UsuarioCreateRequest req) {
        return jdbc.queryForObject(
                "SELECT sp_crear_usuario(?,?,?,?,?,?,?,?)",
                Integer.class,
                req.getCedula(),
                req.getCorreoInstitucional(),
                req.getUsername(),
                req.getPassword(),
                req.getNombres(),
                req.getApellidos(),
                req.getRol(),
                req.getActivo() != null ? req.getActivo() : true
        );
    }

    // ✅ EDITAR (sp_editar_usuario)
    public void editar(Integer id, UsuarioUpdateRequest req) {
        jdbc.update(
                "SELECT sp_editar_usuario(?,?,?,?,?,?)",
                id,
                req.getNombres(),
                req.getApellidos(),
                req.getRol(),
                req.getActivo(),
                req.getPassword()
        );
    }

    // ✅ CAMBIAR ESTADO (sp_cambiar_estado_usuario)
    public void cambiarEstado(Integer id, UsuarioEstadoRequest req) {
        jdbc.update(
                "SELECT sp_cambiar_estado_usuario(?,?)",
                id,
                req.getActivo()
        );
    }
}

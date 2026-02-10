package com.erwin.backend.repository;

import com.erwin.backend.dtos.PermisoDto;
import com.erwin.backend.dtos.RolDto;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;

import java.sql.Array;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Repository
public class RolSpRepository {

    @PersistenceContext
    private EntityManager entityManager;

    public List<RolDto> listarRoles() {
        List<Object[]> rows = entityManager.createNativeQuery(
                        "SELECT id_rol, nombre_rol, activo, permisos FROM sp_listar_roles()")
                .getResultList();

        List<RolDto> result = new ArrayList<>();
        for (Object[] row : rows) {
            result.add(new RolDto(
                    ((Number) row[0]).intValue(),
                    (String) row[1],
                    (Boolean) row[2],
                    toStringList(row[3])
            ));
        }
        return result;
    }

    public List<PermisoDto> listarPermisos() {
        List<Object[]> rows = entityManager.createNativeQuery(
                        "SELECT id_permiso, codigo, descripcion, activo FROM sp_listar_permisos()")
                .getResultList();

        List<PermisoDto> result = new ArrayList<>();
        for (Object[] row : rows) {
            result.add(new PermisoDto(
                    ((Number) row[0]).intValue(),
                    (String) row[1],
                    (String) row[2],
                    (Boolean) row[3]
            ));
        }
        return result;
    }

    public Integer crearRol(String nombreRol, Boolean activo, List<Integer> permisos) {
        Object result = entityManager.createNativeQuery(
                        "SELECT sp_crear_rol(?1, ?2, ?3)")
                .setParameter(1, nombreRol)
                .setParameter(2, activo)
                .setParameter(3, permisos != null ? permisos.toArray(new Integer[0]) : null)
                .getSingleResult();
        return ((Number) result).intValue();
    }

    public void editarRol(Integer idRol, String nombreRol, Boolean activo) {
        entityManager.createNativeQuery(
                        "SELECT sp_editar_rol(?1, ?2, ?3)")
                .setParameter(1, idRol)
                .setParameter(2, nombreRol)
                .setParameter(3, activo)
                .getSingleResult();
    }

    public void asignarPermisos(Integer idRol, List<Integer> permisos) {
        entityManager.createNativeQuery(
                        "SELECT sp_asignar_permisos_rol(?1, ?2)")
                .setParameter(1, idRol)
                .setParameter(2, permisos != null ? permisos.toArray(new Integer[0]) : null)
                .getSingleResult();
    }

    public void cambiarEstado(Integer idRol, Boolean activo) {
        entityManager.createNativeQuery(
                        "SELECT sp_cambiar_estado_rol(?1, ?2)")
                .setParameter(1, idRol)
                .setParameter(2, activo)
                .getSingleResult();
    }

    private List<String> toStringList(Object arrayValue) {
        if (arrayValue == null) {
            return Collections.emptyList();
        }
        if (arrayValue instanceof Array sqlArray) {
            try {
                Object[] values = (Object[]) sqlArray.getArray();
                List<String> result = new ArrayList<>();
                for (Object v : values) {
                    result.add(String.valueOf(v));
                }
                return result;
            } catch (SQLException e) {
                throw new RuntimeException("No se pudo leer el array de permisos", e);
            }
        }
        return Collections.emptyList();
    }
}

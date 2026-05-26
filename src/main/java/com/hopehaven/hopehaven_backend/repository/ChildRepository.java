package com.hopehaven.hopehaven_backend.repository;

import com.hopehaven.hopehaven_backend.model.Child;
import com.hopehaven.hopehaven_backend.model.ChildStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ChildRepository extends JpaRepository<Child, Long> {
    List<Child> findByStatus(ChildStatus status);
    List<Child> findByCity(String city);
    List<Child> findByAgeBetween(int minAge, int maxAge);
}
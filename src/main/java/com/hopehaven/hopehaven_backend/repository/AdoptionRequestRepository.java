package com.hopehaven.hopehaven_backend.repository;

import com.hopehaven.hopehaven_backend.model.AdoptionRequest;
import com.hopehaven.hopehaven_backend.model.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AdoptionRequestRepository extends JpaRepository<AdoptionRequest, Long> {
    List<AdoptionRequest> findByStatus(RequestStatus status);
    List<AdoptionRequest> findByUserId(Long userId);
}
package com.hopehaven.hopehaven_backend.service;

import com.hopehaven.hopehaven_backend.dto.AdoptionRequestDto;
import com.hopehaven.hopehaven_backend.model.AdoptionRequest;
import com.hopehaven.hopehaven_backend.model.Child;
import com.hopehaven.hopehaven_backend.model.ChildStatus;
import com.hopehaven.hopehaven_backend.model.RequestStatus;
import com.hopehaven.hopehaven_backend.repository.AdoptionRequestRepository;
import com.hopehaven.hopehaven_backend.repository.ChildRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AdoptionService {

    @Autowired
    private AdoptionRequestRepository adoptionRequestRepository;

    @Autowired
    private ChildRepository childRepository;

    public AdoptionRequest submitRequest(AdoptionRequestDto dto) {
        Child child = childRepository.findById(dto.getChildId())
                .orElseThrow(() -> new RuntimeException("Child not found"));

        AdoptionRequest request = new AdoptionRequest();
        request.setChild(child);
        request.setMessage(dto.getMessage());
        request.setRequestedAt(LocalDateTime.now());
        request.setStatus(RequestStatus.PENDING);
        return adoptionRequestRepository.save(request);
    }

    public List<AdoptionRequest> getAll() {
        return adoptionRequestRepository.findAll();
    }

    public AdoptionRequest updateStatus(Long id, RequestStatus status) {
        AdoptionRequest request = adoptionRequestRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Request not found"));

        request.setStatus(status);

        if (status == RequestStatus.APPROVED) {
            request.getChild().setStatus(ChildStatus.ADOPTED);
            childRepository.save(request.getChild());
        }

        return adoptionRequestRepository.save(request);
    }
}
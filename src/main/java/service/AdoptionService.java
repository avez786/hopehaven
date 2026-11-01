
package com.hopehaven.hopehaven_backend.service;

import com.hopehaven.hopehaven_backend.dto.AdoptionRequestDto;
import com.hopehaven.hopehaven_backend.exception.ResourceNotFoundException;
import com.hopehaven.hopehaven_backend.model.AdoptionRequest;
import com.hopehaven.hopehaven_backend.model.Child;
import com.hopehaven.hopehaven_backend.model.ChildStatus;
import com.hopehaven.hopehaven_backend.model.RequestStatus;
import com.hopehaven.hopehaven_backend.model.User;
import com.hopehaven.hopehaven_backend.repository.AdoptionRequestRepository;
import com.hopehaven.hopehaven_backend.repository.ChildRepository;
import com.hopehaven.hopehaven_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AdoptionService {

    @Autowired
    private AdoptionRequestRepository adoptionRequestRepository;

    @Autowired
    private ChildRepository childRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional
    public AdoptionRequest submitRequest(
            AdoptionRequestDto dto, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        Child child = childRepository.findById(dto.getChildId())
                .orElseThrow(() ->
                        new ResourceNotFoundException("Child not found"));

        if (child.getStatus() == ChildStatus.ADOPTED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This child has already been adopted"
            );
        }

        boolean duplicate = adoptionRequestRepository
                .existsByUserIdAndChildIdAndStatus(
                        user.getId(),
                        child.getId(),
                        RequestStatus.PENDING
                );

        if (duplicate) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "You already have a pending request for this child"
            );
        }
        // Check 1: Prevent the same user from submitting again
        if (adoptionRequestRepository.existsByUserIdAndChildIdAndStatus(
                user.getId(), child.getId(), RequestStatus.PENDING)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "You already have a pending request for this child"
            );
        }

// Check 2: Prevent another user from requesting the same child
        if (adoptionRequestRepository.existsByChildIdAndStatus(
                child.getId(), RequestStatus.PENDING)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This child already has a pending adoption request"
            );
        }

        AdoptionRequest request = new AdoptionRequest();
        request.setUser(user);
        request.setChild(child);
        request.setMessage(dto.getMessage());
        request.setRequestedAt(LocalDateTime.now());
        request.setStatus(RequestStatus.PENDING);

        return adoptionRequestRepository.save(request);
    }

    @Transactional(readOnly = true)
    public List<AdoptionRequest> getAll() {
        return adoptionRequestRepository.findAll();
    }

    @Transactional
    public void updateStatus(Long id, RequestStatus status) {

        AdoptionRequest request = adoptionRequestRepository.findById(id)
                .orElseThrow(() ->
                        new ResourceNotFoundException(
                                "Adoption request not found: " + id));

        if (status == RequestStatus.APPROVED) {
            Child child = request.getChild();

            if (child.getStatus() == ChildStatus.ADOPTED) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "This child has already been adopted"
                );
            }

            child.setStatus(ChildStatus.ADOPTED);
            childRepository.save(child);
        }

        request.setStatus(status);
        adoptionRequestRepository.save(request);
    }
}

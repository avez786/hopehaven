package com.hopehaven.hopehaven_backend.service;

import com.hopehaven.hopehaven_backend.dto.ChildRequest;
import com.hopehaven.hopehaven_backend.dto.ChildResponse;
import com.hopehaven.hopehaven_backend.model.Child;
import com.hopehaven.hopehaven_backend.model.ChildStatus;
import com.hopehaven.hopehaven_backend.repository.ChildRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChildService {

    @Autowired
    private ChildRepository childRepository;

    public List<ChildResponse> getAllChildren() {
        return childRepository.findAll()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public ChildResponse getChildById(Long id) {
        Child child = childRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Child not found"));
        return toResponse(child);
    }

    public ChildResponse addChild(ChildRequest request) {
        Child child = new Child();
        child.setName(request.getName());
        child.setAge(request.getAge());
        child.setCity(request.getCity());
        child.setBio(request.getBio());
        child.setInterests(request.getInterests());
        child.setImageEmoji(request.getImageEmoji());
        child.setStatus(ChildStatus.AVAILABLE);
        return toResponse(childRepository.save(child));
    }

    public ChildResponse updateChild(Long id, ChildRequest request) {
        Child child = childRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Child not found"));
        child.setName(request.getName());
        child.setAge(request.getAge());
        child.setCity(request.getCity());
        child.setBio(request.getBio());
        child.setInterests(request.getInterests());
        child.setImageEmoji(request.getImageEmoji());
        return toResponse(childRepository.save(child));
    }

    public void deleteChild(Long id) {
        childRepository.deleteById(id);
    }

    public List<ChildResponse> filterChildren(String city, String status, Integer minAge, Integer maxAge) {
        if (city != null) return childRepository.findByCity(city).stream().map(this::toResponse).collect(Collectors.toList());
        if (status != null) return childRepository.findByStatus(ChildStatus.valueOf(status.toUpperCase())).stream().map(this::toResponse).collect(Collectors.toList());
        if (minAge != null && maxAge != null) return childRepository.findByAgeBetween(minAge, maxAge).stream().map(this::toResponse).collect(Collectors.toList());
        return childRepository.findAll().stream().map(this::toResponse).collect(Collectors.toList());
    }

    private ChildResponse toResponse(Child child) {
        ChildResponse response = new ChildResponse();
        response.setId(child.getId());
        response.setName(child.getName());
        response.setAge(child.getAge());
        response.setCity(child.getCity());
        response.setBio(child.getBio());
        response.setInterests(child.getInterests());
        response.setImageEmoji(child.getImageEmoji());
        response.setStatus(child.getStatus());
        return response;
    }
}
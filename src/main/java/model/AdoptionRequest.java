package com.hopehaven.hopehaven_backend.model;

import jakarta.persistence.*;
import lombok.*;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import java.time.LocalDateTime;

@Entity
@Table(name = "adoption_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdoptionRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"password", "adoptionRequests", "hibernateLazyInitializer", "handler"})
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "child_id")
    @JsonIgnoreProperties({"adoptionRequests", "hibernateLazyInitializer", "handler"})
    private com.hopehaven.hopehaven_backend.model.Child child;



    private String message;
    private LocalDateTime requestedAt;

    @Enumerated(EnumType.STRING)
    private com.hopehaven.hopehaven_backend.model.RequestStatus status;
}
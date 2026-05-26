package com.hopehaven.hopehaven_backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "donations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Donation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String donorName;
    private String donorEmail;
    private Double amount;
    private String category;
    private String frequency;
    private LocalDateTime donatedAt;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;
}
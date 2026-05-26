package com.hopehaven.hopehaven_backend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "children")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Child {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private Integer age;
    private String city;
    private String bio;
    private String interests;
    private String imageEmoji;

    @Enumerated(EnumType.STRING)
    private ChildStatus status;
}
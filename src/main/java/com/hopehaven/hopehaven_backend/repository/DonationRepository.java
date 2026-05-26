package com.hopehaven.hopehaven_backend.repository;

import com.hopehaven.hopehaven_backend.model.Donation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface DonationRepository extends JpaRepository<Donation, Long> {
    List<Donation> findByDonorEmail(String email);

    @Query("SELECT SUM(d.amount) FROM Donation d")
    Double getTotalDonations();
}
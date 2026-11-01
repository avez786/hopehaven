
package com.hopehaven.hopehaven_backend.service;

import com.hopehaven.hopehaven_backend.dto.DonationRequest;
import com.hopehaven.hopehaven_backend.exception.ResourceNotFoundException;
import com.hopehaven.hopehaven_backend.model.Donation;
import com.hopehaven.hopehaven_backend.model.User;
import com.hopehaven.hopehaven_backend.repository.DonationRepository;
import com.hopehaven.hopehaven_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Map;
import java.util.stream.Collectors;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DonationService {

    @Autowired
    private DonationRepository donationRepository;

    @Autowired
    private UserRepository userRepository;

    public Donation saveDonation(
            DonationRequest request, String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new ResourceNotFoundException("User not found"));

        Donation donation = new Donation();

        donation.setUser(user);
        donation.setDonorName(
                user.getFirstName() + " " + user.getLastName());
        donation.setDonorEmail(user.getEmail());
        donation.setAmount(request.getAmount());
        donation.setCategory(request.getCategory());
        donation.setFrequency(request.getFrequency());
        donation.setDonatedAt(LocalDateTime.now());

        return donationRepository.save(donation);
    }

    public List<Donation> getAll() {
        return donationRepository.findAll();
    }

    public Double getTotalAmount() {
        Double total = donationRepository.getTotalDonations();
        return total != null ? total : 0.0;
    }
    public Map<String, Double> getDonationsByCategory() {
        return donationRepository.findAll().stream()
                .filter(d -> d.getCategory() != null)
                .collect(Collectors.groupingBy(
                        Donation::getCategory,
                        Collectors.summingDouble(
                                d -> d.getAmount() != null ? d.getAmount() : 0.0
                        )
                ));
    }

    public List<Donation> getRecentDonations() {
        return donationRepository.findAll().stream()
                .sorted((a, b) -> {
                    if (a.getDonatedAt() == null) return 1;
                    if (b.getDonatedAt() == null) return -1;
                    return b.getDonatedAt().compareTo(a.getDonatedAt());
                })
                .limit(5)
                .collect(Collectors.toList());
    }
}

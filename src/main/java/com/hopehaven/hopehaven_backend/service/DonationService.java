package com.hopehaven.hopehaven_backend.service;

import com.hopehaven.hopehaven_backend.dto.DonationRequest;
import com.hopehaven.hopehaven_backend.model.Donation;
import com.hopehaven.hopehaven_backend.repository.DonationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DonationService {

    @Autowired
    private DonationRepository donationRepository;

    public Donation saveDonation(DonationRequest request) {
        Donation donation = new Donation();
        donation.setDonorName(request.getDonorName());
        donation.setDonorEmail(request.getDonorEmail());
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
}
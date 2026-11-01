
package com.hopehaven.hopehaven_backend.service;

import com.hopehaven.hopehaven_backend.model.Donation;
import static org.junit.jupiter.api.Assertions.assertTrue;
import com.hopehaven.hopehaven_backend.repository.DonationRepository;
import com.hopehaven.hopehaven_backend.repository.UserRepository;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import com.hopehaven.hopehaven_backend.dto.DonationRequest;
import com.hopehaven.hopehaven_backend.exception.ResourceNotFoundException;
import com.hopehaven.hopehaven_backend.model.User;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class DonationServiceTest {

    @Mock
    private DonationRepository donationRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private com.hopehaven.hopehaven_backend.service.DonationService donationService;

    @Test
    void getAll_shouldReturnAllDonations() {
        // Arrange
        List<Donation> donations = List.of(
                new Donation(),
                new Donation()
        );

        when(donationRepository.findAll()).thenReturn(donations);

        // Act
        List<Donation> result = donationService.getAll();

        // Assert
        assertEquals(2, result.size());
        assertEquals(donations, result);
        verify(donationRepository).findAll();
    }

    @Test
    void getAll_shouldReturnEmptyListWhenNoDonationsExist() {
        // Arrange
        when(donationRepository.findAll()).thenReturn(List.of());

        // Act
        List<Donation> result = donationService.getAll();

        // Assert
        assertEquals(0, result.size());
        assertTrue(result.isEmpty());
        verify(donationRepository).findAll();
    }

    @Test
    void getTotalAmount_shouldReturnTotal() {
        when(donationRepository.getTotalDonations()).thenReturn(1500.0);

        Double result = donationService.getTotalAmount();

        assertEquals(1500.0, result);
        verify(donationRepository).getTotalDonations();
    }

    @Test
    void getTotalAmount_shouldReturnZeroWhenTotalIsNull() {
        when(donationRepository.getTotalDonations()).thenReturn(null);

        Double result = donationService.getTotalAmount();

        assertEquals(0.0, result);
        verify(donationRepository).getTotalDonations();
    }


    @Test
    void getDonationsByCategory_shouldGroupAndSumAmounts() {
        Donation d1 = new Donation();
        d1.setCategory("Education");
        d1.setAmount(100.0);

        Donation d2 = new Donation();
        d2.setCategory("Education");
        d2.setAmount(200.0);

        Donation d3 = new Donation();
        d3.setCategory("Food");
        d3.setAmount(50.0);

        when(donationRepository.findAll()).thenReturn(List.of(d1, d2, d3));

        var result = donationService.getDonationsByCategory();

        assertEquals(300.0, result.get("Education"));
        assertEquals(50.0, result.get("Food"));
        assertEquals(2, result.size());

        verify(donationRepository).findAll();
    }


    @Test
    void getRecentDonations_shouldReturnAtMostFive() {
        List<Donation> donations = List.of(
                new Donation(),
                new Donation(),
                new Donation(),
                new Donation(),
                new Donation(),
                new Donation(),
                new Donation()
        );

        when(donationRepository.findAll()).thenReturn(donations);

        List<Donation> result = donationService.getRecentDonations();

        assertEquals(5, result.size());
        verify(donationRepository).findAll();
    }

    @Test
    void saveDonation_shouldSaveDonationForExistingUser() {
        User user = new User();
        user.setFirstName("Test");
        user.setLastName("Donor");
        user.setEmail("test@example.com");

        DonationRequest request = new DonationRequest();
        request.setAmount(500.0);
        request.setCategory("Education");
        request.setFrequency("One-time");

        when(userRepository.findByEmail("test@example.com"))
                .thenReturn(java.util.Optional.of(user));

        when(donationRepository.save(any(Donation.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        Donation result = donationService.saveDonation(
                request, "test@example.com");

        assertNotNull(result);
        assertEquals(500.0, result.getAmount());
        assertEquals("Education", result.getCategory());
        assertEquals("One-time", result.getFrequency());

        verify(userRepository).findByEmail("test@example.com");
        verify(donationRepository).save(any(Donation.class));
    }



    @Test
    void saveDonation_shouldThrowWhenUserDoesNotExist() {
        DonationRequest request = new DonationRequest();
        request.setAmount(500.0);
        request.setCategory("Education");
        request.setFrequency("One-time");

        when(userRepository.findByEmail("missing@example.com"))
                .thenReturn(java.util.Optional.empty());

        ResourceNotFoundException exception = org.junit.jupiter.api.Assertions
                .assertThrows(
                        ResourceNotFoundException.class,
                        () -> donationService.saveDonation(
                                request, "missing@example.com")
                );

        assertEquals("User not found", exception.getMessage());

        verify(userRepository).findByEmail("missing@example.com");
        verify(donationRepository, never()).save(any(Donation.class));
    }



}

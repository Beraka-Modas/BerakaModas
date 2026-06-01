package com.beraka.siv.service;

import com.beraka.siv.model.dto.BranchDto;
import com.beraka.siv.model.entity.Branch;
import com.beraka.siv.repository.BranchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BranchService {

    private final BranchRepository branchRepository;

    public BranchDto createBranch(BranchDto dto) {
        Branch branch = new Branch();
        branch.setName(dto.getName());
        branch.setAddress(dto.getAddress());
        branch.setInternalId(dto.getInternalId());

        Branch saved = branchRepository.save(branch);

        dto.setId(saved.getId());
        return dto;
    }

    public List<BranchDto> getAllBranches() {
        return branchRepository.findAll().stream().map(b ->
                new BranchDto(b.getId(), b.getName(), b.getAddress(), b.getInternalId())
        ).collect(Collectors.toList());
    }

    @Transactional
    public BranchDto updateBranch(Long id, BranchDto dto) {
        Branch branch = branchRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sede no encontrada con ID: " + id));

        if (dto.getName() != null && !dto.getName().trim().isEmpty()) {
            branch.setName(dto.getName().trim());
        }
        if (dto.getAddress() != null && !dto.getAddress().trim().isEmpty()) {
            branch.setAddress(dto.getAddress().trim());
        }
        if (dto.getInternalId() != null && !dto.getInternalId().trim().isEmpty()) {
            branch.setInternalId(dto.getInternalId().trim());
        }

        Branch saved = branchRepository.save(branch);
        return new BranchDto(saved.getId(), saved.getName(), saved.getAddress(), saved.getInternalId());
    }
}
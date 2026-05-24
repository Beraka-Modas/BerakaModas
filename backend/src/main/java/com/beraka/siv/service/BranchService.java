package com.beraka.siv.service;

import com.beraka.siv.model.dto.BranchDto;
import com.beraka.siv.model.entity.Branch;
import com.beraka.siv.repository.BranchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
}
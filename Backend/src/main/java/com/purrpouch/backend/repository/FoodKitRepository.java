package com.purrpouch.backend.repository;

import com.purrpouch.backend.model.FoodKit;
import com.purrpouch.backend.model.CatProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FoodKitRepository extends JpaRepository<FoodKit, Long> {
    List<FoodKit> findByCatProfile(CatProfile catProfile);

    List<FoodKit> findByCatProfileId(Long catProfileId);
}

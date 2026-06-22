"""Geographic helpers for property search."""

from __future__ import annotations

import math
from typing import Optional


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Distance in kilometres between two WGS84 points."""
    r = 6371.0
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    dphi = math.radians(lat2 - lat1)
    dlambda = math.radians(lon2 - lon1)
    a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
    return r * 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))


# NZ suburb centroids for manual search suggestions and seed data
NZ_LOCATIONS: dict[str, tuple[float, float]] = {
    "mount maunganui": (-37.638, 176.183),
    "papamoa": (-37.717, 176.317),
    "papamoa beach": (-37.717, 176.317),
    "tauranga central": (-37.687, 176.165),
    "tauranga": (-37.687, 176.165),
    "auckland cbd": (-36.848, 174.763),
    "auckland": (-36.848, 174.763),
    "wellington": (-41.286, 174.776),
    "christchurch": (-43.532, 172.636),
}


def coords_for_place(name: str) -> Optional[tuple[float, float]]:
    if not name:
        return None
    key = name.strip().lower()
    if key in NZ_LOCATIONS:
        return NZ_LOCATIONS[key]
    for label, coords in NZ_LOCATIONS.items():
        if label in key or key in label:
            return coords
    return None

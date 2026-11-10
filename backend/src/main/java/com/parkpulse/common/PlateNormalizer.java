package com.parkpulse.common;

public final class PlateNormalizer {

    private PlateNormalizer() {}

    /**
     * Normalizes a license plate by stripping spaces, hyphens, dots, and converting to uppercase.
     * E.g., "ka 01-ab 1234" -> "KA01AB1234"
     */
    public static String normalize(String rawPlate) {
        if (rawPlate == null) {
            return null;
        }
        return rawPlate.replaceAll("[^a-zA-Z0-9]", "").toUpperCase().trim();
    }
}


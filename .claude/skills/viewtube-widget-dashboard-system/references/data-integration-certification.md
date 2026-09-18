# Data, integration, certification

Preferred data path: SOURCE -> CANONICAL DATASET -> SELECTOR/ADAPTER -> WIDGET VIEW MODEL -> VISUAL/CONTROL. Compatible imported data must not be ignored merely because the preferred network source is unavailable. Preserve provenance and freshness.

Applicable states: loading, ready, empty, disconnected/blocked, stale, error. A disconnected account should normally preserve the useful widget interface and explain connection requirements rather than replace the tool with a blank module.

One stable registry definition and loader per widget. Keep expensive libraries/network work inside lazy boundaries. Hidden/collapsed widgets should avoid unnecessary polling, observers, media, and animation.

Certification gates: IMPLEMENTED, DATA_CONNECTED, FUNCTIONAL, DATA_STATES, RESPONSIVE, MOBILE_VERIFIED, VISUALLY_CERTIFIED, ACCESSIBLE, PRODUCTION_VERIFIED, CANONICAL. Registry lifecycle is not certification.

Accessibility includes keyboard, visible palette-derived focus, labels/semantics, contrast, reduced motion, touch behavior, and non-color encodings.
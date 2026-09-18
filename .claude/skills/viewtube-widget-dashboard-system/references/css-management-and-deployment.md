# CSS management, verification, deployment

CSS ownership order: tokens -> grid/shell -> primitives -> archetypes -> widget-specific -> accessibility. Fix the highest shared layer. Remove duplicate ownership and brittle utility-chain selectors. Reduce blanket dashboard specificity and remove !important by repairing cascade ownership. Keep Toolbox/Subtoolbox and Widget styling isolated.

Measure structural optimization before and after: CSS output, bundle/chunk impact, render behavior and large-list DOM where relevant. Prefer extraction/deletion over parallel abstractions.

Verification: focused tests -> current dashboard contract suite -> type/build checks -> W x H fixtures -> desktop/mobile screenshots -> production/dependency verification. Herald UI work is not PROVEN without visual evidence.

Deployment must preserve rollback/migration paths for persisted IDs/layouts and verify real auth/data dependencies. Do not claim production complete from local build or registry ready status alone.
# Donor and Migration Governance

## Donor principle

A branch/PR/document can contain useful work without being safe to merge wholesale.

Classify donor material as:
- absorbed;
- current-main stronger;
- unique-port;
- semantic-adapt;
- historical-reference;
- superseded;
- retire.

## Required donor record

Capture:
- source PR/branch/commit;
- artifact/path;
- current owner;
- disposition;
- current equivalent;
- verified main SHA;
- unique remaining value;
- tests required for a forward-port.

## Special PR rule

`merged: true` is not equivalent to `on main`.

Record:
- PR base branch;
- merge commit;
- currentMainState;
- verifiedMainSha.

## Historical documents

Archive under migration/reference when they retain provenance.
Promote durable rules into current authorities before removing the active path.

PR #241 is the canonical worked example; use its donor-harvest audit rather than re-running the same branch comparison from scratch.

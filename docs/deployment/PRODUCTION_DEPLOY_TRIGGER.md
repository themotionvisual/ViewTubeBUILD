# Production deployment trigger

Purpose: force Vercel Git integration to build the current `main` HEAD rather than redeploying the older production artifact.

Auth baseline included before this trigger:
- flat auth endpoints
- simple server-owned session
- current main before trigger: bc80799dd6c8731b93946554bf6fba35552ca6b8

This file has no runtime effect.

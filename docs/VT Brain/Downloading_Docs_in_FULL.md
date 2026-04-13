# Convert .docsetconfig to Local Directory

The user has a `.docsetconfig` file that points to `https://www.remotion.dev/docs`. They want to convert this into a "simple directory", which implies downloading the website content for offline viewing or local storage.

## Proposed Changes

I will use `wget` to recursively download the documentation from the specified URL.

### [Component Name]

#### [NEW] [RemotionDocs/](file:///Users/cwb/Downloads/RemotionDocs)
A new directory containing the mirrored HTML, CSS, and JS files from the Remotion documentation site.

## Verification Plan

### Automated Tests
- Check if the `index.html` file exists in the newly created directory.
- Verify that subdirectories (like `/docs`) are populated.

### Manual Verification
- Confirm with the user that the folder structure looks correct.

---
name: Clerk React runtime
description: Compatibility decision for the Clerk web client and workspace React catalog.
---

Keep the app's `react` and `react-dom` versions identical and within the peer range accepted by `@clerk/react`; the workspace catalog may lag that range.

**Why:** A supported Clerk client version rejected React 19.1.0 at runtime, while the catalog still referenced that older patch. Updating only one package caused a runtime crash.

**How to apply:** When updating Clerk or React in this app, check Clerk's peer range and pin both React packages to the same supported version. Avoid changing the workspace-wide catalog unless other apps also need the bump.

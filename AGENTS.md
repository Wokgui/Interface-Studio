# Development and publication

For every user-requested application change, finish the update flow as part of the task: publish the corresponding app build, ensure Actualiser retrieves the latest published version in the editor and the real-device panel, and validate the version shown before reporting success. Do not report a source-only change as an installed update.

Android updates must retain the installed app's signing identity. Never silently generate a replacement signing key, uninstall an existing app, or clear its data to bypass a signature mismatch. If the original private key is unavailable, report that blocker explicitly. Keep the real-device stream available after an unsuccessful update, and distinguish the editor version from the installed phone version.

Run app/scripts/test-phone-refresh.cjs for changes to the phone refresh flow, plus the syntax checks. Hardware installation must be verified on a connected device before claiming it has succeeded.

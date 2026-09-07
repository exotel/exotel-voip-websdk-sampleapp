# demo-npm
This is a basic npm based sample application to showcase Exotel VOIP Websdk API integrations. This demo uses npm library of exotel sdk.

# demo-non-npm
This is a basic non npm based sample application to showcase Exotel VOIP Websdk API integrations. This demo uses bundled exotel sdk .

# Exotel Voice WebSDK
This sample application requires a websdk package to work. Contact us to get the credentials to download the node.js package of the websdk. Follow the instructions provided in Integration guide.

Exotel Voice WebSDK Integration Guide and API documentation
File:[Exotel-Voice-Websdk-Integration-Guide.pdf](https://github.com/user-attachments/files/22391080/Exotel-Voice-Websdk-Integration-Guide.pdf)



Exotel Voice WebSDK Bundle Integration Guide and API documentation
File:[Exotel-Voice-Websdk-Bundle-Integration-Guide.pdf](https://github.com/user-attachments/files/22391090/Exotel-Voice-Websdk-Bundle-Integration-Guide.pdf)

Subscriber Management APIs
File: @[Exotel Client SDK – Subscriber Management API Guide.pdf](https://github.com/user-attachments/files/22132526/Exotel.Client.SDK.Subscriber.Management.API.Guide.pdf)

# Ring tone APIs (SDK v3.0.13)

SDK v3.0.13 makes the incoming ring tone configurable — `setRingingDuration` /
`getRingingDuration` (default 30 sec), `startRingTone` / `stopRingTone`, and
`setRingToneAutoStart` / `getRingToneAutoStart` to gate the automatic ring on your own state.
v3.0.13 also changes `registerLoggerCallback` to pass the real log severity instead of always
passing `"log"`.

These APIs post-date the PDF guides above. Until the PDFs are re-issued, see:

- [demo-npm/README.md](demo-npm/README.md#ring-tone-apis-sdk-v3013) — npm integration
- [demo-non-npm/README.md](demo-non-npm/README.md#ring-tone-apis-sdk-v3013) — bundled SDK integration
- [Changelog.md](Changelog.md) — full v3.0.13 entry, including both behaviour changes





# Exotel Voice WebSDK — Sample Applications

Sample applications and integration documentation for the Exotel Voice WebSDK, which adds VOIP
calling to a web app.

You need an Exotel account to use VOIP calling. Contact Exotel support for a demo and account
creation, or write to hello@exotel.in.

**Current SDK: client-sdk v3.0.14 / core-sdk v3.0.12.** See [Changelog.md](Changelog.md).

## Integration guides

The full integration guide and API reference lives with each sample app. Pick the one matching
how you consume the SDK:

| Guide | Use when | Docs |
| --- | --- | --- |
| **npm** | You install `@exotel-npm-dev/webrtc-client-sdk` from npm and bundle it yourself | [demo-npm/README.md](demo-npm/README.md) |
| **Bundle (non-npm)** | You drop `exotelsdk.js` into a page with a `<script>` tag | [demo-non-npm/README.md](demo-non-npm/README.md) |

Both guides cover the same SDK and are self-contained: getting started, supported browsers,
initialization, register/unregister, call handling (accept, hangup, mute, hold, DTMF), multitab
sessions, device and network diagnostics, auto-reconnect, readiness checks, audio device
selection, noise suppression, logging, volume control, ring tone control and the
`sipAccountInfo` reference.

### Jump to a topic

| Topic | npm | non-npm |
| --- | --- | --- |
| Initialize the library | [link](demo-npm/README.md#61-initialize-the-library) | [link](demo-non-npm/README.md#61-initialize-the-library) |
| Register / unregister | [link](demo-npm/README.md#64-register-the-sip-phone) | [link](demo-non-npm/README.md#64-register-the-sip-phone) |
| Receive / accept calls | [link](demo-npm/README.md#66-receive-calls) | [link](demo-non-npm/README.md#66-receive-calls) |
| Multitab scenarios | [link](demo-npm/README.md#612-multitab-scenarios) | [link](demo-non-npm/README.md#612-multitab-scenarios) |
| Diagnostics | [link](demo-npm/README.md#613-device-and-network-diagnostics) | [link](demo-non-npm/README.md#613-device-and-network-diagnostics) |
| Audio device selection | [link](demo-npm/README.md#616-audio-device-selection) | [link](demo-non-npm/README.md#616-audio-device-selection) |
| Logger callback | [link](demo-npm/README.md#618-logger-callback) | [link](demo-non-npm/README.md#618-logger-callback) |
| Ring tone control | [link](demo-npm/README.md#621-ring-tone-control) | [link](demo-non-npm/README.md#621-ring-tone-control) |
| `sipAccountInfo` reference | [link](demo-npm/README.md#7-messages--sipaccountinfo-reference) | [link](demo-non-npm/README.md#7-messages--sipaccountinfo-reference) |

## Sample apps

### demo-npm

React sample app using the npm package. Configure `src/phone.json`, then:

```bash
cd demo-npm && npm install && npm start
```

Runs on `https://localhost:3000`.

### demo-non-npm

Plain HTML/JS sample app using the bundled SDK. Configure `phone.js`, then serve over HTTPS
(WebRTC requires a secure context):

```bash
cd demo-non-npm
openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem
http-server -S -C cert.pem -K key.pem -p 8080 -c-1
```

The bundled SDK lives in `demo-non-npm/dist/`; `demo-non-npm/SDK/exotelsdk-3.0.14.tar.gz` is the
same build packaged for distribution. Extract it over `dist/` to refresh the bundle, and keep
the `.wav` files that ship alongside `exotelsdk.js` — the bundle loads them by name.

Releases are also published at
[github.com/exotel/exotel-voip-websdk-sampleapp/releases](https://github.com/exotel/exotel-voip-websdk-sampleapp/releases).

## Other documentation

Subscriber Management APIs:
[Exotel Client SDK – Subscriber Management API Guide.pdf](https://github.com/user-attachments/files/22132526/Exotel.Client.SDK.Subscriber.Management.API.Guide.pdf)

> The integration guides were previously distributed as PDFs generated from Google Docs. They
> now live in Markdown alongside the code they document, so they version with the SDK and show
> up in review diffs. A PDF can still be produced on demand from these files — see the
> `websdk-sampleapp-publish` skill.

## Support

Write to hello@exotel.in for any support required with integration.

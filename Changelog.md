Changelog

v3.0.7 30 December, 2025
-[VST-1306] hold unhold issue fix

## v3.0.6 19 December, 2025
-[VST-1269] fixing noise suppression bug and added wss transport in contact params

## v3.0.5 16 December, 2025
-[VST-1292] commenting fetchpublicip in initwebrtc as its causing race condition

## v3.0.4 16 September, 2025
-[VST-1093] Enabled support for noise suppression

## v3.0.3 15 September, 2025
-[VST-1063] granular control over different audio streams, added static registerLogger method for logger callback registration

## v3.0.2 28 August, 2025
-[VST-1063] prevent exotel / sipjs from throwing logs in the console based on a flag, added missing iceconnectionstate in session event callback, make auto audio device change handling configurable and fixing Missing sent_request event in registerCallback

## v3.0.0 07 July, 2025
-[VST-991] Enabled Mutli-Webrtc accounts in the same tab

## v1.0.23 10 June, 2025
-[VST-1011] Increasing Registration Expiry from 60s to 300s
## v1.0.22 04 April, 2025
-[VST-973] get and download logs , log refactoring and mute functionality enhancement

## v1.0.21 05 March, 2025
-[VST-954] Added custom sip codes and reason phrase for when agent are disconnecting and sdk is disconnecting call.

## v1.0.20 28 January, 2025
-[VST-940] Added checks for X-Exotel-Callsid, Call-ID, and LegSid headers in onRecieveInvite.

## v1.0.19 09 January, 2025
-[VST-865] Added option in websdk to select the codec preference

## v1.0.16 21 November, 2024
-[VST-885] Retry Support for SDK Websocket Connection

## v1.0.14 12 September, 2024
-[VST-807] Added call details with callsid and sip headers

## v1.0.11 26 August 2024
- upgraded sdk to 1.0.11, Added real-time selection for microphone and speaker devices, and implemented callbacks to notify the application when a device change occurs.

# v1.0.10 24 March 2024
- upgrade sdk to 1.0.10 with send DTMF support 

# v1.0.8 26 Feb 2024
- upgrade sdk 1.0.9

# v1.0.7 16 Feb 2024
- upgrade sdk having checkclientStatus API
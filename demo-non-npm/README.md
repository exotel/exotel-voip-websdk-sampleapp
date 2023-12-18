# demo-non-npm
This is a basic non npm based sample application to showcase Exotel VOIP Websdk API integrations. Using this sample app you can have a demo of voip calling functionalities in the browser. This sample application works with exotel platform. Contact us to get an account.

# Exotel Voice WebSDK
This sample application requires a websdk package to work. Contact us to get the credentials to download the node.js package of the websdk. Follow the instructions provided in 

# Exotel Voice WebSDK Bundle Integration Guide
File: Exotel-Voice-Websdk-Integration-Guide.pdf

# Demonstrations

## Configuration

exotel sip account is required for performing action. this account is configured in phone.js.

```
[
    {
        "Username":"<VOIP Username>",
        "DisplayName":"<Display Name>",
        "HostServer":"<VOIP Proxy Address>",
        "Domain":"<VOIP Domain Address>",
        "Port":443,
        "Password":"<VOIP Password>",
        "CallTimeout":1000,
        "Security": "wss",
        "EndPoint": "wss",
        "AccountSID":"<Your Account SID>",
        "AccountNo":"<VOIP Username>",
        "AutoRegistration": true
    }            
]
```

## Running

The demos will run in Chrome, Firefox, or other web browsers which supports WebRTC.

In your web browser, open the `index.html` file in this directory to run the demos.

## how to run sample with http-server 

openssl req -newkey rsa:2048 -new -nodes -x509 -days 3650 -keyout key.pem -out cert.pem
http-server  -S 


## Development

This demonstration are build on simple html which provides some basic functionality(register,accept, reject, mute and hold) via a simple interface.

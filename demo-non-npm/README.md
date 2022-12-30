# Demonstrations

## Configuration

exotel sip account is required for performing action. this account is configured in index.html under script id as phone.

```
<script id="phone" type="application/json">
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
</script>
```

## Running

The demos will run in Chrome, Firefox, or other web browsers which supports WebRTC.

In your web browser, open the `index.html` file in this directory to run the demos.


## Development

This demonstration are build on simple html which provides some basic functionality(register,accept, reject, mute and hold) via a simple interface.

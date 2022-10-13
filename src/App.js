import './App.css';
import data from './phone.json';
import React, { useEffect, useRef} from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import { ExotelWebClient as exWebClient} from '@exotel-npm-dev/webrtc-client-sdk';

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

var unregisterWait = "false";

function App() {
  const [phone, setPhoneData ] = React.useState('');
  const [tabValue, setTabValue] = React.useState(0);
  const [ registrationData, setRegistrationData ] = React.useState("Not Registered");
  const [ rows, setRows ] = React.useState([]);
  const [ configUpdated, setConfigUpdated ] = React.useState(false);
  const [ callInfo, setCallInfo ] = React.useState("No Call Info");
  const [ callObject, setCallObject ] = React.useState("");
  const [ callEvent, setCallEvent ] = React.useState("");
  const [ callFrom, setCallFrom ] = React.useState("");
  const [ call, setCall ] = React.useState("");
  const [ regState, setRegState ] = React.useState(false);
  const [ callState, setCallState ] = React.useState(false);
  const [ callComing, setCallComing ] = React.useState(false);
  const [ callOnMute, setCallOnMute ] = React.useState(false);
  const [ callOnHold, setCallOnHold ] = React.useState(false);
  
  var registrationRef = useRef(null);
  var callRef = useRef(null);
  
  useEffect(() => {
    if (!configUpdated) {
      setPhoneData(data[0]);   
      setConfigUpdated(true);         
    }
  }, [configUpdated]);


  /* APIs and Callbacks for webrtc-sdk */
  function updateConfig() {
    setPhoneData(data[0]);   
    setConfigUpdated(true);    
  }

  function CallListenerCallback(callObj, eventType, phone) {
    setCallInfo('Call Listener\n Message:' + JSON.stringify(callObj) + '\n EventType:' + eventType + '\n Phone:' + phone) 
    setCallObject(callObj)   
    setCallEvent(eventType)
    setCallFrom(phone)
    setCall(exWebClient.getCall())
    if (eventType === 'incoming') {
      setCallComing(true)
    }  else if (eventType === 'connected') {
      setCallComing(false)
      setCallState(true)
    }  else if (eventType === 'callEnded') {
      setCallComing(false)
      setCallState(false)
    } else if (eventType === 'terminated') {
      setCallComing(false)
      setCallState(false)
    }

 }

  function RegisterEventCallBack (state, phone){
    /**
     * Based on the status of the state received against the agent phone, store the data into redux
     */
     if (unregisterWait === "false") {
    setRegistrationData('Register:\n State:' + state + '\n User:' + phone)   
     } else {
    setRegistrationData('UnRegister:\n State:' + state + '\n User:' + phone)   
     }
    if (state === 'registered') {
      unregisterWait = "false";
      setRegState(true)
    } else if (state === 'unregistered') {
      setRegState(false)
    } else if (state === 'connected') {
      unregisterWait = "false";
      setRegState(true)
    }  else if (state === 'terminated')  {
      setRegState(false)
    } else if (state === 'sent_request')  {
      if (unregisterWait === "true") {
        unregisterWait = "false";
        setRegState(false)
      }
    }
  }

  function SessionCallback(state, phone) {
    /**
     * SessionCallback is triggered whenever the state of application changes due to an incoming call
     * which needs to be handled across tabs
     */
     console.log('Session state:', state, 'for number...', phone);    
 }

  function initialise_callbacks() {
    if (configUpdated) {
    var sipAccountInfo = {
      'userName':  phone.Username,
      'authUser': phone.Username,
      'sipdomain': phone.Domain,
      'domain': phone.HostServer + ":" + phone.Port,
      'displayname': phone.DisplayName,
      'secret': phone.Password,
      'port': phone.Port,
      'security': phone.Security,
    };
    exWebClient.initWebrtc(sipAccountInfo, RegisterEventCallBack, CallListenerCallback, SessionCallback)
    } 
  }


  /* UI update functions */
  function createData(
    configparam: string,
    configvalue: number,
  ) {
    return { configparam, configvalue };
  }



  function updateTable() {
    var newRows = [];
    newRows.push(createData('Username', phone.Username))
    newRows.push(createData('DisplayName', phone.DisplayName))
    newRows.push(createData('HostServer', phone.HostServer))
    newRows.push(createData('Domain', phone.Domain))
    newRows.push(createData('Port', phone.Port))
    newRows.push(createData('Password', phone.Password))
    newRows.push(createData('CallTimeout', phone.CallTimeout))
    newRows.push(createData('AccountSID', phone.AccountSID))
    newRows.push(createData('AccountNo', phone.AccountNo))
    newRows.push(createData('AutoRegistration', phone.AutoRegistration))
    setRows(newRows);     
  }

  function configTable() {
    return (<TableContainer component={Paper}>
    <Table sx={{ maxWidth: 300 }} aria-label="simple table">
    <TableHead>
        <TableRow>
          <TableCell>Config Params</TableCell>
          <TableCell align="right">Config Value</TableCell>
        </TableRow>
      </TableHead>  
      <TableBody>
      {rows.map((row) => (
          <TableRow
            key={row.configparam}
          >
            <TableCell component="th" scope="row">{row.configparam}</TableCell>
            <TableCell align="right">{row.configvalue?row.configvalue.toString():""}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>);
  }

  interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
  }
  
  function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <Box sx={{ p: 3 }}>
            <Typography component="span">{children}</Typography>
          </Box>
        )}
      </div>
    );
  }
  
  function a11yProps(index: number) {
    return {
      id: `simple-tab-${index}`,
      'aria-controls': `simple-tabpanel-${index}`,
    };
  }
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    updateConfig();
    updateTable();
    setTabValue(newValue);
  }; 
  
    /* Event Handlers */


  const registerHandler = () => {
    registrationRef.current = "Sent register request:" + phone.Username;
    setRegistrationData(registrationRef.current)

    if (!configUpdated) {
      updateConfig();
    }

    unregisterWait = "false";

    initialise_callbacks();

    exWebClient.DoRegister();
    
  };

  const unregisterHandler = () => {
    registrationRef.current = "Sent unregister request:" + phone.Username;
    setRegistrationData(registrationRef.current)

    if (!configUpdated) {
      updateConfig();
    }

    initialise_callbacks();

    unregisterWait = "true";

    exWebClient.UnRegister();
  };  

  const registrationStatusChanged = () => {
    console.log("registrationStatusChanged to: ", phone, registrationRef);
  };    

  function acceptCallHandler() {
    console.log ("Call needs to be accepted");
    console.log ("callObject = ", JSON.stringify(callObject));
    console.log ("callEvent = ", callEvent);
    console.log ("callFrom = ", callFrom);
    call.Answer();
  }

  function rejectCallHandler() {
    console.log ("Call needs to be rejected")
    console.log ("callObject = ", JSON.stringify(callObject));
    console.log ("callEvent = ", callEvent);
    console.log ("callFrom = ", callFrom);
    call.Hangup();
  }

  function muteCallHandler() {
    console.log ("Call needs to be muted")
    console.log ("callObject = ", JSON.stringify(callObject));
    console.log ("callEvent = ", callEvent);
    console.log ("callFrom = ", callFrom);
    console.log ("muteCallHandler: callOnMute", callOnMute);
    //call.MuteToggle();
    if (!callOnMute) {
      call.Mute()
      setCallOnMute(true)
      console.log ("call on mute: callOnMute", callOnMute);
    } else {
      call.UnMute()
      setCallOnMute(false)
      console.log ("call not on mute: callOnMute", callOnMute);
    }
  }

  function holdCallHandler() {
    console.log ("Call needs to hold")
    console.log ("callObject = ", JSON.stringify(callObject));
    console.log ("callEvent = ", callEvent);
    console.log ("callFrom = ", callFrom);
    //call.HoldToggle();
    console.log ("holdCallHandler: callOnHold", callOnHold);
    if (!callOnHold) {
      call.Hold()
      setCallOnHold(true)
      console.log ("call on hold: callOnHold", callOnHold);
    } else {
      call.UnHold()
      setCallOnHold(false)
      console.log ("call not on hold: callOnHold", callOnHold);
    }
  }

  const callInfoChanged = () => {
    console.log("callInfoChanged to: ", phone, callRef);
  }

  return (
    <div className="App">
      <header className="App-header">
          Simple SIP Phone
      </header>

<Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
<Tabs value={tabValue} onChange={handleTabChange} aria-label="SIPPhoneTabs">
  <Tab label="Demo" {...a11yProps(0)} />
  <Tab label="Config" {...a11yProps(1)} />
</Tabs>
</Box>
<TabPanel component="span" value={tabValue} index={0}>

<Grid container spacing={2}>
  <Grid item xs={6}>
    <Item>
    <Stack spacing={2}>
    <Item>
    <textarea style={{ width: 400, height: 300, resize:'none' }} ref={registrationRef} value={registrationData} onChange={registrationStatusChanged}></textarea>
      <br></br>          
      {(configUpdated && !regState)?<button onClick={registerHandler}>Register</button>:null}
      {(regState)?<button onClick={unregisterHandler}>UnRegister</button>:null}
    </Item>
    <Item>
      <textarea style={{ width: 400, height: 300, resize:'none' }}   ref={callRef} value={callInfo} onChange={callInfoChanged}></textarea>          
      <br></br>  
      {(regState && callComing)?<button onClick={acceptCallHandler}>Accept Call</button>:null}
      {(regState && (callState || callComing))?<button onClick={rejectCallHandler}>Reject Call</button>:null}
      {(regState && callState)?<button onClick={muteCallHandler}>Mute Toggle</button>:null}
      {(regState && callState)?<button onClick={holdCallHandler}>Hold Toggle</button>:null} 
    </Item>
    </Stack>
    </Item>
  </Grid>
  </Grid>
</TabPanel>
<TabPanel component="span" value={tabValue} index={1}>
{
  configTable()
}
</TabPanel>

    </div>
  );
}

export default App;

import {useState} from 'react';
import {MapContainer, TileLayer, Circle, Polyline} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import moment from 'moment';
import task from './task.json';

const IGCParser = require('igc-parser');
const geolib = require('geolib');

const listStyle = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '2px',
  margin: '2px',
  borderColor: 'red',
  color: 'red',
  borderStyle: 'solid',
};

const containerStyle = {
  display: 'flex',
  flexDirection: 'row',
  alignSelf: 'stretch',
  height: '100vh',
};

function formatDuration(durationSec) {
  return new Date(durationSec * 1000).toISOString().substr(12, 7);
}

function Results(props) {
  const {name, wing} = props;
  let igc = IGCParser.parse(props.igc);
  const [progress, setProgress] = useState(1);
  const [sent, setSent] = useState(false);
  const [entryReceived, setEntryReceived] = useState(false);

  let turnpointIndex = 0;
  let turnpoints = [];  // Turnpoints to show
  let circles = []; // Circles to show on the map
  let positions = [];

  let turnpointTimes = [];
  let taskDuration = 0;
  let essIndex = 0;

  for (let i = 0;
      i < igc.fixes.length && i / igc.fixes.length < progress;
      i++) {
    const fix = igc.fixes[i];
    const turnpoint = task.turnpoints[turnpointIndex];

    positions.push([fix.latitude, fix.longitude]);

    if (!turnpoint) {
      continue;
    }
    const distance = geolib.getDistance(fix, turnpoint.waypoint);
    if (distance < turnpoint.radius) {
      turnpointTimes.push(fix.time);
      const durationSec = (moment(`1970-01-01 ${fix.time}Z`) -
          moment(`1970-01-01 ${turnpointTimes[0]}Z`)) / 1000;
      let ess = turnpoint.type === 'ESS';
      if (ess || (!taskDuration && turnpointIndex ===
          task.turnpoints.length - 1)) {
        if (ess) essIndex = turnpointIndex;
        taskDuration = durationSec;
      }
      // We have hit a turnpoint, add it to a success list and move on
      turnpoints.push(
          <div key={'turnpoint-' + turnpointIndex} style={{
            ...listStyle,
            color: 'green',
            borderColor: 'green',
            zIndex: i,
          }}
          >
            <small
                style={{color: 'white'}}>{turnpoint.waypoint.description}</small>
            <small>{fix.time}</small>
            <small style={{
              opacity: turnpointIndex === 0 ? 0 : 1,
              color: ess ? 'white' : 'grey',
            }}>{formatDuration(durationSec)}</small>
          </div>,
      );
      let center = [turnpoint.waypoint.lat, turnpoint.waypoint.lon];
      circles.push(<Circle center={center}
                           pathOptions={{
                             fillColor: 'blue',
                             color: 'transparent',
                             opacity: 0.25,
                           }}
                           radius={turnpoint.radius}
                           key={'turnpoint-circle-' + turnpointIndex}/>);
      turnpointIndex++;
    }
  }
  const valid = task.turnpoints.length === turnpointIndex;
  const saveEntry = {igc: props.igc, valid, date: igc.date, name, wing};
  if (!sent) {
    fetch('https://g.co', { method: 'POST', body: JSON.stringify(saveEntry)}).then((resp) => {
      setEntryReceived(resp.ok);
    })
    setSent(true);
  }

  const addResult = (str) => {
    turnpoints.push(<pre style={{fontSize: 14}}>{str}</pre>);
  };
  addResult(`Heure début: ${turnpointTimes[0]}`);
  if (essIndex) addResult(`Heure ESS: ${turnpointTimes[essIndex]}`);
  if (valid) {
    addResult(`Heure fin: ${turnpointTimes.slice(-1)[0]}`);
    addResult(`Durée task: ${formatDuration(taskDuration)}`);
  } else {
    addResult('Non valide');
  }

  addResult(sent ? 'Envoyé' : '' + ' ' + entryReceived ? ', reçu' : '');

  // Complete filling in all the waypoints we didn't get.
  for (let i = task.turnpoints.length - 1; i >= turnpointIndex; i--) {
    // Show red for everything except for the next waypoint we're trying to hit
    let color = 'gray';
    let fillColor = 'FFF';
    let opacity = 0.25;
    if (i === turnpointIndex) {
      color = 'orange';
      fillColor = 'orange';
      opacity = 1;
    }

    const turnpoint = task.turnpoints[i];
    turnpoints.splice(turnpointIndex, 0, <div key={'turnpoint-' + i}
                                              style={{
                                                ...listStyle,
                                                borderColor: color,
                                                zIndex: i,
                                              }}>
      <small>{turnpoint.waypoint.description}</small>
    </div>);
    let center = [turnpoint.waypoint.lat, turnpoint.waypoint.lon];

    circles.push(<Circle center={center}
                         pathOptions={{
                           color: color,
                           fillColor: fillColor,
                           opacity: opacity,
                         }}
                         radius={turnpoint.radius}
                         key={'turnpoint-circle-' + i}/>);
  }

  const initialTurn = task.turnpoints[0];
  const center = [initialTurn.waypoint.lat, initialTurn.waypoint.lon];
  const time = igc.fixes[Math.round(igc.fixes.length * progress - 1)]?.time ??
      'Nan';

  return <div style={containerStyle}>
    <div style={{display: 'flex', flexDirection: 'column', overflow: 'auto'}}>
      <h2>Challenge Charance</h2>
      {turnpoints}
    </div>
    <div className="rightHandContainer"
         style={{
           alignSelf: 'stretch',
           width: '100%',
           display: 'flex',
           flexDirection: 'column',
           height: '100vh',
         }}>
      <div className="mapContainer" style={{flexGrow: 1, display: 'flex'}}>
        <MapContainer center={center} zoom={13} scrollWheelZoom={false}>
          <TileLayer
              attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
              url="https://{s}.tile.jawg.io/jawg-terrain/{z}/{x}/{y}{r}.png?access-token=OCSVqPtVG4tEq4zlKGa0sA3LW6bC5l528PJhTuBSPZ5BPvbjemWIyzaHd15iYV11"
          /> {circles}
          <Polyline positions={positions}/>
        </MapContainer>

      </div>
      <div className="flightProgress"
           style={{height: '80px', backgroundColor: 'blue', display: 'flex'}}>
        <input type="range" min="1" max="100" class="slider" id="myRange"
               style={{flexGrow: 1}}
               value={progress * 100} onChange={(event) => {
          let percentage = event.target.value / 100;
          setProgress(percentage);
        }}/>
        <p>{time}</p>
      </div>
    </div>
  </div>;
}

export {Results};



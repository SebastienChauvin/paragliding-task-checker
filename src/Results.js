import { useState } from 'react';
import { MapContainer, TileLayer, Circle, Polyline } from 'react-leaflet'
import 'leaflet/dist/leaflet.css';
import moment from 'moment'



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
}

const containerStyle = {
    display: 'flex',
    flexDirection: 'row',
    alignSelf: 'stretch',
    height: '100vh',
}

function Results(props) {
    let task = JSON.parse(props.tsk);
    let igc = IGCParser.parse(props.igc);
    const [progress, setProgress] = useState(1);

    let turnpointIndex = 0;
    let turnpoints = [];  // Turnpoints to show
    let circles = []; // Circles to show on the map
    let positions = [];
    let preStartPositions = [];

    // Calculate the starting time (assume SSS)
    const startTime = task.sss.timeGates[0];

    let started = false;
    for( let i = 0; i < igc.fixes.length &&  i / igc.fixes.length < progress; i++) {
        const fix = igc.fixes[i];
        const turnpoint = task.turnpoints[turnpointIndex];

        // We're before the start of the race.  Do not consider this.
        if(!started && moment("1970-01-01 " + fix.time + "Z") < moment("1970-01-01 " + startTime)) {
            preStartPositions.push([fix.latitude, fix.longitude]);
            continue;
        } else {
            started = true;
            positions.push([fix.latitude, fix.longitude]);
        }

        if (turnpoint == null) {
            continue;
        }
        const distance = geolib.getDistance(fix, turnpoint.waypoint);
        if (distance < turnpoint.radius) {
            // We have hit a turnpoint, add it to a success list and move on
            turnpoints.push(
                <div key={"turnpoint-" + turnpointIndex} style={{
                    ...listStyle,
                    color: 'green',
                    borderColor: 'green',
                    zIndex: i
                }}
                >
                    <small>{turnpoint.waypoint.description}</small>
                </div>
            );
            let center = [turnpoint.waypoint.lat, turnpoint.waypoint.lon];
            circles.push(<Circle center={center} pathOptions={{ fillColor: 'blue', color: 'transparent', opacity: 0.25 }} radius={turnpoint.radius} key={"turnpoint-circle-" + turnpointIndex} />);
            turnpointIndex++;
        }
    }

    // Complete filling in all the waypoints we didn't get.
    for (let i = task.turnpoints.length - 1; i >= turnpointIndex; i--) {
        // Show red for everything except for the next waypoint we're trying to hit
        let color = "gray"
        let fillColor = "FFF"
        let opacity = 0.25
        if(i === turnpointIndex) {
            color = "orange"
            fillColor = "orange"
            opacity = 1
        }

        const turnpoint = task.turnpoints[i];
        turnpoints.splice(turnpointIndex, 0, <div key={"turnpoint-" + i} style={{...listStyle, borderColor: color, zIndex: i}}>
            <small>{turnpoint.waypoint.description}</small>
        </div>);
        let center = [turnpoint.waypoint.lat, turnpoint.waypoint.lon];

        circles.push(<Circle center={center} pathOptions={{ color: color, fillColor: fillColor, opacity: opacity }} radius={turnpoint.radius} key={"turnpoint-circle-" + i} />)
    };

    const initialTurn = task.turnpoints[0];
    const center = [initialTurn.waypoint.lat, initialTurn.waypoint.lon]
    const time = igc.fixes[Math.round(igc.fixes.length * progress - 1)]?.time ?? "Nan";

    return <div style={containerStyle}>
        <div style={{ display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
            <h2>All turnpoints</h2>
            {turnpoints}
        </div>
        <div className="rightHandContainer" style={{ alignSelf: 'stretch', width: "100%", display: 'flex', flexDirection: 'column', height: "100vh" }}>
            <div className="mapContainer" style={{ flexGrow: 1, display: 'flex' }}>
                <MapContainer center={center} zoom={13} scrollWheelZoom={false}>
                <TileLayer
        attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors'
        url="https://{s}.tile.jawg.io/jawg-terrain/{z}/{x}/{y}{r}.png?access-token=OCSVqPtVG4tEq4zlKGa0sA3LW6bC5l528PJhTuBSPZ5BPvbjemWIyzaHd15iYV11"
      />                    {circles}
                    <Polyline positions={preStartPositions} color="gray" />
                    <Polyline positions={positions} />
                </MapContainer>

            </div>
            <div className="flightProgress" style={{ height: "80px", backgroundColor: "blue", display: 'flex' }}>
                <input type="range" min="1" max="100" class="slider" id="myRange" style={{ flexGrow: 1 }} onChange={(event) => {
                    let percentage = event.target.value / 100;
                    setProgress(percentage)
                }} />
                <p>{time}</p>
            </div>
        </div>
    </div>
}

export { Results }



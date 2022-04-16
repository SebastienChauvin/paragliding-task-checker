import './App.css';
import { Uploader } from './Uploader.js';
import { useState } from 'react';
import { Results } from './Results.js';


const style = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
}

function App() {
  // State for IGC and XCTSK uploads
  const [igc, setIgc] = useState();

  // Component for uploading the files
  let pageURL = new URL(window.location);
  pageURL.hash = "";
  let content = <div style={{display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
    <h1><a href={pageURL.toString()} style={{ color: 'white' }}>Paraglider Task Checker</a></h1>
    <div style={style}>
      <Uploader file={igc} fileSetter={setIgc} message={'Fichier igc'}/>
    </div>
  </div>;

  // Component for showing the results given the files
  if (igc != null) {
    content = <Results igc={igc} />;
  }


  return (

    <div className="App">
      <header className="App-header">
        {content}
      </header>
    </div>
  );
}

export default App;

import './App.css';
import { Uploader } from './Uploader.js';
import {useEffect, useState} from 'react';
import { Results } from './Results.js';


const style = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
}

function Submit() {
  const [igc, setIgc] = useState();
  const [name, setName] = useState();
  const [wing, setWing] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    setName(localStorage.getItem('name') ?? '');
    setWing(localStorage.getItem('wing'));
  }, [])

  useEffect(() => {
    localStorage.setItem('name', name);
  }, [name]);

  useEffect(() => {
    localStorage.setItem('wing', wing);
  }, [wing]);

  // Component for uploading the files
  let pageURL = new URL(window.location);
  pageURL.hash = "";
  let inputStyle = {margin: 10, padding: 5, fontSize: 18};

  function submit() {
    setSubmitted(true);
  }

  if (submitted) {
    return <Results igc={igc} name={name} wing={wing}/>;
  }

  return <div style={{display: 'flex', alignItems: 'center', flexDirection: 'column'}}>
    <h1><a href={pageURL.toString()} style={{ color: 'white' }}>Challenge Charance</a></h1>
    <div style={style}>
      <form action="#">
        <Uploader file={igc} fileSetter={setIgc} message={'Fichier igc'}/>
        <input style={inputStyle} type={'text'} value={name} onChange={(e) => setName(e.target.value)} placeholder={'Nom Prénom'}/>
        <select style={inputStyle} name={'wing'} onChange={(e) => setWing(e.target.value)} value={wing}>
          <option value={''}>-</option>
          <option value={'A'}>EN-A</option>
          <option value={'B'}>EN-B</option>
          <option value={'C'}>EN-C</option>
          <option value={'D'}>EN-D</option>
          <option value={'CCC'}>CCC</option>
        </select>
        <br/>
        <input style={inputStyle} type={'submit'} value={'Envoyer'} disabled={!name || !wing || !igc} onClick={submit}/>
      </form>
    </div>
  </div>;
}

export default Submit;

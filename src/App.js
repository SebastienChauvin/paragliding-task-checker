import Submit from './Submit';
import {Link, Route, Routes} from 'react-router-dom';

function Rankings() {
  return <>
    <h1>Rankings</h1>
    <Link to={'/declaration'}>Declarer un vol</Link>
    </>;
}

export function App() {
  return (
      <div className="App">
        <header className="App-header">
          <Routes>
            <Route path='/' element={<Rankings/>}/>
            <Route path="/declaration" element={<Submit/>}/>
          </Routes>
        </header>
      </div>
  );
}
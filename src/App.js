import Submit from './Submit';
import {Route, Routes} from 'react-router-dom';
import {Rankings} from './Rankings';

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
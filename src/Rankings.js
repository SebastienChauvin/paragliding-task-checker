import {Link} from 'react-router-dom';
import {useState} from 'react';
import {formatDuration} from './utils';

function Wing(props) {
  const {type} = props;
  const [list, setList] = useState(null);
  const [fetched, setFetched] = useState(false);

  if (!fetched) {
    console.log('loading');
    setFetched(true);
    fetch(
        `https://lnk30ei5aj.execute-api.eu-west-3.amazonaws.com/dev/ranking/${type}`,
        {method: 'GET'}).then((resp) => resp.json()).then(data => {
      setList(data.list);
      console.log(list);
    }).catch((e) => console.error('receiving', e));
  }

  return <div style={{width: '600px', float: 'left'}}>
    <h2>Classement {type}</h2>
    <table style={{padding: 10, textAlign: 'left'}}>
      {list?.map((e, i) => <tr>
        <td style={{paddingRight: 30}}>{i + 1}.</td>
        <td style={{paddingRight: 30}}>{e.name}</td>
        <td style={{paddingRight: 30, fontSize: 20}}>{formatDuration(e.duration)}</td>
        <td style={{paddingRight: 30, fontSize: 16}}>{e.date}</td>
      </tr>)}
    </table>
  </div>;
}

export function Rankings() {
  return <>
    <div className={'row'}>
      <Wing type={'A'}/>
      <Wing type={'B'}/>
      <Wing type={'C'}/>
      <Wing type={'D'}/>
      <Wing type={'CCC'}/>
    </div>
    <div style={{backgroundColor: '#ddd', padding: 20, marginTop: 30}}>
    <Link to={'/declaration'}>Declarer un vol</Link>
    </div>
  </>;
}
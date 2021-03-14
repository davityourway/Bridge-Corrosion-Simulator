import React from 'react';
import './App.css';
import { useForm } from 'react-hook-form';

function App() {
  const { register, handleSubmit } = useForm();

  const onSubmit = (data: any) => alert(JSON.stringify(data));

  return <div className="App">
    <header className="App-header">
      <p>Bridge Corrosion Simulator</p>
      <form onSubmit={ handleSubmit(onSubmit)}>
        <label>Pylon shape: <select ref={ register }>
          <option>Rectangle</option>
          <option>Circle</option>
        </select></label>
        <label>Cover: <input ref={ register }/></label>
        <label>Diff: <input ref={ register }/></label>
        <label>CL threshold: <input ref={ register }/></label>
        <label>CL concentration: <input ref={ register }/></label>
        <label>Propagation time: <input ref={ register }/></label>
        <label>Nitrite concentration: <input ref={ register }/></label>
        <label>Simulation time: <input ref={ register }/></label>
        <label>Height: <input ref={ register }/></label>
        <label>Radius: <input ref={ register }/></label>
      </form>
    </header>
  </div>;
}

export default App;

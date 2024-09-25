import './App.css';
import {useRef} from 'react';

import { Workbook } from "@fortune-sheet/react";
import "@fortune-sheet/react/dist/index.css"
function App() {
  const ref = useRef(null) 
  const handleOnClick = () => {
    console.log(ref.current.getSheet())
  }
  return (
    <>
    <Workbook data={[{ name: "Sheet1" }]} ref={ref} />
    <button onClick={handleOnClick}>Get Data</button>
    </>
  );
}

export default App;

import './App.css';
import { useRef } from 'react';
import { useEffect } from 'react';
import { Workbook } from "@fortune-sheet/react";
import "@fortune-sheet/react/dist/index.css";

function App() {
  const ref = useRef(null);

  const PostMessageListener = () => {
    useEffect(() => {
      const handleMessage = (event) => {
        console.log('Message received:', event.data);

        const allowedOrigin = "testbookSheetData";
        if (event.origin !== allowedOrigin) {
          return;
        }

        if (event.data && event.data.tid) {
          console.log(event.data);
          if (ref.current) {
            const sheetData = ref.current.getSheet();
            window.parent.currentSheetData = sheetData;
            window.sheetData = sheetData;
            console.log(sheetData);
          }
        }

        console.log('Validated message:', event.data);
      };
      window.addEventListener('message', handleMessage);

      return () => {
        window.removeEventListener('message', handleMessage);
      };
    }, []);
  };

  PostMessageListener();

  const handleOnClick = () => {
    if (ref.current) {
      const sheetData = ref.current.getSheet();
      window.currentSheetData = sheetData;
      console.log(sheetData, 'sheet data on click');
    }
  };

  return (
    <>
      <Workbook data={[{ name: "Sheet1" }]} ref={ref} />
      <button onClick={handleOnClick}>Get Data</button>
    </>
  );
}

export default App;

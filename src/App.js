import './App.css';
import { useRef, useEffect, useState } from 'react';
import { Workbook } from "@fortune-sheet/react";
import "@fortune-sheet/react/dist/index.css";

function App() {
  const ref = useRef(null);
  const [sheetActualData, setSheetData] = useState(null);
  const [showEmptySheet, setEmptySheet] = useState(false);
  const [loading, setLoading] = useState(true);

  async function initialize() {
    const cdnLink = getClientQueryParamValue('sheetUrl'); // Function to get the CDN link

    console.log('CDN Link:', cdnLink);

    if (cdnLink) {
      try {
        const response = await fetch(cdnLink);

        // Check if response is okay
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');

        // Check if response content type is JSON
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('The provided URL does not return a valid JSON response.');
        }

        const jsonData = await response.json();
        setSheetData({ ...jsonData });
        setLoading(false);

      } catch (err) {
        console.error(err.message);
        resetSheet();
      } finally {
        setLoading(false);
      }
    } else {
      console.error('No CDN link available.');
      resetSheet();
    }
  }

  const sheetConfig = {
    column: 26,
    row: 50,
    allowEdit: true,
    showToolbar: true,
    showFormulaBar: true,
    showSheetTabs: false,
    addRows: false
  };

  const handleIncomingMessage = (event) => {
    // Check the origin of the event for security
    if (event.data.source !== "sheetAcess") {
      return;
    }

    const { type } = event.data;

    switch (type) {
      case "getSheet":
        currentSheetData(event.data.qid,event.data.buttonAction);
          break;
      case "resetSheet":
        resetSheet();
          break;
      default:
        console.log("Unknown action:", type);
    }
  };


  useEffect(() => {
    initialize();

    // Add event listener for messages
    window.addEventListener("message", handleIncomingMessage);

    // Cleanup the event listener when the component unmounts
    return () => {
      window.removeEventListener("message", handleIncomingMessage);
    };

     // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array ensures this runs once when the component mounts

  const handleSheetChange = () => {
    if (ref.current) {
      const sheetData = ref.current.getSheet();
      console.log(sheetData, 'Latest sheet data');
    }
  };

  const resetSheet = () => {
    let updatedJson = {
      "name": "Sheet1",
      "status": 1,
      "celldata": [],
      "data": []
    };
    setLoading(false);
    setEmptySheet(true);
    setSheetData(updatedJson); // Fixed typo: removed extra braces
  };

  function getClientQueryParamValue(key, url = decodeURI(window.location.href)) {
    var arr = url.split('&' + key + '=');
    if (arr.length === 1) {
      arr = url.split('?' + key + '=');
    }
    if (arr.length === 1) {
      return '';
    }
    return arr[1].split('&')[0];
  }

  const currentSheetData = (qid,buttonAction) => {
    let sheetData = JSON.parse(JSON.stringify(ref.current.getSheet()));
    const cell = ref.current.getSelection();
    let currentGridValue = document.getElementById('luckysheet-rich-text-editor')?.innerText?.trim(); // Safe access and trim to avoid empty spaces

    if (cell && cell.length && currentGridValue && sheetData.data.length) {
      const [selectedRow, selectedColumn] = [cell[0]?.row[0], cell[0]?.column[0]];

      // Ensure selected cell exists within the bounds of the sheet data
      if (sheetData.data[selectedRow] && !sheetData.data[selectedRow][selectedColumn]) {
        let currentCellData = {
          "m": currentGridValue,
          "ct": {
            "fa": "General",
            "t": "g"
          },
          "v": currentGridValue
        };
        let cellDataForUpdating = 
          {
            "c": selectedColumn,
            "r": selectedRow,
            "v": {
              "ct": {
                "fa": "General",
                "t": "g"
              },
              "m": currentGridValue,
              "v": currentGridValue
            }
          }
        

        // Update the cell data
        sheetData.data[selectedRow][selectedColumn] = currentCellData;
        sheetData.celldata.push(cellDataForUpdating);

        // Log for verification
        console.log('Updated sheet data:', sheetData);
      } else {
        console.warn(`Invalid cell selection at row ${selectedRow}, column ${selectedColumn}.`);
      }
    } else {
      if (cell && !cell.length) console.warn('No cell selected.');
      if (!currentGridValue) console.warn('Grid value is empty.');
      if (!sheetData.data.length) console.warn('Sheet data is empty.');
    }

    window.top.postMessage({
      type: "sheetDataUpdated",
      source: "sendsheetAcess",
      isCurrentFlow: true,
      qid:qid,
      buttonAction:buttonAction,
      sheetData: sheetData
    }, "*");
  };

  return (
    <>
     {sheetActualData && ((!loading && (sheetActualData.data && sheetActualData.data.length)) || showEmptySheet) ? (
        <Workbook
          {...sheetConfig}
          data={[sheetActualData]}
          ref={ref}
          onChange={handleSheetChange}
        />
      ) : loading ? (
        <div className='loader-wrapper'><div className="loader"></div></div>
      ) : null}

    </>
  );
}

export default App;

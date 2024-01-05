import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Expand } from "lucide-react";

interface CsvFullscreenProps {
  url: string;
}

interface CsvRow {
  [key: string]: string; 
}

const CsvFullscreen = ({ url }: CsvFullscreenProps) => {
  const [csvData, setCsvData] = useState<CsvRow[]>([]); // State to store the parsed CSV data.
  const [isOpen, setIsOpen] = useState(false); // State to manage dialog visibility.

  // useEffect hook to fetch and parse CSV data on component mount or URL change.
  useEffect(() => {
    fetch(url)
      .then((response) => response.text())
      .then((csvText) => {
        // Using Papa Parse to convert CSV text to JSON.
        Papa.parse<CsvRow>(csvText, {
          complete: (result: any) => {
            setCsvData(result.data); 
          },
          header: true, 
        });
      });
  }, [url]); 

  // Function to render a table from the CSV data.
  const renderTable = (data: CsvRow[]) => {
    if (data.length === 0) return <p>Loading CSV data...</p>;

    const headers = Object.keys(data[0]); 
    const rows = data;

    return (
      <table>
        <thead>
          <tr className="border border-gray-50">
            {/* Mapping headers to table column headers */}
            {headers.map((header, index) => (
              <th
                key={index}
                className="border border-gray-500 px-5 py-2 text-left"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {/* Mapping each row of CSV data to table rows */}
          {rows.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {Object.values(row).map((value, cellIndex) => (
                <td
                  key={cellIndex}
                  className="border border-gray-500 px-5 py-2"
                >
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <>
      {/* Dialog component for displaying the CSV data in fullscreen */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          {/* Trigger button for opening the dialog */}
          <Button variant="ghost" aria-label="fullscreen">
            <Expand className="h-4 w-4" /> 
          </Button>
        </DialogTrigger>
        <DialogContent className="w-screen">
          <div className="h-[calc(100vh-100px)] overflow-auto ">
            {renderTable(csvData)}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CsvFullscreen;

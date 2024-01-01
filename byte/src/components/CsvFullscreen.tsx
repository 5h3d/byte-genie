import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Expand } from "lucide-react";

// Define the props for the CsvFullscreen component
interface CsvFullscreenProps {
  url: string;
}

// Define the type for each row in the CSV data
interface CsvRow {
  [key: string]: string;
}

const CsvFullscreen: React.FC<CsvFullscreenProps> = ({ url }) => {
  const [csvData, setCsvData] = useState<CsvRow[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetch(url)
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse<CsvRow>(csvText, {
          complete: (result: any) => {
            setCsvData(result.data);
          },
          header: true,
        });
      });
  }, [url]);

  const renderTable = (data: CsvRow[]) => {
    if (data.length === 0) return <p>Loading CSV data...</p>;

    const headers = Object.keys(data[0]);
    const rows = data;

    return (
      <table>
        <thead>
          <tr className="border border-gray-50">
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
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" aria-label="fullscreen">
            <Expand className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="w-screen">
          <div className="h-[calc(100dvh-100px)] overflow-auto ">
            {renderTable(csvData)}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CsvFullscreen;

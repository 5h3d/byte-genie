"use client";

import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import { Loader2 } from "lucide-react";
import CsvFullscreen from "./CsvFullscreen";

// The props for the CsvRenderer component
interface CsvRendererProps {
  url: string;
}

// The type for each row in the CSV data
interface CsvRow {
  [key: string]: string;
}

const CsvRenderer = ({ url }: CsvRendererProps) => {
  const [csvData, setCsvData] = useState<CsvRow[]>([]);

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

  console.log("csv data", csvData);

  return (
    <div className="w-full bg-white rounded-md shadow flex flex-col items-center ">
      {/* Header section with navigation and zoom controls */}
      <div className="h-14 w-full border-b border-zinc-200  flex items-center justify-between px-2">
        {/* PDF Navigation Controls */}
        <CsvFullscreen url={url} />
      </div>

      {/* csv Document Viewer */}
      <div className="w-full h-[calc(100vh-20rem)] hidden lg:block overflow-hidden">
        <div className="overflow-auto h-full p-3 scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch">
          {csvData.length > 0 ? (
            <table>
              <thead>
                <tr className="border border-gray-50">
                  {Object.keys(csvData[0]).map((header, index) => (
                    <th
                      key={index}
                      className="border border-gray-500 p-2 text-left"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {csvData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {Object.values(row).map((value, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="border border-gray-500 p-2"
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="flex justify-center h-full w-full items-center">
              <Loader2 className="my-24 h-6 w-6 animate-spin" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CsvRenderer;

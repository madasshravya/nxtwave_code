import React from "react";
import axios from "axios";

const DownloadPDF = () => {
  const downloadPDF = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/generate-pdf", {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "transactions_report.pdf");
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error("Error downloading the PDF", error);
    }
  };

  return (
    <button onClick={downloadPDF} style={{ padding: "10px", background: "blue", color: "white" }}>
      Download Transactions Report
    </button>
  );
};

export default DownloadPDF;

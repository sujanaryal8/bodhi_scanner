const API_URL = "https://script.google.com/macros/s/AKfycbwxp8_YZz4r0AnP433hOXa4itZrU4JmJ6zTIiQG_RXokUb0h2pAz0V8n6RCqY-W3iTy/exec";

let lastScan = "";

function verifyParticipant(id) {
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = "Processing...";
    resultDiv.classList.remove("hidden");

    fetch(API_URL, {
        method: "POST",
        mode: "no-cors", // Required for Google Apps Script Web App
        body: JSON.stringify({ participantId: id })
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === "success") {
            resultDiv.innerHTML = `✅ VERIFIED<br>${data.name}<br>${data.organization}`;
            resultDiv.style.borderColor = "#22c55e"; // Green
        } else if (data.status === "already_checked_in") {
            resultDiv.innerHTML = `⚠ Already Checked In<br>${data.name}`;
            resultDiv.style.borderColor = "#f59e0b"; // Amber
        } else {
            resultDiv.innerHTML = "❌ Participant Not Found";
            resultDiv.style.borderColor = "#ef4444"; // Red
        }
    })
    .catch(err => {
        resultDiv.innerHTML = "Error: Could not connect to server.";
    });
}

function onScanSuccess(decodedText) {
    if (decodedText === lastScan) return;
    lastScan = decodedText;
    verifyParticipant(decodedText);
    
    // Reset after 3 seconds to allow next scan
    setTimeout(() => { lastScan = ""; }, 3000);
}

// Initialize Scanner
const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
scanner.render(onScanSuccess);
// Configuration: Ensure this URL is your latest Web App deployment
const API_URL = "https://script.google.com/macros/s/AKfycbx-ObyarvSubZFTZmXIhf2sUPKJxqZHB0tDeahoRQ1tTVNY4Pskybu3I3zT4NKYmsN4/exec";

// Initialize Scanner
const html5QrCode = new Html5Qrcode("reader");

// Start Rear Camera Automatically
function startScanner() {
    html5QrCode.start(
        { facingMode: "environment" }, 
        { fps: 10, qrbox: 250 },
        (decodedText) => {
            onScanSuccess(decodedText);
        }
    ).catch(err => {
        console.error("Camera access failed", err);
        document.getElementById("reader").innerHTML = 
            "<p class='p-4 text-red-500'>Camera access denied. Please allow permissions in settings.</p>";
    });
}

// Handle Successful Scan
let lastScan = "";
function onScanSuccess(decodedText) {
    if (decodedText === lastScan) return;
    lastScan = decodedText;

    // Parse Data: ID|Name|Email|Phone
    const parts = decodedText.split('|');
    if (parts.length === 4) {
        verifyParticipant(parts[0], parts[1], parts[2], parts[3]);
    } else {
        showResult("❌ Invalid QR Code format", "red");
    }
    
    // Reset scan after 3 seconds
    setTimeout(() => { lastScan = ""; }, 3000);
}

// Verify Participant against Sheet
async function verifyParticipant(id, name, email, phone) {
    showResult("Verifying...", "blue");

    try {
        // Send POST request to mark attendance
        await fetch(API_URL, {
            method: "POST",
            mode: "no-cors",
            body: JSON.stringify({ participantId: id })
        });
        
        // Success UI
        showResult(`✅ ${name} Checked In!`, "green");
        
        // Refresh stats after successful check-in
        setTimeout(updateStats, 1000); 
    } catch (error) {
        showResult("❌ Server Error", "red");
    }
}

// Helper: Show Result
function showResult(message, color) {
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = `<p class="font-bold text-${color}-600">${message}</p>`;
    resultDiv.classList.remove("hidden");
    
    // Hide result after 4 seconds
    setTimeout(() => resultDiv.classList.add("hidden"), 4000);
}

// Update Stats Dashboard
async function updateStats() {
    try {
        // Fetch stats via GET request
        const response = await fetch(API_URL); 
        const data = await response.json();
        
        document.getElementById('total-count').innerText = data.total;
        document.getElementById('attend-count').innerText = data.attending;
    } catch (err) {
        console.log("Stats fetch skipped: Ensure doGet() is correctly deployed in Apps Script.");
    }
}

// Initialize on Load
window.addEventListener('load', () => {
    startScanner();
    updateStats();
});

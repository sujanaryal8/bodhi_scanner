// --- CONFIGURATION ---
const API_URL = "https://script.google.com/macros/s/AKfycbynECsROpmvWpNJ95QIVTpO2bOV57xKDMmN9M3jwsZh7lo130OmRk8EpydPFmmvkQvb/exec"; // PASTE YOUR NEW DEPLOYMENT URL HERE

// Initialize the QR Scanner
const html5QrCode = new Html5Qrcode("reader");

// Start the camera
function startScanner() {
    html5QrCode.start(
        { facingMode: "environment" }, 
        { fps: 10, qrbox: 250 }, 
        (decodedText) => {
            onScanSuccess(decodedText);
        }
    ).catch(err => {
        showResult(`<div class='text-red-600 font-bold'>❌ Camera Error: ${err}</div>`);
    });
}

// Logic triggered when QR is scanned
async function onScanSuccess(decodedText) {
    // Expected format: ID|Name|Email|Phone
    const parts = decodedText.split('|');
    if (parts.length >= 1) {
        // Pause scanning to process the request
        html5QrCode.pause();
        
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                mode: "cors", // Required to bypass CORS errors
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ participantId: parts[0] })
            });

            const data = await response.json();
            
            if (data.status === "success") {
                // Show verified details
                showResult(`
                    <div class="text-green-700 font-bold text-lg mb-2">✅ Checked In Successfully</div>
                    <div class="text-left text-sm text-gray-700 space-y-1 bg-gray-50 p-3 rounded">
                        <p><b>Name:</b> ${data.name}</p>
                        <p><b>Email:</b> ${data.email}</p>
                        <p><b>Phone:</b> ${data.phone}</p>
                    </div>
                `);
            } else if (data.status === "already_checked") {
                // Show warning for duplicate scans
                showResult(`
                    <div class="text-amber-700 font-bold text-lg">⚠️ Already Checked In!</div>
                    <p class="text-gray-600 mt-2 text-sm">${data.name} has already been scanned.</p>
                `);
            } else {
                showResult("<div class='text-red-600 font-bold'>❌ Participant Not Found</div>");
            }
        } catch (e) {
            console.error("Scan Error:", e);
            showResult("<div class='text-red-600 font-bold'>❌ Server Connection Error</div>");
        }
        
        // Resume scanning automatically after 4 seconds
        setTimeout(() => { 
            html5QrCode.resume(); 
        }, 4000);
    }
}

// Helper to display results in the UI
function showResult(message) {
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = message;
    resultDiv.classList.remove("hidden");
}

// Start the scanner when the page loads
window.addEventListener('load', startScanner);

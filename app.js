const API_URL = "YOUR_WEB_APP_URL_HERE"; 

const html5QrCode = new Html5Qrcode("reader");

function startScanner() {
    html5QrCode.start({ facingMode: "environment" }, { fps: 10, qrbox: 250 }, (decodedText) => {
        onScanSuccess(decodedText);
    });
}

async function onScanSuccess(decodedText) {
    const parts = decodedText.split('|');
    if (parts.length >= 1) {
        html5QrCode.pause(); // Pause to prevent rapid-fire scans
        
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                body: JSON.stringify({ participantId: parts[0] })
            });
            const data = await response.json();
            
            if (data.status === "success") {
                showResult(`
                    <div class="text-green-700 font-bold text-lg mb-2">✅ Checked In Successfully</div>
                    <div class="text-left text-gray-700 space-y-1">
                        <p><b>Name:</b> ${data.name}</p>
                        <p><b>Email:</b> ${data.email}</p>
                        <p><b>Phone:</b> ${data.phone}</p>
                    </div>
                `);
            } else if (data.status === "already_checked") {
                showResult(`
                    <div class="text-amber-700 font-bold text-lg">⚠️ Already Checked In!</div>
                    <p class="text-gray-600 mt-2">${data.name} was already scanned.</p>
                `);
            } else {
                showResult("<div class='text-red-600 font-bold'>❌ Participant Not Found</div>");
            }
        } catch (e) {
            showResult("<div class='text-red-600 font-bold'>❌ Server Error</div>");
        }
        
        // Resume after 4 seconds so you have time to read the result
        setTimeout(() => { html5QrCode.resume(); }, 4000);
    }
}

function showResult(message) {
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = message;
    resultDiv.classList.remove("hidden");
}

window.addEventListener('load', startScanner);

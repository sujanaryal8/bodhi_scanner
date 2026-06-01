const API_URL = "PASTE_YOUR_NEW_URL_HERE"; 
const html5QrCode = new Html5Qrcode("reader");

function startScanner() {
    html5QrCode.start(
        { facingMode: "environment" }, 
        { fps: 10, qrbox: 250 }, 
        (decodedText) => onScanSuccess(decodedText)
    ).catch(err => console.error("Scanner Error:", err));
}

async function onScanSuccess(decodedText) {
    html5QrCode.pause();
    const id = decodedText.split('|')[0];
    
    try {
        const response = await fetch(API_URL, {
            method: "POST",
            mode: "cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ participantId: id })
        });
        
        const data = await response.json();
        
        if (data.status === "success") {
            showResult(`
                <div class="text-green-700 font-bold text-lg">✅ Verified!</div>
                <div class="text-left text-sm mt-3 space-y-1">
                    <p><b>Name:</b> ${data.name}</p>
                    <p><b>Email:</b> ${data.email}</p>
                    <p><b>Phone:</b> ${data.phone}</p>
                </div>
            `);
        } else if (data.status === "already_checked") {
            showResult(`
                <div class="text-amber-700 font-bold text-lg">⚠️ Already Checked In</div>
                <p class="text-sm mt-2">${data.name} has already scanned this ticket.</p>
            `);
        } else {
            showResult("<div class='text-red-700 font-bold'>❌ Participant Not Found</div>");
        }
    } catch (e) {
        showResult("<div class='text-red-700 font-bold'>❌ Server Error. Check your connection.</div>");
    }
    
    setTimeout(() => html5QrCode.resume(), 4000);
}

function showResult(message) {
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = message;
    resultDiv.classList.remove("hidden");
}

window.addEventListener('load', startScanner);

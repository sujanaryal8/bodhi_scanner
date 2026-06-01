const API_URL = "https://script.google.com/macros/s/AKfycbwXZDG1jIo63D7ZFPlH03eDZ4C2SHANMlGL0Mq8Ty7v6dtRyineclVsPIj1AbcIlpvm/exec";

const html5QrCode = new Html5Qrcode("reader");

function startScanner() {
    html5QrCode.start({ facingMode: "environment" }, { fps: 10, qrbox: 250 }, (decodedText) => {
        onScanSuccess(decodedText);
    });
}

async function onScanSuccess(decodedText) {
    const parts = decodedText.split('|');
    if (parts.length === 4) {
        // Stop scanning temporarily while verifying
        html5QrCode.pause();
        
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                body: JSON.stringify({ participantId: parts[0] })
            });
            const data = await response.json();
            
            if (data.status === "success") {
                showResult(`
                    <div class="text-green-600 font-bold">✅ Checked In Successfully</div>
                    <div class="text-sm mt-2 text-left">
                        <p><b>Name:</b> ${data.name}</p>
                        <p><b>Email:</b> ${data.email}</p>
                        <p><b>Phone:</b> ${data.phone}</p>
                    </div>
                `, "green");
            } else if (data.status === "already_checked") {
                showResult(`<p class="text-amber-600 font-bold">⚠️ Already Checked In</p><p>${data.name} has already entered.</p>`, "amber");
            } else {
                showResult("❌ Participant not found", "red");
            }
        } catch (e) {
            showResult("❌ Server connection error", "red");
        }
        
        // Resume scanning after 3 seconds
        setTimeout(() => { html5QrCode.resume(); }, 3000);
    }
}

function showResult(message, color) {
    const resultDiv = document.getElementById("result");
    resultDiv.innerHTML = message;
    resultDiv.classList.remove("hidden");
}

window.addEventListener('load', startScanner);

const API_URL = "https://script.google.com/macros/s/AKfycbx-ObyarvSubZFTZmXIhf2sUPKJxqZHB0tDeahoRQ1tTVNY4Pskybu3I3zT4NKYmsN4/exec";

let lastScan = "";

function verifyParticipant(id, name, email, phone) {
    const resultDiv = document.getElementById("result");
    
    // Display verification card
    resultDiv.innerHTML = `
        <div style="text-align: left; padding: 15px; border: 2px solid #70231a; border-radius: 12px; background: #fff;">
            <h3 style="margin-top:0; color: #70231a;">Verify Participant</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>ID:</strong> ${id}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p id="status-msg" style="font-weight:bold; color: #333;">Verifying...</p>
        </div>
    `;
    resultDiv.classList.remove("hidden");

    fetch(API_URL, {
        method: "POST",
        mode: "no-cors",
        body: JSON.stringify({ participantId: id })
    })
    .then(() => {
        document.getElementById("status-msg").innerHTML = "✅ Attendance Marked!";
        document.getElementById("status-msg").style.color = "#22c55e";
    })
    .catch(() => {
        document.getElementById("status-msg").innerHTML = "❌ Error.";
    });
}

function onScanSuccess(decodedText) {
    if (decodedText === lastScan) return;
    lastScan = decodedText;

    // Split format: ID|Name|Email|Phone
    const parts = decodedText.split('|');
    if (parts.length === 4) {
        verifyParticipant(parts[0], parts[1], parts[2], parts[3]);
    } else {
        document.getElementById("result").innerHTML = "❌ Invalid QR Code";
    }
    
    setTimeout(() => { lastScan = ""; }, 3000);
}

const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
scanner.render(onScanSuccess);

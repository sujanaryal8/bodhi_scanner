const API_URL = "https://script.google.com/macros/s/AKfycbxJOVEJ1NNGu7KUjRJn8Pqmb32Qg_cmp2p68RPi6zhE5rAKdSMAwKxjQg6FSI0WC6Sr/exec"; 

const html5QrCode = new Html5Qrcode("reader");

async function startScanner() {
    try {
        // Wait for cameras to be listed to ensure hardware is ready
        const cameras = await Html5Qrcode.getCameras();
        if (cameras && cameras.length > 0) {
            html5QrCode.start(
                { facingMode: "environment" }, 
                { fps: 10, qrbox: 250 },
                (decodedText) => {
                    onScanSuccess(decodedText);
                }
            );
        } else {
            document.getElementById("reader").innerHTML = "<p class='p-4 text-red-500'>No cameras found.</p>";
        }
    } catch (err) {
        document.getElementById("reader").innerHTML = "<p class='p-4 text-red-500'>Permission denied.</p>";
    }
}

function onScanSuccess(decodedText) {
    const parts = decodedText.split('|');
    if (parts.length === 4) {
        verifyParticipant(parts[0], parts[1], parts[2], parts[3]);
    }
}

async function verifyParticipant(id, name, email, phone) {
    try {
        await fetch(API_URL, {
            method: "POST",
            mode: "no-cors",
            body: JSON.stringify({ participantId: id })
        });
        document.getElementById("result").innerHTML = `<p class='font-bold text-green-600'>✅ ${name} Checked In!</p>`;
        document.getElementById("result").classList.remove("hidden");
        updateStats();
    } catch (e) { alert("Error connecting to server"); }
}

async function updateStats() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        document.getElementById('total-count').innerText = data.total;
        document.getElementById('attend-count').innerText = data.attending;
    } catch (e) {}
}

window.addEventListener('load', () => {
    startScanner();
    updateStats();
});

async function onScanSuccess(decodedText) {
    const parts = decodedText.split('|');
    if (parts.length >= 1) {
        html5QrCode.pause(); // Pause to prevent double-scans
        
        try {
            const response = await fetch(https://script.google.com/macros/s/AKfycbynECsROpmvWpNJ95QIVTpO2bOV57xKDMmN9M3jwsZh7lo130OmRk8EpydPFmmvkQvb/exec, {
                method: "POST",
                mode: "cors", // Required for cross-origin
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json"
                },
                body: JSON.stringify({ participantId: parts[0] })
            });

            // If the response is not ok, throw error to catch block
            if (!response.ok) throw new Error("Server returned " + response.status);

            const data = await response.json();
            
            if (data.status === "success") {
                showResult(`
                    <div class="text-green-700 font-bold text-lg mb-2">✅ Checked In Successfully</div>
                    <div class="text-left text-sm text-gray-700 space-y-1 bg-gray-50 p-3 rounded border">
                        <p><b>Name:</b> ${data.name}</p>
                        <p><b>Email:</b> ${data.email}</p>
                        <p><b>Phone:</b> ${data.phone}</p>
                    </div>
                `);
            } else if (data.status === "already_checked") {
                showResult(`
                    <div class="text-amber-700 font-bold text-lg">⚠️ Already Checked In!</div>
                    <p class="text-gray-600 mt-2 text-sm">${data.name} has already been scanned.</p>
                `);
            } else {
                showResult("<div class='text-red-600 font-bold'>❌ Participant Not Found</div>");
            }
        } catch (e) {
            console.error("Scan Error:", e);
            showResult("<div class='text-red-600 font-bold'>❌ Connection Error. Please ensure you are connected to the internet.</div>");
        }
        
        setTimeout(() => { html5QrCode.resume(); }, 4000);
    }
}

<script>
    // Masukkan API Key kamu di sini. Kamu bisa tambah sebanyak mungkin!
    // Semakin banyak Key, semakin jarang Orion AI kamu akan "mogok".
    const keysRaw = [
        "QUl6YVN5QUpZamVUYVpYVmdwdUFqU3ZYRkdVMnJWd2ctUE1iM1NZ", // Key 1
        "QUl6YVN5QUZuaGpySUN5ZjRxZjR2RXlYeF9uTGRua0kzclZ1ejlj", // Key 2
        "QUl6YVN5QlZBNzhGTVNPdXdfTG9vMkI5NmtRUmhJQ3pSNDRYNlRwbw",  // Key 3
        "QUl6YVN5QUY2eThTY3Z4ekxFVEhYZndaWDdHVGdCX1NBdmZ2WFQw", // Key 4
        "QUl6YVN5QW9ZSkNSYjc0aF9YeWdjSjRKRENaTUNkMFRPRG5lazRB", // Key 5
    ];

    // Proses decode semua key
    const API_KEYS = keysRaw.map(k => atob(k));
    let currentKeyIndex = 0; // Mulai dari key pertama

    async function send() {
        const inp = document.getElementById("in");
        const box = document.getElementById("box");
        const text = inp.value.trim();
        if (!text) return;

        box.innerHTML += `<div class="msg u">${text}</div>`;
        inp.value = "";
        box.scrollTop = box.scrollHeight;

        const loadId = "loading-" + Date.now();
        box.innerHTML += `<div class="msg a" id="${loadId}"><div class="typing"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div></div>`;
        box.scrollTop = box.scrollHeight;

        // Fungsi internal untuk memanggil API dengan fitur otomatis ganti Key
        async function fetchWithRetry(attempt = 0) {
            try {
                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEYS[currentKeyIndex]}`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ contents: [{ parts: [{ text: text }] }] })
                });

                const data = await response.json();

                // Jika terkena limit (error 429) dan masih ada key cadangan
                if (response.status === 429 && currentKeyIndex < API_KEYS.length - 1) {
                    console.warn("Key " + (currentKeyIndex + 1) + " habis, mencoba key berikutnya...");
                    currentKeyIndex++; // Pindah ke key cadangan
                    return fetchWithRetry(attempt + 1); 
                }

                if (data.candidates && data.candidates[0].content.parts[0].text) {
                    return data.candidates[0].content.parts[0].text;
                } else {
                    throw new Error("Gagal ambil respon");
                }
            } catch (error) {
                // Jika sudah mencoba semua key tapi masih gagal
                if (currentKeyIndex >= API_KEYS.length - 1) {
                    throw new Error("Semua kuota API Key habis.");
                }
                throw error;
            }
        }

        try {
            const result = await fetchWithRetry();
            document.getElementById(loadId)?.remove();
            box.innerHTML += `<div class="msg a">${marked.parse(result)}</div>`;
        } catch (e) {
            document.getElementById(loadId)?.remove();
            box.innerHTML += `<div class="msg a" style="color: #ff4757;">Maaf, semua jalur kuota Orion sedang penuh. Coba lagi 1 menit lagi ya!</div>`;
        }
        box.scrollTop = box.scrollHeight;
    }

    // ... sisa fungsi modal dan partikel tetap sama seperti sebelumnya ...
</script>

import { supabase } from "./supabase-client.js";

const form = document.getElementById("forgotPasswordForm");
const emailInput = document.getElementById("email");
const message = document.getElementById("forgotMessage");
const button = document.getElementById("forgotButton");

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = emailInput.value.trim();

    button.disabled = true;
    message.textContent = "Sedang mengirim permintaan...";

    try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${window.location.origin}/reset-password.html`
        });

        if (error) {
            console.error("Permintaan pemulihan gagal:", error.message);
            message.textContent =
                "Belum bisa mengirim email. Coba lagi nanti.";
            return;
        }

        message.textContent =
            "Jika email dapat menerima pemulihan, link akan dikirim. " +
            "Periksa Inbox dan folder Spam.";
    } catch (error) {
        console.error(error);
        message.textContent =
            "Terjadi kesalahan koneksi. Coba lagi nanti.";
    } finally {
        button.disabled = false;
    }
});

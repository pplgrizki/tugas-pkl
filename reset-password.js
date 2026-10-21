
import { supabase } from "./supabase-client.js";

const form = document.getElementById("resetPasswordForm");
const passwordInput = document.getElementById("newPassword");
const confirmInput = document.getElementById("confirmPassword");
const message = document.getElementById("resetMessage");
const button = document.getElementById("resetButton");

form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const password = passwordInput.value;
    const confirmation = confirmInput.value;

    if (password.length < 6) {
        message.textContent = "Password minimal 6 karakter.";
        return;
    }

    if (password !== confirmation) {
        message.textContent = "Konfirmasi password tidak sama.";
        return;
    }

    button.disabled = true;
    message.textContent = "Sedang memperbarui password...";

    try {
        const { data, error: sessionError } =
            await supabase.auth.getSession();

        if (sessionError || !data.session) {
            message.textContent =
                "Link pemulihan tidak valid atau sudah kedaluwarsa. " +
                "Minta link baru dari halaman Lupa Password.";
            return;
        }

        const { error } = await supabase.auth.updateUser({ password });

        if (error) {
            console.error("Reset password gagal:", error.message);
            message.textContent =
                "Password belum bisa diperbarui. Coba lagi.";
            return;
        }

        message.textContent =
            "Password berhasil diperbarui! Silakan login kembali.";

        await supabase.auth.signOut();

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1800);
    } catch (error) {
        console.error(error);
        message.textContent =
            "Terjadi kesalahan. Coba minta link pemulihan baru.";
    } finally {
        button.disabled = false;
    }
});

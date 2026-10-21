
import { supabase } from "./supabase-client.js";

const registerForm = document.getElementById("registerForm");
const displayNameInput = document.getElementById("displayName");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const registerMessage = document.getElementById("registerMessage");
const registerButton = document.getElementById("registerButton");

registerForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const username = displayNameInput.value.trim();
    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (username.length < 3) {
        registerMessage.textContent =
            "Username minimal 3 karakter.";
        return;
    }

    if (password.length < 6) {
        registerMessage.textContent =
            "Password minimal 6 karakter.";
        return;
    }

    if (password !== confirmPassword) {
        registerMessage.textContent =
            "Konfirmasi password tidak sama.";
        return;
    }

    registerButton.disabled = true;
    registerMessage.textContent = "Sedang membuat akun...";

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username: username,
                    display_name: username
                },
                emailRedirectTo: `${window.location.origin}/login.html`
            }
        });

        if (error) {
            console.error("Pendaftaran gagal:", error.message);
            registerMessage.textContent =
                "Pendaftaran gagal: " + error.message;
            return;
        }

        if (data.session) {
            registerMessage.textContent =
                "Akun berhasil dibuat! Mengarahkan ke halaman login...";

            setTimeout(() => {
                window.location.href = "login.html";
            }, 1500);
        } else {
            registerMessage.textContent =
                "Pendaftaran berhasil dikirim. Periksa email kamu " +
                "untuk verifikasi akun, lalu login.";
        }

    } catch (error) {
        console.error("Kesalahan pendaftaran:", error);

        registerMessage.textContent =
            "Terjadi kesalahan. Periksa koneksi dan konfigurasi Supabase.";
    } finally {
        registerButton.disabled = false;
    }
});

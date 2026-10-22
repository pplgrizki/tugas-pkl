
import { supabase } from "./supabase-client.js";

const registerForm = document.getElementById("registerForm");
const displayNameInput = document.getElementById("displayName");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");
const registerMessage = document.getElementById("registerMessage");
const registerButton = document.getElementById("registerButton");

if (
    registerForm &&
    displayNameInput &&
    emailInput &&
    passwordInput &&
    confirmPasswordInput &&
    registerMessage &&
    registerButton
) {
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
                        username,
                        display_name: username
                    },
                    emailRedirectTo:
                        `${window.location.origin}/login.html`
                }
            });

            if (error) {
                console.error(
                    "Pendaftaran gagal:",
                    error.message
                );

                if (
                    error.message.toLowerCase().includes(
                        "email rate limit exceeded"
                    )
                ) {
                    registerMessage.textContent =
                        "Pengiriman email sedang mencapai batas. " +
                        "Jangan daftar ulang dulu. Periksa " +
                        "Authentication > Users di Supabase. " +
                        "Jika akun sudah tercatat, tunggu sampai " +
                        "pengiriman email tersedia kembali.";
                } else if (
                    error.message.toLowerCase().includes(
                        "already registered"
                    ) ||
                    error.message.toLowerCase().includes(
                        "already been registered"
                    )
                ) {
                    registerMessage.textContent =
                        "Email ini sudah terdaftar. " +
                        "Silakan coba login menggunakan email tersebut.";
                } else {
                    registerMessage.textContent =
                        "Pendaftaran gagal: " + error.message;
                }

                return;
            }

            if (data.session && data.user) {
                registerMessage.textContent =
                    "Akun berhasil dibuat! Membuka dashboard...";

                window.location.replace("index.html");
                return;
            }

            registerMessage.textContent =
                "Permintaan pendaftaran berhasil diproses. " +
                "Jika akun sudah muncul di Supabase Users, " +
                "jangan daftar ulang. Email perlu diverifikasi " +
                "sebelum kamu bisa login. Periksa Inbox atau Spam.";

        } catch (error) {
            console.error(
                "Kesalahan pendaftaran:",
                error
            );

            registerMessage.textContent =
                "Tidak dapat menghubungi Supabase. " +
                "Periksa koneksi internet, lalu coba lagi nanti.";
        } finally {
            registerButton.disabled = false;
        }
    });
}

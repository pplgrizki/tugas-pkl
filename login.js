
import { supabase } from "./supabase-client.js";

const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginMessage = document.getElementById("loginMessage");
const togglePassword = document.getElementById("togglePassword");
const googleLoginBtn = document.getElementById("googleLoginBtn");

if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", () => {
        passwordInput.type =
            passwordInput.type === "password" ? "text" : "password";
    });
}

if (loginForm && usernameInput && passwordInput && loginMessage) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = usernameInput.value.trim();
        const password = passwordInput.value;

        if (!email || !password) {
            loginMessage.textContent =
                "Masukkan email dan password terlebih dahulu.";
            return;
        }

        const submitButton = loginForm.querySelector(
            'button[type="submit"]'
        );

        if (submitButton) submitButton.disabled = true;

        loginMessage.textContent = "Sedang masuk...";

        try {
            const { data, error } =
                await supabase.auth.signInWithPassword({
                    email,
                    password
                });

            if (error) {
                console.error("Login gagal:", error.message);

                const message = error.message.toLowerCase();

                if (
                    message.includes("email not confirmed") ||
                    message.includes("email_not_confirmed")
                ) {
                    loginMessage.textContent =
                        "Email kamu belum diverifikasi. " +
                        "Periksa Inbox atau Spam dan klik tautan verifikasi. " +
                        "Jika belum menerima email, coba lagi nanti.";
                } else if (
                    message.includes("invalid login credentials")
                ) {
                    loginMessage.textContent =
                        "Email atau password salah, atau akun belum " +
                        "dapat digunakan. Periksa kembali data login " +
                        "dan pastikan email sudah diverifikasi.";
                } else if (
                    message.includes("rate limit") ||
                    message.includes("too many requests")
                ) {
                    loginMessage.textContent =
                        "Terlalu banyak percobaan. Tunggu sebentar " +
                        "sebelum mencoba login kembali.";
                } else {
                    loginMessage.textContent =
                        "Login belum berhasil. Coba lagi nanti. " +
                        "Jika masalah berlanjut, hubungi admin.";
                }

                return;
            }

            if (!data.session || !data.user) {
                loginMessage.textContent =
                    "Sesi login tidak ditemukan. Silakan coba lagi.";
                return;
            }

            loginMessage.textContent =
                "Login berhasil! Membuka Pixel Vault...";

            window.location.replace("index.html");
        } catch (error) {
            console.error("Kesalahan login:", error);

            loginMessage.textContent =
                "Terjadi masalah koneksi. Periksa internet " +
                "dan coba lagi nanti.";
        } finally {
            if (submitButton) submitButton.disabled = false;
        }
    });
}

if (googleLoginBtn && loginMessage) {
    googleLoginBtn.addEventListener("click", async () => {
        loginMessage.textContent = "Menghubungkan ke Google...";
        googleLoginBtn.disabled = true;

        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    redirectTo: `${window.location.origin}/index.html`
                }
            });

            if (error) {
                console.error("Login Google gagal:", error.message);

                loginMessage.textContent =
                    "Login Google gagal. Coba lagi atau periksa " +
                    "konfigurasi OAuth.";

                googleLoginBtn.disabled = false;
            }
        } catch (error) {
            console.error("Kesalahan login Google:", error);

            loginMessage.textContent =
                "Tidak dapat menghubungkan ke Google. " +
                "Periksa koneksi internet.";

            googleLoginBtn.disabled = false;
        }
    });
}

import { supabase } from "./supabase-client.js";

const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const loginMessage = document.getElementById("loginMessage");
const togglePassword = document.getElementById("togglePassword");
const googleLoginBtn = document.getElementById("googleLoginBtn");

// Tampilkan atau sembunyikan password
if (togglePassword && passwordInput) {
    togglePassword.addEventListener("click", () => {
        const showPassword = passwordInput.type === "password";
        passwordInput.type = showPassword ? "text" : "password";
    });
}

// Login dengan Supabase
if (loginForm) {
    loginForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        loginMessage.textContent = "Sedang masuk...";

        const email = usernameInput.value.trim();
        const password = passwordInput.value;

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                console.error("Login gagal:", error.message);
                loginMessage.textContent =
                    "Login gagal. Periksa email dan password.";
                return;
            }

            console.log("Login berhasil!");
            console.log("Email:", data.user.email);
            console.log("User ID:", data.user.id);

            // Mengirim informasi login ke terminal
            await fetch("/api/login-log", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: data.user.email,
                    userId: data.user.id
                })
            });

            // Mengirim JWT ke API /api/me
            const response = await fetch("/api/me", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${data.session.access_token}`
                }
            });

            const result = await response.json();

            if (!response.ok) {
                console.error("Verifikasi JWT gagal:", result);
                loginMessage.textContent = "Verifikasi token gagal.";
                return;
            }

            console.log("Verifikasi JWT berhasil!");
            console.log("Data dari API /api/me:", result);

            loginMessage.textContent = "Login dan verifikasi JWT berhasil!";

            window.location.href = "index.html";

        } catch (error) {
            console.error("Terjadi kesalahan:", error);
            loginMessage.textContent =
                "Terjadi kesalahan. Periksa server.";
        }
    });
}

// Login Google
if (googleLoginBtn) {
    googleLoginBtn.addEventListener("click", async () => {
        loginMessage.textContent = "Menghubungkan ke Google...";

        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: "http://localhost:3001/index.html"
            }
        });

        if (error) {
            console.error("Login Google gagal:", error.message);
            loginMessage.textContent =
                "Login Google gagal: " + error.message;
        }
    });
}
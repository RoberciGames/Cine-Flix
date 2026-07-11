import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, // <- Nova função para registrar usuários
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";

// ⚠️ IMPORTANTE: Cole as SUAS credenciais do Firebase aqui!
const firebaseConfig = {
    apiKey: "AIzaSyAs-SUA-API-KEY-AQUI",
    authDomain: "seu-projeto.firebaseapp.com",
    projectId: "seu-projeto",
    storageBucket: "seu-projeto.appspot.com",
    messagingSenderId: "1234567890",
    appId: "1:1234567890:web:abcdef123456"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const isLoginPage = window.location.pathname.includes("login.html") || window.location.pathname === "/" || window.location.pathname.endsWith("/");

// Bloqueio de Telas (Redirecionamento automático)
onAuthStateChanged(auth, (user) => {
    if (user) {
        if (isLoginPage) window.location.href = "index.html";
    } else {
        if (!isLoginPage) window.location.href = "login.html";
    }
});

document.addEventListener("DOMContentLoaded", () => {
    
    const authForm = document.getElementById("auth-form");
    const formTitle = document.getElementById("form-title");
    const submitBtn = document.getElementById("submit-btn");
    const toggleModeBtn = document.getElementById("toggle-mode");
    const modeText = document.getElementById("mode-text");
    
    // Variável que diz se estamos na tela de Login ou de Registro
    let isLoginMode = true; 

    // Alterna o visual do formulário entre "Entrar" e "Criar Conta"
    if (toggleModeBtn) {
        toggleModeBtn.addEventListener("click", (e) => {
            e.preventDefault();
            isLoginMode = !isLoginMode; // Inverte o modo

            if (isLoginMode) {
                formTitle.innerText = "Entrar";
                submitBtn.innerText = "Entrar";
                modeText.innerText = "Novo por aqui?";
                toggleModeBtn.innerText = "Assine agora.";
            } else {
                formTitle.innerText = "Criar Conta";
                submitBtn.innerText = "Registrar";
                modeText.innerText = "Já tem uma conta?";
                toggleModeBtn.innerText = "Entre agora.";
            }
        });
    }

    // Processa o envio do formulário (Login ou Registro)
    if (authForm) {
        authForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const email = document.getElementById("email").value.trim();
            const password = document.getElementById("password").value;

            try {
                submitBtn.innerText = "Processando...";
                submitBtn.disabled = true;

                if (isLoginMode) {
                    // Tenta fazer o Login
                    await signInWithEmailAndPassword(auth, email, password);
                } else {
                    // Tenta Criar a Conta (O Firebase já loga o usuário após criar)
                    await createUserWithEmailAndPassword(auth, email, password);
                    alert("Conta criada com sucesso! Bem-vindo ao Cine Flix.");
                }
                
                window.location.href = "index.html";

            } catch (error) {
                console.error("Erro na autenticação:", error);
                
                // Tratamento de erros em português
                if (error.code === 'auth/email-already-in-use') {
                    alert("Este e-mail já tem uma conta! Clique em 'Entre agora'.");
                } else if (error.code === 'auth/weak-password') {
                    alert("A senha é muito fraca. Escolha uma com pelo menos 6 caracteres.");
                } else if (error.code === 'auth/invalid-credential') {
                    alert("E-mail ou senha incorretos! Verifique e tente novamente.");
                } else {
                    alert("Ocorreu um erro. Tente novamente mais tarde.");
                }

                // Restaura o botão caso dê erro
                submitBtn.innerText = isLoginMode ? "Entrar" : "Registrar";
                submitBtn.disabled = false;
            }
        });
    }

    // Sistema de Sair (Logout)
    const logoutBtn = document.getElementById("logout-btn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", async () => {
            try {
                await signOut(auth);
                window.location.href = "login.html";
            } catch (error) {
                console.error("Erro ao sair da conta:", error);
            }
        });
    }
});
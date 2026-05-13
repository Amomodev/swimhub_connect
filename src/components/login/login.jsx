import React, { useState } from "react";

export function Login() {

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault(); // Empêche la page de se reload

        // Connexion au backend Python  il faut mettre le bon port
        const response = await fetch("http://localhost:5000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (response.ok) {
            console.log("Succès !", data.access_token);
            localStorage.setItem("token", data.access_token);
        } else {
            alert(data.msg || "Erreur de connexion");
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <input type="text" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Mot de passe" onChange={(e) => setPassword(e.target.value)} />
            <button type="submit">Se connecter</button>
        </form>
    );
}

export default Login
import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';

export function SignUpPage() {

    const navigate = useNavigate();

    const [firstname, setFirst_name] = useState("");
    const [lastname, setLast_name] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault(); // Empêche la page de se reload

        // Connexion au backend Python
        const response = await fetch("http://localhost:5000/SignUp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                firstname: firstname,
                lastname: lastname,
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
            <input type="text" placeholder="Prénom" onChange={(e) => setFirst_name(e.target.value)} />
            <input type="text" placeholder="Nom" onChange={(e) => setLast_name(e.target.value)} />
            <input type="text" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Mot de passe" onChange={(e) => setPassword(e.target.value)} />
            <button type="submit">S'inscrire</button>
            <li onClick={() => { navigate('/login') }}>Login</li>
        </form>
    );
}

export default SignUpPage
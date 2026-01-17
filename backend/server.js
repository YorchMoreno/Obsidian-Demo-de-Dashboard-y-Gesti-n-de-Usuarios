const jwt = require("jsonwebtoken");

const SECRET_KEY = "obsidian_secreto";

const express = require("express");
const cors = require("cors");  // ✅ importar cors

const app = express();
app.use(cors());            // ✅ habilitar CORS
app.use(express.json());    // para leer JSON en POST

const usuarios = [
    { correo: "demo@demo.com", password: "123456", nombre: "Usuario Demo" }
];

const codigosRecuperacion = {};

function verificarToken(req, res, next) {
    const authHeader = req.headers["authorization"];

    if (!authHeader) {
        return res.status(401).json({
            ok: false,
            message: "Token requerido"
        });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, SECRET_KEY);
        req.usuario = decoded;
        next();
    } catch (error) {
        return res.status(403).json({
            ok: false,
            message: "Token inválido o expirado"
        });
    }
}

app.get("/perfil", verificarToken, (req, res) => {
    res.json({
        ok: true,
        message: "Acceso permitido",
        usuario: req.usuario
    });
});


// Ruta de prueba
app.get("/", (req, res) => {
    res.send("🔥 Backend funcionando correctamente");
});
//LOGIN JWT
app.post("/login", (req, res) => {
    const { correo, password } = req.body;

    const usuario = usuarios.find(
        u => u.correo === correo && u.password === password
    );

    if (!usuario) {
        return res.status(401).json({
            ok: false,
            message: "Usuario o contraseña incorrectos"
        });
    }

    // 🔐 Crear token JWT
    const token = jwt.sign(
        {
            correo: usuario.correo,
            nombre: usuario.nombre
        },
        SECRET_KEY,
        { expiresIn: "1h" }
    );

    res.json({
        ok: true,
        message: "Login exitoso",
        token,
        usuario: {
            nombre: usuario.nombre,
            correo: usuario.correo
        }
    });
});

// REGISTRO
app.post("/register", (req, res) => {
    const { nombre, correo, password, telefono } = req.body;

    // Verificar si ya existe
    if (usuarios.find(u => u.correo === correo)) {
        return res.status(400).json({ ok: false, message: "El correo ya está registrado" });
    }

    // Guardar usuario nuevo
    usuarios.push({ nombre, correo, password, telefono });

    res.json({ ok: true, message: "Registro exitoso, ahora puedes iniciar sesión" });
});

// RECUPERAR CONTRASEÑA (BACKEND)
app.post("/recover", (req, res) => {
    const { correo, nuevaPassword } = req.body;

    // Buscar usuario
    const usuario = usuarios.find(u => u.correo === correo);

    if (!usuario) {
        return res.status(404).json({
            ok: false,
            message: "No existe una cuenta con ese correo"
        });
    }

    // Actualizar contraseña
    usuario.password = nuevaPassword;

    res.json({
        ok: true,
        message: "Contraseña actualizada correctamente"
    });
});



// Puerto
const PORT = 3000;
app.listen(PORT, () => console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`));

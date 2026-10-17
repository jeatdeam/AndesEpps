import express from "express";
import cors from "cors";
import controladores from "./controllers/controladores";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Servidor funcionando"
    });
});

app.get("/productos", controladores.categorias)
app.get("/getProductosCategoria", controladores.getProductosCategoria);
app.get('/productos/:id', controladores.getProductElegido);
// app.get("/getAllCategorias", controladores.getAllCategorias);


app.listen(3001, () => {
    console.log(`Servidor en http://localhost:3001`);
});
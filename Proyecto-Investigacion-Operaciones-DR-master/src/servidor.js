import express from "express";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";

let datosTemporales = {}; //Chambonada necesaria para pasar los datos del post al get
let datosTemporales2 = {}; //Chambonada necesaria para pasar los datos del post al get

const app = express();

const __dirname = dirname(fileURLToPath(import.meta.url));

app.set("views", join(__dirname, "views"));
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

app.use(express.static(join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("inicio");
});

app.get("/metodoGrafico", (req, res) => {
  res.render("metodoGrafico");
});

app.get("/metodoDosFases", (req, res) => {
  res.render("metodoDosFases");
});

app.get("/metodoDosFases-v2", (req, res) => {
  res.render("metodoDosFases_v2");
});

/*Metodo grafico */

/*Importante Duvan por eso lo encerre para pasar los datos que necesita********************************************************* */
//Se necesita para el metodo post por que se convierte en un Json Importante no borrar
app.use(bodyParser.json());

//Metodo POST
app.post("/solucionGrafico", (req, res) => {
  const datos = req.body;
  datosTemporales = datos; //Ojo a esto
  res.render("solucionGrafico", { datos: datos });
});

//Metodo GET
app.get("/solucionGrafico", (req, res) => {
  res.render("solucionGrafico", { datos: datosTemporales });
});
/*********************************************************************************************** */

/*Metodo Dos Fases */

/*Importante Duvan por eso lo encerre********************************************************* */
//Se necesita para el metodo post por que se convierte en un Json Importante no borrar
//Metodo POST
app.post("/solucionDosFases", (req, res) => {
  const datos = req.body;
  datosTemporales2 = datos; //Ojo a esto
  res.render("solucionDosFases", { datos: datos });
});

//Metodo GET
app.get("/solucionDosFases", (req, res) => {
  res.render("solucionDosFases", { datos: datosTemporales2 });
});
/*********************************************************************************************** */

app.listen(process.env.PORT || 3000);
console.log(`Servidor ejecutandose en el puerto ${process.env.PORT || 3000}`);

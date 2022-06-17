const express = require("express");
const cors = require("cors");
const multer = require("multer");
const PORT = process.env.PORT || 3001;
const app = express();
const fs = require("fs");
const pdfParse = require("pdf-parse");
const gtts = require("gtts");
const path = require("path");

let text;

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "X-PINGOTHER, Content-Type, Authorization"
  );
  app.use(cors());
  next();
});
app.use(express.static(path.resolve(__dirname, "../client/build")));
const storagemulter = multer.diskStorage({
  //configura upload
  destination: (req, file, cb) => {
    //manda arquivo para pasta public_files
    cb(null, "public_files");
  },
  filename: (req, file, cb) => {
    // arquivos upados no servidor recebem o nome de documento.pdf
    cb(null, "documento.pdf");
  },
});
app.get("/api", (req, res) => {
  //rota para teste de servidor
  res.json({ message: "o servidor se comunicando" });
});
const upload = multer({ storage: storagemulter });
app.post("/uploadfile", upload.single("pdf-file"), async (req, res) => {
  //recebe o upload nessa rota
  if (req.file) {
    let dataBuffer = await fs.readFileSync("public_files/documento.pdf"); //se o arquivo chegou no servidor esperar pelo upload e armazena o caminho do arquivo na variavel
    pdfParse(dataBuffer).then((result) => {
      text = result.text; // transforma o pdf em texto e armazena na variavel
      var voice = new gtts(text, "pt");
      var outputFilePath = __dirname + Date.now() + " documento.mp3";
      voice.save(outputFilePath); // cria arquivo de audio com o texto extraido do pdf
      res.download(outputFilePath); // faz dowload do arquivo de audio no cliente
    });

    return res.json({
      erro: false,
      mensagem: "Upload feito com sucesso e enviado para download",
    }); // retorna mensagem para cliente
  }
  return res.status(400).json({ erro: true, mensagem: "upload nao feito" });
});

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../client/build", "index.html"));
});
app.listen(PORT);

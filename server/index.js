const express = require("express");
const cors = require("cors");
const multer = require("multer");
const PORT = process.env.PORT || 3001;
const app = express();
const fs = require("fs");
const crawler = require("crawler-request");
const gtts = require("gtts");
const path = require("path");
const aws = require("aws-sdk");
const multerS3 = require("multer-s3-v2");
const PdfParse = require("pdf-parse");
let filemp3;

let text;
let namefile;

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

/*aws.config.update({
  accessKeyId: "AKIAR7TNGBQ5QCOUHSXT",
  secretAccessKey: "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",
  region: "sa-east-1",
});
/*const s3 = new aws.S3();
const upload = multer({
  storage: multerS3({
    s3,
    bucket: "audioexam-multer",
    acl: "public-read",
    key(req, file, cb) {
      namefile = Date.now() + "documento.pdf";
      cb(null, namefile);
    },
  }),
});*/

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public_files");
  },
  filename: (req, file, cb) => {
    namefile = Date.now() + "document.pdf";
    cb(null, namefile);
  },
});

const upload = multer({ storage: storage });

app.post("/uploadfile", upload.single("pdf-file"), async (req, res) => {
  //recebe o upload nessa rota
  if (req.file) {
    let databuffer = fs.readFileSync(__dirname + "/public_files/" + namefile);

    /*crawler(req.file.location)*/
    PdfParse(databuffer).then(async (result) => {
      console.log(result.text);
      text = await result.text; // transforma o pdf em texto e armazena na variavel
      var voice = new gtts(text, "pt");
      var outputFilePath = Date.now() + " documento.mp3";
      voice.save(outputFilePath);

      // cria arquivo de audio com o texto extraido do pdf
      //res.download(path.resolve("./", outputFilePath)); // faz dowload do arquivo de audio no cliente
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

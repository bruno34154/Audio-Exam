import "./style.css";
import { useState } from "react";
import document from "../../assets/imgs/document.png";

import axios from "axios";

export default function PostFile() {
  const [srcf, setSrc] = useState("");
  const [pdffile, setMessage] = useState("");
  const [value, setValue] = useState("");
  const [status, setStatus] = useState("");

  const change = async (e) => {
    setMessage(e.target.files[0]);
    setValue(e.target.value.slice(12));
    setSrc(document);
  };
  const play = async (e) => {
    e.preventDefault();
    console.log(pdffile);
    const formData = new FormData();
    formData.append("pdf-file", pdffile);
    const headers = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    await axios
      .post("/uploadfile", formData, headers)
      .then((res) => {
        //console.log(res);
        setStatus(res.data.mensagem);
      })
      .catch((err) => {
        if (err.res) {
          setStatus(err.response.data.mensagem);
        } else {
          setStatus("Servidor não esta funcionando no momento");
        }
      });
  };

  return (
    <div className="Container-post">
      <form
        onSubmit={play}
        className="form-area-input"
        encType="multipart/form-data"
      >
        <div className="input-Area">
          <label for="input-fileb" className="label-file">
            Selecione um arquivo aqui
          </label>
          <input
            type="file"
            id="input-fileb"
            className="input-file"
            onChange={change}
            name="pdf-file"
            accept="application/pdf"
          />
          {srcf === "" ? (
            <div></div>
          ) : (
            <div className="img-area-file">
              <img src={srcf} className="image-file" alt="documento" />
              <p className="text-file">{value}</p>
            </div>
          )}
        </div>
        <div className="buttons-area-input">
          <button className="button-file" type="submit">
            Criar audio
          </button>
        </div>
      </form>
      <div>
        <h1 className="instructions">
          Clique em selecionar arquivo e selecione o seu documento em pdf para
          transforma-lo em audio
        </h1>
      </div>
      {status === "" ? (
        <div></div>
      ) : (
        <div>
          <p className="status-post">{status}</p>
        </div>
      )}
    </div>
  );
}

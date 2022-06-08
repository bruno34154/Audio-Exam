import "./style.css";
import { useState } from "react";
import document from "../../assets/imgs/document.png";

export default function PostFile() {
  const [srcf, setSrc] = useState("");
  const [message, setMessage] = useState("");
  let msg = new SpeechSynthesisUtterance();
  const [value, setValue] = useState("");

  const change = async (e) => {
    let text = await e.target.files[0].text();
    setMessage(text);
    setValue(e.target.value.slice(12));
    setSrc(document);
  };
  const play = () => {
    msg.text = message;
    speechSynthesis.speak(msg);
  };

  return (
    <div className="Container-post">
      <div className="input-Area">
        <label for="input-fileb" className="label-file">
          Selecione um arquivo aqui
        </label>
        <input
          type="file"
          id="input-fileb"
          className="input-file"
          onChange={change}
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
        <button className="button-file" onClick={play}>
          Criar audio
        </button>
      </div>
    </div>
  );
}

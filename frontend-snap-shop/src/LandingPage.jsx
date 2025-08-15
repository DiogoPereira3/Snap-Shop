import { useState, useRef } from "react";
import App from "./App";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const [mode, setMode] = useState("landing");
  const [initialText, setInitialText] = useState("");
  const [initialImage, setInitialImage] = useState(null);
  const [inputText, setInputText] = useState("");
  const fileInput = useRef();

  function handleTextSearch() {
    if (inputText.trim()) {
      setInitialText(inputText);
      setMode("app");
    }
  }

  function handleImageSearch(file) {
    if (file) {
      setInitialImage(file);
      setMode("app");
    }
  }

  if (mode === "app") {
    return <App initialText={initialText} initialImage={initialImage} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-purple-200">
      <div className="bg-white rounded-2xl shadow-2xl p-10 max-w-lg w-full flex flex-col items-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">Snap & Shop</h1>
        <p className="text-lg text-gray-600 mb-8 text-center">
          O seu motor de busca por imagem para produtos usados nas principais plataformas em Portugal.<br />
          Carregue uma imagem ou pesquise por texto!
        </p>
        <div className="w-full flex flex-col gap-4">
          <label
            htmlFor="file-upload-landing"
            className="flex flex-col items-center justify-center border-4 border-dashed border-blue-400 rounded-xl p-12 cursor-pointer hover:bg-blue-50 transition"
            onDrop={e => {
              e.preventDefault();
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleImageSearch(e.dataTransfer.files[0]);
              }
            }}
            onDragOver={e => e.preventDefault()}
            onDragEnter={e => e.preventDefault()}
          >
            <input
              id="file-upload-landing"
              type="file"
              accept="image/*"
              ref={fileInput}
              onChange={e => {
                if (e.target.files[0]) handleImageSearch(e.target.files[0]);
              }}
              className="hidden"
            />
            <span className="text-2xl text-center font-semibold text-blue-700 mb-2">Carregue ou arraste uma imagem</span>
            <span className="text-sm text-gray-500">Procure produtos por imagem</span>
          </label>
          <div className="flex items-center justify-center gap-2 text-gray-500 my-2">
            <span className="border-t border-gray-300 flex-1"></span>
            ou
            <span className="border-t border-gray-300 flex-1"></span>
          </div>
          <input
            type="text"
            placeholder="Pesquisar produto..."
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            className="border rounded px-4 py-2 w-full text-lg"
            onKeyDown={e => e.key === "Enter" && handleTextSearch()}
          />
          <Button
            className="w-full text-lg"
            onClick={handleTextSearch}
            disabled={!inputText.trim()}
          >
            Pesquisar por texto
          </Button>
        </div>
        <div className="mt-8 text-xs text-gray-400 text-center">
          <span>OLX • Vinted • Wallapop</span>
        </div>
      </div>
    </div>
  );
}
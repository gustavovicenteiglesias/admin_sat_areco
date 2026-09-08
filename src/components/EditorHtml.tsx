import { IonButton, IonSegment, IonSegmentButton, IonTextarea } from "@ionic/react";
import { useEffect, useRef, useState } from "react";
import "./EditorHtml.css";

export default function EditorHtml({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const editor = useRef<HTMLDivElement>(null);
  const [mode, setMode] = useState<"visual" | "html">("visual");
  useEffect(() => {
    if (editor.current && editor.current.innerHTML !== value) editor.current.innerHTML = value;
  }, [value]);

  const command = (name: string, argument?: string) => {
    editor.current?.focus();
    document.execCommand(name, false, argument);
    onChange(editor.current?.innerHTML ?? "");
  };

  const insertLink = () => {
    const url = window.prompt("Dirección del enlace (https://…)");
    if (url) command("createLink", url);
  };

  return <div className="editor-html">
    <IonSegment value={mode} onIonChange={e => setMode(e.detail.value as "visual" | "html")}>
      <IonSegmentButton value="visual">Editor visual</IonSegmentButton>
      <IonSegmentButton value="html">Código HTML</IonSegmentButton>
    </IonSegment>
    {mode === "visual" && <div className="editor-html-toolbar">
      <IonButton size="small" fill="outline" onClick={() => command("bold")}><strong>N</strong></IonButton>
      <IonButton size="small" fill="outline" onClick={() => command("italic")}><em>C</em></IonButton>
      <IonButton size="small" fill="outline" onClick={() => command("underline")}><u>S</u></IonButton>
      <IonButton size="small" fill="outline" onClick={() => command("formatBlock", "h2")}>Título</IonButton>
      <IonButton size="small" fill="outline" onClick={() => command("insertUnorderedList")}>Viñetas</IonButton>
      <IonButton size="small" fill="outline" onClick={() => command("insertOrderedList")}>Numerada</IonButton>
      <IonButton size="small" fill="outline" onClick={insertLink}>Enlace</IonButton>
      <IonButton size="small" fill="outline" onClick={() => command("formatBlock", "p")}>Párrafo</IonButton>
      <IonButton size="small" fill="clear" onClick={() => command("removeFormat")}>Limpiar formato</IonButton>
    </div>}
    {mode === "visual" ? <div ref={editor} className="editor-html-content" contentEditable suppressContentEditableWarning
      onInput={e => onChange(e.currentTarget.innerHTML)} />
      : <IonTextarea className="editor-html-source" aria-label="Código HTML" value={value} autoGrow
          placeholder="Pegá o escribí aquí el HTML…" onIonInput={e => onChange(e.detail.value ?? "")} />}
  </div>;
}

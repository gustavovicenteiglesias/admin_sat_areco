import { IonButton, IonButtons, IonContent, IonHeader, IonInput, IonItem, IonLabel, IonList, IonMenuButton, IonPage, IonSpinner, IonTextarea, IonTitle, IonToast, IonToggle, IonToolbar } from "@ionic/react";
import { useEffect, useMemo, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import EditorHtml from "../components/EditorHtml";
import { recomendacionCreate, recomendacionGet, recomendacionUpdate } from "../data/recomendaciones.repo";
import type { Recomendacion } from "../types/recomendacion";

const EMPTY: Recomendacion = { titulo: "", resumen: "", contenidoHtml: "", prioridad: 0, orden: 0, publicado: false };
export default function RecomendacionForm() {
  const { id } = useParams<{ id?: string }>();
  const editId = useMemo(() => id ? Number(id) : null, [id]);
  const [model, setModel] = useState({ ...EMPTY });
  const [toast, setToast] = useState("");
  const [saving, setSaving] = useState(false);
  const history = useHistory();
  const set = <K extends keyof Recomendacion>(key: K, value: Recomendacion[K]) => setModel(prev => ({ ...prev, [key]: value }));
  useEffect(() => { if (editId) recomendacionGet(editId).then(setModel).catch(() => setToast("No se pudo cargar")); }, [editId]);
  const guardar = async () => {
    if (saving) return;
    const documento = new DOMParser().parseFromString(model.contenidoHtml, "text/html");
    const tituloHtml = documento.querySelector("title")?.textContent?.trim()
      || documento.querySelector("h1")?.textContent?.trim()
      || "";
    const item = { ...model, titulo: model.titulo.trim() || tituloHtml.slice(0, 180) };
    if (!item.titulo) { setToast("Completá el título o incluí una etiqueta <title> o <h1> en el HTML"); return; }
    if (!documento.body.textContent?.trim()) { setToast("El contenido HTML está vacío"); return; }
    if ((item.resumen?.length ?? 0) > 500) { setToast("El resumen no puede superar los 500 caracteres"); return; }
    setSaving(true);
    try {
      if (editId) await recomendacionUpdate(editId, item); else await recomendacionCreate(item);
      history.replace("/recomendaciones");
    } catch (e: any) { setToast(e?.response?.data?.message ?? "No se pudo guardar"); }
    finally { setSaving(false); }
  };
  return <IonPage><IonHeader><IonToolbar><IonButtons slot="start"><IonMenuButton /></IonButtons><IonTitle>{editId ? "Editar" : "Nueva"} recomendación</IonTitle></IonToolbar></IonHeader><IonContent><IonList>
    <IonItem><IonLabel position="stacked">Título *</IonLabel><IonInput value={model.titulo} onIonInput={e => set("titulo", e.detail.value ?? "")} /></IonItem>
    <IonItem><IonLabel position="stacked">Resumen</IonLabel><IonTextarea value={model.resumen ?? ""} autoGrow onIonInput={e => set("resumen", e.detail.value ?? "")} /></IonItem>
    <IonItem><IonLabel position="stacked">Prioridad</IonLabel><IonInput type="number" value={model.prioridad} onIonInput={e => set("prioridad", Number(e.detail.value ?? 0))} /></IonItem>
    <IonItem><IonLabel position="stacked">Orden</IonLabel><IonInput type="number" value={model.orden} onIonInput={e => set("orden", Number(e.detail.value ?? 0))} /></IonItem>
    <IonItem><IonLabel>Publicada en la app</IonLabel><IonToggle checked={model.publicado} onIonChange={e => set("publicado", e.detail.checked)} /></IonItem>
  </IonList><section className="ion-padding"><IonLabel>Contenido *</IonLabel><EditorHtml value={model.contenidoHtml} onChange={value => set("contenidoHtml", value)} /></section>
  <div className="ion-padding"><IonButton expand="block" disabled={saving} onClick={guardar}>{saving && <IonSpinner slot="start" name="crescent" />}{saving ? "Guardando…" : "Guardar"}</IonButton><IonButton expand="block" fill="clear" disabled={saving} onClick={() => history.push("/recomendaciones")}>Cancelar</IonButton></div>
  <IonToast isOpen={!!toast} message={toast} duration={2500} color="danger" onDidDismiss={() => setToast("")} /></IonContent></IonPage>;
}

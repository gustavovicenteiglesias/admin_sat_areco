import {
  IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonInput, IonItem,
  IonLabel, IonList, IonMenuButton, IonNote, IonPage, IonRange, IonSelect,
  IonSelectOption, IonSpinner, IonTextarea, IonTitle, IonToast, IonToggle, IonToolbar,
} from "@ionic/react";
import { arrowDownOutline, arrowUpOutline, trashOutline } from "ionicons/icons";
import { useEffect, useMemo, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import MapaPreview from "../components/MapaPreview";
import { mapaArchivoDelete, mapaArchivoUpdate, mapaArchivosOrden, mapaCreate, mapaGeojson, mapaGet, mapaUpdate } from "../data/mapas.repo";
import type { MapaCapa, MapaLineaConfig } from "../types/mapaCapa";
import "./MapaCapaForm.css";

const EMPTY: MapaCapa = { nombre: "", descripcion: "", grupo: "", tipo: "Zona", color: "#3388ff", opacidad: 0.65, visibleInicialmente: false, orden: 0, publicado: false, fuente: "", recomendaciones: "", mostrarPdf: false };

export default function MapaCapaForm() {
  const { id } = useParams<{ id?: string }>();
  const editId = useMemo(() => id ? Number(id) : null, [id]);
  const history = useHistory();
  const [model, setModel] = useState<MapaCapa>({ ...EMPTY });
  const [mapFile, setMapFile] = useState<File | null>(null);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [geojson, setGeojson] = useState<GeoJSON.GeoJsonObject | null>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({ open: false, msg: "", color: "" });
  const setField = <K extends keyof MapaCapa>(key: K, value: MapaCapa[K]) => setModel(prev => ({ ...prev, [key]: value }));
  const lineas = useMemo(() => {
    if (!geojson || geojson.type !== "FeatureCollection") return [];
    return geojson.features.flatMap((feature, indice) => feature.geometry?.type === "LineString" ? [{
      clave: String(feature.properties?.elementoId ?? `linea-${indice}`),
      nombre: String(feature.properties?.nombre ?? `Línea ${indice + 1}`),
    }] : []);
  }, [geojson]);

  const configLinea = (clave: string, nombre: string): MapaLineaConfig => model.configuracionLineas?.find(item => item.clave === clave) ?? {
    clave,
    mostrarFlechas: nombre.trim().startsWith("Vía de Evacuación"),
    sentidoInvertido: false,
    separacion: 70,
  };

  const setConfigLinea = (clave: string, nombre: string, cambio: Partial<MapaLineaConfig>) => {
    const actual = configLinea(clave, nombre);
    const otras = (model.configuracionLineas ?? []).filter(item => item.clave !== clave);
    setField("configuracionLineas", [...otras, { ...actual, ...cambio }]);
  };

  useEffect(() => {
    if (!editId) return;
    Promise.all([mapaGet(editId), mapaGeojson(editId)]).then(([data, geo]) => { setModel(data); setGeojson(geo); })
      .catch(() => setToast({ open: true, msg: "No se pudo cargar la capa", color: "danger" }));
  }, [editId]);

  const save = async () => {
    if (saving) return;
    if (!model.nombre.trim() || (!editId && !mapFile)) {
      setToast({ open: true, msg: "Completá el nombre y seleccioná un KML o KMZ", color: "warning" }); return;
    }
    setSaving(true);
    try {
      if (editId) await mapaUpdate(editId, model, mapFile, newFiles);
      else await mapaCreate(model, mapFile!, newFiles);
      history.replace("/mapas");
    } catch (e: any) {
      setToast({ open: true, msg: e?.response?.data?.message ?? "No se pudo guardar la capa", color: "danger" });
    } finally { setSaving(false); }
  };

  const moveFile = async (index: number, direction: -1 | 1) => {
    if (!editId || !model.archivos) return;
    const target = index + direction;
    if (target < 0 || target >= model.archivos.length) return;
    const reordered = [...model.archivos];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
    setField("archivos", reordered);
    try { setField("archivos", await mapaArchivosOrden(editId, reordered)); }
    catch { setToast({ open: true, msg: "No se pudo cambiar el orden", color: "danger" }); }
  };

  const deleteFile = async (archivoId: number) => {
    if (!editId) return;
    try {
      await mapaArchivoDelete(editId, archivoId);
      setField("archivos", (model.archivos ?? []).filter(archivo => archivo.id !== archivoId));
    } catch { setToast({ open: true, msg: "No se pudo eliminar el archivo", color: "danger" }); }
  };

  const toggleFile = async (index: number, visible: boolean) => {
    if (!editId || !model.archivos) return;
    const archivos = [...model.archivos];
    archivos[index] = { ...archivos[index], visible };
    setField("archivos", archivos);
    try {
      archivos[index] = await mapaArchivoUpdate(editId, archivos[index]);
      setField("archivos", [...archivos]);
    } catch {
      setToast({ open: true, msg: "No se pudo cambiar la publicación del archivo", color: "danger" });
    }
  };

  return <IonPage>
    <IonHeader><IonToolbar><IonButtons slot="start"><IonMenuButton /></IonButtons><IonTitle>{editId ? "Editar capa" : "Nueva capa"}</IonTitle></IonToolbar></IonHeader>
    <IonContent><IonList>
      <IonItem><IonLabel position="stacked">Nombre *</IonLabel><IonInput value={model.nombre} maxlength={150} onIonInput={e => setField("nombre", e.detail.value ?? "")} /></IonItem>
      <IonItem><IonLabel position="stacked">Descripción</IonLabel><IonTextarea value={model.descripcion ?? ""} autoGrow onIonInput={e => setField("descripcion", e.detail.value ?? "")} /></IonItem>
      <IonItem><IonLabel position="stacked">Grupo</IonLabel><IonInput value={model.grupo ?? ""} placeholder="Ej.: Evacuación" onIonInput={e => setField("grupo", e.detail.value ?? "")} /></IonItem>
      <IonItem><IonLabel position="stacked">Tipo</IonLabel><IonSelect value={model.tipo} interface="popover" onIonChange={e => setField("tipo", e.detail.value)}><IonSelectOption value="Zona">Zona</IonSelectOption><IonSelectOption value="Recorrido">Recorrido</IonSelectOption><IonSelectOption value="Puntos">Puntos</IonSelectOption><IonSelectOption value="Mediciones">Mediciones</IonSelectOption><IonSelectOption value="Otro">Otro</IonSelectOption></IonSelect></IonItem>
      <IonItem><IonLabel>Color</IonLabel><input aria-label="Color de la capa" type="color" value={model.color} onChange={e => setField("color", e.target.value)} /></IonItem>
      <IonItem><IonLabel position="stacked">Opacidad: {Math.round(model.opacidad * 100)}%</IonLabel><IonRange min={0.1} max={1} step={0.05} value={model.opacidad} onIonChange={e => setField("opacidad", Number(e.detail.value))} /></IonItem>
      <IonItem><IonLabel position="stacked">Orden</IonLabel><IonInput type="number" value={model.orden} onIonInput={e => setField("orden", Number(e.detail.value ?? 0))} /></IonItem>
      <IonItem><IonLabel position="stacked">Fuente</IonLabel><IonInput value={model.fuente ?? ""} onIonInput={e => setField("fuente", e.detail.value ?? "")} /></IonItem>
      <IonItem><IonLabel position="stacked">Recomendaciones para esta capa</IonLabel><IonTextarea value={model.recomendaciones ?? ""} rows={6} autoGrow onIonInput={e => setField("recomendaciones", e.detail.value ?? "")} /></IonItem>
      <div className="mapa-file-field"><label htmlFor="mapa-kml">Mapa KML/KMZ {!editId && "*"}</label><input id="mapa-kml" type="file" accept=".kml,.kmz,application/vnd.google-earth.kml+xml,application/vnd.google-earth.kmz" onChange={e => setMapFile(e.target.files?.[0] ?? null)} />{model.nombreArchivoMapa && <IonNote>Actual: {model.nombreArchivoMapa}</IonNote>}</div>
      {!!lineas.length && <section className="mapa-lineas"><h3>Dirección de las líneas</h3><IonNote>Configurá flechas para cualquier recorrido del mapa.</IonNote>{lineas.map(linea => {
        const config = configLinea(linea.clave, linea.nombre);
        return <div className="mapa-linea-card" key={linea.clave}>
          <IonItem lines="none"><IonLabel><h2>{linea.nombre}</h2><p>{linea.clave}</p></IonLabel><IonToggle checked={config.mostrarFlechas} onIonChange={e => setConfigLinea(linea.clave, linea.nombre, { mostrarFlechas: e.detail.checked })} /></IonItem>
          {config.mostrarFlechas && <>
            <IonItem lines="none"><IonLabel>Invertir sentido</IonLabel><IonToggle checked={config.sentidoInvertido} onIonChange={e => setConfigLinea(linea.clave, linea.nombre, { sentidoInvertido: e.detail.checked })} /></IonItem>
            <IonItem lines="none"><IonLabel position="stacked">Separación entre flechas: {config.separacion} px</IonLabel><IonRange min={30} max={300} step={10} value={config.separacion} onIonChange={e => setConfigLinea(linea.clave, linea.nombre, { separacion: Number(e.detail.value) })} /></IonItem>
          </>}
        </div>;
      })}</section>}
      <div className="mapa-file-field"><label htmlFor="mapa-adjuntos">Imágenes y PDF (opcionales, carga múltiple)</label><input id="mapa-adjuntos" type="file" multiple accept="image/jpeg,image/png,image/webp,application/pdf,.jpg,.jpeg,.png,.webp,.pdf" onChange={e => setNewFiles(Array.from(e.target.files ?? []))} /><IonNote>{newFiles.length ? `${newFiles.length} archivo(s) seleccionado(s)` : "Podés combinar varias imágenes y PDF"}</IonNote></div>
      {!!model.archivos?.length && <section className="mapa-archivos"><h3>Archivos cargados</h3>{model.archivos.map((archivo, index) => <IonItem key={archivo.id}>
        <IonLabel><h2>{archivo.nombreArchivo}</h2><p>{archivo.tipo}</p></IonLabel>
        <IonLabel>Visible</IonLabel><IonToggle checked={archivo.visible} onIonChange={e => toggleFile(index, e.detail.checked)} />
        <IonButton fill="clear" disabled={index === 0} onClick={() => moveFile(index, -1)}><IonIcon icon={arrowUpOutline} /></IonButton>
        <IonButton fill="clear" disabled={index === model.archivos!.length - 1} onClick={() => moveFile(index, 1)}><IonIcon icon={arrowDownOutline} /></IonButton>
        <IonButton fill="clear" color="danger" onClick={() => deleteFile(archivo.id)}><IonIcon icon={trashOutline} /></IonButton>
      </IonItem>)}</section>}
      <IonItem><IonLabel>Visible al abrir SAT Mapas</IonLabel><IonToggle checked={model.visibleInicialmente} onIonChange={e => setField("visibleInicialmente", e.detail.checked)} /></IonItem>
      <IonItem><IonLabel>Publicada en la app</IonLabel><IonToggle checked={model.publicado} onIonChange={e => setField("publicado", e.detail.checked)} /></IonItem>
    </IonList>
    {geojson && <section className="ion-padding"><h2>Vista previa</h2><MapaPreview geojson={geojson} color={model.color} opacidad={model.opacidad} configuracionLineas={model.configuracionLineas} /></section>}
    {!editId && <IonNote className="ion-padding ion-display-block">La vista previa estará disponible después de guardar la capa como borrador.</IonNote>}
    <div className="ion-padding"><IonButton expand="block" disabled={saving} onClick={save}>{saving && <IonSpinner slot="start" name="crescent" />}{saving ? "Guardando…" : "Guardar"}</IonButton><IonButton expand="block" fill="clear" disabled={saving} onClick={() => history.push("/mapas")}>Cancelar</IonButton></div>
    <IonToast isOpen={toast.open} message={toast.msg} color={toast.color} duration={2200} onDidDismiss={() => setToast({ open: false, msg: "", color: "" })} />
    </IonContent>
  </IonPage>;
}

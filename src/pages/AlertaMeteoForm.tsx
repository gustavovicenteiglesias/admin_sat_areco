import {
  IonPage, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle,
  IonContent, IonList, IonItem, IonLabel, IonInput, IonTextarea,
  IonSelect, IonSelectOption, IonToggle, IonButton, IonToast
} from "@ionic/react";
import { useEffect, useMemo, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import type { AlertaMeteo, TipoAlerta } from "../types/alertaMeteo";
import { meteoGet, meteoCreate, meteoUpdateSmart } from "../data/alertaMeteo.repo";

type RouteParams = { id?: string };
const TIPOS: TipoAlerta[] = ["AMARILLO", "NARANJA", "ROJO"];

const EMPTY: AlertaMeteo = {
  id: 0,
  fecha: "",
  hora: "",
  titulo: "",
  zona: "",
  situacion: "",
  estado: false,
  tipo: "AMARILLO",
};

export default function AlertaMeteoForm() {
  const { id } = useParams<RouteParams>();
  const editId = useMemo(() => (id ? parseInt(id, 10) : null), [id]);
  const history = useHistory();

  const [model, setModel] = useState<AlertaMeteo>({ ...EMPTY });
  const [originalEstado, setOriginalEstado] = useState<boolean>(false);
  const [saving, setSaving] = useState(false);
  const [pushMode, setPushMode] = useState<"none" | "default" | "sirena">("default");
  const [toast, setToast] = useState<{open:boolean; msg:string}>({open:false, msg:""});

  useEffect(() => {
    if (!editId) {
      const now = new Date();
      setModel(m => ({
        ...m,
        fecha: now.toISOString().slice(0,10),
        hora: now.toTimeString().slice(0,8),
        tipo: "AMARILLO",
        estado: false,
      }));
      setOriginalEstado(false);
      return;
    }
    (async () => {
      const data = await meteoGet(editId);
      setModel({
        ...data,
        fecha: data.fecha ?? new Date().toISOString().slice(0,10),
        hora: data.hora ?? new Date().toTimeString().slice(0,8),
      });
      setOriginalEstado(!!data.estado);
    })();
  }, [editId]);

  const setField = (k: keyof AlertaMeteo, v: any) => setModel(prev => ({ ...prev, [k]: v }));
  const isValid = () => !!model.fecha && !!model.hora && !!model.titulo && !!model.tipo;

  const onSubmit = async () => {
    if (!isValid()) {
      setToast({ open:true, msg:"Completá fecha, hora, título y tipo" });
      return;
    }
    setSaving(true);
    try {
      const payload: Partial<AlertaMeteo> = {
        fecha: model.fecha,
        hora: model.hora,
        titulo: model.titulo,
        zona: model.zona ?? "",
        situacion: model.situacion ?? "",
        estado: !!model.estado,
        tipo: model.tipo,
      };

      if (editId) {
        await meteoUpdateSmart(editId, payload, originalEstado, !!model.estado, pushMode === "none" ? undefined : pushMode);
      } else {
        await meteoCreate(payload, pushMode === "none" ? undefined : pushMode);
      }

      const msg = editId
        ? (!originalEstado && model.estado ? "Actualizada y push enviado" : "Actualizada (sin push)")
        : (model.estado ? "Creada y push enviado" : "Creada (inactiva)");

      setToast({ open:true, msg });
      history.replace("/alertameteorologica");
    } finally {
      setSaving(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start"><IonMenuButton /></IonButtons>
          <IonTitle>{editId ? "Editar alerta meteo" : "Nueva alerta meteo"}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonList>
          <IonItem>
            <IonLabel position="stacked">Fecha</IonLabel>
            <IonInput type="date" value={model.fecha} onIonChange={(e)=>setField("fecha", e.detail.value!)} required />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Hora</IonLabel>
            <IonInput
              type="time"
              value={(model.hora ?? "").slice(0,5)}
              onIonChange={(e)=>{
                const hhmm = e.detail.value!;
                setField("hora", hhmm.length===5 ? hhmm + ":00" : hhmm);
              }}
              required
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Título</IonLabel>
            <IonInput value={model.titulo} onIonChange={(e)=>setField("titulo", e.detail.value!)} required />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Zona (opcional)</IonLabel>
            <IonInput value={model.zona ?? ""} onIonChange={(e)=>setField("zona", e.detail.value!)} />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Situación (opcional)</IonLabel>
            <IonTextarea autoGrow value={model.situacion ?? ""} onIonChange={(e)=>setField("situacion", e.detail.value!)} />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Tipo</IonLabel>
            <IonSelect interface="popover" value={model.tipo} onIonChange={(e)=>setField("tipo", e.detail.value as any)} required>
              {TIPOS.map(t => <IonSelectOption key={t} value={t}>{t}</IonSelectOption>)}
            </IonSelect>
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Notificación al guardar</IonLabel>
            <IonSelect value={pushMode} onIonChange={(e) => setPushMode(e.detail.value)}>
              <IonSelectOption value="none">No enviar push</IonSelectOption>
              <IonSelectOption value="default">Push con sonido normal</IonSelectOption>
              <IonSelectOption value="sirena">Push con sirena</IonSelectOption>
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel>Activo / publicado</IonLabel>
            <IonToggle checked={!!model.estado} onIonChange={(e)=>setField("estado", e.detail.checked)} />
          </IonItem>

          <div className="ion-padding">
            <IonButton expand="block" onClick={onSubmit} disabled={saving}>
              {saving ? "Guardando..." : "Guardar"}
            </IonButton>
            <IonButton expand="block" fill="clear" onClick={()=>history.goBack()}>Cancelar</IonButton>
          </div>
        </IonList>

        <IonToast isOpen={toast.open} message={toast.msg} duration={1400} onDidDismiss={()=>setToast({open:false,msg:""})}/>
      </IonContent>
    </IonPage>
  );
}

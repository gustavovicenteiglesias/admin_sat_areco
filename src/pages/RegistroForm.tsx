import {
  IonPage, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle,
  IonContent, IonList, IonItem, IonLabel, IonInput, IonButton, IonToast, IonTextarea
} from "@ionic/react";
import { useEffect, useMemo, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import type { Registro } from "../types/registro";
import { registroGet, registroCreate, registroUpdate } from "../data/registros.repo";

type RouteParams = { id?: string };

const EMPTY: Registro = {
  id: 0,
  fecha: "",
  hora: "",
  lluvia_hoy: "",
  lluvia_ayer: "",
  lluvia_mes: "",
  lluvia_ano: "",
  idEstacion: "",
  codigo: 20,
  source: "ARECOCLIMA",
  raw: "",
  createdAt: "",
};

export default function RegistroForm() {
  const { id } = useParams<RouteParams>();
  const editId = useMemo(() => (id ? parseInt(id, 10) : null), [id]);
  const history = useHistory();

  const [model, setModel] = useState<Registro>({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; msg: string }>({ open: false, msg: "" });

  useEffect(() => {
    if (!editId) {
      const now = new Date();
      setModel(m => ({
        ...m,
        fecha: now.toISOString().slice(0,10),
        hora: now.toTimeString().slice(0,8),
      }));
      return;
    }
    (async () => {
      const data = await registroGet(editId);
      setModel({
        ...data,
        fecha: data.fecha ?? new Date().toISOString().slice(0,10),
        hora: data.hora ?? new Date().toTimeString().slice(0,8),
      });
    })();
  }, [editId]);

  const setField = (k: keyof Registro, v: any) => setModel(prev => ({ ...prev, [k]: v }));
  const isValid = () => !!model.fecha && !!model.hora;

  const onSubmit = async () => {
    if (!isValid()) {
      setToast({ open: true, msg: "Completá fecha y hora" });
      return;
    }
    setSaving(true);
    try {
      const payload: Partial<Registro> = {
        fecha: model.fecha,
        hora: model.hora,
        lluvia_hoy: model.lluvia_hoy ?? "",
        lluvia_ayer: model.lluvia_ayer ?? "",
        lluvia_mes: model.lluvia_mes ?? "",
        lluvia_ano: model.lluvia_ano ?? "",
        idEstacion: model.idEstacion ?? "",
        codigo: model.codigo ?? undefined,
        source: model.source ?? "",
        raw: model.raw ?? "",
      };

      if (editId) await registroUpdate(editId, payload);
      else await registroCreate(payload);

      setToast({ open: true, msg: "Guardado" });
      history.replace("/registros");
    } finally {
      setSaving(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start"><IonMenuButton /></IonButtons>
          <IonTitle>{editId ? "Editar registro" : "Nuevo registro"}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonList>
          <IonItem>
            <IonLabel position="stacked">Fecha</IonLabel>
            <IonInput
              type="date"
              value={model.fecha}
              onIonChange={(e) => setField("fecha", e.detail.value!)}
              required
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Hora</IonLabel>
            <IonInput
              type="time"
              value={(model.hora ?? "").slice(0,5)}
              onIonChange={(e) => {
                const hhmm = e.detail.value!;
                setField("hora", hhmm.length === 5 ? hhmm + ":00" : hhmm);
              }}
              required
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Lluvia hoy (mm)</IonLabel>
            <IonInput value={model.lluvia_hoy ?? ""} onIonChange={(e)=>setField("lluvia_hoy", e.detail.value!)} />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Lluvia ayer (mm)</IonLabel>
            <IonInput value={model.lluvia_ayer ?? ""} onIonChange={(e)=>setField("lluvia_ayer", e.detail.value!)} />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Lluvia mes (mm)</IonLabel>
            <IonInput value={model.lluvia_mes ?? ""} onIonChange={(e)=>setField("lluvia_mes", e.detail.value!)} />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Lluvia año (mm)</IonLabel>
            <IonInput value={model.lluvia_ano ?? ""} onIonChange={(e)=>setField("lluvia_ano", e.detail.value!)} />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">ID Estación</IonLabel>
            <IonInput value={model.idEstacion ?? ""} onIonChange={(e)=>setField("idEstacion", e.detail.value!)} />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Código</IonLabel>
            <IonInput type="number" value={model.codigo ?? 20} onIonChange={(e)=>setField("codigo", e.detail.value ? parseInt(e.detail.value, 10) : 20)} />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Source</IonLabel>
            <IonInput value={model.source ?? ""} onIonChange={(e)=>setField("source", e.detail.value!)} />
          </IonItem>

          {/*<IonItem>
            <IonLabel position="stacked">Raw (opcional)</IonLabel>
            <IonTextarea autoGrow value={model.raw ?? ""} onIonChange={(e)=>setField("raw", e.detail.value!)} />
          </IonItem>*/}

          <div className="ion-padding">
            <IonButton expand="block" onClick={onSubmit} disabled={saving}>
              {saving ? "Guardando..." : "Guardar"}
            </IonButton>
            <IonButton expand="block" fill="clear" onClick={()=>history.goBack()}>
              Cancelar
            </IonButton>
          </div>
        </IonList>

        <IonToast isOpen={toast.open} message={toast.msg} duration={1400} onDidDismiss={()=>setToast({open:false,msg:""})}/>
      </IonContent>
    </IonPage>
  );
}

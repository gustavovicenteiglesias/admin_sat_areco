// src/modules/alertas-corto/CortoplazoForm.tsx
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonToast,
  IonToggle,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";
import { useEffect, useMemo, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import type { CortoPlazo } from "../types/cortoplazo";
import { cpGet, cpCreate, cpUpdateSmart } from "../data/cortoplazo.repo";
import imagen13m from "../assets/cortoplazo/13m.png";
import imagen14m from "../assets/cortoplazo/14m.png";
import imagen21m from "../assets/cortoplazo/21m.png";

type RouteParams = { id?: string };

const IMAGENES = ["13m.png", "14m.png", "21m.png"];
const IMAGEN_PREVIEW: Record<string, string> = {
  "13m.png": imagen13m,
  "14m.png": imagen14m,
  "21m.png": imagen21m,
};
const DURACIONES_H = [1, 2, 3]; // horas

const EMPTY: CortoPlazo = {
  id: 0,
  fecha: null,
  hora: null,
  titulo: null,
  contenido: null,
  imagen: null,
  duracion: 1, // default 1h en minutos
  estado: false,
};

export default function CortoplazoForm() {
  const { id } = useParams<RouteParams>();
  const editId = useMemo(() => (id ? parseInt(id, 10) : null), [id]);
  const history = useHistory();

  const [model, setModel] = useState<CortoPlazo>({ ...EMPTY });
  const [originalEstado, setOriginalEstado] = useState<boolean>(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; msg: string }>({
    open: false,
    msg: "",
  });

  useEffect(() => {
    if (!editId) {
      const now = new Date();
      setModel((m) => ({
        ...m,
        fecha: now.toISOString().slice(0, 10),
        hora: now.toTimeString().slice(0, 8),
        duracion: 60, // 1h
        imagen: IMAGENES[0],
      }));
      setOriginalEstado(false);
      return;
    }
    (async () => {
      const data = await cpGet(editId);
      setModel({
        ...data,
        fecha: data.fecha ?? new Date().toISOString().slice(0, 10),
        hora: data.hora ?? new Date().toTimeString().slice(0, 8),
        duracion: data.duracion ?? 60,
        imagen: data.imagen ?? IMAGENES[0],
        estado: !!data.estado,
      });
      setOriginalEstado(!!data.estado);
    })();
  }, [editId]);

  const setField = (k: keyof CortoPlazo, v: any) =>
    setModel((prev) => ({ ...prev, [k]: v }));

  const isValid = () =>
    !!model.fecha &&
    !!model.hora &&
    !!model.titulo &&
    !!model.contenido &&
    (model.duracion ?? 0) > 0;

  // helper para convertir hrs -> minutos
  const horasToMin = (h: number) => h * 60;

  const onSubmit = async () => {
    if (!isValid()) {
      setToast({
        open: true,
        msg: "Completá fecha, hora, título, contenido e imagen. Duración > 0",
      });
      return;
    }
    setSaving(true);
    try {
      const payload: Partial<CortoPlazo> = {
        fecha: model.fecha!,
        hora: model.hora!,
        titulo: model.titulo!,
        contenido: model.contenido!,
        imagen: model.imagen ?? undefined,
        duracion: model.duracion ?? 1, // 👈 en horas
        estado: !!model.estado,
      };

      if (editId) {
        // SOLO push si pasa de inactivo->activo
        await cpUpdateSmart(editId, payload, originalEstado, !!model.estado);
      } else {
        // En create: si viene activo, se envía push
        await cpCreate(payload, true);
      }

      const msg = editId
        ? !originalEstado && model.estado
          ? "Actualizado y push enviado"
          : "Actualizado (sin push)"
        : model.estado
        ? "Creado y push enviado"
        : "Creado (inactivo)";
      setToast({ open: true, msg });

      history.replace("/cortoplazo");
    } finally {
      setSaving(false);
    }
  };

  // valor controlado para el select de duración en HORAS
  const duracionHoras = Math.round((model.duracion ?? 60) / 60) || 1;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>{editId ? "Editar aviso" : "Nuevo aviso"}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonList>
          <IonItem>
            <IonLabel position="stacked">Fecha</IonLabel>
            <IonInput
              type="date"
              value={model.fecha ?? new Date().toISOString().slice(0, 10)}
              onIonChange={(e) => setField("fecha", e.detail.value!)}
              required
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Hora</IonLabel>
            <IonInput
              type="time"
              value={(
                model.hora ?? new Date().toTimeString().slice(0, 5)
              ).slice(0, 5)}
              onIonChange={(e) => {
                const hhmm = e.detail.value!;
                setField("hora", hhmm.length === 5 ? hhmm + ":00" : hhmm);
              }}
              required
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Título</IonLabel>
            <IonInput
              value={model.titulo ?? ""}
              onIonChange={(e) => setField("titulo", e.detail.value!)}
              required
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Contenido</IonLabel>
            <IonInput
              value={model.contenido ?? ""}
              onIonChange={(e) => setField("contenido", e.detail.value!)}
              required
            />
          </IonItem>

          {/* Imagen por SELECT */}
          <IonItem>
            <IonLabel position="stacked">Imagen</IonLabel>
            <IonSelect
              interface="popover"
              value={model.imagen ?? IMAGENES[0]}
              onIonChange={(e) => setField("imagen", e.detail.value)}
            >
              {IMAGENES.map((img) => (
                <IonSelectOption key={img} value={img}>
                  {img}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>

          {model.imagen && IMAGEN_PREVIEW[model.imagen] && (
            <IonItem>
              <IonLabel position="stacked">Vista previa</IonLabel>
              <img
                src={IMAGEN_PREVIEW[model.imagen]}
                alt={`Vista previa de ${model.imagen}`}
                style={{ width: 96, height: 96, objectFit: "contain", margin: "12px 0" }}
              />
            </IonItem>
          )}
          {/* Duración por SELECT (horas) */}
          <IonItem>
            <IonLabel position="stacked">Duración</IonLabel>
            <IonSelect
              interface="popover"
              value={model.duracion ?? 1}
              onIonChange={(e) =>
                setField("duracion", parseInt(e.detail.value, 10))
              }
            >
              <IonSelectOption value={1}>1 hora</IonSelectOption>
              <IonSelectOption value={2}>2 horas</IonSelectOption>
              <IonSelectOption value={3}>3 horas</IonSelectOption>
            </IonSelect>
          </IonItem>

          <IonItem>
            <IonLabel>Activo (enviar push al guardar)</IonLabel>
            <IonToggle
              checked={!!model.estado}
              onIonChange={(e) => setField("estado", e.detail.checked)}
            />
          </IonItem>

          <div className="ion-padding">
            <IonButton expand="block" onClick={onSubmit} disabled={saving}>
              {saving ? "Guardando..." : "Guardar"}
            </IonButton>
            <IonButton
              expand="block"
              fill="clear"
              onClick={() => history.goBack()}
            >
              Cancelar
            </IonButton>
          </div>
        </IonList>

        <IonToast
          isOpen={toast.open}
          message={toast.msg}
          duration={1400}
          onDidDismiss={() => setToast({ open: false, msg: "" })}
        />
      </IonContent>
    </IonPage>
  );
}

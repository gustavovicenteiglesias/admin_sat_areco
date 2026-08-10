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
  IonSelect,
  IonSelectOption,
} from "@ionic/react";
import { useEffect, useMemo, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import type { Situacion } from "../types/situacion";
import {
  situacionGet,
  situacionCreate,
  situacionUpdate,
} from "../data/situaciones.repo";

type RouteParams = { id?: string };

const ESTADOS = ["En baja", "Leve suba", "Estable"]; // ajustá a tus dominios
const COMP_PUERTAS = ["Abiertas", "Cerradas", "Parcial"];

const EMPTY: Situacion = {
  id: 0,
  hora: null,
  fecha: null,
  altura: null,
  situacion: null,
  estado_compuertas: null,
  estado_compuertas_porciento: null,
  updatedAt: null,
};

export default function SituacionForm() {
  const { id } = useParams<RouteParams>();
  const editId = useMemo(() => (id ? parseInt(id, 10) : null), [id]);
  const history = useHistory();

  const [model, setModel] = useState<Situacion>({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ open: boolean; msg: string }>({
    open: false,
    msg: "",
  });

  useEffect(() => {
    if (!editId) return;
    (async () => {
      const data = await situacionGet(editId);
      // normalizo a strings para inputs
      setModel({
        ...data,
        fecha: data.fecha ?? new Date().toISOString().slice(0, 10),
        hora: data.hora ?? new Date().toTimeString().slice(0, 8),
      });
    })();
  }, [editId]);

  // Handlers simples
  const setField = (k: keyof Situacion, v: any) =>
    setModel((prev) => ({ ...prev, [k]: v }));

  // Validación mínima
  const isValid = () => !!model.fecha && !!model.hora && model.altura !== null;

  const onSubmit = async () => {
    if (!isValid()) {
      setToast({ open: true, msg: "Completá fecha, hora y altura" });
      return;
    }
    setSaving(true);
    try {
      const payload: Partial<Situacion> = {
        fecha: model.fecha!,
        hora: model.hora!,
        altura: model.altura!,
        situacion: model.situacion ?? undefined,
        estado_compuertas: model.estado_compuertas ?? undefined,
        estado_compuertas_porciento:
          model.estado_compuertas_porciento ?? undefined,
        updatedAt: model.updatedAt ?? undefined,
      };
      if (editId) await situacionUpdate(editId, payload);
      else await situacionCreate(payload);
      setToast({ open: true, msg: "Guardado" });
      history.replace("/situacion");
    } finally {
      setSaving(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>{editId ? "Editar situación" : "Nueva situación"}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonList>
          {/* Fecha */}
          <IonItem>
            <IonLabel position="stacked">Fecha (YYYY-MM-DD)</IonLabel>
            <IonInput
              type="date"
              value={model.fecha ?? new Date().toISOString().slice(0, 10)}
              onIonInput={(e) =>
                setField("fecha", (e.detail.value ?? "") as any)
              }
              required
            />
          </IonItem>

          {/* Hora */}
          <IonItem>
            <IonLabel position="stacked">Hora (HH:mm)</IonLabel>
            <IonInput
              type="time"
              value={(
                model.hora ?? new Date().toTimeString().slice(0, 5)
              ).slice(0, 5)}
              onIonInput={(e) => {
                const hhmm = (e.detail.value ?? "") as string;
                if (!hhmm) {
                  setField("hora", null);
                  return;
                }
                setField("hora", hhmm.length === 5 ? hhmm + ":00" : hhmm);
              }}
              required
            />
          </IonItem>

          {/* Altura */}
          <IonItem>
            <IonLabel position="stacked">Altura (m)</IonLabel>
            <IonInput
              type="number"
              step="0.01"
              inputmode="decimal"
              value={model.altura ?? ""}
              onIonInput={(e) => {
                const raw = (e.detail.value ?? "") as string;
                if (raw.trim() === "") {
                  setField("altura", null);
                  return;
                }
                const n = Number(raw.replace(",", ".")); // por si el teclado mete coma
                setField("altura", Number.isFinite(n) ? n : null);
              }}
              required
            />
          </IonItem>

          {/* Estado (texto libre o select) */}
          <IonItem>
            <IonLabel position="stacked">Situación</IonLabel>
            <IonSelect
              interface="popover"
              value={model.situacion ?? ""}
              onIonChange={(e) => setField("situacion", e.detail.value)}
            >
              <IonSelectOption value="">(sin definir)</IonSelectOption>
              {ESTADOS.map((v) => (
                <IonSelectOption key={v} value={v}>
                  {v}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>

          {/* Comp. */}
          <IonItem>
            <IonLabel position="stacked">Estado compuertas</IonLabel>
            <IonSelect
              interface="popover"
              value={model.estado_compuertas ?? ""}
              onIonChange={(e) => setField("estado_compuertas", e.detail.value)}
            >
              <IonSelectOption value="">(sin definir)</IonSelectOption>
              {COMP_PUERTAS.map((v) => (
                <IonSelectOption key={v} value={v}>
                  {v}
                </IonSelectOption>
              ))}
            </IonSelect>
          </IonItem>

          {/* Porcentaje compuertas */}
          <IonItem>
            <IonLabel position="stacked">% compuertas (texto)</IonLabel>
            <IonInput
              value={model.estado_compuertas_porciento ?? ""}
              placeholder="Ej: 50%"
              onIonInput={(e) =>
                setField(
                  "estado_compuertas_porciento",
                  (e.detail.value ?? "") as any,
                )
              }
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

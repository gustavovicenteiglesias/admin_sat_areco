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
  IonTextarea,
  IonButton,
  IonToast,
  IonToggle,
  IonSelect,
  IonSelectOption,
} from "@ionic/react";
import { useEffect, useMemo, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import type { ComunicadoDTO, CategoriaComu } from "../types/comunicado";
import {
  comunicadoGet,
  comunicadoCreate,
  comunicadoUpdate,
  categoriasComuAll,
} from "../data/comunicados.repo";

type RouteParams = { id?: string };

const EMPTY: ComunicadoDTO = {
  idcomunicado: 0,
  fecha: "",
  hora: "",
  titulo: "",
  alerta: "",
  contenido: "",
  fuente: "",
  estado: true,
  idCategoria: 0,
};

export default function ComunicadoForm() {
  const { id } = useParams<RouteParams>();
  const editId = useMemo(() => (id ? parseInt(id, 10) : null), [id]);
  const history = useHistory();

  const [model, setModel] = useState<ComunicadoDTO>({ ...EMPTY });
  const [categorias, setCategorias] = useState<CategoriaComu[]>([]);
  const [saving, setSaving] = useState(false);
  const [pushMode, setPushMode] = useState<"none" | "default" | "sirena">("default");
  const [toast, setToast] = useState<{ open: boolean; msg: string }>({
    open: false,
    msg: "",
  });

  // cargar categorías + comunicado si edito
  useEffect(() => {
    (async () => {
      try {
        const cats = await categoriasComuAll();
        setCategorias(cats);

        if (editId) {
          const data = await comunicadoGet(editId);
          setModel({
            ...data,
            fecha: data.fecha ?? new Date().toISOString().slice(0, 10),
            hora: data.hora ?? new Date().toTimeString().slice(0, 8),
          });
        } else {
          const now = new Date();
          setModel((m) => ({
            ...m,
            fecha: now.toISOString().slice(0, 10),
            hora: now.toTimeString().slice(0, 8),
            estado: true,
            idCategoria: cats?.[0]?.idCategoria ?? 0,
          }));
        }
      } catch (e) {
        // opcional: manejo de error
      }
    })();
  }, [editId]);

  const setField = (k: keyof ComunicadoDTO, v: any) =>
    setModel((prev) => ({ ...prev, [k]: v }));

  const isValid = () =>
    !!model.fecha && !!model.hora && !!model.titulo && model.idCategoria > 0;

  const onSubmit = async () => {
    if (!isValid()) {
      setToast({ open: true, msg: "Completá fecha, hora, título y categoría" });
      return;
    }
    setSaving(true);
    try {
      const payload: Partial<ComunicadoDTO> = {
        fecha: model.fecha,
        hora: model.hora, // "HH:mm:ss"
        titulo: model.titulo,
        alerta: model.alerta ?? "",
        contenido: model.contenido ?? "",
        fuente: model.fuente ?? "",
        estado: !!model.estado,
        idCategoria: model.idCategoria, // 👈 Long en back
      };

      const sound = pushMode === "none" ? undefined : pushMode;
      if (editId) await comunicadoUpdate(editId, payload, sound);
      else await comunicadoCreate(payload, sound);

      setToast({ open: true, msg: "Guardado" });
      history.replace("/comunicados");
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
          <IonTitle>
            {editId ? "Editar comunicado" : "Nuevo comunicado"}
          </IonTitle>
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
          <IonInput
            type="time"
            value={(model.hora ?? new Date().toTimeString().slice(0, 5)).slice(0, 5)}
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
              value={model.titulo}
              onIonChange={(e) => setField("titulo", e.detail.value!)}
              required
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Alerta (opcional)</IonLabel>
            <IonInput
              value={model.alerta ?? ""}
              onIonChange={(e) => setField("alerta", e.detail.value!)}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Contenido</IonLabel>
            <IonTextarea
              autoGrow
              value={model.contenido ?? ""}
              onIonChange={(e) => setField("contenido", e.detail.value!)}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Fuente (opcional)</IonLabel>
            <IonInput
              value={model.fuente ?? ""}
              onIonChange={(e) => setField("fuente", e.detail.value!)}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Notificación al guardar</IonLabel>
            <IonSelect value={pushMode} onIonChange={(e) => setPushMode(e.detail.value)}>
              <IonSelectOption value="none">No enviar push</IonSelectOption>
              <IonSelectOption value="default">Push con sonido normal</IonSelectOption>
              <IonSelectOption value="sirena">Push con sirena</IonSelectOption>
            </IonSelect>
          </IonItem>          <IonItem>
          <IonLabel position="stacked">Tipo</IonLabel>
          <IonSelect
            interface="popover"
            value={model.idCategoria}
            onIonChange={(e) =>
              setField("idCategoria", parseInt(e.detail.value, 10))
            }
          >
            {categorias.map((c) => (
              <IonSelectOption key={c.idCategoria} value={c.idCategoria}>
                {c.nombre}
              </IonSelectOption>
            ))}
          </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel>Publicado</IonLabel>
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

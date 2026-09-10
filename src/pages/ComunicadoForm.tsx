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
import type { ChangeEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import type { ComunicadoDTO, CategoriaComu } from "../types/comunicado";
import {
  comunicadoGet,
  comunicadoCreate,
  comunicadoUpdate,
  comunicadoPush,
  comunicadoUploadImagen,
  comunicadoDeleteImagen,
  categoriasComuAll,
} from "../data/comunicados.repo";
import { URL_API } from "../service/constantes";

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
  const [imagen, setImagen] = useState<File | null>(null);
  const [quitarImagen, setQuitarImagen] = useState(false);
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

  const normalizar = (valor?: string | null) =>
    (valor ?? "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase();

  const categoriaSeleccionada = categorias.find((c) => c.idCategoria === model.idCategoria);
  const esCategoriaImagen = normalizar(categoriaSeleccionada?.nombre) === "IMAGEN";
  const imagenActualUrl = editId && model.tieneImagen
    ? `${URL_API}/v1/comunicados/${editId}/imagen?v=${editId}`
    : "";

  const onImagenChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) {
      setImagen(null);
      return;
    }
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setToast({ open: true, msg: "Usá una imagen PNG, JPG o WEBP" });
      event.target.value = "";
      setImagen(null);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setToast({ open: true, msg: "La imagen puede pesar como máximo 5 MB" });
      event.target.value = "";
      setImagen(null);
      return;
    }
    setQuitarImagen(false);
    setImagen(file);
  };

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

      const saved = editId
        ? await comunicadoUpdate(editId, payload)
        : await comunicadoCreate(payload);

      if (quitarImagen && saved.idcomunicado) {
        await comunicadoDeleteImagen(saved.idcomunicado);
      }
      if (imagen && saved.idcomunicado) {
        await comunicadoUploadImagen(saved.idcomunicado, imagen);
      }
      if (pushMode !== "none" && saved.estado) {
        await comunicadoPush(saved.idcomunicado, pushMode);
      }

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
          {esCategoriaImagen && (
            <IonItem lines="full">
              <IonLabel position="stacked">Imagen del comunicado</IonLabel>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={onImagenChange}
                style={{ marginTop: 12, marginBottom: 12 }}
              />
              {imagen && (
                <p style={{ margin: "4px 0 12px" }}>
                  Nueva imagen: <strong>{imagen.name}</strong>
                </p>
              )}
              {!imagen && imagenActualUrl && !quitarImagen && (
                <div style={{ margin: "12px 0", width: "100%" }}>
                  <p style={{ margin: "0 0 8px" }}>
                    Imagen actual: <strong>{model.imagenNombre ?? "comunicado"}</strong>
                  </p>
                  <img
                    src={imagenActualUrl}
                    alt="Imagen actual del comunicado"
                    style={{ display: "block", maxWidth: 260, width: "100%", borderRadius: 8 }}
                  />
                  <IonButton
                    size="small"
                    fill="outline"
                    color="danger"
                    style={{ marginTop: 8 }}
                    onClick={() => setQuitarImagen(true)}
                  >
                    Quitar imagen
                  </IonButton>
                </div>
              )}
              {quitarImagen && (
                <p style={{ margin: "4px 0 12px", color: "var(--ion-color-danger)" }}>
                  La imagen actual se eliminará al guardar.
                </p>
              )}
            </IonItem>
          )}
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

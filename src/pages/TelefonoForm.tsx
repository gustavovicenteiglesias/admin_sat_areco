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
  IonSelect,
  IonSelectOption,
  IonToggle,
  IonButton,
  IonToast,
} from "@ionic/react";
import { useEffect, useMemo, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import type { Telefono } from "../types/telefono";
import {
  telefonoGet,
  telefonoCreate,
  telefonoUpdate,
} from "../data/telefonos.repo";

type RouteParams = { id?: string };

const EMPTY: Telefono = {
  numero: parseInt("0"),
  tipo: "",
  descripcion: "",
  estado: true,
  orden: null,
};

export default function TelefonoForm() {
  const { id } = useParams<RouteParams>();
  const editId = useMemo(() => (id ? parseInt(id, 10) : null), [id]);
  const history = useHistory();

  const [model, setModel] = useState<Telefono>({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{
    open: boolean;
    msg: string;
    color?: string;
  }>({ open: false, msg: "" });

  useEffect(() => {
    if (!editId) return;
    (async () => {
      try {
        const data = await telefonoGet(editId);
        setModel(data);
      } catch {
        setToast({
          open: true,
          msg: "Error al cargar teléfono",
          color: "danger",
        });
      }
    })();
  }, [editId]);

  const setField = (k: keyof Telefono, v: any) =>
    setModel((prev) => ({ ...prev, [k]: v }));

  const isValid = () => !!model.numero && !!model.descripcion;

  const onSubmit = async () => {
    if (!isValid()) {
      setToast({
        open: true,
        msg: "Completá número y descripción",
        color: "warning",
      });
      return;
    }
    setSaving(true);
    try {
      const payload: Partial<Telefono> = {
        numero: model.numero,
        tipo: model.tipo ?? "",
        descripcion: model.descripcion ?? "",
        estado: model.estado ?? true,
        orden: model.orden ?? null,
      };

      if (editId) {
        await telefonoUpdate(editId, payload);
      } else {
        await telefonoCreate(payload);
      }

      setToast({
        open: true,
        msg: editId ? "Actualizado correctamente" : "Creado correctamente",
        color: "success",
      });
      history.replace("/telefonos");
    } catch {
      setToast({ open: true, msg: "Error al guardar", color: "danger" });
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
          <IonTitle>{editId ? "Editar teléfono" : "Nuevo teléfono"}</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonList>
          <IonItem>
            <IonLabel position="stacked">Descripción</IonLabel>
            <IonInput
              value={model.descripcion ?? ""}
              onIonInput={(e) => setField("descripcion", e.detail.value!)}
              required
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Número</IonLabel>
            <IonInput
              type="tel"
              value={model.numero == null ? "" : String(model.numero)}
              onIonInput={(e) => {
                const raw = e.detail.value ?? "";
                const digits = raw.replace(/\D/g, ""); // solo dígitos
                // elegí null o 0 según tu validación
                setField("numero", digits === "" ? null : parseInt(digits, 10));
              }}
              inputmode="numeric"
            />
          </IonItem>

          <IonItem>
            <IonLabel position="stacked">Tipo</IonLabel>
            <IonSelect
              interface="popover"
              value={model.tipo ?? ""}
              onIonChange={(e) => setField("tipo", e.detail.value)}
            >
              <IonSelectOption value="">—</IonSelectOption>
              <IonSelectOption value="Fijo">Fijo</IonSelectOption>
              <IonSelectOption value="Celular">Celular</IonSelectOption>
              <IonSelectOption value="Interno">Interno</IonSelectOption>
              <IonSelectOption value="Emergencia">Emergencia</IonSelectOption>
            </IonSelect>
          </IonItem>

          <IonItem>
            <IonLabel>Activo</IonLabel>
            <IonToggle
              checked={!!model.estado}
              onIonChange={(e) => {
                console.log(e.detail.checked);
                setField("estado", e.detail.checked);
              }}
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
          color={toast.color}
          duration={1400}
          onDidDismiss={() => setToast({ open: false, msg: "" })}
        />
      </IonContent>
    </IonPage>
  );
}

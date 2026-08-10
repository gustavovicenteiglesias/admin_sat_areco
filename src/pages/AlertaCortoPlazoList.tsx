import {
  IonPage, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle,
  IonContent, IonButton, IonIcon, IonList, IonItem, IonLabel, IonBadge,
  IonNote, IonRefresher, IonRefresherContent, IonSpinner, IonAlert
} from "@ionic/react";
import { addOutline, createOutline, trashOutline, timeOutline } from "ionicons/icons";
import { useEffect, useState, useCallback } from "react";
import { useHistory } from "react-router-dom";
import type { CortoPlazo } from "../types/cortoplazo";
import { cpVigentes, cpDelete } from "../data/cortoplazo.repo";

function fmtFecha(s?: string | null) {
  if (!s) return "-";
  const [y, m, d] = s.split("-");
  return `${d}/${m}/${y}`;
}
function fmtHora(h?: string | null) { return h?.slice(0,5) ?? "-"; }

export default function CortoplazoList() {
  const history = useHistory();
  const [items, setItems] = useState<CortoPlazo[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<CortoPlazo | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    try {
      setLoading(true);
      const data = await cpVigentes();
      // opcional: ordenar por fecha/hora desc
      data.sort((a, b) => `${b.fecha} ${b.hora}`.localeCompare(`${a.fecha} ${a.hora}`));
      setItems(data);
    } catch (e: any) {
      setErr(e?.message ?? "Error al cargar");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!toDelete) return;
    await cpDelete(toDelete.id);
    setToDelete(null);
    load();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start"><IonMenuButton /></IonButtons>
          <IonTitle>Alertas (corto plazo) — Vigentes</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => history.push("/cortoplazo/new")}>
              <IonIcon icon={addOutline} slot="start" />Nuevo
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={async (e) => { await load(); e.detail.complete(); }}>
          <IonRefresherContent />
        </IonRefresher>

        {loading && <div className="ion-text-center ion-padding"><IonSpinner /></div>}
        {err && <p className="ion-padding">{err}</p>}

        <IonList>
          {items.map(a => (
            <IonItem key={a.id} lines="full">
              <IonLabel onClick={() => history.push(`/cortoplazo/${a.id}`)}>
                <h2>
                  {fmtFecha(a.fecha)}&nbsp;
                  <IonBadge color="medium"><IonIcon icon={timeOutline} />&nbsp;{fmtHora(a.hora)}</IonBadge>
                </h2>
                <IonNote>Duración: {a.duracion} {a.duracion === 1 ? "hora" : "horas"}</IonNote>
                <p><strong>{a.titulo}</strong></p>
                <p>{a.contenido}</p>
                {a.imagen && <IonNote>Imagen: {a.imagen}</IonNote>}
              </IonLabel>

              <IonButton fill="clear" onClick={() => history.push(`/cortoplazo/${a.id}`)}>
                <IonIcon icon={createOutline} />
              </IonButton>
              <IonButton fill="clear" color="danger" onClick={() => setToDelete(a)}>
                <IonIcon icon={trashOutline} />
              </IonButton>
            </IonItem>
          ))}
        </IonList>

        <IonAlert
          isOpen={!!toDelete}
          onDidDismiss={() => setToDelete(null)}
          header="Eliminar aviso"
          message={`¿Eliminar "${toDelete?.titulo}" del ${fmtFecha(toDelete?.fecha)} ${fmtHora(toDelete?.hora)}?`}
          buttons={[
            { text: "Cancelar", role: "cancel" },
            { text: "Eliminar", role: "destructive", handler: handleDelete },
          ]}
        />
      </IonContent>
    </IonPage>
  );
}

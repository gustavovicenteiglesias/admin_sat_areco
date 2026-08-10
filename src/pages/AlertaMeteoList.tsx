import {
  IonPage, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle,
  IonContent, IonButton, IonIcon, IonList, IonItem, IonLabel, IonBadge,
  IonNote, IonRefresher, IonRefresherContent, IonSpinner, IonAlert
} from "@ionic/react";
import { addOutline, createOutline, trashOutline, timeOutline } from "ionicons/icons";
import { useEffect, useState, useCallback } from "react";
import { useHistory } from "react-router-dom";
import type { AlertaMeteo } from "../types/alertaMeteo";
import { meteoVigentes, meteoDelete } from "../data/alertaMeteo.repo";

function fmtFecha(s?: string) { if (!s) return "-"; const [y,m,d]=s.split("-"); return `${d}/${m}/${y}`; }
function fmtHora(h?: string) { return h?.slice(0,5) ?? "-"; }
function colorTipo(t?: string) {
  switch (t) {
    case "ROJO": return "danger";
    case "NARANJA": return "warning";
    default: return "tertiary"; // AMARILLO
  }
}

export default function AlertaMeteoList() {
  const history = useHistory();
  const [items, setItems] = useState<AlertaMeteo[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<AlertaMeteo | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    try {
      setLoading(true);
      const data = await meteoVigentes();
      data.sort((a,b) => `${b.fecha} ${b.hora}`.localeCompare(`${a.fecha} ${a.hora}`));
      setItems(data);
    } catch (e: any) {
      setErr(e?.message ?? "Error al cargar");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    if (!toDelete) return;
    await meteoDelete(toDelete.id);
    setToDelete(null);
    load();
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start"><IonMenuButton /></IonButtons>
          <IonTitle>Alertas meteorológicas — Vigentes</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => history.push("/alertameteorologica/new")}>
              <IonIcon slot="start" icon={addOutline} />Nuevo
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={async (e)=>{ await load(); e.detail.complete(); }}>
          <IonRefresherContent />
        </IonRefresher>

        {loading && <div className="ion-text-center ion-padding"><IonSpinner /></div>}
        {err && <p className="ion-padding">{err}</p>}

        <IonList>
          {items.map(a => (
            <IonItem key={a.id} lines="full">
              <IonLabel onClick={() => history.push(`/alertameteorologica/${a.id}`)}>
                <h2>
                  {fmtFecha(a.fecha)}&nbsp;
                  <IonBadge color="medium"><IonIcon icon={timeOutline} />&nbsp;{fmtHora(a.hora)}</IonBadge>
                  &nbsp;
                  <IonBadge color={colorTipo(a.tipo)}>{a.tipo}</IonBadge>
                </h2>
                <p><strong>{a.titulo}</strong>{a.zona ? ` — ${a.zona}` : ""}</p>
                {a.situacion && <IonNote>{a.situacion}</IonNote>}
              </IonLabel>

              <IonButton fill="clear" onClick={() => history.push(`/alertameteorologica/${a.id}`)}>
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
          header="Eliminar alerta"
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

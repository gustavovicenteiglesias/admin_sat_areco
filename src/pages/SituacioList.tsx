// src/modules/situacion/SituacionList.tsx
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonContent,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonBadge,
  IonNote,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonAlert,
} from "@ionic/react";
import {
  addOutline,
  createOutline,
  trashOutline,
  timeOutline,
} from "ionicons/icons";
import { useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import type { Situacion } from "../types/situacion";
import { situacionesPaged, situacionDelete } from "../data/situaciones.repo";
import { IonToggle } from "@ionic/react";
import { getRioEnabled, putRioEnabled } from "../data/settings.repo";

function fmtFecha(s?: string | null) {
  if (!s) return "-";
  const [y, m, d] = s.split("-");
  return `${d}/${m}/${y}`;
}
function fmtHora(h?: string | null) {
  return h?.slice(0, 5) ?? "-";
}

export default function SituacionList() {
  const history = useHistory();
  const [items, setItems] = useState<Situacion[]>([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Situacion | null>(null);
  const [rioEnabled, setRioEnabled] = useState<boolean>(true);
  const [rioBusy, setRioBusy] = useState<boolean>(false);

  const fetchPage = useCallback(
    async (reset = false) => {
      setErr(null);
      try {
        setLoading(reset ? true : false);
        const nextPage = reset ? 0 : page;
        const resp = await situacionesPaged({
          page: nextPage,
          size,
          sort: "updatedAt",
          dir: "DESC",
        });
        setHasMore(!resp.last && resp.content.length > 0);
        setPage(nextPage + 1);
        setItems((prev) => (reset ? resp.content : [...prev, ...resp.content]));
      } catch (e: any) {
        setErr(e?.message ?? "Error al cargar");
      } finally {
        setLoading(false);
      }
    },
    [page, size]
  );

  useEffect(() => {
    (async () => {
      try {
        const enabled = await getRioEnabled();
        setRioEnabled(enabled);
      } catch {
        // silencioso: no bloquea la vista
      }
    })();
  }, []);

  useEffect(() => {
    fetchPage(true);
  }, []); // primera carga

  const onRefresh = async (e: CustomEvent) => {
    setPage(0);
    await fetchPage(true);
    (e.target as HTMLIonRefresherElement).complete();
  };

  const onLoadMore = async (e: CustomEvent<void>) => {
    if (!hasMore) {
      (e.target as HTMLIonInfiniteScrollElement).disabled = true;
      return;
    }
    await fetchPage(false);
    (e.target as HTMLIonInfiniteScrollElement).complete();
  };

  const handleDelete = async () => {
    if (!toDelete) return;
    await situacionDelete(toDelete.id);
    setToDelete(null);
    setPage(0);
    fetchPage(true);
  };
  const onToggleRio = async (checked: boolean) => {
    setRioBusy(true);
    try {
      await putRioEnabled(checked);
      setRioEnabled(checked);
    } catch (e) {
      // rollback visual
      setRioEnabled((prev) => prev);
      alert("No se pudo cambiar el estado de la ingesta del río");
    } finally {
      setRioBusy(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Situación (río)</IonTitle>
          <IonButtons slot="end">
            {/* Toggle ingesta río */}
            <IonItem lines="none">
              <IonLabel className="ion-text-wrap">Río</IonLabel>
              <IonToggle
                checked={rioEnabled}
                disabled={rioBusy}
                onIonChange={(e) => onToggleRio(e.detail.checked)}
              />
            </IonItem>

            {/* Nuevo */}
            <IonButton onClick={() => history.push("/situacion/new")}>
              <IonIcon icon={addOutline} slot="start" />
              Nuevo
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={onRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {loading && (
          <div className="ion-text-center ion-padding">
            <IonSpinner />
          </div>
        )}
        {err && <p className="ion-padding">{err}</p>}

        <IonList>
          {items.map((s) => (
            <IonItem key={s.id} lines="full">
              <IonLabel onClick={() => history.push(`/situacion/${s.id}`)}>
                <h2>
                  {fmtFecha(s.fecha)}&nbsp;
                  <IonBadge color="medium">
                    <IonIcon icon={timeOutline} />
                    &nbsp;{fmtHora(s.hora)}
                  </IonBadge>
                </h2>
                <p>
                  Altura: <strong>{s.altura ?? "-"}</strong> m · Estado:{" "}
                  {s.situacion ?? "-"} · &nbsp;Comp.:{" "}
                  {s.estado_compuertas ?? "-"} (
                  {s.estado_compuertas_porciento ?? "-"})
                </p>
                {s.updatedAt && (
                  <IonNote>
                    Actualizado: {new Date(s.updatedAt).toLocaleString()}
                  </IonNote>
                )}
              </IonLabel>

              <IonButton
                fill="clear"
                onClick={() => history.push(`/situacion/${s.id}`)}
              >
                <IonIcon icon={createOutline} />
              </IonButton>
              <IonButton
                fill="clear"
                color="danger"
                onClick={() => setToDelete(s)}
              >
                <IonIcon icon={trashOutline} />
              </IonButton>
            </IonItem>
          ))}
        </IonList>

        <IonInfiniteScroll
          threshold="100px"
          disabled={!hasMore}
          onIonInfinite={onLoadMore}
        >
          <IonInfiniteScrollContent
            loadingSpinner="bubbles"
            loadingText="Cargando más..."
          />
        </IonInfiniteScroll>

        <IonAlert
          isOpen={!!toDelete}
          onDidDismiss={() => setToDelete(null)}
          header="Eliminar registro"
          message={`¿Eliminar la situación del ${fmtFecha(
            toDelete?.fecha
          )} ${fmtHora(toDelete?.hora)}?`}
          buttons={[
            { text: "Cancelar", role: "cancel" },
            { text: "Eliminar", role: "destructive", handler: handleDelete },
          ]}
        />
      </IonContent>
    </IonPage>
  );
}

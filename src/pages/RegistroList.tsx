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
  IonBadge,
  IonNote,
  IonButton,
  IonIcon,
  IonSpinner,
  IonAlert,
  IonRefresher,
  IonRefresherContent,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
} from "@ionic/react";
import {
  addOutline,
  createOutline,
  trashOutline,
  timeOutline,
} from "ionicons/icons";
import { useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import type { Registro } from "../types/registro";
import { registrosPaged, registroDelete } from "../data/registros.repo";
import { IonToggle } from "@ionic/react";
import { getLluviaEnabled, putLluviaEnabled } from "../data/settings.repo";

function fmtFecha(s?: string) {
  if (!s) return "-";
  const [y, m, d] = s.split("-");
  return `${d}/${m}/${y}`;
}
function fmtHora(h?: string) {
  return h?.slice(0, 5) ?? "-";
}

export default function RegistroList() {
  const history = useHistory();

  const [items, setItems] = useState<Registro[]>([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<Registro | null>(null);
  const [lluviaEnabled, setLluviaEnabled] = useState<boolean>(true);
  const [lluviaBusy, setLluviaBusy] = useState<boolean>(false);

  const fetchPage = useCallback(
    async (reset = false) => {
      setErr(null);
      try {
        setLoading(reset ? true : false);
        const next = reset ? 0 : page;
        const resp = await registrosPaged({ page: next, size });
        setHasMore(!resp.last && resp.content.length > 0);
        setPage(next + 1);
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
        const enabled = await getLluviaEnabled();
        setLluviaEnabled(enabled);
      } catch {
        // no bloquea la pantalla
      }
    })();
  }, []);

  useEffect(() => {
    fetchPage(true);
  }, []); // inicial

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
    await registroDelete(toDelete.id);
    setToDelete(null);
    setPage(0);
    fetchPage(true);
  };
  const onToggleLluvia = async (checked: boolean) => {
    setLluviaBusy(true);
    try {
      await putLluviaEnabled(checked);
      setLluviaEnabled(checked);
    } catch (e) {
      alert("No se pudo cambiar el estado de la ingesta de lluvia");
    } finally {
      setLluviaBusy(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Registros de lluvia</IonTitle>
          <IonButtons slot="end">
            {/* Toggle ingesta lluvia */}
            <IonItem lines="none">
              <IonLabel>Lluvia</IonLabel>
              <IonToggle
                checked={lluviaEnabled}
                disabled={lluviaBusy}
                onIonChange={(e) => onToggleLluvia(e.detail.checked)}
              />
            </IonItem>

            {/* Nuevo */}
            <IonButton onClick={() => history.push("/registros/new")}>
              <IonIcon slot="start" icon={addOutline} />
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
          {items.map((r) => (
            <IonItem key={r.id} lines="full">
              <IonLabel onClick={() => history.push(`/registros/${r.id}`)}>
                <h2>
                  {fmtFecha(r.fecha)} &nbsp;
                  <IonBadge color="medium">
                    <IonIcon icon={timeOutline} />
                    &nbsp;{fmtHora(r.hora)}
                  </IonBadge>
                </h2>
                <p>
                  Hoy: <strong>{r.lluvia_hoy ?? "-"}</strong> mm · Ayer:{" "}
                  {r.lluvia_ayer ?? "-"} · Mes: {r.lluvia_mes ?? "-"} · Año:{" "}
                  {r.lluvia_ano ?? "-"}
                </p>
                {(r.idEstacion || r.source) && (
                  <IonNote>
                    {r.idEstacion ?? ""}
                    {r.idEstacion && r.source ? " · " : ""}
                    {r.source ?? ""}
                  </IonNote>
                )}
              </IonLabel>

              <IonButton
                fill="clear"
                onClick={() => history.push(`/registros/${r.id}`)}
              >
                <IonIcon icon={createOutline} />
              </IonButton>
              <IonButton
                fill="clear"
                color="danger"
                onClick={() => setToDelete(r)}
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
          message={`¿Eliminar el registro del ${fmtFecha(
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

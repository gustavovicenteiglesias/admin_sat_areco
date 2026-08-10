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
import type { ComunicadoDTO } from "../types/comunicado";
import { comunicadosPaged, comunicadoDelete } from "../data/comunicados.repo";

function fmtFecha(s?: string) {
  if (!s) return "-";
  const [y, m, d] = s.split("-");
  return `${d}/${m}/${y}`;
}
function fmtHora(h?: string) {
  return h?.slice(0, 5) ?? "-";
}

export default function ComunicadosList() {
  const history = useHistory();

  const [items, setItems] = useState<ComunicadoDTO[]>([]);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<ComunicadoDTO | null>(null);

  const fetchPage = useCallback(
    async (reset = false) => {
      setErr(null);
      try {
        setLoading(reset ? true : false);
        const nextPage = reset ? 0 : page;
        const resp = await comunicadosPaged({ page: nextPage, size,sort:"fecha,desc" });
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
    await comunicadoDelete(toDelete.idcomunicado);
    setToDelete(null);
    setPage(0);
    fetchPage(true);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Comunicados</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => history.push("/comunicados/new")}>
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
          {items.map((c) => (
            <IonItem key={c.idcomunicado} lines="full">
              <IonLabel
                onClick={() => history.push(`/comunicados/${c.idcomunicado}`)}
              >
                <h2>
                  {fmtFecha(c.fecha)}&nbsp;
                  <IonBadge color={c.estado ? "success" : "medium"}>
                    {c.estado ? "Publicado" : "Borrador"}
                  </IonBadge>
                  &nbsp;
                  <IonBadge color="medium">
                    <IonIcon icon={timeOutline} />
                    &nbsp;{fmtHora(c.hora)}
                  </IonBadge>
                </h2>
                <p>
                  <strong>{c.titulo}</strong>
                  {c.alerta ? ` — ${c.alerta}` : ""}
                </p>
                
                {c.categoriaColorP && (
                  <span
                    style={{
                      display: "inline-block",
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      background: c.categoriaColorP,
                      marginLeft: 8,
                    }}
                  />
                )}
              </IonLabel>

              <IonButton
                fill="clear"
                onClick={() => history.push(`/comunicados/${c.idcomunicado}`)}
              >
                <IonIcon icon={createOutline} />
              </IonButton>
              <IonButton
                fill="clear"
                color="danger"
                onClick={() => setToDelete(c)}
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
          header="Eliminar comunicado"
          message={`¿Eliminar "${toDelete?.titulo}" del ${fmtFecha(
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

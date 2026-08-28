import {
  IonAlert, IonBadge, IonButton, IonButtons, IonContent, IonHeader, IonIcon,
  IonItem, IonLabel, IonList, IonMenuButton, IonPage, IonSpinner, IonTitle,
  IonToast, IonToolbar,
} from "@ionic/react";
import { addOutline, createOutline, layersOutline, trashOutline } from "ionicons/icons";
import { useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { mapaDelete, mapasList } from "../data/mapas.repo";
import type { MapaCapa } from "../types/mapaCapa";

export default function MapaCapasList() {
  const history = useHistory();
  const [items, setItems] = useState<MapaCapa[]>([]);
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState<MapaCapa | null>(null);
  const [toast, setToast] = useState({ open: false, msg: "", color: "" });

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await mapasList()); }
    catch (e: any) { setToast({ open: true, msg: e?.response?.data?.message ?? "No se pudieron cargar las capas", color: "danger" }); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const remove = async () => {
    if (!toDelete?.id) return;
    try {
      await mapaDelete(toDelete.id);
      setToast({ open: true, msg: "Capa eliminada", color: "success" });
      await load();
    } catch { setToast({ open: true, msg: "No se pudo eliminar", color: "danger" }); }
    finally { setToDelete(null); }
  };

  return <IonPage>
    <IonHeader><IonToolbar>
      <IonButtons slot="start"><IonMenuButton /></IonButtons>
      <IonTitle>SAT Mapas</IonTitle>
      <IonButtons slot="end"><IonButton onClick={() => history.push("/mapas/new")}><IonIcon icon={addOutline} slot="start" />Nueva capa</IonButton></IonButtons>
    </IonToolbar></IonHeader>
    <IonContent>
      {loading && <div className="ion-text-center ion-padding"><IonSpinner /></div>}
      {!loading && items.length === 0 && <div className="ion-padding ion-text-center"><IonIcon icon={layersOutline} size="large" /><p>Todavía no hay capas cargadas.</p></div>}
      <IonList>{items.map(item => <IonItem key={item.id}>
        <span slot="start" style={{ width: 18, height: 18, borderRadius: 4, background: item.color }} />
        <IonLabel><h2>{item.nombre}</h2><p>{item.grupo || "Sin grupo"} · {item.nombreArchivoMapa}</p></IonLabel>
        <IonBadge color={item.publicado ? "success" : "medium"}>{item.publicado ? "Publicada" : "Borrador"}</IonBadge>
        {!!item.archivos?.length && <IonBadge color="tertiary" className="ion-margin-start">{item.archivos.length} archivo(s)</IonBadge>}
        <IonButton fill="clear" onClick={() => history.push(`/mapas/${item.id}`)}><IonIcon icon={createOutline} /></IonButton>
        <IonButton fill="clear" color="danger" onClick={() => setToDelete(item)}><IonIcon icon={trashOutline} /></IonButton>
      </IonItem>)}</IonList>
      <IonAlert isOpen={!!toDelete} onDidDismiss={() => setToDelete(null)} header="Eliminar capa"
        message={`¿Eliminar “${toDelete?.nombre}”?`} buttons={[{ text: "Cancelar", role: "cancel" }, { text: "Eliminar", role: "destructive", handler: remove }]} />
      <IonToast isOpen={toast.open} message={toast.msg} color={toast.color} duration={1800} onDidDismiss={() => setToast({ open: false, msg: "", color: "" })} />
    </IonContent>
  </IonPage>;
}

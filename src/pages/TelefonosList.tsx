import {
  IonPage, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle,
  IonContent, IonList, IonItem, IonLabel, IonButton, IonIcon,
  IonSpinner, IonRefresher, IonRefresherContent, IonToast, IonReorder,
  IonReorderGroup, IonAlert
} from "@ionic/react";
import { addOutline, createOutline, trashOutline, reorderThreeOutline, callOutline } from "ionicons/icons";
import { useEffect, useState, useCallback } from "react";
import { useHistory } from "react-router-dom";
import type { Telefono } from "../types/telefono";
import {
  telefonosList,
  telefonoDelete,
  telefonosUpdateOrdenBatch
} from "../data/telefonos.repo";

export default function TelefonosList() {
  const history = useHistory();
  const [items, setItems] = useState<Telefono[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{open:boolean; msg:string; color?:string}>({open:false,msg:""});
  const [toDelete, setToDelete] = useState<Telefono | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await telefonosList();
      setItems(data);
    } catch (e: any) {
      setToast({ open:true, msg:e?.message ?? "Error al cargar", color:"danger" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // --- reindexar orden 1..N antes de enviar
  const normalizeOrden = (arr: Telefono[]): Telefono[] =>
    arr.map((t, i) => ({ ...t, orden: i + 1 }));

  const handleReorder = async (event: CustomEvent) => {
    const from = event.detail.from;
    const to = event.detail.to;
    const updated = [...items];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    const reindexed = normalizeOrden(updated);
    event.detail.complete(reindexed);
    setItems(reindexed);
    try {
      await telefonosUpdateOrdenBatch(reindexed.map(t => ({ id: t.id!, orden: t.orden! })));
      setToast({ open:true, msg:"Orden actualizado", color:"success" });
    } catch {
      setToast({ open:true, msg:"Error al guardar orden", color:"danger" });
      await load();
    }
  };

  const handleDelete = async () => {
    if (!toDelete?.id) return;
    try {
      await telefonoDelete(toDelete.id);
      setToast({ open:true, msg:"Eliminado correctamente", color:"success" });
      await load();
    } catch {
      setToast({ open:true, msg:"Error al eliminar", color:"danger" });
    } finally {
      setToDelete(null);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start"><IonMenuButton /></IonButtons>
          <IonTitle>Teléfonos útiles</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => history.push("/telefonos/new")}>
              <IonIcon icon={addOutline} slot="start" />
              Nuevo
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={async (e) => { await load(); e.detail.complete(); }}>
          <IonRefresherContent />
        </IonRefresher>

        {loading && <div className="ion-text-center ion-padding"><IonSpinner /></div>}

        {!loading && (
          <IonList>
            <IonReorderGroup disabled={false} onIonItemReorder={handleReorder}>
              {items.map(t => (
                <IonItem key={t.id}>
                  <IonReorder slot="start">
                    <IonIcon icon={reorderThreeOutline} />
                  </IonReorder>

                  <IonIcon slot="start" icon={callOutline} color="success" />

                  <IonLabel onClick={() => history.push(`/telefonos/${t.id}`)}>
                    <h2>{t.descripcion ?? "—"}</h2>
                    <p>{t.numero}</p>
                  </IonLabel>

                  <IonButton fill="clear" onClick={() => history.push(`/telefonos/${t.id}`)}>
                    <IonIcon icon={createOutline} />
                  </IonButton>
                  <IonButton fill="clear" color="danger" onClick={() => setToDelete(t)}>
                    <IonIcon icon={trashOutline} />
                  </IonButton>
                </IonItem>
              ))}
            </IonReorderGroup>
          </IonList>
        )}

        <IonAlert
          isOpen={!!toDelete}
          onDidDismiss={() => setToDelete(null)}
          header="Eliminar teléfono"
          message={`¿Eliminar "${toDelete?.descripcion}" (${toDelete?.numero})?`}
          buttons={[
            { text: "Cancelar", role: "cancel" },
            { text: "Eliminar", role: "destructive", handler: handleDelete },
          ]}
        />

        <IonToast
          isOpen={toast.open}
          message={toast.msg}
          color={toast.color}
          duration={1600}
          onDidDismiss={() => setToast({open:false,msg:""})}
        />
      </IonContent>
    </IonPage>
  );
}

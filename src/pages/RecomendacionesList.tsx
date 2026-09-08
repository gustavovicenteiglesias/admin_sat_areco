import { IonBadge, IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonMenuButton, IonNote, IonPage, IonTitle, IonToolbar } from "@ionic/react";
import { addOutline, createOutline, trashOutline } from "ionicons/icons";
import { useEffect, useState } from "react";
import { recomendacionesList, recomendacionDelete } from "../data/recomendaciones.repo";
import type { Recomendacion } from "../types/recomendacion";

export default function RecomendacionesList() {
  const [items, setItems] = useState<Recomendacion[]>([]);
  const [error, setError] = useState("");
  const cargar = async () => {
    try {
      setItems(await recomendacionesList());
      setError("");
    } catch (e: any) {
      setError(e?.response?.data?.message ?? "No se pudieron cargar las recomendaciones");
    }
  };
  useEffect(() => { void cargar(); }, []);
  return <IonPage><IonHeader><IonToolbar><IonButtons slot="start"><IonMenuButton /></IonButtons><IonTitle>Recomendaciones</IonTitle><IonButtons slot="end"><IonButton routerLink="/recomendaciones/new"><IonIcon icon={addOutline} /> Nueva</IonButton></IonButtons></IonToolbar></IonHeader>
    <IonContent>{error && <IonNote color="danger" className="ion-padding ion-display-block">{error}</IonNote>}<IonList>{items.map(item => <IonItem key={item.id}>
      <IonLabel><h2>{item.titulo}</h2><p>{item.resumen}</p><p>Prioridad {item.prioridad} · Orden {item.orden}</p></IonLabel>
      <IonBadge color={item.publicado ? "success" : "medium"}>{item.publicado ? "Publicada" : "Borrador"}</IonBadge>
      <IonButton fill="clear" routerLink={`/recomendaciones/${item.id}`}><IonIcon icon={createOutline} /></IonButton>
      <IonButton fill="clear" color="danger" onClick={async () => { if (confirm(`¿Eliminar ${item.titulo}?`)) { await recomendacionDelete(item.id!); cargar(); } }}><IonIcon icon={trashOutline} /></IonButton>
    </IonItem>)}</IonList></IonContent></IonPage>;
}

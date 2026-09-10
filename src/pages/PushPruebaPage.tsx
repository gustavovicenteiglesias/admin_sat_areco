import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonMenuButton,
  IonNote,
  IonPage,
  IonSpinner,
  IonTextarea,
  IonTitle,
  IonToast,
  IonToggle,
  IonToolbar,
} from "@ionic/react";
import { useState } from "react";
import { enviarPushDePrueba } from "../data/push.repo";

export default function PushPruebaPage() {
  const [token, setToken] = useState("");
  const [titulo, setTitulo] = useState("Prueba SAT Areco");
  const [contenido, setContenido] = useState("Notificación dirigida al teléfono de prueba");
  const [sirena, setSirena] = useState(true);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState("");

  const enviar = async () => {
    if (sending) return;
    const tokenLimpio = token.trim();
    if (!tokenLimpio) {
      setToast("Pegá el token del teléfono de prueba");
      return;
    }

    setSending(true);
    try {
      const messageId = await enviarPushDePrueba({
        token: tokenLimpio,
        titulo: titulo.trim() || undefined,
        contenido: contenido.trim() || undefined,
        sirena,
      });
      setToast(messageId ? `Push enviado. ID: ${messageId}` : "Push de prueba enviado");
    } catch (error: any) {
      setToast(error?.response?.data?.message ?? "No se pudo enviar el push de prueba");
    } finally {
      setSending(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start"><IonMenuButton /></IonButtons>
          <IonTitle>Prueba de notificaciones</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonList>
          <IonItem>
            <IonLabel position="stacked">Token del teléfono *</IonLabel>
            <IonTextarea
              autoGrow
              rows={4}
              value={token}
              placeholder="Pegá el token completo que aparece en Logcat"
              onIonInput={(event) => setToken(event.detail.value ?? "")}
            />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Título</IonLabel>
            <IonInput value={titulo} onIonInput={(event) => setTitulo(event.detail.value ?? "")} />
          </IonItem>
          <IonItem>
            <IonLabel position="stacked">Mensaje</IonLabel>
            <IonTextarea
              autoGrow
              value={contenido}
              onIonInput={(event) => setContenido(event.detail.value ?? "")}
            />
          </IonItem>
          <IonItem>
            <IonLabel>
              Reproducir sirena
              <IonNote className="ion-text-wrap" style={{ display: "block", marginTop: 4 }}>
                El envío se dirige solamente al token indicado.
              </IonNote>
            </IonLabel>
            <IonToggle checked={sirena} onIonChange={(event) => setSirena(event.detail.checked)} />
          </IonItem>
        </IonList>
        <div className="ion-padding">
          <IonButton expand="block" color={sirena ? "danger" : "primary"} disabled={sending} onClick={enviar}>
            {sending && <IonSpinner slot="start" name="crescent" />}
            {sending ? "Enviando…" : sirena ? "Enviar prueba con sirena" : "Enviar prueba"}
          </IonButton>
        </div>
        <IonToast isOpen={!!toast} message={toast} duration={3500} onDidDismiss={() => setToast("")} />
      </IonContent>
    </IonPage>
  );
}

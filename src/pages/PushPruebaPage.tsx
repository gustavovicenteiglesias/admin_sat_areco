import {
  IonBadge,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonMenuButton,
  IonNote,
  IonPage,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTextarea,
  IonTitle,
  IonToast,
  IonToggle,
  IonToolbar,
} from "@ionic/react";
import { useEffect, useMemo, useState } from "react";
import {
  enviarPushDePruebaADispositivo,
  pushDevicesList,
  pushDeviceUpdate,
  type PushDevice,
} from "../data/push.repo";

const TOPICS = ["alerts-meteo", "alerts-acp", "alerts-comunicados"];

const shortId = (value: string) =>
  value && value.length > 14 ? `${value.slice(0, 8)}…${value.slice(-4)}` : value;

const formatDate = (value?: string) => {
  if (!value) return "Sin datos";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("es-AR");
};

const labelFor = (device: PushDevice) =>
  device.alias?.trim() ||
  `${device.platform || "dispositivo"} ${device.appVersion ? `v${device.appVersion}` : ""}`.trim() ||
  shortId(device.installationId);

export default function PushPruebaPage() {
  const [devices, setDevices] = useState<PushDevice[]>([]);
  const [selectedId, setSelectedId] = useState<number | undefined>();
  const [platformFilter, setPlatformFilter] = useState("");
  const [stateFilter, setStateFilter] = useState("test-active");
  const [titulo, setTitulo] = useState("Prueba SAT Areco");
  const [contenido, setContenido] = useState("Notificación dirigida al teléfono de prueba");
  const [deeplink, setDeeplink] = useState("/tab1");
  const [tipo, setTipo] = useState("test");
  const [sirena, setSirena] = useState(true);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState("");

  const selected = useMemo(
    () => devices.find((device) => device.id === selectedId),
    [devices, selectedId]
  );

  const cargar = async () => {
    setLoading(true);
    try {
      const filters: any = {};
      if (platformFilter) filters.platform = platformFilter;
      if (stateFilter === "test-active") {
        filters.isTest = true;
        filters.active = true;
      }
      if (stateFilter === "test") filters.isTest = true;
      if (stateFilter === "active") filters.active = true;
      if (stateFilter === "inactive") filters.active = false;

      const data = await pushDevicesList(filters);
      setDevices(data);
      if (data.length && (!selectedId || !data.some((d) => d.id === selectedId))) {
        setSelectedId(data[0].id);
      }
      if (!data.length) setSelectedId(undefined);
    } catch (error: any) {
      setToast(error?.response?.data?.message ?? "No se pudieron cargar los dispositivos");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [platformFilter, stateFilter]);

  const guardarDevice = async (device: PushDevice, patch: Partial<Pick<PushDevice, "alias" | "isTest" | "active">>) => {
    setSavingId(device.id);
    try {
      const updated = await pushDeviceUpdate(device.id, {
        alias: patch.alias ?? device.alias ?? "",
        isTest: patch.isTest ?? device.isTest,
        active: patch.active ?? device.active,
      });
      setDevices((items) => items.map((item) => (item.id === updated.id ? updated : item)));
      setToast("Dispositivo actualizado");
    } catch (error: any) {
      setToast(error?.response?.data?.message ?? "No se pudo actualizar el dispositivo");
    } finally {
      setSavingId(null);
    }
  };

  const enviar = async () => {
    if (sending) return;
    if (!selected) {
      setToast("Seleccioná un dispositivo de prueba");
      return;
    }
    if (!selected.active || !selected.isTest) {
      setToast("El dispositivo debe estar activo y marcado como prueba interna");
      return;
    }

    const ok = window.confirm(
      `PRUEBA INTERNA\n\nDestino: ${labelFor(selected)}\nEnvío individual por token FCM.\n\nNo se enviará a topics productivos. ¿Continuar?`
    );
    if (!ok) return;

    setSending(true);
    try {
      const messageId = await enviarPushDePruebaADispositivo(selected.id, {
        titulo: titulo.trim() || undefined,
        contenido: contenido.trim() || undefined,
        deeplink: deeplink.trim() || undefined,
        tipo: tipo.trim() || undefined,
        sirena,
      });
      setToast(messageId ? `Prueba enviada. ID: ${messageId}` : "Prueba enviada");
      await cargar();
    } catch (error: any) {
      setToast(error?.response?.data?.message ?? "No se pudo enviar la prueba");
      await cargar();
    } finally {
      setSending(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start"><IonMenuButton /></IonButtons>
          <IonTitle>Dispositivos Push / Pruebas internas</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonCard color="warning">
          <IonCardHeader>
            <IonCardTitle>PRUEBA INTERNA</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            Esta pantalla envía exclusivamente al token FCM del dispositivo seleccionado. No permite elegir topics productivos ni hacer broadcast.
          </IonCardContent>
        </IonCard>

        <IonList>
          <IonItem>
            <IonLabel>Filtro plataforma</IonLabel>
            <IonSelect value={platformFilter} onIonChange={(event) => setPlatformFilter(event.detail.value)}>
              <IonSelectOption value="">Todas</IonSelectOption>
              <IonSelectOption value="android">Android</IonSelectOption>
              <IonSelectOption value="ios">iOS</IonSelectOption>
              <IonSelectOption value="web">Web</IonSelectOption>
            </IonSelect>
          </IonItem>
          <IonItem>
            <IonLabel>Filtro estado</IonLabel>
            <IonSelect value={stateFilter} onIonChange={(event) => setStateFilter(event.detail.value)}>
              <IonSelectOption value="test-active">Prueba activos</IonSelectOption>
              <IonSelectOption value="test">Dispositivos de prueba</IonSelectOption>
              <IonSelectOption value="active">Activos</IonSelectOption>
              <IonSelectOption value="inactive">Inactivos</IonSelectOption>
              <IonSelectOption value="all">Todos</IonSelectOption>
            </IonSelect>
          </IonItem>
        </IonList>

        <div className="ion-padding">
          <IonButton fill="outline" disabled={loading} onClick={cargar}>
            {loading && <IonSpinner slot="start" name="crescent" />}
            Actualizar listado
          </IonButton>
        </div>

        <IonList>
          {devices.map((device) => {
            const topics = new Set(device.subscriptions?.filter((s) => s.active).map((s) => s.topic));
            const checked = device.id === selectedId;

            return (
              <IonCard key={device.id} color={checked ? "light" : undefined}>
                <IonCardHeader>
                  <IonCardTitle>
                    <IonButton fill={checked ? "solid" : "outline"} size="small" onClick={() => setSelectedId(device.id)}>
                      {checked ? "Seleccionado" : "Seleccionar"}
                    </IonButton>{" "}
                    {labelFor(device)}
                  </IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonItem>
                    <IonLabel position="stacked">Alias administrativo</IonLabel>
                    <IonInput
                      value={device.alias ?? ""}
                      placeholder="Ej.: Samsung A24 Gustavo"
                      onIonBlur={(event) => {
                        const alias = String(event.target.value ?? "");
                        if (alias !== (device.alias ?? "")) guardarDevice(device, { alias });
                      }}
                    />
                  </IonItem>
                  <p><b>Plataforma:</b> {device.platform}</p>
                  <p><b>Modelo:</b> {device.model || "Sin informar"}</p>
                  <p><b>Versión app:</b> {device.appVersion || "Sin dato"} {device.appBuild ? `(build ${device.appBuild})` : ""}</p>
                  <p><b>Installation ID:</b> {shortId(device.installationId)}</p>
                  <p><b>Última conexión:</b> {formatDate(device.lastSeenAt)}</p>
                  <p>
                    <IonBadge color={device.active ? "success" : "medium"}>{device.active ? "Activo" : "Inactivo"}</IonBadge>{" "}
                    <IonBadge color={device.isTest ? "warning" : "medium"}>{device.isTest ? "Prueba interna" : "Normal"}</IonBadge>
                  </p>
                  <IonItem>
                    <IonLabel>Dispositivo de prueba</IonLabel>
                    <IonToggle
                      checked={device.isTest}
                      disabled={savingId === device.id}
                      onIonChange={(event) => guardarDevice(device, { isTest: event.detail.checked })}
                    />
                  </IonItem>
                  <IonItem>
                    <IonLabel>Activo</IonLabel>
                    <IonToggle
                      checked={device.active}
                      disabled={savingId === device.id}
                      onIonChange={(event) => guardarDevice(device, { active: event.detail.checked })}
                    />
                  </IonItem>
                  <IonNote>Suscripciones informadas:</IonNote>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                    {TOPICS.map((topic) => (
                      <IonBadge key={topic} color={topics.has(topic) ? "success" : "medium"}>
                        {topics.has(topic) ? "✓" : "—"} {topic}
                      </IonBadge>
                    ))}
                  </div>
                </IonCardContent>
              </IonCard>
            );
          })}
          {!loading && devices.length === 0 && (
            <IonItem>
              <IonLabel>No hay dispositivos con este filtro</IonLabel>
            </IonItem>
          )}
        </IonList>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Enviar prueba individual</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonNote className="ion-text-wrap" style={{ display: "block", marginBottom: 12 }}>
              Destino: {selected ? labelFor(selected) : "ninguno"} · Envío individual por token FCM.
            </IonNote>
            <IonList>
              <IonItem>
                <IonLabel position="stacked">Título</IonLabel>
                <IonInput value={titulo} onIonInput={(event) => setTitulo(event.detail.value ?? "")} />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Mensaje</IonLabel>
                <IonTextarea autoGrow value={contenido} onIonInput={(event) => setContenido(event.detail.value ?? "")} />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Deeplink</IonLabel>
                <IonInput value={deeplink} onIonInput={(event) => setDeeplink(event.detail.value ?? "")} />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Tipo de alerta</IonLabel>
                <IonInput value={tipo} onIonInput={(event) => setTipo(event.detail.value ?? "")} />
              </IonItem>
              <IonItem>
                <IonLabel>
                  Reproducir sirena
                  <IonNote className="ion-text-wrap" style={{ display: "block", marginTop: 4 }}>
                    Cuidado: aunque es prueba individual, reproduce el canal de sirena en el dispositivo elegido.
                  </IonNote>
                </IonLabel>
                <IonToggle checked={sirena} onIonChange={(event) => setSirena(event.detail.checked)} />
              </IonItem>
            </IonList>
            <IonButton
              expand="block"
              color={sirena ? "danger" : "primary"}
              disabled={sending || !selected || !selected.active || !selected.isTest}
              onClick={enviar}
            >
              {sending && <IonSpinner slot="start" name="crescent" />}
              {sending ? "Enviando…" : sirena ? "Enviar prueba con sirena" : "Enviar prueba"}
            </IonButton>
          </IonCardContent>
        </IonCard>

        <IonToast isOpen={!!toast} message={toast} duration={3500} onDidDismiss={() => setToast("")} />
      </IonContent>
    </IonPage>
  );
}

import {
  IonPage, IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle,
  IonContent, IonList, IonItem, IonLabel, IonInput, IonButton,
  IonGrid, IonRow, IonCol, IonToast, IonSpinner, IonCard, IonCardHeader, IonCardTitle, IonCardContent,
  IonText
} from "@ionic/react";
import { useEffect, useState } from "react";
import {
  getRioInterval, putRioInterval,
  getLluviaDay, putLluviaDay,
  getLluviaNight, putLluviaNight,
  getHidricos, putHidricos
} from "../data/settings.repo";
import type { HidricosDTO } from "../types/settings";
import authService from "../service/auth.service";

// ===== Constantes =====
const MS_PER_MIN = 60000;

// Rangos del backend (fuente de verdad)
const RIO_UI_MIN_MIN = 1;     // UI en minutos
const RIO_UI_MAX_MIN = 60;

const LLUVIA_MIN_MIN = 1;
const LLUVIA_MAX_MIN = 60;

const TOL_MIN_EXCLUSIVE = 0;   // (0, 1.0]
const TOL_MAX_INCLUSIVE = 1.0;

const DELTA_MIN_EXCLUSIVE = 0; // (0, 0.5]
const DELTA_MAX_INCLUSIVE = 0.5;

// ===== Helper para extraer mensajes del backend =====
function extractApiMessage(err: any, fallback = "Ocurrió un error"): string {
  // intenta leer ApiResponse.fail → { success:false, message:"..." }
  const msg =
    err?.response?.data?.message ??
    err?.data?.message ??
    err?.message ??
    fallback;
  return String(msg);
}

// ===== Utils =====
function toInt(v: any, def = 1): number {
  const n = parseInt(String(v ?? "").trim(), 10);
  return Number.isFinite(n) ? n : def;
}
function parseLocaleDecimal(s: string, fallback = NaN): number {
  const cleaned = String(s ?? "").trim().replace(",", ".");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : fallback;
}
// Formatea con hasta 3 decimales (ajustá si querés fijo)
function formatDecimal(n: number, digits = 3): string {
  if (!Number.isFinite(n)) return "";
  return String(parseFloat(n.toFixed(digits)));
}
function clamp(x: number, min: number, max: number) {
  return Math.max(min, Math.min(max, x));
}

export default function SettingsPage() {
  const currentUser = authService.getCurrentUser();
  const xUser = currentUser?.email ?? "admin-ui";

  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ open: boolean; msg: string }>({ open: false, msg: "" });

  // saving flags por sección
  const [savingRio, setSavingRio] = useState(false);
  const [savingDay, setSavingDay] = useState(false);
  const [savingNight, setSavingNight] = useState(false);
  const [savingHidricos, setSavingHidricos] = useState(false);

  // valores en MINUTOS (UI)
  const [rioMin, setRioMin] = useState<number>(1);       // 1..60
  const [dayMin, setDayMin] = useState<number>(1);       // 1..60
  const [nightMin, setNightMin] = useState<number>(1);  // 1..60

  // hídricos - mantenemos DTO y strings para edición libre
  const [hidricos, setHidricos] = useState<HidricosDTO>({ toleranciaM: 0.10, deltaEstableM: 0.03 });
  const [toleranciaStr, setToleranciaStr] = useState<string>("0.10");
  const [deltaEstableStr, setDeltaEstableStr] = useState<string>("0.03");

  // flags de validación en vivo
  const tolParsed = parseLocaleDecimal(toleranciaStr, NaN);
  const deltaParsed = parseLocaleDecimal(deltaEstableStr, NaN);

  const tolInvalid =
    !Number.isFinite(tolParsed) ||
    !(tolParsed > TOL_MIN_EXCLUSIVE && tolParsed <= TOL_MAX_INCLUSIVE);

  const deltaInvalid =
    !Number.isFinite(deltaParsed) ||
    !(deltaParsed > DELTA_MIN_EXCLUSIVE && deltaParsed <= DELTA_MAX_INCLUSIVE);

  const rioOutOfRange = rioMin < RIO_UI_MIN_MIN || rioMin > RIO_UI_MAX_MIN;
  const dayOutOfRange = dayMin < LLUVIA_MIN_MIN || dayMin > LLUVIA_MAX_MIN;
  const nightOutOfRange = nightMin < LLUVIA_MIN_MIN || nightMin > LLUVIA_MAX_MIN;

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [rio, day, night, hidr] = await Promise.all([
          getRioInterval(),
          getLluviaDay(),
          getLluviaNight(),
          getHidricos(),
        ]);
        setRioMin(Math.max(1, Math.round((rio.ms ?? 60000) / MS_PER_MIN)));
        setDayMin(Math.max(1, Math.round((day.ms ?? 60000) / MS_PER_MIN)));
        setNightMin(Math.max(1, Math.round((night.ms ?? 60000) / MS_PER_MIN)));

        setHidricos(hidr);
        setToleranciaStr(formatDecimal(hidr.toleranciaM));
        setDeltaEstableStr(formatDecimal(hidr.deltaEstableM));
      } catch (err) {
        setToast({ open: true, msg: extractApiMessage(err, "No se pudieron cargar las configuraciones") });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const saveRio = async () => {
    if (rioOutOfRange) {
      setToast({ open: true, msg: "Rango permitido: 1..60 min (el backend acepta 5s..60min)." });
      return;
    }
    setSavingRio(true);
    try {
      const mins = clamp(rioMin, RIO_UI_MIN_MIN, RIO_UI_MAX_MIN);
      const dto = await putRioInterval(mins * MS_PER_MIN, xUser);
      setRioMin(Math.round(dto.ms / MS_PER_MIN));
      setToast({ open: true, msg: "Intervalo de río guardado" });
    } catch (err) {
      setToast({ open: true, msg: extractApiMessage(err, "No se pudo guardar el intervalo de río") });
    } finally {
      setSavingRio(false);
    }
  };

  const saveDay = async () => {
    if (dayOutOfRange) {
      setToast({ open: true, msg: "Rango permitido para día: 1..60 min." });
      return;
    }
    setSavingDay(true);
    try {
      const mins = clamp(dayMin, LLUVIA_MIN_MIN, LLUVIA_MAX_MIN);
      const dto = await putLluviaDay(mins * MS_PER_MIN);
      setDayMin(Math.round(dto.ms / MS_PER_MIN));
      setToast({ open: true, msg: "Intervalo de lluvia (día) guardado" });
    } catch (err) {
      setToast({ open: true, msg: extractApiMessage(err, "No se pudo guardar el intervalo de día") });
    } finally {
      setSavingDay(false);
    }
  };

  const saveNight = async () => {
    if (nightOutOfRange) {
      setToast({ open: true, msg: "Rango permitido para noche: 1..60 min." });
      return;
    }
    setSavingNight(true);
    try {
      const mins = clamp(nightMin, LLUVIA_MIN_MIN, LLUVIA_MAX_MIN);
      const dto = await putLluviaNight(mins * MS_PER_MIN);
      setNightMin(Math.round(dto.ms / MS_PER_MIN));
      setToast({ open: true, msg: "Intervalo de lluvia (noche) guardado" });
    } catch (err) {
      setToast({ open: true, msg: extractApiMessage(err, "No se pudo guardar el intervalo de noche") });
    } finally {
      setSavingNight(false);
    }
  };

  const saveHidricos = async () => {
    if (tolInvalid || deltaInvalid) {
      setToast({
        open: true,
        msg: "Valores fuera de rango: tolerancia (0 < m ≤ 1.0) y Δ estable (0 < m ≤ 0.5).",
      });
      return;
    }

    setSavingHidricos(true);
    try {
      const body: HidricosDTO = {
        toleranciaM: tolParsed,
        deltaEstableM: deltaParsed,
      };

      const dto = await putHidricos(body);
      setHidricos(dto);
      setToleranciaStr(formatDecimal(dto.toleranciaM));
      setDeltaEstableStr(formatDecimal(dto.deltaEstableM));
      setToast({ open: true, msg: "Parámetros hídricos guardados" });
    } catch (err) {
      setToast({ open: true, msg: extractApiMessage(err, "No se pudieron guardar los parámetros hídricos") });
    } finally {
      setSavingHidricos(false);
    }
  };

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start"><IonMenuButton /></IonButtons>
            <IonTitle>Configuración</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonSpinner />
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start"><IonMenuButton /></IonButtons>
          <IonTitle>Configuración</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <IonGrid>
          <IonRow>
            {/* RÍO */}
            <IonCol size="12" sizeMd="6">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>⏱️ Ingesta Río</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonList>
                    <IonItem>
                      <IonLabel position="stacked">Intervalo (min)</IonLabel>
                      <IonInput
                        type="number"
                        inputmode="numeric"
                        min={RIO_UI_MIN_MIN}
                        max={RIO_UI_MAX_MIN}
                        value={rioMin}
                        onIonInput={(e)=> setRioMin(toInt(e.detail.value, 1))}
                        disabled={savingRio}
                      />
                    </IonItem>
                    {rioOutOfRange && (
                      <IonText color="danger" className="ion-padding-start">
                        <small>Rango permitido: 1..60 min (el backend acepta 5s..60min).</small>
                      </IonText>
                    )}
                  </IonList>
                  <IonButton className="ion-margin-top" onClick={saveRio} disabled={savingRio || rioOutOfRange}>
                    {savingRio && <IonSpinner slot="start" />}
                    {savingRio ? "Guardando..." : "Guardar"}
                  </IonButton>
                </IonCardContent>
              </IonCard>
            </IonCol>

            {/* LLUVIA */}
            <IonCol size="12" sizeMd="6">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>🌧️ Ingesta Lluvia</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonList>
                    <IonItem>
                      <IonLabel position="stacked">Día (min)</IonLabel>
                      <IonInput
                        type="number"
                        inputmode="numeric"
                        min={LLUVIA_MIN_MIN}
                        max={LLUVIA_MAX_MIN}
                        value={dayMin}
                        onIonInput={(e)=> setDayMin(toInt(e.detail.value, 1))}
                        disabled={savingDay}
                      />
                    </IonItem>
                    {dayOutOfRange && (
                      <IonText color="danger" className="ion-padding-start">
                        <small>Rango permitido: 1..60 min.</small>
                      </IonText>
                    )}
                    <IonButton className="ion-margin-top" onClick={saveDay} disabled={savingDay || dayOutOfRange}>
                      {savingDay && <IonSpinner slot="start" />}
                      {savingDay ? "Guardando..." : "Guardar Día"}
                    </IonButton>

                    <IonItem className="ion-margin-top">
                      <IonLabel position="stacked">Noche (min)</IonLabel>
                      <IonInput
                        type="number"
                        inputmode="numeric"
                        min={LLUVIA_MIN_MIN}
                        max={LLUVIA_MAX_MIN}
                        value={nightMin}
                        onIonInput={(e)=> setNightMin(toInt(e.detail.value, 1))}
                        disabled={savingNight}
                      />
                    </IonItem>
                    {nightOutOfRange && (
                      <IonText color="danger" className="ion-padding-start">
                        <small>Rango permitido: 1..60 min.</small>
                      </IonText>
                    )}
                    <IonButton className="ion-margin-top" onClick={saveNight} disabled={savingNight || nightOutOfRange}>
                      {savingNight && <IonSpinner slot="start" />}
                      {savingNight ? "Guardando..." : "Guardar Noche"}
                    </IonButton>
                  </IonList>
                </IonCardContent>
              </IonCard>
            </IonCol>

            {/* HÍDRICOS */}
            <IonCol size="12">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>🌊 Parámetros Hídricos</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonList>
                    <IonItem>
                      <IonLabel position="stacked">Tolerancia (m)</IonLabel>
                      <IonInput
                        type="text"
                        inputmode="decimal"
                        step="any"
                        min="0"
                        max={String(TOL_MAX_INCLUSIVE)}
                        value={toleranciaStr}
                        onIonChange={(e)=> setToleranciaStr((e.detail.value ?? "").replace(",", "."))}
                        disabled={savingHidricos}
                      />
                    </IonItem>
                    {tolInvalid && (
                      <IonText color="danger" className="ion-padding-start">
                        <small>Rango permitido: 0 &lt; m ≤ 1.0</small>
                      </IonText>
                    )}

                    <IonItem className="ion-margin-top">
                      <IonLabel position="stacked">Δ Estable (m)</IonLabel>
                      <IonInput
                        type="text"
                        inputmode="decimal"
                        step="any"
                        min="0"
                        max={String(DELTA_MAX_INCLUSIVE)}
                        value={deltaEstableStr}
                        onIonChange={(e)=> setDeltaEstableStr((e.detail.value ?? "").replace(",", "."))}
                        disabled={savingHidricos}
                      />
                    </IonItem>
                    {deltaInvalid && (
                      <IonText color="danger" className="ion-padding-start">
                        <small>Rango permitido: 0 &lt; m ≤ 0.5</small>
                      </IonText>
                    )}
                  </IonList>

                  <IonButton
                    className="ion-margin-top"
                    onClick={saveHidricos}
                    disabled={savingHidricos || tolInvalid || deltaInvalid}
                  >
                    {savingHidricos && <IonSpinner slot="start" />}
                    {savingHidricos ? "Guardando..." : "Guardar Hídricos"}
                  </IonButton>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonToast
          isOpen={toast.open}
          message={toast.msg}
          duration={1800}
          onDidDismiss={() => setToast({ open: false, msg: "" })}
        />
      </IonContent>
    </IonPage>
  );
}

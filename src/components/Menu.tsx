import {
  IonMenu, IonHeader, IonToolbar, IonTitle, IonContent,
  IonList, IonItem, IonIcon, IonLabel, IonMenuToggle,
  IonAvatar, IonButton, IonListHeader, IonNote
} from "@ionic/react";
import { useLocation, useHistory } from "react-router-dom";
import {
  pulseOutline, flashOutline, megaphoneOutline, homeOutline,
  logInOutline, logOutOutline, personCircleOutline,
  waterOutline,settingsOutline,
  callOutline
} from "ionicons/icons";
import type { user } from "../types/user";
import { useEffect, useState } from "react";
import authService from "../service/auth.service";

const appPages = [
  { title: "Home", url: "/home", icon: homeOutline },
  { title: "Registros", url: "/registros", icon: waterOutline },
  
  { title: "Situación", url: "/situacion", icon: pulseOutline },
  { title: "Alertas (corto plazo)", url: "/cortoplazo", icon: flashOutline },
  { title: "Comunicados", url: "/comunicados", icon: megaphoneOutline },
  { title: "Alertas meteorológicas", url: "/alertameteorologica", icon: flashOutline },
  { title: "Configuración", url: "/settings", icon: settingsOutline },
  { title: "Teléfonos", url: "/telefonos", icon: callOutline },
  
];

export default function Menu() {
  const [currentUser, setCurrentUser] = useState<user | null>(null);
  const [showAdminBoard, setShowAdminBoard] = useState<boolean>(false);

  const location = useLocation();
  const history = useHistory();

  useEffect(() => {
    const u: user = authService.getCurrentUser();
    if (u) {
      setCurrentUser(u);
      setShowAdminBoard(u.roles?.includes("ROLE_ADMIN"));
    } else {
      setCurrentUser(null);
      setShowAdminBoard(false);
    }
  }, []);

  const pagesToShow = showAdminBoard ? appPages : appPages.filter(p => p.url === "/home");

  const handleLogin = () => {
    history.push("/login");
  };

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setShowAdminBoard(false);
    history.push("/home");
  };

  return (
    <IonMenu contentId="main" type="overlay">
      <IonHeader>
        <IonToolbar>
          <IonTitle>Sat Areco Admin</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {/* Bloque de usuario en el lateral */}
        <IonList inset>
          <IonListHeader>Usuario</IonListHeader>

          {currentUser ? (
            <IonItem lines="none">
              <IonAvatar slot="start">
                {currentUser.picture ? (
                  <img src={currentUser.picture} alt={currentUser.name || currentUser.email} />
                ) : (
                  <IonIcon icon={personCircleOutline} />
                )}
              </IonAvatar>
              <IonLabel>
                <h2>{currentUser.name || currentUser.email}</h2>
                <IonNote>{currentUser.email}</IonNote>
              </IonLabel>
            </IonItem>
          ) : (
            <IonItem lines="none">
              <IonLabel>Sesión no iniciada</IonLabel>
              <IonButton slot="end" onClick={handleLogin}>
                <IonIcon slot="start" icon={logInOutline} />
                Login
              </IonButton>
            </IonItem>
          )}
        </IonList>

        {/* Navegación */}
        <IonList>
          {pagesToShow.map(p => {
            const active = location.pathname.startsWith(p.url);
            return (
              <IonMenuToggle key={p.url} autoHide={false}>
                <IonItem
                  routerLink={p.url}
                  routerDirection="root"
                  detail={false}
                  color={active ? "primary" : undefined}
                >
                  <IonIcon slot="start" icon={p.icon} />
                  <IonLabel>{p.title}</IonLabel>
                </IonItem>
              </IonMenuToggle>
            );
          })}
        </IonList>

        {/* Acciones: Login/Logout en el lateral */}
        <IonList inset>
          {currentUser ? (
            <IonItem button detail={false} onClick={handleLogout}>
              <IonIcon slot="start" icon={logOutOutline} />
              <IonLabel>Logout</IonLabel>
            </IonItem>
          ) : (
            <IonMenuToggle autoHide={false}>
              <IonItem button detail={false} onClick={handleLogin}>
                <IonIcon slot="start" icon={logInOutline} />
                <IonLabel>Login</IonLabel>
              </IonItem>
            </IonMenuToggle>
          )}
        </IonList>
      </IonContent>
    </IonMenu>
  );
}

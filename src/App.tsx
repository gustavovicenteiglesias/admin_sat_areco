import { IonApp, IonRouterOutlet, IonSplitPane } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { Redirect, Route, Switch } from "react-router-dom";

import LoginGoogle from "./pages/LoginGoogle";
import Home from "./pages/Home";
import { setupIonicReact } from "@ionic/react";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

import "@ionic/react/css/core.css";
import Menu from "./components/Menu";
import SituacionList from "./pages/SituacioList";
import AlertaCortoPlazoList from "./pages/AlertaCortoPlazoList";
import SituacionForm from "./pages/SituacionForm";
import CortoplazoForm from "./pages/CortoplazoForm";
import ComunicadoForm from "./pages/ComunicadoForm";
import ComunicadosList from "./pages/ComunicadosList";
import "./theme/variables.css";
import AlertaMeteoForm from "./pages/AlertaMeteoForm";
import AlertaMeteoList from "./pages/AlertaMeteoList";
import RegistroForm from "./pages/RegistroForm";
import RegistroList from "./pages/RegistroList";
import SettingsPage from "./pages/SettingsPage";
import TelefonoForm from "./pages/TelefonoForm";
import TelefonosList from "./pages/TelefonosList";
import MapaCapasList from "./pages/MapaCapasList";
import MapaCapaForm from "./pages/MapaCapaForm";
import RecomendacionesList from "./pages/RecomendacionesList";
import RecomendacionForm from "./pages/RecomendacionForm";
import PrecipitacionesPage from "./pages/PrecipitacionesPage";
import NosotrosPage from "./pages/NosotrosPage";

setupIonicReact();
const App: React.FC = () => {
  return (
    <IonApp>
      <IonReactRouter>
        <IonSplitPane contentId="main">
          <Menu />
          <IonRouterOutlet id="main">
            <Switch>
              {/* redirect a sección por defecto */}
              <Route path="/" exact>
                <Redirect to="/home" />
              </Route>
              <Route path="/home" exact component={Home} />
              {/* SITUACIÓN */}
              <Route path="/situacion" exact component={SituacionList} />
              <Route path="/situacion/new" exact component={SituacionForm} />
              <Route path="/situacion/:id" exact component={SituacionForm} />

              {/* ALERTAS CORTO PLAZO */}
              <Route
                path="/cortoplazo"
                exact
                component={AlertaCortoPlazoList}
              />
              <Route path="/cortoplazo/new" exact component={CortoplazoForm} />
              <Route path="/cortoplazo/:id" exact component={CortoplazoForm} />

              {/* COMUNICADOS */}
              <Route path="/comunicados" exact component={ComunicadosList} />
              <Route path="/comunicados/new" exact component={ComunicadoForm} />
              <Route path="/comunicados/:id" exact component={ComunicadoForm} />

              <Route
                path="/alertameteorologica"
                exact
                component={AlertaMeteoList}
              />
              <Route
                path="/alertameteorologica/new"
                exact
                component={AlertaMeteoForm}
              />
              <Route
                path="/alertameteorologica/:id"
                exact
                component={AlertaMeteoForm}
              />

              <Route path="/registros" exact component={RegistroList} />
              <Route path="/registros/new" exact component={RegistroForm} />
              <Route path="/registros/:id" exact component={RegistroForm} />
              <Route path="/settings" exact component={SettingsPage} />

              <Route exact path="/telefonos" component={TelefonosList} />
              <Route exact path="/telefonos/new" component={TelefonoForm} />
              <Route exact path="/telefonos/:id" component={TelefonoForm} />
              <Route exact path="/mapas" component={MapaCapasList} />
              <Route exact path="/mapas/new" component={MapaCapaForm} />
              <Route exact path="/mapas/:id" component={MapaCapaForm} />
              <Route exact path="/recomendaciones" component={RecomendacionesList} />
              <Route exact path="/recomendaciones/new" component={RecomendacionForm} />
              <Route exact path="/recomendaciones/:id" component={RecomendacionForm} />
              <Route exact path="/precipitaciones" component={PrecipitacionesPage} />
              <Route exact path="/nosotros" component={NosotrosPage} />
              {/* 404 simple */}

              <Route path="/login" exact component={LoginGoogle} />
            </Switch>
          </IonRouterOutlet>
        </IonSplitPane>
      </IonReactRouter>
    </IonApp>
  );
};

export default App;

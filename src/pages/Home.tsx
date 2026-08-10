import {
  IonButton,
  IonButtons,
  IonContent,
  IonDatetime,
  IonHeader,
  IonIcon,
  IonItem,
  IonMenu,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import authService from "../service/auth.service";
import { useEffect, useState } from "react";
import type { user } from "../types/user";
import { pulseOutline, flashOutline, megaphoneOutline } from "ionicons/icons";

const Home = () => {

  return (
    <>
      
      <IonPage >
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonMenuButton></IonMenuButton>
            </IonButtons>
            <IonTitle>Menu</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">Tap the button in the toolbar to open the menu.</IonContent>
      </IonPage>
    </>
  );
};
export default Home;

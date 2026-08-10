import { GoogleLogin } from "@react-oauth/google";
import authService from "../service/auth.service";
import { IonPage } from "@ionic/react";

const LoginGoogle = () => {

interface data {
  idToken: any;
}
 const Onsuccess = async (e: any) => {
    console.log(e);
    const data: data = {
      idToken: e.credential,
    };
    console.log(data);
    await authService
      .login(data)
      .then((res: { status: number; data: any }) => {
        if (res.status === 200) {
          console.log(res.data);
          localStorage.setItem("user", JSON.stringify({ ...res.data }));
          
          window.location.href = "/";
        } else {
          console.log("Usuario no registrado ");
        }
      })
      .catch((error: any) => {
        console.log(error.response.data);
      });
 }
    return (
        <IonPage>
         <GoogleLogin
                onSuccess={Onsuccess}
                onError={() => {
                  console.log("Login Failed");
                }}
              />
        </IonPage>
    )
}
export default LoginGoogle;
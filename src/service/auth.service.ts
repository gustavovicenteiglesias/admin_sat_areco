
import http from "./http-common";
import { URL_API } from "./constantes";


class AuthService {
    login(data:any){
      return http.post(`${URL_API}/auth/google`,data)
    }

    logout() {
        localStorage.removeItem("user");
      }
    
      getCurrentUser() {
        return JSON.parse(localStorage.getItem('user')!);
      }
    
}
export default new AuthService();
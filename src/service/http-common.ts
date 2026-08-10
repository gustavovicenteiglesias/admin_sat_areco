import axios from "axios";
import { URL_API } from "./constantes";


export default axios.create({
  baseURL: URL_API,
  headers: {
    
    "Content-type": "application/json"
  }
});
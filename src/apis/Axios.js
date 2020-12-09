import axios from "axios";

const Axios = axios.create({
  baseURL: "https://api.jikan.moe/v3",
});

export default Axios;

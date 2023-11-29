
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getFirestore  } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";


const firebaseConfig = {
    apiKey: "AIzaSyBCnm-2DJ5T2KzqENZneCaWK8NASkjDUzg",
  authDomain: "imagem-database.firebaseapp.com",
  projectId: "imagem-database",
  storageBucket: "imagem-database.appspot.com",
  messagingSenderId: "96613531537",
  appId: "1:96613531537:web:fec3c90379e87e36136430"
};
// const firebaseConfig = {
//     apiKey: "AIzaSyCJBIJIYIOmzi350402SaIwOd7-1ekAO_M",
//     authDomain: "dpl-login.firebaseapp.com",
//     projectId: "dpl-login",
//     storageBucket: "dpl-login.appspot.com",
//     messagingSenderId: "586330109963",
//     appId: "1:586330109963:web:6a88fbe86ff9f80a582f0e"
// };


export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
console.log("conectado com sucesso")
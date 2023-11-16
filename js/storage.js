import { app } from "./config-firebase.js"
import { getStorage, ref, uploadBytes, getDownloadURL} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-storage.js"

let imgDesligar = document.querySelector("#imgDesligar")

let timestamp = new Date().getTime() // para poder ser utilizado como nome da imagem ao salvar no cloud storage.

let dadosImagem = {
    nome:"",
    url: "",
    timestamp: ""
}

const storage = getStorage(app);
const storageRef = ref(storage, `DPLimagem/${timestamp}`);// função ref() recebe a instância de armazenamento storage e uma string que representa o caminho para o local desejado, seria o nome do arquivo lá no storage. Estou salvando dentro de uma pasta chamado 'imagem/' e em seguida


function store(){
    try {        

        dadosImagem.nome = imgDesligar.files[0].name// salvando o nome da imagem
        let data = new Date(timestamp)// convertendo o timestamp para data e hora
        dadosImagem.timestamp = data.toLocaleString("pt-BR")// alterando a data e hora para o padrão BR
        
            // Fazendo o upload da imagem para o Storage
            uploadBytes(storageRef, imgDesligar.files[0]).then((resultado) => {
                //console.log('Upload realizado', resultado);

                // Obtendo a URL de download da imagem
                getDownloadURL(resultado.ref)
                .then((url) => {

                    //console.log(url)
                    dadosImagem.url = url

                    //cadastrarImagem(dadosImagem)

                    console.log(dadosImagem)
                    alert("Imagem carregada com sucesso")
                    localStorage.setItem("imgDesligar",url)// salvando o link da imagem no localstorage
                })
                .catch((error) => {
                    // Uma lista completa de códigos de erro está disponível em
                    // https://firebase.google.com/docs/storage/web/handle-errors
                    console.log("Erro ao gerar a URL da imagem: "+error)
                    switch (error.code) {
                    case 'storage/object-not-found':
                        // File doesn't exist
                        break;
                    case 'storage/unauthorized':
                        // User doesn't have permission to access the object
                        break;
                    case 'storage/canceled':
                        // User canceled the upload
                        break;
            
                    // ...
            
                    case 'storage/unknown':
                        // Unknown error occurred, inspect the server response
                        break;
                    }
                });            
                
            });            
        
               
    } catch (error) {
        console.error("Erro ao fazer upload da imagem: ", error);
        alert("Não foi possível fazer o upload da imagem, insira uma imagem válida")
    }
}

imgDesligar.addEventListener("change",()=>{
    console.log(imgDesligar.files[0])
    store()
})
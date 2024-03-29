import { app, db } from "./config-firebase.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-storage.js";
import { addDoc, collection } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";

let btnAvancar = document.querySelector("#btnAvancar");
let confir = document.querySelector(".confirm");
let imageContainer = document.getElementById("imageContainer");

let loader = document.querySelector("#loader")
let btnCamera = document.querySelector("#btnCamera")

//switch que verifica se a etapa deve ser ignorada ou obrigatória
let campoNaoNecessario = document.querySelector("#campoNaoNecessario")
//campoNaoNecessario.checked = false


loader.classList.replace("d-block", "d-none")// para desabilitar o loader

let nomeImagem = "";
let images = [];
let temporaryImageName = "";
let temporaryImageStorage = [];

let timestamp = new Date().getTime() // para poder ser utilizado como nome da imagem ao salvar no cloud storage.

//criando um objeto para armazenar os dados da imagem
let dadosImagem = {
  nome: "",
  url: ""
}

dadosImagem.nome = timestamp// pegando o novo nome da imagem

const storage = getStorage(app);
const storageRef = ref(storage, `DPLimagem/${timestamp}`);// função ref() recebe a instância de armazenamento storage e uma string que representa o caminho para o local desejado, seria o nome do arquivo lá no storage. Estou salvando dentro de uma pasta chamado 'imagem/' e em seguida


btnCamera.addEventListener('change', handleFileSelect)

let selectedImages = []; // Alteração: alterando o nome da variável para evitar conflito com a variável 'images'


//Essa função irá veirificar em qual página o usuário está atualmente, e irá criar um nome único para poder utilizar no localStorage, para poder salvar os dados das imagens localmente e depois salvar no firestore
function verificaPagina() {

  if (btnCamera.classList.contains("apr")) {
    nomeImagem = "apr"

  } else if (btnCamera.classList.contains("desligar")) {
    nomeImagem = "desligar"

  } else if (btnCamera.classList.contains("bloquear")) {
    nomeImagem = "bloquear"

  } else if (btnCamera.classList.contains("sinalizar")) {
    nomeImagem = "sinalizar"

  } else if (btnCamera.classList.contains("testar")) {
    nomeImagem = "testar"

  } else if (btnCamera.classList.contains("aterrar")) {
    nomeImagem = "aterrar"

  } else if (btnCamera.classList.contains("proteger")) {
    nomeImagem = "proteger"

  }

}
// Alteração: definindo o array de imagens selecionadas

function handleFileSelect(evt) {
  const files = evt.target.files;

  verificaPagina();

  // Verificar se há espaço para novas imagens
  const remainingSlots = 3 - selectedImages.length;
  const filesToProcess = files.length > remainingSlots ? remainingSlots : files.length;

  if (selectedImages.length >= 3) {
    alert('Você atingiu o número máximo de imagens (3).');
    return;
  }

  for (let i = 0; i < filesToProcess; i++) {
    const file = files[i];
    const reader = new FileReader();

    reader.onload = function (e) {
      const imgElement = document.createElement('img');
      imgElement.src = e.target.result;
      imgElement.alt = 'Imagem';
      selectedImages.push({ file, imgElement }); // Armazenar cada imagem selecionada
      displayImages(); // Exibir as imagens
    };

    reader.readAsDataURL(file);
  }
}

function displayImages() {
  while (imageContainer.firstChild) {
    imageContainer.removeChild(imageContainer.firstChild);
  }

  for (let i = 0; i < selectedImages.length; i++) {
    imageContainer.appendChild(selectedImages[i].imgElement);
  }
}



btnAvancar.addEventListener("click", async (evento) => {
  evento.preventDefault();

  //Verifica se é a página "proteger6.html"
  if(window.location.href.includes("proteger6")){
    //Verifica se o campo switch "Não necessário" NÃO foi marcado, e chama a função de validação normal de cada página
    if (!campoNaoNecessario.checked) {
      validarESalvarRegistro()
    }
    // Caso tenha marcado o campo "Não necessário" Então chama a função de cadastrar no firebase e redireciona o usuário
    else{
      const confirmEnvio = confirm("DESEJA REALMENTE ENVIAR O REGISTRO?");
        if (confirmEnvio) {
          cadastrarDados();
          alert("ENVIO BEM-SUCEDIDO! REDIRECIONANDO PARA A PÁGINA INICIAL!");
          setTimeout(() => {
            window.location.href = "../..";
            // window.location.href = "../index.html";
          }, 2000);
        }
    }
  }
  //Caso não seja a página proteger6, chama a função de validação normal dde casa página
  else{
    validarESalvarRegistro()
  }

  



});

//Função de validação do campo "Confirmo que li e estou ciente." e do botão de "Abrir Câmera". Essa função foi separada do evento "btnAvancar" para poder ser chamada algumas vezes no momento da validação do campo "ESTA ETAPA NÃO É NECESSÁRIA." quando for selecionado ou não
function validarESalvarRegistro(){
  const isAprPage = window.location.href.includes("apr.html");
  if (isAprPage) {
    if (selectedImages.length === 0) {
      alert("VOCÊ DEVE INSERIR PELO MENOS UMA IMAGEM PARA PROSSEGUIR.");
    } else {
      temporaryImageStorage.push({ temporaryImageName, selectedImages });
      store(); // Armazenar no Firestore Storage
    }
  } else {
    if (!confir.checked) {
      alert("VOCÊ DEVE CONFIRMAR ANTES DE PROSSEGUIR.");
    } else if (selectedImages.length === 0) {
      alert("VOCÊ DEVE INSERIR PELO MENOS UMA IMAGEM PARA PROSSEGUIR.");
    } else {
      temporaryImageStorage.push({ temporaryImageName, selectedImages });
      store(); // Armazenar no Firestore Storage
    }
  }
}

function store() {
  loader.classList.replace("d-none", "d-block");

  try {
    const promises = [];
    let uploadedCount = 0; // Contador para acompanhar o número de uploads concluídos

    // Criar um objeto para armazenar as URLs das imagens por categoria (apr, desligar, bloquear, etc.)
    const dadosEquipe = JSON.parse(localStorage.getItem("dadosEquipe")) || {};

    verificaPagina(); // Identifica a página atual para determinar a categoria

    for (let i = 0; i < selectedImages.length; i++) {
      const file = selectedImages[i].file;
      const imgDados = { ...dadosImagem }; // Copiando os dados da imagem

      const timestamp = new Date().getTime(); // Novo timestamp para cada imagem
      imgDados.nome = timestamp; // Atualizando o nome da imagem

      const storageRef = ref(storage, `DPLimagem/${timestamp}`); // Referência no Storage

      promises.push(
        uploadBytes(storageRef, file).then((resultado) => {
          return getDownloadURL(resultado.ref).then((url) => {
            imgDados.url = url;

            // Armazenar a URL no objeto sob a chave correspondente à categoria da página
            const categoria = nomeImagem;
            if (!dadosEquipe[categoria]) {
              dadosEquipe[categoria] = [];
            }
            dadosEquipe[categoria].push({ timestamp, url });

            localStorage.setItem("dadosEquipe", JSON.stringify(dadosEquipe));

            uploadedCount++;

             if (uploadedCount === selectedImages.length || uploadedCount === 3) {
              loader.classList.replace("d-block", "d-none");

              if (window.location.href.includes("proteger6")) {
                try {
                  const confirmEnvio = confirm("DESEJA REALMENTE ENVIAR O REGISTRO?");
                  if (confirmEnvio) {
                    cadastrarDados();
                    alert("ENVIO BEM-SUCEDIDO! REDIRECIONANDO PARA A PÁGINA INICIAL!");
                    setTimeout(() => {
                      window.location.href = "../..";
                      // window.location.href = "../index.html";
                    }, 2000);
                  }
                } catch (error) {
                  console.error("Erro ao enviar imagem para o Firebase:", error);
                }
              } else {
                const nextPageHref = btnAvancar.getAttribute("href");
                window.location.href = nextPageHref;
              }

              selectedImages = [];
              displayImages();
            }
          });
        }).catch((error) => {
          console.log("Erro ao fazer upload da imagem: " + error);
        })
      );
    }

    Promise.all(promises).catch((error) => {
      console.log("Erro ao armazenar imagens no Firebase: " + error);
    });

  } catch (error) {
    console.error("Erro ao fazer upload da imagem: ", error);
    alert("Não foi possível fazer o upload da imagem, insira uma imagem válida");
  }
}

// CADASTRANDO TODOS OS DADOS NO FIRESTORE
async function cadastrarDados() {
  //Pegando os dados do localStorage para armazenar no banco
  let resultado = JSON.parse(localStorage.getItem("dadosEquipe"))

  try {
    console.log(resultado)
    await addDoc(collection(db, "registrar"), resultado);
    //console.log("Document criado com ID: ", docRef.id);
    alert("Dados cadastrados com sucesso");

    localStorage.removeItem("dadosEquipe")

    alert("ENVIO BEM-SUCEDIDO! REDIRECIONANDO PARA A PÁGINA INICIAL!");
    window.location.href = "../"

   } catch (e) {
    console.error("Erro ao criar o documento: ", e);
  }

  //getDados() // chamando função para atualizar lista de dados ao criar novo contato
}

if(window.location.href.includes("proteger6")){
  campoNaoNecessario.addEventListener('change',()=>{
    //Irá desabilitar a confirmação e a área para inserir a imagem
    if (campoNaoNecessario.checked) {
      confir.disabled = true
      areaCamera.classList.replace("d-block", "d-none")
  
  
    // Irá deixar ativo a área de confirmação e a inserção de imagens
    } else {
      confir.disabled = false
      areaCamera.classList.replace("d-none", "d-block")
    }
  })
}





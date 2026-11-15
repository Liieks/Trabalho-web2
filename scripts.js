let tela = document.getElementById('tela')
let personagem = document.getElementById('personagem')
let zumbi = document.getElementById('zumbi')
let barricada = document.getElementById('barricada')
let erva = document.getElementById('erva')
let contador = document.getElementById('contador')
let relogio = document.getElementById('relogio')
let painelTempo = document.getElementById('painelTempo')
let inicio = document.getElementById('inicio')
let fimDeJogo = document.getElementById('fimDeJogo')
let motivo = document.getElementById('motivo')
let resultado = document.getElementById('resultado')

let ervas = 0
let tempo = 60
let velocidade = 3
let jogando = false
let pulando = false
let mudo = false
let ciclo
let cronometro
let audio


let xZumbi = 0
let xBarricada = 0
let xErva = 0
let pesAnterior = 0


let alturasErva = [110, 190, 250, 200, 170, 140]

function aleatorio(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function tocar(frequencia, tipo, duracao) {
  if (mudo || !audio) return

  let oscilador = audio.createOscillator()
  let volume = audio.createGain()

  oscilador.type = tipo
  oscilador.frequency.value = frequencia
  volume.gain.setValueAtTime(0.05, audio.currentTime)
  volume.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + duracao)

  oscilador.connect(volume)
  volume.connect(audio.destination)
  oscilador.start()
  oscilador.stop(audio.currentTime + duracao)
}

function colidiu(a, b) {
  let ra = a.getBoundingClientRect()
  let rb = b.getBoundingClientRect()
  let m = 12 

  return ra.left + m < rb.right - m &&
         ra.right - m > rb.left + m &&
         ra.top + m < rb.bottom - m &&
         ra.bottom - m > rb.top + m
}

function novaErva() {
  xErva = tela.offsetWidth + aleatorio(0, 500)
  erva.style.left = xErva + 'px'
  erva.style.bottom = alturasErva[aleatorio(0, 2)] + 'px'
}

function pular() {
  if (!jogando || pulando) return

  pulando = true
  personagem.classList.add('pulo')
  tocar(400, 'square', 0.15)

  setTimeout(function() {
    personagem.classList.remove('pulo')
    pulando = false
  }, 700)
}

function terminar(texto, morreu) {
  jogando = false
  clearInterval(ciclo)
  clearInterval(cronometro)

  tela.classList.add('parado')
  if (morreu) personagem.classList.add('morto')

  motivo.innerText = texto
  resultado.innerText = ervas
  fimDeJogo.style.display = 'flex'

  tocar(120, 'sawtooth', 0.8)
}

function atualizar() {
  xZumbi -= velocidade
  xBarricada -= velocidade
  xErva -= velocidade


  if (xZumbi < -150) {
    xZumbi = Math.max(tela.offsetWidth, xBarricada) + aleatorio(350, 750)
  }
  if (xBarricada < -150) {
    xBarricada = Math.max(tela.offsetWidth, xZumbi) + aleatorio(350, 750)
  }
  if (xErva < -150) {
    novaErva()
  }

  zumbi.style.left = xZumbi + 'px'
  barricada.style.left = xBarricada + 'px'
  erva.style.left = xErva + 'px'

  let pes = personagem.getBoundingClientRect().bottom
  let caindo = pes > pesAnterior
  pesAnterior = pes

  if (colidiu(personagem, erva)) {
    ervas++
    contador.innerText = ervas
    novaErva()
    tocar(900, 'square', 0.1)
  }

  if (colidiu(personagem, zumbi)) {
    let cabeca = zumbi.getBoundingClientRect().top

    if (caindo && pes < cabeca + 55) {
      // eliminar o zumbo quando pular na cabeca dele
      xZumbi = Math.max(tela.offsetWidth, xBarricada) + aleatorio(350, 750)
      zumbi.style.left = xZumbi + 'px'
      tocar(220, 'square', 0.15)
    } else {
      terminar('Os infectados te alcançaram.', true)
    }
  }

  if (jogando && colidiu(personagem, barricada)) {
    terminar('O arame farpado te prendeu.', true)
  }
}

function contarTempo() {
  tempo--
  velocidade += 0.04
  relogio.innerText = tempo

  if (tempo <= 10) {
    painelTempo.classList.add('urgente')
  }

  if (tempo <= 0) {
    terminar('O tempo acabou. Você sobreviveu.', false)
  }
}

function iniciar() {
  clearInterval(ciclo)
  clearInterval(cronometro)

  if (!audio) audio = new (window.AudioContext || window.webkitAudioContext)()

  ervas = 0
  tempo = 60
  velocidade = 3
  jogando = true
  pulando = false

  contador.innerText = 0
  relogio.innerText = tempo
  painelTempo.classList.remove('urgente')
  tela.classList.remove('parado')
  personagem.classList.remove('pulo', 'morto')
  inicio.style.display = 'none'
  fimDeJogo.style.display = 'none'

  xZumbi = tela.offsetWidth + 300
  xBarricada = xZumbi + aleatorio(350, 750)
  zumbi.style.left = xZumbi + 'px'
  barricada.style.left = xBarricada + 'px'
  novaErva()

  pesAnterior = personagem.getBoundingClientRect().bottom

  ciclo = setInterval(atualizar, 10)
  cronometro = setInterval(contarTempo, 1000)
}

document.addEventListener('keydown', function(evento) {
  if (evento.code == 'KeyM') {
    mudo = !mudo
  }

  if (evento.code == 'Space' || evento.code == 'ArrowUp' || evento.code == 'KeyW') {
    if (jogando) evento.preventDefault()
    pular()
  }
})

tela.addEventListener('pointerdown', pular)
document.getElementById('botaoIniciar').addEventListener('click', iniciar)
document.getElementById('botaoReiniciar').addEventListener('click', iniciar)

import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
  return null;
}

// Scene setup
document.getElementById('Language').style.display = 'none';
document.getElementById('controls').style.display = 'none';
// Global değişkenler
let renderer, scene, camera;
let gameOverMessage, scoreBoard;
let tournamentMatches = [];
let tournamentOptions;
let currentMatchIndex = 0;
let tournamentWinners = [];
let semiFinalLosers = [];
let gameActive = false;
let u = 0;

// Yeni eklenen global değişkenler
let aiUpdateInterval;
let animationFrameId;
let onKeyDown, onKeyUp; // Klavye olay fonksiyonları
let leftUpPressed = false;
let leftDownPressed = false;
let rightUpPressed = false;
let rightDownPressed = false;

if (localStorage.getItem('vs_mode') === 'true')
  startGame(window.gameOptions);
else if (localStorage.getItem('tournament_mode') === 'true')
  startTournament();
else
{
  window.history.pushState({}, "", "/game_home/");
  handleLocation();
}

// startGame fonksiyonunu gameOptions parametresi alacak şekilde tanımlıyoruz
function startGame(gameOptions) {
  // Kullanıcı seçeneklerini alma

  if (!gameOptions)
    gameOptions = JSON.parse(localStorage.getItem('gameOptions'));

  gameActive = true;
  let player1Name = gameOptions.player1Name || 'Oyuncu 1';
  let player2Name = gameOptions.player2Name || 'Oyuncu 2';
  let gameMode = gameOptions.gameMode || 'standard';
  let paddleSizeOption = gameOptions.paddleSize || 'medium';
  let ballSpeedOption = gameOptions.ballSpeed || 'medium';
  let aiMode = gameOptions.aiMode || false;
  let aiDifficulty = gameOptions.aiDifficulty || 'medium';
  let onGameOver = gameOptions.onGameOver || null;

  // AI hata payı (error margin) zorluk seviyesine göre ayarlanacak
  let aiErrorMargin = 0.75; // Varsayılan değer
  if (aiMode) {
    if (aiDifficulty === 'easy') {
      aiErrorMargin = 1.5; // Kolay zorlukta daha büyük hata payı
    } else if (aiDifficulty === 'medium') {
      aiErrorMargin = 0.75; // Orta zorlukta orta seviye hata payı
    } else {
      aiErrorMargin = 0.1; // Zor zorlukta düşük hata payı
    }
  }

  // Sahne, kamera ve renderer oluşturma
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true; // Gölgeyi etkinleştir
  document.body.appendChild(renderer.domElement);

  // Skorlar
  let player1Score = 0;
  let player2Score = 0;
  const winningScore = 5; // Oyunun biteceği skor

  // Skorları göstermek için HTML elemanı
  scoreBoard = document.createElement('div');
  scoreBoard.style.position = 'absolute';
  scoreBoard.style.top = '10px';
  scoreBoard.style.left = '50%';
  scoreBoard.style.transform = 'translateX(-50%)';
  scoreBoard.style.color = 'white';
  scoreBoard.style.fontSize = '24px';
  document.body.appendChild(scoreBoard);

  function updateScoreBoard() {
    scoreBoard.innerHTML = `${player1Name}: ${player1Score} - ${player2Name}: ${player2Score}`;
  }
  updateScoreBoard();

  // Oyun bittiğinde gösterilecek mesaj elemanı
  gameOverMessage = document.createElement('div');
  gameOverMessage.style.position = 'absolute';
  gameOverMessage.style.top = '50%';
  gameOverMessage.style.left = '50%';
  gameOverMessage.style.transform = 'translate(-50%, -50%)';
  gameOverMessage.style.color = 'white';
  gameOverMessage.style.fontSize = '32px';
  gameOverMessage.style.textAlign = 'center';
  gameOverMessage.style.display = 'none'; // Başlangıçta gizli
  document.body.appendChild(gameOverMessage);

  // Alan boyutları
  const fieldWidth = 10; // Yarı genişlik
  const fieldHeight = 5; // Yarı yükseklik

  // Malzemeler
  const floorMaterial = new THREE.MeshLambertMaterial({
    color: 0x00ff00,
    side: THREE.DoubleSide,
  });
  const wallMaterial = new THREE.MeshLambertMaterial({ color: 0x888888 });
  const paddleMaterial = new THREE.MeshLambertMaterial({ color: 0xffffff });
  const puckMaterial = new THREE.MeshLambertMaterial({ color: 0x333333 }); // Puck için gri renk

  // Zemin
  const floorGeometry = new THREE.PlaneGeometry(20, 10);
  const floor = new THREE.Mesh(floorGeometry, floorMaterial);
  floor.receiveShadow = true; // Gölge almasını sağla
  scene.add(floor);

  // Duvarlar
  const wallThickness = 0.2;

  // Üst duvar
  const topWall = new THREE.Mesh(
    new THREE.BoxGeometry(20, wallThickness, 1),
    wallMaterial
  );
  topWall.position.y = fieldHeight;
  topWall.receiveShadow = true;
  scene.add(topWall);

  // Alt duvar
  const bottomWall = new THREE.Mesh(
    new THREE.BoxGeometry(20, wallThickness, 1),
    wallMaterial
  );
  bottomWall.position.y = -fieldHeight;
  bottomWall.receiveShadow = true;
  scene.add(bottomWall);

  // Sol duvar
  const leftWall = new THREE.Mesh(
    new THREE.BoxGeometry(wallThickness, 10, 1),
    wallMaterial
  );
  leftWall.position.x = -fieldWidth;
  leftWall.receiveShadow = true;
  scene.add(leftWall);

  // Sağ duvar
  const rightWall = new THREE.Mesh(
    new THREE.BoxGeometry(wallThickness, 10, 1),
    wallMaterial
  );
  rightWall.position.x = fieldWidth;
  rightWall.receiveShadow = true;
  scene.add(rightWall);

  // Raket boyutunu seçilen seçeneğe göre ayarlama
  let paddleHeight;
  if (paddleSizeOption === 'large') {
    paddleHeight = 3;
  } else if (paddleSizeOption === 'medium') {
    paddleHeight = 2;
  } else {
    paddleHeight = 1;
  }
  const paddleWidth = 0.2,
    paddleDepth = 1;

  // Sol raket (Oyuncu 1)
  const leftPaddleGeometry = new THREE.BoxGeometry(
    paddleWidth,
    paddleHeight,
    paddleDepth
  );
  const leftPaddle = new THREE.Mesh(leftPaddleGeometry, paddleMaterial);
  leftPaddle.position.x = -fieldWidth + paddleWidth / 2 + wallThickness;
  leftPaddle.castShadow = true; // Gölge oluşturmasını sağla
  scene.add(leftPaddle);

  // Sağ raket (Oyuncu 2 veya AI)
  const rightPaddleGeometry = new THREE.BoxGeometry(
    paddleWidth,
    paddleHeight,
    paddleDepth
  );
  const rightPaddle = new THREE.Mesh(rightPaddleGeometry, paddleMaterial);
  rightPaddle.position.x = fieldWidth - paddleWidth / 2 - wallThickness;
  rightPaddle.castShadow = true;
  scene.add(rightPaddle);

  // Puck
  const puckGeometry = new THREE.CylinderGeometry(0.5, 0.5, 0.2, 32);
  const puck = new THREE.Mesh(puckGeometry, puckMaterial);
  puck.rotation.x = Math.PI / 2; // Puck'ı yatay hale getir
  puck.position.y = 0.1; // Zemine yakın yerleştirme
  puck.castShadow = true;
  scene.add(puck);

  // Işıklar
  // Ambient Light (Ortam ışığı)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);

  // Directional Light (Yönlü ışık)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(20, 20, 10);
  directionalLight.castShadow = true;
  scene.add(directionalLight);
  directionalLight.shadow.bias = -0.00005; // Daha küçük bir negatif değer
  directionalLight.shadow.normalBias = 0.0; // Varsayılan değere geri döndürün

  // Gölge haritası ayarları
  directionalLight.shadow.mapSize.width = 4096;
  directionalLight.shadow.mapSize.height = 4096;
  const d = 15; // Daha küçük bir değer kullanarak gölge alanını daraltın
  directionalLight.shadow.camera.left = -d;
  directionalLight.shadow.camera.right = d;
  directionalLight.shadow.camera.top = d;
  directionalLight.shadow.camera.bottom = -d;

  // Kamera pozisyonu
  camera.position.z = 15;
  camera.position.y = -10;
  camera.lookAt(0, 0, 0);

  // Puck ve raket hızlarını seçilen seçeneğe göre ayarlama
  let puckSpeedX, puckSpeedY;
  if (ballSpeedOption === 'fast') {
    puckSpeedX = 0.3;
    puckSpeedY = 0.2;
  } else if (ballSpeedOption === 'medium') {
    puckSpeedX = 0.20;
    puckSpeedY = 0.13;
  } else {
    puckSpeedX = 0.075;
    puckSpeedY = 0.05;
  }
  const paddleSpeed = 0.3;

  // Kullanıcı kontrolü değişkenleri
  leftUpPressed = false;
  leftDownPressed = false;
  rightUpPressed = false;
  rightDownPressed = false;

  // AI hedef pozisyon değişkeni
  let aiTargetY = rightPaddle.position.y; // AI paddle'ının hedef pozisyonu

  // Oyun durumu değişkeni
  let gameOver = false;

  // Klavye olayları (Sadece birinci oyuncu için)
  onKeyDown = function(event) {
    if (event.key === 'a' || event.key === 'A') leftUpPressed = true;
    if (event.key === 's' || event.key === 'S') leftDownPressed = true;
    if (!aiMode) {
      if (event.key === 'k' || event.key === 'K') rightUpPressed = true;
      if (event.key === 'l' || event.key === 'L') rightDownPressed = true;
    }
  };

  onKeyUp = function(event) {
    if (event.key === 'a' || event.key === 'A') leftUpPressed = false;
    if (event.key === 's' || event.key === 'S') leftDownPressed = false;
    if (!aiMode) {
      if (event.key === 'k' || event.key === 'K') rightUpPressed = false;
      if (event.key === 'l' || event.key === 'L') rightDownPressed = false;
    }
  };

  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  if (aiMode) {
    // AI'yı saniyede bir kez güncelle
    aiUpdateInterval = setInterval(updateAI, 1000);
  }

  // Oyun döngüsü
  function animate() {
    if (!gameOver) {
      animationFrameId = requestAnimationFrame(animate);
    }

    // Puck hareketi
    puck.position.x += puckSpeedX;
    puck.position.y += puckSpeedY;

    // Oyun modu: Unpredictable ise, puck'ın hareket yönünü rastgele değiştir
    if (gameMode === 'unpredictable') {
      puckSpeedX += (Math.random() - 0.5) * 0.01;
      puckSpeedY += (Math.random() - 0.5) * 0.01;
    }

    // Oyun modu: Accelerating ise, puck'ın hızını zamanla artır
    if (gameMode === 'accelerating') {
      puckSpeedX *= 1.0005;
      puckSpeedY *= 1.0005;
    }

    // Y ekseninde duvardan sekme
    const collisionBoundaryY = fieldHeight - 0.5 - wallThickness / 2;
    if (puck.position.y > collisionBoundaryY || puck.position.y < -collisionBoundaryY) {
      puckSpeedY = -puckSpeedY;
    }

    // Sağ ve sol raketlerle çarpışma
    const collisionBoundaryX = fieldWidth - 0.5 - paddleWidth - wallThickness;

    // Sağ raketle çarpışma
    if (
      puck.position.x > rightPaddle.position.x - paddleWidth / 2 - 0.1 &&
      puck.position.x < rightPaddle.position.x + paddleWidth / 2 + 0.1
    ) {
      if (
        puck.position.y > rightPaddle.position.y - paddleHeight / 2 &&
        puck.position.y < rightPaddle.position.y + paddleHeight / 2
      ) {
        puckSpeedX = -puckSpeedX;
      }
    }

    // Sol raketle çarpışma
    if (
      puck.position.x < leftPaddle.position.x + paddleWidth / 2 + 0.1 &&
      puck.position.x > leftPaddle.position.x - paddleWidth / 2 - 0.1
    ) {
      if (
        puck.position.y > leftPaddle.position.y - paddleHeight / 2 &&
        puck.position.y < leftPaddle.position.y + paddleHeight / 2
      ) {
        puckSpeedX = -puckSpeedX;
      }
    }

    // Puck duvarların arkasına geçti mi?
    if (puck.position.x > rightWall.position.x + wallThickness / 2) {
      // Puck duvarın arkasına geçti, skor güncelle
      player1Score++;
      updateScoreBoard();
      puckReset();

      // Oyun bitti mi?
      if (player1Score >= winningScore) {
        endGame(player1Name, player2Name, player1Score, player2Score);
      }
    }

    if (puck.position.x < leftWall.position.x - wallThickness / 2) {
      // Puck duvarın arkasına geçti, skor güncelle
      player2Score++;
      updateScoreBoard();
      puckReset();

      // Oyun bitti mi?
      if (player2Score >= winningScore) {
        endGame(player2Name, player1Name, player2Score, player1Score);
      }
    }

    // Sol raket hareketi (Oyuncu 1)
    if (leftUpPressed && leftPaddle.position.y < fieldHeight - paddleHeight / 2 - 0.3) {
      leftPaddle.position.y += paddleSpeed;
    }
    if (leftDownPressed && leftPaddle.position.y > -fieldHeight + paddleHeight / 2 + 0.3) {
      leftPaddle.position.y -= paddleSpeed;
    }

    if (aiMode) {
      // AI paddle hareketi
      let paddleY = rightPaddle.position.y;

      // Paddle'ı hedef pozisyona doğru hareket ettir
      if (
        paddleY < aiTargetY - 0.1 &&
        paddleY < fieldHeight - paddleHeight / 2 - 0.3
      ) {
        rightPaddle.position.y += paddleSpeed;
      } else if (
        paddleY > aiTargetY + 0.1 &&
        paddleY > -fieldHeight + paddleHeight / 2 + 0.3
      ) {
        rightPaddle.position.y -= paddleSpeed;
      }
    } else {
      // Sağ raket hareketi (Oyuncu 2)
      if (rightUpPressed && rightPaddle.position.y < fieldHeight - paddleHeight / 2 - 0.3) {
        rightPaddle.position.y += paddleSpeed;
      }
      if (rightDownPressed && rightPaddle.position.y > -fieldHeight + paddleHeight / 2 + 0.3) {
        rightPaddle.position.y -= paddleSpeed;
      }
    }

    renderer.render(scene, camera);
  }

  // Puck'ı sıfırlama fonksiyonu
  function puckReset() {
    puck.position.set(0, 0, 0);
    // Puck'ın yönünü rastgele değiştir
    if (ballSpeedOption === 'fast') {
      puckSpeedX = (Math.random() > 0.5 ? 1 : -1) * 0.3;
      puckSpeedY = Math.random() * 0.2 - 0.1;
    } else if (ballSpeedOption === 'medium') {
      puckSpeedX = (Math.random() > 0.5 ? 1 : -1) * 0.20;
      puckSpeedY = Math.random() * 0.2 - 0.1;
    } else {
      puckSpeedX = (Math.random() > 0.5 ? 1 : -1) * 0.075;
      puckSpeedY = Math.random() * 0.2 - 0.1;
    }
  }

  // AI fonksiyonları
  function predictBallPosition() {
    let ballPosX = puck.position.x;
    let ballPosY = puck.position.y;
    let ballSpeedX = puckSpeedX;
    let ballSpeedY = puckSpeedY;

    // AI paddle'ının X pozisyonu
    let aiPaddleX = rightPaddle.position.x;

    // Eğer ballSpeedX sıfırsa, küçük bir değer verelim
    if (ballSpeedX === 0) {
      ballSpeedX = 0.0001;
    }

    // Topun AI paddle'ına ulaşması için gereken zamanı hesaplayalım
    let timeToReachPaddle = (aiPaddleX - ballPosX) / ballSpeedX;

    // Eğer top AI paddle'ına doğru gitmiyorsa, tahmin yapmaya gerek yok
    if (timeToReachPaddle < 0) {
      return rightPaddle.position.y;
    }

    // Topun Y pozisyonunu zaman içinde simüle ederek duvarlardan sekmeleri hesaba katalım
    let predictedY = ballPosY;
    let predictedSpeedY = ballSpeedY;
    let remainingTime = timeToReachPaddle;

    while (remainingTime > 0) {
      // Topun duvara çarpana kadar ne kadar süresi var?
      let timeToWall;
      if (predictedSpeedY > 0) {
        // Yukarı doğru hareket ediyor
        timeToWall =
          (fieldHeight - predictedY - 0.5 - wallThickness / 2) / predictedSpeedY;
      } else {
        // Aşağı doğru hareket ediyor
        timeToWall =
          (-fieldHeight - predictedY + 0.5 + wallThickness / 2) / predictedSpeedY;
      }

      if (timeToWall > remainingTime) {
        // Duvara çarpmadan AI paddle'ına ulaşacak
        predictedY += predictedSpeedY * remainingTime;
        remainingTime = 0;
      } else {
        // Duvara çarpacak, hızı tersine çevir
        predictedY += predictedSpeedY * timeToWall;
        predictedSpeedY = -predictedSpeedY;
        remainingTime -= timeToWall;
      }
    }

    // Hata payını uygulayalım
    predictedY += (Math.random() - 0.5) * aiErrorMargin;

    // Tahmin edilen Y pozisyonunu oyun alanının sınırları içinde olacak şekilde sınırlayalım
    const maxY = fieldHeight - paddleHeight / 2 - 0.3;
    const minY = -fieldHeight + paddleHeight / 2 + 0.3;
    predictedY = Math.max(minY, Math.min(maxY, predictedY));

    return predictedY;
  }

  function updateAI() {
    // Topun tahmin edilen Y pozisyonunu al ve global değişkene ata
    aiTargetY = predictBallPosition();
  }

  // Oyunu bitirme fonksiyonu
  function endGame(winnerName, loserName, winnerScore, loserScore) {
    gameOver = true;

    // Klavye olaylarını kaldır
    document.removeEventListener('keydown', onKeyDown);
    document.removeEventListener('keyup', onKeyUp);

    // AI interval'ı temizle
    if (aiUpdateInterval) {
      clearInterval(aiUpdateInterval);
    }

    // Animasyonu iptal et
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }

    // Oyun sahnesini temizle
    while (scene.children.length > 0) {
      scene.remove(scene.children[0]);
    }
    renderer.render(scene, camera); // Ekranı temizlemek için

    // Skorları ve kazananı göster
    let data = "won";
    let lastScore = "Son Skor:";
    let next = "Devam Et";
    let currentLanguage = localStorage.getItem('currentLanguage');
    if (currentLanguage === 'tr')
    {
      data = "kazandı";
      lastScore = "Son Skor:";
      next = "Devam Et";
    }
    else if (currentLanguage === 'en')
    {
      data = "won";
      lastScore = "Last Score:";
      next = "Next";
    }
    else if (currentLanguage === 'fr')
    {
      data = "gagné";
      lastScore = "Dernier Score:";
      next = "Prochain";
    }
    gameOverMessage.innerHTML = `
      <p>${winnerName} ${data}!</p>
      <p>${lastScore} ${player1Name} ${player1Score} - ${player2Name} ${player2Score}</p>
    `;
    sendGameResult(winnerName, winnerScore, loserName, loserScore);
    
    // Turnuva modunda isek, 'Hazır' butonunu ve sonraki oyuncuları göster
    if (onGameOver && typeof onGameOver === 'function') {
      gameOverMessage.innerHTML += `<button id="nextMatchButton">${next}</button>`;
      gameOverMessage.style.display = 'block';

      document.getElementById('nextMatchButton').addEventListener('click', () => {
        // HTML elemanlarını temizle
        gameOverMessage.style.display = 'none';
        document.body.removeChild(renderer.domElement);
        document.body.removeChild(scoreBoard);
        document.body.removeChild(gameOverMessage);

        // Kazananı kaydet ve bir sonraki maça geç
        onGameOver(winnerName);
      });
    } else {

      document.body.removeChild(scoreBoard);
      document.body.removeChild(renderer.domElement);
      localStorage.removeItem('vs_mode');
      localStorage.removeItem('tournament_mode');
      localStorage.removeItem('gameOptions');
      window.history.pushState({}, "", "/game_home/");
      handleLocation();
    }
  }
  animate();
}

// Turnuva fonksiyonunu tanımlayın
function startTournament() {
  // Turnuva seçeneklerini al
  tournamentOptions = window.tournamentOptions;

  if (!tournamentOptions)
    tournamentOptions = JSON.parse(localStorage.getItem('gameOptions'));

  // Oyuncuları al ve karıştır
  const players = tournamentOptions.players.slice();
  shuffleArray(players);

  // Turnuva eşleşmelerini hazırlayın (2 yarı final ve 1 final)
  tournamentMatches = [
    { player1: players[0], player2: players[1], winner: null, isSemiFinal: true },
    { player1: players[2], player2: players[3], winner: null, isSemiFinal: true },
    { player1: null, player2: null, winner: null, isThirdPlace: true }, // Üçüncülük maçı
    { player1: null, player2: null, winner: null, isFinal: true }, // Final maçı
  ];

  currentMatchIndex = 0;
  tournamentWinners = [];
  semiFinalLosers = [];

  // İlk maçı başlatmadan önce 'Hazır' butonunu göster
  showNextMatchReadyScreen();
}

// Bir sonraki maça başlamadan önce oyuncu isimlerini ve 'Hazır' butonunu gösteren fonksiyon
function showNextMatchReadyScreen() {
  const match = tournamentMatches[currentMatchIndex];

  // Eğer üçüncülük maçıysa ve oyuncular henüz belirlenmediyse, oyuncuları belirle
  if (match.isThirdPlace && match.player1 === null && match.player2 === null) {
    match.player1 = semiFinalLosers[0];
    match.player2 = semiFinalLosers[1];
  }

  // Eğer final maçıysa ve oyuncular henüz belirlenmediyse, oyuncuları belirle
  if (match.isFinal && match.player1 === null && match.player2 === null) {
    match.player1 = tournamentMatches[0].winner;
    match.player2 = tournamentMatches[1].winner;
  }

  if (u === 0) {
    gameActive = false;
  } else {
    gameActive = true;
  }
  u++;

  // Maç türüne göre başlık belirleme
  let matchTitle = "Sıradaki Maç:";
  let currentLanguage = localStorage.getItem('currentLanguage');

  if (match.isSemiFinal) {
    if (currentLanguage === 'tr')
      matchTitle = "Sıradaki Maç:";
    else if (currentLanguage === 'en')
      matchTitle = "Next Match:";
    else if (currentLanguage === 'fr')
      matchTitle = "Prochain Match:";  
  } else if (match.isThirdPlace) {
    if (currentLanguage === 'tr')
      matchTitle = "Üçüncülük Maçı:";
    else if (currentLanguage === 'en')
      matchTitle = "Third Place Match:";
    else if (currentLanguage === 'fr')
      matchTitle = "Match de Troisième Place:";
  } else if (match.isFinal) {
    if (currentLanguage === 'tr')
      matchTitle = "Final Maçı:";
    else if (currentLanguage === 'en')
      matchTitle = "Final Match:";
    else if (currentLanguage === 'fr')
      matchTitle = "Match Final:";
  }

  // Mesajı göstermek için bir div oluştur
  let ready = "Hazır";
  if (localStorage.getItem('currentLanguage') === 'tr')
    ready = "Hazır";
  else if (localStorage.getItem('currentLanguage') === 'en')
    ready = "Ready";
  else if (localStorage.getItem('currentLanguage') === 'fr')
    ready = "Prêt";
  const readyMessage = document.createElement('div');
  readyMessage.style.position = 'absolute';
  readyMessage.style.top = '50%';
  readyMessage.style.left = '50%';
  readyMessage.style.transform = 'translate(-50%, -50%)';
  readyMessage.style.color = 'black';
  readyMessage.style.fontSize = '24px';
  readyMessage.style.textAlign = 'center';
  readyMessage.innerHTML = `
    <p>${matchTitle}</p>
    <p>${match.player1} vs ${match.player2}</p>
    <button id="startMatchButton"> ${ready}</button>
  `;
  document.body.appendChild(readyMessage);

  document.getElementById('startMatchButton').addEventListener('click', () => {
    document.body.removeChild(readyMessage);
    startMatch(match.player1, match.player2, tournamentOptions, onMatchEnd);
  });
}

// Maç bittiğinde çağrılan fonksiyon
function onMatchEnd(winnerName) {
  const match = tournamentMatches[currentMatchIndex];

  // Kazananı kaydet
  match.winner = winnerName;

  if (match.isSemiFinal) {
    // Yarı final maçında kaybedenleri kaydet
    const loser = match.player1 === winnerName ? match.player2 : match.player1;
    semiFinalLosers.push(loser);
  }

  currentMatchIndex++;

  if (currentMatchIndex < tournamentMatches.length) {
    // Bir sonraki maça geçmeden önce 'Hazır' ekranını göster
    showNextMatchReadyScreen();
  } else {
    // Turnuva bitti, sonuçları göster
    displayTournamentResults();
  }
}

// Maç başlatma fonksiyonu
function startMatch(player1Name, player2Name, options, callback) {
  // Oyun seçeneklerini hazırla
  const gameOptions = {
    player1Name: player1Name,
    player2Name: player2Name,
    aiMode: false, // Turnuvada AI yok
    gameMode: options.gameMode,
    paddleSize: options.paddleSize,
    ballSpeed: options.ballSpeed,
    onGameOver: callback,
  };

  // Oyunu başlat
  startGame(gameOptions);
}

// Dizi karıştırma fonksiyonu
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Turnuva sonuçlarını gösterme fonksiyonu
function displayTournamentResults() {
  // Final maçının kazananını ve ikincisini belirle
  let tournamentWon = "Turnuva Sonuçları:";
  let game_home = "Oyun Ana Sayfası";
  if (localStorage.getItem('currentLanguage') === 'tr')
  {
    tournamentWon = "Turnuva Sonuçları:";
    game_home = "Oyun Ana Sayfası";
  }
  else if (localStorage.getItem('currentLanguage') === 'en')
  {
    tournamentWon = "Tournament Results:";
    game_home = "Game Home";
  }
  else if (localStorage.getItem('currentLanguage') === 'fr')
  {
    tournamentWon = "Résultats du Tournoi:";
    game_home = "Accueil du Jeu";
  }
  const finalMatch = tournamentMatches.find((match) => match.isFinal);
  const champion = finalMatch.winner;
  const runnerUp =
    finalMatch.player1 === champion ? finalMatch.player2 : finalMatch.player1;

  // Üçüncülük maçının kazananını ve dördüncüsünü belirle
  const thirdPlaceMatch = tournamentMatches.find((match) => match.isThirdPlace);
  const thirdPlace = thirdPlaceMatch.winner;
  const fourthPlace =
    thirdPlaceMatch.player1 === thirdPlace
      ? thirdPlaceMatch.player2
      : thirdPlaceMatch.player1;

  // Sonuçları göster
  const message = `
    <h1>${tournamentWon}</h1>
    <ol>
      <li>${champion}</li>
      <li>${runnerUp}</li>
      <li>${thirdPlace}</li>
      <li>${fourthPlace}</li>
    </ol>
    <button id="backGameHome">${game_home}</button>
  `;

  // Mesajı göstermek için bir div oluştur
  const tournamentMessage = document.createElement('div');
  tournamentMessage.style.position = 'absolute';
  tournamentMessage.style.top = '50%';
  tournamentMessage.style.left = '50%';
  tournamentMessage.style.transform = 'translate(-50%, -50%)';
  tournamentMessage.style.color = 'black';
  tournamentMessage.style.fontSize = '24px';
  tournamentMessage.style.textAlign = 'center';
  tournamentMessage.innerHTML = message;
  document.body.appendChild(tournamentMessage);
  localStorage.removeItem('tournament_mode');

  // Yeniden başlat butonuna tıklanıldığında ana menüye dön
  document.getElementById('backGameHome').addEventListener('click', () => {
    document.body.removeChild(tournamentMessage);
    window.history.pushState({}, "", "/game_home/");
    handleLocation();
  });
}

async function sendGameResult(winnerName, winnerScore, loserName, loserScore) {
  const data = {
    winnerName: winnerName,
    winnerScore: winnerScore,
    loserName: loserName,
    loserScore: loserScore,
  };
  const accessToken = getCookie('access_token');
  const url = window.location.origin
  try {
    const response = await fetch(url+'/game/match_results_post/',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      }
    );

    const responData = await response.json();
    if (response.status === 401){
      const newAccessToken = await refreshAccessToken();
      if (newAccessToken){
        document.cookie = `access_token=${newAccessToken}; path=/; Secure; SameSite=Lax;`;
        sendGameResult(winnerName, winnerScore, loserName, loserScore);
      }
      else{
        logout();
        return;
      }
    }
  } catch (error) {
    console.error("Error sending game result:", error);
  }
}

// popstate olayında her şeyi temizleme
window.addEventListener('popstate', function (event) {
  // Klavye olaylarını kaldır
  document.removeEventListener('keydown', onKeyDown);
  document.removeEventListener('keyup', onKeyUp);

  // AI interval'ı temizle
  if (aiUpdateInterval) {
    clearInterval(aiUpdateInterval);
  }

  // Animasyonu iptal et
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }

  // DOM elemanlarını kaldır
  if (renderer && renderer.domElement && renderer.domElement.parentNode) {
    renderer.domElement.parentNode.removeChild(renderer.domElement);
  }
  if (scoreBoard && scoreBoard.parentNode) {
    scoreBoard.parentNode.removeChild(scoreBoard);
  }
  if (gameOverMessage && gameOverMessage.parentNode) {
    gameOverMessage.parentNode.removeChild(gameOverMessage);
  }

  // Sahneyi temizle
  if (scene) {
    while (scene.children.length > 0) {
      scene.remove(scene.children[0]);
    }
  }

  // Global değişkenleri sıfırla
  renderer = null;
  scene = null;
  camera = null;
  gameOverMessage = null;
  scoreBoard = null;
  tournamentMatches = [];
  tournamentOptions = null;
  currentMatchIndex = 0;
  tournamentWinners = [];
  semiFinalLosers = [];
  gameActive = false;
  u = 0;

  // Oyun modunu temizle ve ana sayfaya yönlendir
  localStorage.removeItem('vs_mode');
  localStorage.removeItem('tournament_mode');
  localStorage.removeItem('gameOptions');
  window.history.pushState({}, "", "/game_home/");
  handleLocation();
});

async function refreshAccessToken() {
  const refreshToken = getCookie('refresh_token');
  
  try {
      const response = await fetch(url+'/api/token/refresh/', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify({
              refresh: refreshToken
          }),
      });
      
      const data = await response.json();

      if (data.access) {
          return data.access 
      } else {
          console.error("Refresh token suresi dolmus");
      }
  } catch (error) {
      console.error('Token yenileme hatası:', error);
  }
}


function gameClear()
{
  document.removeEventListener('keydown', onKeyDown);
  document.removeEventListener('keyup', onKeyUp);
   // AI interval'ı temizle
   if (aiUpdateInterval) {
    clearInterval(aiUpdateInterval);
  }

  // Animasyonu iptal et
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }

  // DOM elemanlarını kaldır
  if (renderer && renderer.domElement && renderer.domElement.parentNode) {
    renderer.domElement.parentNode.removeChild(renderer.domElement);
  }
  if (scoreBoard && scoreBoard.parentNode) {
    scoreBoard.parentNode.removeChild(scoreBoard);
  }
  if (gameOverMessage && gameOverMessage.parentNode) {
    gameOverMessage.parentNode.removeChild(gameOverMessage);
  }

  // Sahneyi temizle
  if (scene) {
    while (scene.children.length > 0) {
      scene.remove(scene.children[0]);
    }
  }
  renderer = null;
  scene = null;
  camera = null;
  gameOverMessage = null;
  scoreBoard = null;
  tournamentMatches = [];
  tournamentOptions = null;
  currentMatchIndex = 0;
  tournamentWinners = [];
  semiFinalLosers = [];
  gameActive = false;
}

async function logout() {
  const language = localStorage.getItem('currentLanguage') || 'en';
  if (language === 'tr')
      alert('Lütfen tekrar giriş yapın. Giriş sayfasına yönlendiriliyorsunuz.');
  else if (language === 'en')
      alert('Please login again. You are being redirected to the login page.');
  else if (language === 'fr')
      alert('Veuillez vous reconnecter. Vous êtes redirigé vers la page de connexion.');
  gameClear();
  document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure;";
  document.cookie = "refresh_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; Secure;";
  localStorage.clear();
  sessionStorage.clear();
  window.history.pushState({}, "", "/login/");
  handleLocation();
}
import React, { useState, useEffect, useCallback, useRef } from "react";
import "./App.css";

// --- IMAGENS INIMIGO 1 (RED) ---
import e1IdleSprite from "./assets/Enemy1Idle.png";
import e1HurtSprite from "./assets/Enemy1Hurt.png";

// --- IMAGENS INIMIGO 2 (YELLOW) ---
import yWalk0 from "./assets/yellowninjawalk0.png";
import yWalk1 from "./assets/yellowninjawalk1.png";
import yWalk2 from "./assets/yellowninjawalk2.png";
import yWalk3 from "./assets/yellowninjawalk3.png";
import yWalk4 from "./assets/yellowninjawalk4.png";
import yWalk5 from "./assets/yellowninjawalk5.png";
import yHurt0 from "./assets/yellowninjahurt0.png";
import yHurt1 from "./assets/yellowninjahurt1.png";
import yHurt2 from "./assets/yellowninjahurt2.png";
import yHurt3 from "./assets/yellowninjahurt3.png";

const yellowWalkFrames = [yWalk0, yWalk1, yWalk2, yWalk3, yWalk4, yWalk5];
const yellowHurtFrames = [yHurt0, yHurt1, yHurt2, yHurt3];

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [level, setLevel] = useState(1);
  const [showPowerUpMenu, setShowPowerUpMenu] = useState(false);
  const [gameVictory, setGameVictory] = useState(false);

  // Status Jogador
  const [pos, setPos] = useState(window.innerWidth / 2 - 50);
  const [hp, setHp] = useState(100);
  const [stamina, setStamina] = useState(100);
  const [maxStamina, setMaxStamina] = useState(100);
  const [score, setScore] = useState(0);
  const [shurikens, setShurikens] = useState([]);
  const [facing, setFacing] = useState(1);
  const [posY, setPosY] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [velY, setVelY] = useState(0);

  // Power-ups
  const [regenAir, setRegenAir] = useState(false);

  const [idleFrame, setIdleFrame] = useState(1);
  const [jumpFrame, setJumpFrame] = useState(1);
  const [runFrame, setRunFrame] = useState(1);

  const levelAudioRef = useRef(null);
  const throwSoundRef = useRef(null);

  useEffect(() => {
    levelAudioRef.current = new Audio("./LevelMusic.mp3");
    throwSoundRef.current = new Audio("./Throw.wav");
    levelAudioRef.current.loop = true;
  }, []);

  const keysPressed = useRef({});
  const posRef = useRef(pos);
  const posYRef = useRef(posY);
  const facingRef = useRef(facing);

  const GRAVITY = 1.8;
  const JUMP_FORCE = 28;

  useEffect(() => {
    posRef.current = pos;
    posYRef.current = posY;
    facingRef.current = facing;
  }, [pos, posY, facing]);

  const generateEnemies = (lvl) => {
    let allEnemies = [];
    const redCount = 8;
    
    [1, -1].forEach((sideDir) => {
      // Inimigos Normais (Red)
      for (let i = 0; i < redCount; i++) {
        allEnemies.push({
          id: `red-${lvl}-${sideDir}-${i}`,
          type: "red",
          x: sideDir === 1 ? -200 - i * 400 : window.innerWidth + 200 + i * 400,
          hp: 100,
          dir: sideDir,
          speed: 2 + Math.random() * 1.5,
          isHurt: false,
          currentFrame: 0,
          lastFrameUpdate: Date.now()
        });
      }

      // Novo Inimigo (Yellow) - Só Nível 2+
      if (lvl >= 2) {
        for (let i = 0; i < 4; i++) {
          allEnemies.push({
            id: `yellow-${lvl}-${sideDir}-${i}`,
            type: "yellow",
            x: sideDir === 1 ? -600 - i * 500 : window.innerWidth + 600 + i * 500,
            hp: 135, // Mais vida (tankar 1 hit extra)
            dir: sideDir,
            speed: 1.2, // Mais lento
            isHurt: false,
            currentFrame: 0,
            lastFrameUpdate: Date.now()
          });
        }
      }
    });
    return allEnemies;
  };

  const [enemies, setEnemies] = useState(() => generateEnemies(1));

  // Lógica de Final de Nível
  useEffect(() => {
    const alive = enemies.filter((e) => e.hp > 0).length;
    if (gameStarted && alive === 0 && !showPowerUpMenu) {
      if (level === 1) setShowPowerUpMenu(true);
      else if (level === 2) setGameVictory(true);
    }
  }, [enemies, gameStarted, level, showPowerUpMenu]);

  const handlePowerUp = (choice) => {
    if (choice === "regen") setRegenAir(true);
    if (choice === "stamina") setMaxStamina(150);
    if (choice === "life") setHp(100);

    setLevel(2);
    setEnemies(generateEnemies(2));
    setShowPowerUpMenu(false);
    setShurikens([]);
    setPos(window.innerWidth / 2 - 50);
  };

  // Movimento e Física
  useEffect(() => {
    if (!gameStarted || hp <= 0 || showPowerUpMenu) return;

    const engine = setInterval(() => {
      // Stamina
      setStamina(s => {
        if (!isJumping || regenAir) return Math.min(s + 1.5, maxStamina);
        return s;
      });

      // Movimento Jogador
      setPos(p => {
        if (keysPressed.current["ArrowRight"]) { setFacing(1); return Math.min(p + 8, window.innerWidth - 100); }
        if (keysPressed.current["ArrowLeft"]) { setFacing(-1); return Math.max(p - 8, 0); }
        return p;
      });

      // Shurikens e Inimigos
      let hitIds = [];
      setEnemies(prev => prev.map(en => {
        if (en.hp <= 0) return en;
        const now = Date.now();

        // Animação Inimigos
        if (now - en.lastFrameUpdate > 120) {
          en.currentFrame = (en.currentFrame + 1) % (en.isHurt ? 4 : 6);
          en.lastFrameUpdate = now;
        }
        if (en.isHurt && now - en.lastHurt > 500) en.isHurt = false;

        let nX = en.x + (en.isHurt ? 0 : en.dir * en.speed);
        if (nX > window.innerWidth - 50) en.dir = -1;
        if (nX < 0) en.dir = 1;

        // Dano no jogador
        if (Math.abs(nX - posRef.current) < 60 && posYRef.current < 70) setHp(h => Math.max(h - 0.5, 0));

        // Colisão Shuriken
        const hit = shurikens.find(s => s.x > nX - 20 && s.x < nX + 80);
        if (hit) {
          hitIds.push(hit.id);
          en.hp -= 34;
          en.isHurt = true;
          en.lastHurt = now;
          en.currentFrame = 0;
          if (en.hp <= 0) setScore(s => s + 150);
        }

        return { ...en, x: nX };
      }));

      setShurikens(prev => prev.filter(s => !hitIds.includes(s.id)).map(s => ({ ...s, x: s.x + 22 * s.dir })).filter(s => s.x > -100 && s.x < window.innerWidth + 100));
    }, 1000/60);

    const physics = setInterval(() => {
      setPosY(y => {
        if (y > 0 || velY !== 0) {
          let nextY = y + velY;
          setVelY(v => v - GRAVITY);
          if (nextY <= 0) { setVelY(0); setIsJumping(false); return 0; }
          return nextY;
        }
        return 0;
      });
    }, 30);

    return () => { clearInterval(engine); clearInterval(physics); };
  }, [gameStarted, hp, showPowerUpMenu, shurikens, isJumping, regenAir, maxStamina, velY]);

  const handleKeyDown = useCallback((e) => {
    if (!gameStarted || hp <= 0 || showPowerUpMenu) return;
    keysPressed.current[e.key] = true;
    if ((e.key === "ArrowUp" || e.code === "Space") && !isJumping) {
      setIsJumping(true);
      setVelY(JUMP_FORCE);
    }
    if (e.key.toLowerCase() === "f" && stamina >= 25) {
      throwSoundRef.current.currentTime = 0;
      throwSoundRef.current.play().catch(() => {});
      const startX = facingRef.current === 1 ? posRef.current + 60 : posRef.current - 20;
      setShurikens(prev => [...prev, { id: Date.now(), x: startX, y: posYRef.current + 15, dir: facingRef.current }]);
      setStamina(s => Math.max(s - 25, 0));
    }
  }, [gameStarted, hp, isJumping, stamina, showPowerUpMenu]);

  useEffect(() => {
    const i = setInterval(() => setIdleFrame(f => f === 1 ? 2 : 1), 500);
    const r = setInterval(() => { if (keysPressed.current["ArrowRight"] || keysPressed.current["ArrowLeft"]) setRunFrame(f => f < 4 ? f + 1 : 1); }, 100);
    const j = setInterval(() => { if (isJumping) setJumpFrame(f => f < 12 ? f + 1 : 12); }, 60);
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", (e) => keysPressed.current[e.key] = false);
    return () => { clearInterval(i); clearInterval(r); clearInterval(j); };
  }, [handleKeyDown, isJumping]);

  return (
    <div className="game-container">
      {!gameStarted ? (
        <div className="start-menu">
          <h1 className="title-glow">BREAKOUT</h1>
          <button className="btn-start" onClick={() => {setGameStarted(true); levelAudioRef.current.play();}}>INICIAR FUGA</button>
        </div>
      ) : (
        <>
          <div className="hud">
            <div>NÍVEL: {level}</div>
            <div className="hud-center">PONTOS: {score}</div>
            <div>INIMIGOS: {enemies.filter(e => e.hp > 0).length}</div>
          </div>

          <div className="stats-container">
            <div><div className="bar-label">VIDA</div><div className="life-bar-outer"><div className="life-bar-fill" style={{ width: `${hp}%` }}></div></div></div>
            <div><div className="bar-label">STAMINA</div><div className="stamina-bar-outer"><div className="stamina-bar-fill" style={{ width: `${(stamina/maxStamina)*100}%` }}></div></div></div>
          </div>

          <div className={`bashira ${isJumping ? `jump-frame-${jumpFrame}` : keysPressed.current["ArrowRight"] || keysPressed.current["ArrowLeft"] ? `run-frame-${runFrame}` : `frame-${idleFrame}`}`}
            style={{ left: `${pos}px`, bottom: `${50 + posY}px`, transform: `scaleX(${facing}) scale(0.85)` }}></div>

          {enemies.map((en) => en.hp > 0 && (
            <div key={en.id} style={{ left: `${en.x}px`, bottom: "80px", position: "absolute", transform: `scaleX(${en.dir * -1})`, zIndex: 100 }}>
              <div className="enemy-hp-bar"><div style={{ background: en.type === "yellow" ? "gold" : "red", width: `${(en.hp / (en.type === "yellow" ? 135 : 100)) * 100}%`, height: "100%" }}></div></div>
              {en.type === "red" ? (
                <div style={{
                  width: "32px", height: "32px",
                  backgroundImage: `url(${en.isHurt ? e1HurtSprite : e1IdleSprite})`,
                  backgroundSize: en.isHurt ? "400% 100%" : "600% 100%",
                  backgroundPosition: `${en.currentFrame * (100 / (en.isHurt ? 3 : 5))}% 0%`,
                  imageRendering: "pixelated", scale: "2.5"
                }}></div>
              ) : (
                <img src={en.isHurt ? yellowHurtFrames[en.currentFrame] : yellowWalkFrames[en.currentFrame]} style={{ width: "120px", imageRendering: "pixelated" }} />
              )}
            </div>
          ))}

          {shurikens.map((s) => <div key={s.id} className="shuriken" style={{ left: `${s.x}px`, bottom: `${90 + s.y}px` }}></div>)}

          {showPowerUpMenu && (
            <div className="overlay powerup-screen">
              <h1>NÍVEL 1 COMPLETO! ESCOLHE UM POWER-UP:</h1>
              <div className="powerup-list">
                <button onClick={() => handlePowerUp("regen")}>☁️ RECUPERAR STAMINA NO AR</button>
                <button onClick={() => handlePowerUp("stamina")}>⚡ MAIS STAMINA MÁXIMA</button>
                <button onClick={() => handlePowerUp("life")}>❤️ RECUPERAR TODA A VIDA</button>
              </div>
            </div>
          )}

          {hp <= 0 && <div className="overlay"><h1>DERROTADO</h1><button className="btn-retry" onClick={() => window.location.reload()}>RECOMEÇAR</button></div>}
          {gameVictory && <div className="overlay victory"><h1 className="title-glow">VITÓRIA!</h1><button className="btn-retry" onClick={() => window.location.reload()}>JOGAR NOVAMENTE</button></div>}
        </>
      )}
    </div>
  );
}

export default App;
import React, { useState, useEffect, useCallback, useRef } from "react";
import "./App.css";

// --- IMPORTAÇÕES DE ASSETS (Mantém as tuas exatamente como estão) ---
import e1Idle0 from "./assets/sprite_idle0.png";
import e1Idle1 from "./assets/sprite_idle1.png";
import e1Idle2 from "./assets/sprite_idle2.png";
import e1Idle3 from "./assets/sprite_idle3.png";
import e1Idle4 from "./assets/sprite_idle4.png";
import e1Idle5 from "./assets/sprite_idle5.png";
import e1Hurt0 from "./assets/sprite_hurt0.png";
import e1Hurt1 from "./assets/sprite_hurt1.png";
import e1Hurt2 from "./assets/sprite_hurt2.png";
import e1Hurt3 from "./assets/sprite_hurt3.png";

import e2Walk0 from "./assets/yellowninjawalk0.png";
import e2Walk1 from "./assets/yellowninjawalk1.png";
import e2Walk2 from "./assets/yellowninjawalk2.png";
import e2Walk3 from "./assets/yellowninjawalk3.png";
import e2Walk4 from "./assets/yellowninjawalk4.png";
import e2Walk5 from "./assets/yellowninjawalk5.png";
import e2Hurt0 from "./assets/yellowninjahurt0.png";
import e2Hurt1 from "./assets/yellowninjahurt1.png";
import e2Hurt2 from "./assets/yellowninjahurt2.png";
import e2Hurt3 from "./assets/yellowninjahurt3.png";

const enemy1IdleFrames = [e1Idle0, e1Idle1, e1Idle2, e1Idle3, e1Idle4, e1Idle5];
const enemy1HurtFrames = [e1Hurt0, e1Hurt1, e1Hurt2, e1Hurt3];
const enemy2WalkFrames = [e2Walk0, e2Walk1, e2Walk2, e2Walk3, e2Walk4, e2Walk5];
const enemy2HurtFrames = [e2Hurt0, e2Hurt1, e2Hurt2, e2Hurt3];

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [level, setLevel] = useState(1);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [gameVictory, setGameVictory] = useState(false);
  const [pos, setPos] = useState(window.innerWidth / 2 - 50);
  const [hp, setHp] = useState(100);
  const [stamina, setStamina] = useState(100);
  const [score, setScore] = useState(0);
  const [shurikens, setShurikens] = useState([]);
  const [enemies, setEnemies] = useState([]);
  const [facing, setFacing] = useState(1);
  const [posY, setPosY] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [velY, setVelY] = useState(0);
  const [idleFrame, setIdleFrame] = useState(1);
  const [jumpFrame, setJumpFrame] = useState(1);
  const [runFrame, setRunFrame] = useState(1);

  const levelAudioRef = useRef(null);
  const throwSoundRef = useRef(null);
  const keysPressed = useRef({});
  const posRef = useRef(pos);
  const posYRef = useRef(posY);
  const facingRef = useRef(facing);

  useEffect(() => {
    levelAudioRef.current = new Audio("./LevelMusic.mp3");
    throwSoundRef.current = new Audio("./Throw.wav");
    if (levelAudioRef.current) levelAudioRef.current.loop = true;
  }, []);

  useEffect(() => {
    posRef.current = pos;
    posYRef.current = posY;
    facingRef.current = facing;
  }, [pos, posY, facing]);

  const generateEnemies = (lvl) => {
    const countPerSide = lvl === 1 ? 8 : 10; 
    let allEnemies = [];
    [1, -1].forEach((sideDir) => {
      for (let i = 0; i < countPerSide; i++) {
        const type = lvl === 1 ? 1 : (Math.random() > 0.5 ? 2 : 1);
        allEnemies.push({
          id: Math.random(),
          x: sideDir === 1 ? -200 - i * 450 : window.innerWidth + 200 + i * 450,
          hp: type === 1 ? 100 : 150,
          maxHp: type === 1 ? 100 : 150,
          dir: sideDir,
          speed: type === 1 ? 3 : 2.2,
          currentFrame: 0,
          lastFrameUpdate: Date.now(),
          isHurt: false,
          lastHurt: 0,
          type: type 
        });
      }
    });
    const final = lvl === 1 ? allEnemies.slice(0, 15) : allEnemies;
    setEnemies(final);
  };

  useEffect(() => { if(gameStarted) generateEnemies(level); }, [gameStarted]);

  const nextLevel = () => {
    const nextLvl = level + 1;
    setLevel(nextLvl);
    generateEnemies(nextLvl);
    setHp(100);
    setStamina(100);
    setShurikens([]);
    setShowLevelUp(false);
    setPos(window.innerWidth / 2 - 50);
    setPosY(0);
  };

  useEffect(() => {
    const anim = setInterval(() => setIdleFrame((prev) => (prev === 1 ? 2 : 1)), 500);
    return () => clearInterval(anim);
  }, []);

  useEffect(() => {
    if (!gameStarted || hp <= 0 || showLevelUp) return;
    const physics = setInterval(() => {
      setPosY((y) => {
        if (y > 0 || velY !== 0) {
          let nextY = y + velY;
          setVelY((v) => v - 1.8);
          if (nextY <= 0) { setVelY(0); setIsJumping(false); return 0; }
          return nextY;
        }
        return 0;
      });
      setStamina((s) => Math.min(s + 1, 100));
    }, 30);
    return () => clearInterval(physics);
  }, [gameStarted, hp, velY, showLevelUp]);

  const handleKeyDown = useCallback((e) => {
    keysPressed.current[e.key] = true;
    if (!gameStarted || hp <= 0 || showLevelUp) return;
    if ((e.key === "ArrowUp" || e.code === "Space") && !isJumping) { setIsJumping(true); setVelY(28); }
    if (e.key.toLowerCase() === "f" && stamina >= 25) {
      if (throwSoundRef.current) throwSoundRef.current.play().catch(() => {});
      const startX = facingRef.current === 1 ? posRef.current + 60 : posRef.current - 20;
      setShurikens((prev) => [...prev, { id: Math.random(), x: startX, y: posYRef.current + 14, dir: facingRef.current }]);
      setStamina((s) => Math.max(s - 25, 0));
    }
  }, [gameStarted, hp, isJumping, stamina, showLevelUp]);

  const handleKeyUp = useCallback((e) => { keysPressed.current[e.key] = false; }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => { window.removeEventListener("keydown", handleKeyDown); window.removeEventListener("keyup", handleKeyUp); };
  }, [handleKeyDown, handleKeyUp]);

  // ENGINE PRINCIPAL - TUDO ACONTECE AQUI
  useEffect(() => {
    if (!gameStarted || showLevelUp || gameVictory) return;

    const engine = setInterval(() => {
      // 1. Jogador
      setPos((p) => {
        if (keysPressed.current["ArrowRight"]) { setFacing(1); return Math.min(p + 8, window.innerWidth - 110); }
        if (keysPressed.current["ArrowLeft"]) { setFacing(-1); return Math.max(p - 8, 0); }
        return p;
      });

      // 2. Lógica Unificada de Inimigos e Shurikens
      setEnemies((prevEnemies) => {
        let currentEnemies = [...prevEnemies];
        let shurikensHit = [];

        setShurikens((prevShurikens) => {
          let currentShurikens = prevShurikens.map(s => ({ ...s, x: s.x + 25 * s.dir }));
          
          // Verificar cada inimigo contra cada shuriken
          currentEnemies = currentEnemies.map(enemy => {
            if (enemy.hp <= 0) return enemy;
            const now = Date.now();

            // Movimento/Animação
            if (now - enemy.lastFrameUpdate > 100) {
              enemy.currentFrame = enemy.isHurt ? Math.min(enemy.currentFrame + 1, 3) : (enemy.currentFrame + 1) % 6;
              enemy.lastFrameUpdate = now;
            }
            if (enemy.isHurt && now - enemy.lastHurt > 500) enemy.isHurt = false;

            let nX = enemy.x;
            if (!enemy.isHurt) nX += enemy.dir * enemy.speed;

            // Dano no Jogador
            if (Math.abs(nX - posRef.current) < 60 && posYRef.current < 70) setHp(h => Math.max(h - 0.5, 0));

            // Colisão Real
            let nHp = enemy.hp;
            let isHurt = enemy.isHurt;
            let lastHurt = enemy.lastHurt;

            for (let i = 0; i < currentShurikens.length; i++) {
              let s = currentShurikens[i];
              // Se a shuriken ainda não bateu em nada e está na área do inimigo
              if (!shurikensHit.includes(s.id) && s.x > nX - 20 && s.x < nX + 80) {
                shurikensHit.push(s.id); // Matamos a shuriken aqui
                nHp -= 34;
                isHurt = true;
                lastHurt = now;
                enemy.currentFrame = 0;
                if (nHp <= 0) setScore(sc => sc + 100);
                break; // Um inimigo só pode ser atingido por UMA shuriken por frame
              }
            }
            return { ...enemy, x: nX, hp: nHp, isHurt, lastHurt };
          });

          // Filtramos as shurikens que bateram e as que saíram do ecrã
          return currentShurikens.filter(s => !shurikensHit.includes(s.id) && s.x > -100 && s.x < window.innerWidth + 100);
        });

        if (currentEnemies.length > 0 && currentEnemies.filter(e => e.hp > 0).length === 0 && !showLevelUp) {
            setShowLevelUp(true);
        }

        return currentEnemies;
      });

    }, 1000 / 60);

    return () => clearInterval(engine);
  }, [gameStarted, showLevelUp, gameVictory]);

  return (
    <div className="game-container">
      {!gameStarted ? (
        <div className="start-menu">
          <h1 className="title-glow">BREAKOUT</h1>
          <button className="btn-start" onClick={() => setGameStarted(true)}>INICIAR FUGA</button>
        </div>
      ) : (
        <>
          <div className="hud">
            <div>NÍVEL: {level}</div>
            <div className="hud-center">PONTOS: {score}</div>
            <div>INIMIGOS: {enemies.filter((e) => e.hp > 0).length}</div>
          </div>

          <div className="stats-container">
            <div>
              <div className="bar-label">VIDA</div>
              <div className="life-bar-outer"><div className="life-bar-fill" style={{ width: `${hp}%` }}></div></div>
            </div>
            <div>
              <div className="bar-label">STAMINA</div>
              <div className="stamina-bar-outer"><div className="stamina-bar-fill" style={{ width: `${stamina}%` }}></div></div>
            </div>
          </div>

          <div
            className={`bashira ${isJumping ? `jump-frame-${jumpFrame}` : (keysPressed.current["ArrowRight"] || keysPressed.current["ArrowLeft"]) ? `run-frame-${runFrame}` : `frame-${idleFrame}`}`}
            style={{ left: `${pos}px`, bottom: `${50 + posY}px`, transform: `scaleX(${facing}) scale(0.85)` }}
          ></div>

          {enemies.map((enemy) =>
            enemy.hp > 0 && (
              <div key={enemy.id} style={{ left: `${enemy.x}px`, bottom: "70px", position: "absolute", transform: `scaleX(${enemy.dir})`, zIndex: 100 }}>
                <div style={{ background: "#333", width: "80px", height: "8px", marginBottom: "5px" }}>
                  <div style={{ background: "red", height: "100%", width: `${(enemy.hp / enemy.maxHp) * 100}%` }}></div>
                </div>
                <img 
                  src={enemy.type === 1 
                    ? (enemy.isHurt ? enemy1HurtFrames[enemy.currentFrame] : enemy1IdleFrames[enemy.currentFrame])
                    : (enemy.isHurt ? enemy2HurtFrames[enemy.currentFrame] : enemy2WalkFrames[enemy.currentFrame])
                  }
                  style={{ width: enemy.type === 1 ? "100px" : "125px", height: "auto", imageRendering: "pixelated" }} 
                  alt="enemy"
                />
              </div>
            )
          )}

          {shurikens.map((s) => <div key={s.id} className="shuriken" style={{ left: `${s.x}px`, bottom: `${90 + s.y}px` }}></div>)}

          {showLevelUp && (
            <div className="overlay">
              <h1>NÍVEL CONCLUÍDO!</h1>
              <button className="btn-start" onClick={nextLevel}>ENTRAR NO NÍVEL {level + 1}</button>
            </div>
          )}
          {hp <= 0 && (
            <div className="overlay">
              <h1>DERROTADO</h1>
              <button className="btn-retry" onClick={() => window.location.reload()}>RECOMEÇAR</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
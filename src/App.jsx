import React, { useState, useEffect, useCallback, useRef } from "react";
import "./App.css";

// --- INIMIGO 1 (RED) ---
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

// --- INIMIGO 2 (YELLOW NINJA) ---
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
  const [facing, setFacing] = useState(1);
  const [posY, setPosY] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [velY, setVelY] = useState(0);

  const [idleFrame, setIdleFrame] = useState(1);
  const [jumpFrame, setJumpFrame] = useState(1);
  const [runFrame, setRunFrame] = useState(1);

  const levelAudioRef = useRef(null);
  const bossAudioRef = useRef(null);
  const defeatSoundRef = useRef(null);
  const levelVictoryRef = useRef(null);
  const throwSoundRef = useRef(null);

  useEffect(() => {
    levelAudioRef.current = new Audio("./LevelMusic.mp3");
    bossAudioRef.current = new Audio("./BossMusic.mp3");
    defeatSoundRef.current = new Audio("./DefeatSound.wav");
    levelVictoryRef.current = new Audio("./LevelVictory.mp3");
    throwSoundRef.current = new Audio("./Throw.wav");
    [levelAudioRef, bossAudioRef, defeatSoundRef, levelVictoryRef, throwSoundRef].forEach((ref) => {
      if (ref.current) ref.current.volume = 0.5;
    });
    if (levelAudioRef.current) levelAudioRef.current.loop = true;
    if (bossAudioRef.current) bossAudioRef.current.loop = true;
  }, []);

  const keysPressed = useRef({});
  const posRef = useRef(pos);
  const posYRef = useRef(posY);
  const facingRef = useRef(facing);

  const GRAVITY = 1.8;
  const JUMP_FORCE = 28;

  useEffect(() => {
    const levelMusic = levelAudioRef.current;
    const bossMusic = bossAudioRef.current;
    if (gameStarted && hp > 0 && !gameVictory && !showLevelUp) {
      if (level === 3 && bossMusic) { levelMusic?.pause(); bossMusic.play().catch(() => {}); }
      else if (levelMusic) { bossMusic?.pause(); levelMusic.play().catch(() => {}); }
    } else {
      levelMusic?.pause();
      bossMusic?.pause();
    }
  }, [gameStarted, level, hp, gameVictory, showLevelUp]);

  useEffect(() => {
    if ((showLevelUp || gameVictory) && levelVictoryRef.current) {
      levelVictoryRef.current.currentTime = 0;
      levelVictoryRef.current.play().catch(() => {});
    }
  }, [showLevelUp, gameVictory]);

  useEffect(() => {
    if (hp <= 0 && gameStarted && defeatSoundRef.current) {
      defeatSoundRef.current.currentTime = 0;
      defeatSoundRef.current.play().catch(() => {});
    }
  }, [hp, gameStarted]);

  useEffect(() => {
    posRef.current = pos;
    posYRef.current = posY;
    facingRef.current = facing;
  }, [pos, posY, facing]);

  const generateEnemies = (lvl) => {
    const countPerSide = lvl === 1 ? 10 : 7;
    let allEnemies = [];
    [1, -1].forEach((sideDir) => {
      for (let i = 0; i < countPerSide; i++) {
        const spawnDistance = 450;
        allEnemies.push({
          id: `enemy-${lvl}-${sideDir}-${i}`,
          x: sideDir === 1 ? -200 - i * spawnDistance : window.innerWidth + 200 + i * spawnDistance,
          hp: lvl === 1 ? 100 : 150,
          maxHp: lvl === 1 ? 100 : 150,
          dir: sideDir,
          speed: lvl === 1 ? 3 : 2.2,
          currentFrame: 0,
          lastFrameUpdate: Date.now(),
          isHurt: false,
          lastHurt: 0,
          type: lvl 
        });
      }
    });
    return allEnemies;
  };

  const [enemies, setEnemies] = useState(() => generateEnemies(1));

  useEffect(() => {
    const aliveEnemies = enemies.filter((e) => e.hp > 0).length;
    if (gameStarted && !showLevelUp && !gameVictory) {
      if (level < 3 && aliveEnemies === 0) setShowLevelUp(true);
    }
  }, [enemies, gameStarted, level, showLevelUp, gameVictory]);

  const nextLevel = () => {
    const nextLvl = level + 1;
    setLevel(nextLvl);
    setEnemies(generateEnemies(nextLvl));
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
    let jumpAnim;
    if (isJumping) {
      setJumpFrame(1);
      jumpAnim = setInterval(() => setJumpFrame((prev) => (prev < 12 ? prev + 1 : 12)), 60);
    }
    return () => clearInterval(jumpAnim);
  }, [isJumping]);

  useEffect(() => {
    let runAnim;
    if (!isJumping && gameStarted && !showLevelUp) {
      runAnim = setInterval(() => {
        const moving = keysPressed.current["ArrowRight"] || keysPressed.current["ArrowLeft"];
        if (moving) setRunFrame((prev) => (prev < 4 ? prev + 1 : 1));
        else setRunFrame(1);
      }, 100);
    }
    return () => clearInterval(runAnim);
  }, [isJumping, gameStarted, showLevelUp]);

  useEffect(() => {
    if (!gameStarted || hp <= 0 || showLevelUp || gameVictory) return;
    const reg = setInterval(() => setStamina((s) => Math.min(s + 4, 100)), 250);
    const physics = setInterval(() => {
      setPosY((y) => {
        if (y > 0 || velY !== 0) {
          let nextY = y + velY;
          setVelY((v) => v - GRAVITY);
          if (nextY <= 0) { setVelY(0); setIsJumping(false); return 0; }
          return nextY;
        }
        return 0;
      });
    }, 30);
    return () => { clearInterval(reg); clearInterval(physics); };
  }, [gameStarted, hp, velY, showLevelUp, gameVictory]);

  const handleKeyDown = useCallback((e) => {
    keysPressed.current[e.key] = true;
    if (!gameStarted || hp <= 0 || showLevelUp || gameVictory) return;
    if ((e.key === "ArrowUp" || e.code === "Space") && !isJumping) { setIsJumping(true); setVelY(JUMP_FORCE); }
    if (e.key.toLowerCase() === "f" && stamina >= 25) {
      if (throwSoundRef.current) {
        throwSoundRef.current.currentTime = 0;
        throwSoundRef.current.play().catch(() => {});
      }
      const startX = facingRef.current === 1 ? posRef.current + 60 : posRef.current - 20;
      setShurikens((prev) => [...prev, { id: Date.now(), x: startX, y: posYRef.current + 14, dir: facingRef.current }]);
      setStamina((s) => Math.max(s - 25, 0));
    }
  }, [gameStarted, hp, isJumping, stamina, showLevelUp, gameVictory]);

  const handleKeyUp = useCallback((e) => { keysPressed.current[e.key] = false; }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => { window.removeEventListener("keydown", handleKeyDown); window.removeEventListener("keyup", handleKeyUp); };
  }, [handleKeyDown, handleKeyUp]);

  useEffect(() => {
    if (!gameStarted || showLevelUp || gameVictory) return;
    const engine = setInterval(() => {
      setPos((p) => {
        let newPos = p;
        if (keysPressed.current["ArrowRight"]) { newPos = Math.min(p + 8, window.innerWidth - 110); setFacing(1); }
        if (keysPressed.current["ArrowLeft"]) { newPos = Math.max(p - 8, 0); setFacing(-1); }
        return newPos;
      });

      let hitShurikenIds = [];

      setEnemies((prev) =>
        prev.map((enemy) => {
          if (enemy.hp <= 0) return enemy;
          const tempoAgora = Date.now();

          if (tempoAgora - enemy.lastFrameUpdate > 100) {
            if (enemy.isHurt) {
               if (enemy.currentFrame < 3) { enemy.currentFrame += 1; }
            } else {
               enemy.currentFrame = (enemy.currentFrame + 1) % 6;
            }
            enemy.lastFrameUpdate = tempoAgora;
          }

          if (enemy.isHurt && tempoAgora - enemy.lastHurt > 600) { 
            enemy.isHurt = false; 
            enemy.currentFrame = 0; 
          }

          let nX = enemy.x;
          let nDir = enemy.dir;
          if (!enemy.isHurt) {
            nX = enemy.x + enemy.dir * enemy.speed;
            if (nX > window.innerWidth - 60) nDir = -1;
            if (nX < 0) nDir = 1;
          }

          if (Math.abs(nX - posRef.current) < 65 && posYRef.current < 70) setHp((h) => Math.max(h - 0.8, 0));

          const coll = shurikens.find((s) => s.x > nX - 20 && s.x < nX + 80);
          let nHp = enemy.hp;
          let isHurt = enemy.isHurt;
          let lastHurt = enemy.lastHurt;
          let currentFrame = enemy.currentFrame;

          if (coll) {
            hitShurikenIds.push(coll.id);
            nHp -= 34;
            isHurt = true;
            lastHurt = tempoAgora;
            currentFrame = 0;
            if (nHp <= 0) setScore((s) => s + 100);
          }
          return { ...enemy, x: nX, dir: nDir, hp: nHp, isHurt, lastHurt, currentFrame };
        })
      );

      setShurikens((prev) =>
        prev.filter((s) => !hitShurikenIds.includes(s.id))
          .map((s) => ({ ...s, x: s.x + 25 * s.dir }))
          .filter((s) => s.x > -100 && s.x < window.innerWidth + 100)
      );
    }, 1000 / 60);
    return () => clearInterval(engine);
  }, [gameStarted, showLevelUp, gameVictory, level, shurikens]);

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
            className={`bashira ${isJumping ? `jump-frame-${jumpFrame}` : keysPressed.current["ArrowRight"] || keysPressed.current["ArrowLeft"] ? `run-frame-${runFrame}` : `frame-${idleFrame}`}`}
            style={{ 
                left: `${pos}px`, 
                bottom: `${50 + posY}px`, 
                transform: `scaleX(${facing}) scale(0.85)`
            }}
          ></div>

          {enemies.map((enemy) =>
            enemy.hp > 0 && (
              <div key={enemy.id} style={{ 
                left: `${enemy.x}px`, 
                bottom: "70px", 
                position: "absolute", 
                transform: `scaleX(${enemy.dir})`, 
                zIndex: 100 
              }}>
                <div style={{ background: "#333", width: "80px", height: "8px", marginBottom: "5px" }}>
                  <div style={{ background: "red", height: "100%", width: `${(enemy.hp / enemy.maxHp) * 100}%` }}></div>
                </div>
                <img 
                  src={enemy.type === 1 
                    ? (enemy.isHurt ? enemy1HurtFrames[enemy.currentFrame] : enemy1IdleFrames[enemy.currentFrame])
                    : (enemy.isHurt ? enemy2HurtFrames[enemy.currentFrame] : enemy2WalkFrames[enemy.currentFrame])
                  }
                  style={{ 
                    width: enemy.type === 1 ? "100px" : "125px", 
                    height: "auto", 
                    imageRendering: "pixelated" 
                  }} 
                  alt="inimigo"
                />
              </div>
            )
          )}

          {shurikens.map((s) => <div key={s.id} className="shuriken" style={{ left: `${s.x}px`, bottom: `${90 + s.y}px` }}></div>)}

          {showLevelUp && (
            <div className="overlay level-up">
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
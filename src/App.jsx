import React, { useState, useEffect, useCallback, useRef } from "react";
import "./App.css";

// --- INIMIGO 1 ---
import e1Idle0 from "./assets/sprite_idle0.png"; import e1Idle1 from "./assets/sprite_idle1.png"; import e1Idle2 from "./assets/sprite_idle2.png"; import e1Idle3 from "./assets/sprite_idle3.png"; import e1Idle4 from "./assets/sprite_idle4.png"; import e1Idle5 from "./assets/sprite_idle5.png"; import e1Hurt0 from "./assets/sprite_hurt0.png"; import e1Hurt1 from "./assets/sprite_hurt1.png"; import e1Hurt2 from "./assets/sprite_hurt2.png"; import e1Hurt3 from "./assets/sprite_hurt3.png";
// --- INIMIGO 2 ---
import e2Walk0 from "./assets/yellowninjawalk0.png"; import e2Walk1 from "./assets/yellowninjawalk1.png"; import e2Walk2 from "./assets/yellowninjawalk2.png"; import e2Walk3 from "./assets/yellowninjawalk3.png"; import e2Walk4 from "./assets/yellowninjawalk4.png"; import e2Walk5 from "./assets/yellowninjawalk5.png"; import e2Hurt0 from "./assets/yellowninjahurt0.png"; import e2Hurt1 from "./assets/yellowninjahurt1.png"; import e2Hurt2 from "./assets/yellowninjahurt2.png"; import e2Hurt3 from "./assets/yellowninjahurt3.png";
// --- BOSS ---
import bossMove0 from "./assets/bossmove0.png"; import bossMove1 from "./assets/bossmove1.png"; import bossMove2 from "./assets/bossmove2.png"; import bossMove3 from "./assets/bossmove3.png"; import bossMove4 from "./assets/bossmove4.png"; import bossMove5 from "./assets/bossmove5.png"; import bossMove6 from "./assets/bossmove6.png"; import bossMove7 from "./assets/bossmove7.png";
import bossAtk0 from "./assets/bossatk0.png"; import bossAtk1 from "./assets/bossatk1.png"; import bossAtk2 from "./assets/bossatk2.png"; import bossAtk3 from "./assets/bossatk3.png"; import bossAtk4 from "./assets/bossatk4.png"; import bossAtk5 from "./assets/bossatk5.png";
import bossHurt0 from "./assets/bosshurt0.png"; import bossHurt1 from "./assets/bosshurt1.png"; import bossHurt2 from "./assets/bosshurt2.png";
import bossDeath0 from "./assets/bossdeath0.png"; import bossDeath1 from "./assets/bossdeath1.png"; import bossDeath2 from "./assets/bossdeath2.png"; import bossDeath3 from "./assets/bossdeath3.png"; import bossDeath4 from "./assets/bossdeath4.png"; import bossDeath5 from "./assets/bossdeath5.png"; import bossDeath6 from "./assets/bossdeath6.png"; import bossDeath7 from "./assets/bossdeath7.png"; import bossDeath8 from "./assets/bossdeath8.png"; import bossDeath9 from "./assets/bossdeath9.png"; import bossDeath10 from "./assets/bossdeath10.png"; import bossDeath11 from "./assets/bossdeath11.png"; import bossDeath12 from "./assets/bossdeath12.png";

const enemy1IdleFrames = [e1Idle0, e1Idle1, e1Idle2, e1Idle3, e1Idle4, e1Idle5];
const enemy1HurtFrames = [e1Hurt0, e1Hurt1, e1Hurt2, e1Hurt3];
const enemy2WalkFrames = [e2Walk0, e2Walk1, e2Walk2, e2Walk3, e2Walk4, e2Walk5];
const enemy2HurtFrames = [e2Hurt0, e2Hurt1, e2Hurt2, e2Hurt3];
const bossMoveFrames = [bossMove0, bossMove1, bossMove2, bossMove3, bossMove4, bossMove5, bossMove6, bossMove7];
const bossAtkFrames = [bossAtk0, bossAtk1, bossAtk2, bossAtk3, bossAtk4, bossAtk5];
const bossHurtFrames = [bossHurt0, bossHurt1, bossHurt2];
const bossDeathFrames = [bossDeath0, bossDeath1, bossDeath2, bossDeath3, bossDeath4, bossDeath5, bossDeath6, bossDeath7, bossDeath8, bossDeath9, bossDeath10, bossDeath11, bossDeath12];

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [level, setLevel] = useState(1);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [gameVictory, setGameVictory] = useState(false);

  // --- STATS E MODIFICADORES ---
  const [hp, setHp] = useState(100);
  const [maxHp, setMaxHp] = useState(100);
  const [stamina, setStamina] = useState(100);
  const [maxStamina, setMaxStamina] = useState(100);
  const [staminaRegenJump, setStaminaRegenJump] = useState(false);
  const [isRegenBlocked, setIsRegenBlocked] = useState(false);
  
  // Novos Power-ups (Checklist)
  const [shurikenDamage, setShurikenDamage] = useState(34);
  const [regenMultiplier, setRegenMultiplier] = useState(1);
  const [healOnBossSpawn, setHealOnBossSpawn] = useState(false);
  const [powerUpOptions, setPowerUpOptions] = useState([]);

  const [score, setScore] = useState(0);
  const [shurikens, setShurikens] = useState([]);
  const [pos, setPos] = useState(window.innerWidth / 2 - 50);
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
    [levelAudioRef, bossAudioRef, defeatSoundRef, levelVictoryRef, throwSoundRef].forEach(ref => { if(ref.current) ref.current.volume = 0.5; });
    if (levelAudioRef.current) levelAudioRef.current.loop = true;
    if (bossAudioRef.current) bossAudioRef.current.loop = true;
  }, []);

  const keysPressed = useRef({});
  const posRef = useRef(pos);
  const posYRef = useRef(posY);
  const facingRef = useRef(facing);

  useEffect(() => {
    posRef.current = pos; posYRef.current = posY; facingRef.current = facing;
  }, [pos, posY, facing]);

  const generateEnemies = (lvl) => {
    if (lvl === 3) {
      return Array.from({ length: 5 }, (_, i) => ({
        id: `lvl3-ninja-${i}`, x: i % 2 === 0 ? -200 - i * 400 : window.innerWidth + 200 + i * 400,
        hp: 280, maxHp: 280, dir: i % 2 === 0 ? 1 : -1, speed: 2.2,
        currentFrame: 0, lastFrameUpdate: Date.now(), isHurt: false, lastHurt: 0, type: 2
      }));
    }
    const count = lvl === 1 ? 15 : 20;
    let allEnemies = [];
    [1, -1].forEach((sideDir) => {
      for (let i = 0; i < (count/2 + 2); i++) {
        const type = lvl === 1 ? 1 : (Math.random() > 0.5 ? 2 : 1);
        const enemyHp = type === 1 ? 100 : 280;
        allEnemies.push({
          id: `enemy-${lvl}-${sideDir}-${i}-${Math.random()}`,
          x: sideDir === 1 ? -200 - i * 450 : window.innerWidth + 200 + i * 450,
          hp: enemyHp, maxHp: enemyHp, dir: sideDir, speed: type === 1 ? 3 : 2.2,
          currentFrame: 0, lastFrameUpdate: Date.now(), isHurt: false, lastHurt: 0, type: type
        });
      }
    });
    return allEnemies.slice(0, count);
  };

  const [enemies, setEnemies] = useState(() => generateEnemies(1));

  // --- LÓGICA DE PROGRESSÃO E SORTEIO ---
  useEffect(() => {
    if (!gameStarted || showLevelUp || gameVictory) return;
    const aliveEnemies = enemies.filter(e => e.hp > 0).length;
    const bossExists = enemies.some(e => e.type === 3);

    if (aliveEnemies === 0) {
      if (level < 3) {
        // SISTEMA DE SORTEIO ALEATÓRIO (3 de 6)
        const pool = [
          { id: "stamina", name: "+ STAMINA" },
          { id: "health", name: "+ VIDA" },
          { id: "regen_inf", name: "REGEN. INFINITA" },
          { id: "damage", name: "+25% DAMAGE" },
          { id: "regen_boost", name: "+50% STAMINA REGEN" },
          { id: "boss_heal", name: "100% HP WHEN BOSS SPAWNS" }
        ];
        const shuffled = pool.sort(() => 0.5 - Math.random());
        setPowerUpOptions(shuffled.slice(0, 3));
        setShowLevelUp(true);
      } else if (level === 3 && !bossExists) {
        // CURA NO SPAWN DO BOSS
        if (healOnBossSpawn) setHp(maxHp);
        
        const boss = {
          id: "THE-BOSS", x: -300, hp: 4500, maxHp: 4500, dir: 1, speed: 2.4,
          currentFrame: 0, lastFrameUpdate: Date.now(), isHurt: false, lastHurt: 0,
          isAttacking: false, isDying: false, type: 3
        };
        setEnemies([boss]);
        if (levelAudioRef.current) levelAudioRef.current.pause();
        if (bossAudioRef.current) bossAudioRef.current.play().catch(() => {});
      }
    }
  }, [enemies, level, gameStarted, showLevelUp, gameVictory, healOnBossSpawn, maxHp]);

  const applyPowerUp = (id) => {
    if (id === "stamina") { setMaxStamina(prev => prev + 50); setStamina(prev => prev + 50); }
    if (id === "health") { setMaxHp(prev => prev + 50); setHp(prev => prev + 50); }
    if (id === "regen_inf") setStaminaRegenJump(true);
    if (id === "damage") setShurikenDamage(prev => prev * 1.25);
    if (id === "regen_boost") setRegenMultiplier(prev => prev * 1.5);
    if (id === "boss_heal") setHealOnBossSpawn(true);

    const nextLvl = level + 1;
    setLevel(nextLvl);
    setEnemies(generateEnemies(nextLvl));
    setShurikens([]);
    setShowLevelUp(false);
    setPos(window.innerWidth / 2 - 50);
    setPosY(0);
  };

  // --- REGENERAÇÃO ---
  useEffect(() => {
    if (!gameStarted || hp <= 0 || showLevelUp || gameVictory) return;
    const reg = setInterval(() => {
      if (staminaRegenJump || !isRegenBlocked) {
        setStamina(s => Math.min(s + (4 * regenMultiplier), maxStamina));
      }
    }, 250);
    return () => clearInterval(reg);
  }, [gameStarted, hp, showLevelUp, gameVictory, maxStamina, staminaRegenJump, isRegenBlocked, regenMultiplier]);

  // --- FÍSICA E MOVIMENTO (IGUAL AO TEU) ---
  useEffect(() => {
    if (!gameStarted || hp <= 0 || showLevelUp || gameVictory) return;
    const physics = setInterval(() => {
      setPosY(y => {
        if (y > 0 || velY !== 0) {
          let nextY = y + velY;
          setVelY(v => v - 1.8);
          if (nextY <= 0) { setVelY(0); setIsJumping(false); return 0; }
          return nextY;
        }
        return 0;
      });
    }, 30);
    return () => clearInterval(physics);
  }, [gameStarted, hp, velY, showLevelUp, gameVictory]);

  const handleKeyDown = useCallback((e) => {
    keysPressed.current[e.key] = true;
    if (!gameStarted || hp <= 0 || showLevelUp || gameVictory) return;
    if ((e.key === "ArrowUp" || e.code === "Space") && !isJumping) {
      setIsJumping(true); setVelY(28);
      if (!staminaRegenJump) {
        setIsRegenBlocked(true); setTimeout(() => setIsRegenBlocked(false), 500);
      }
    }
    if (e.key.toLowerCase() === "f" && stamina >= 25 && posY === 0) {
      if (throwSoundRef.current) { throwSoundRef.current.currentTime = 0; throwSoundRef.current.play().catch(() => {}); }
      const startX = facingRef.current === 1 ? posRef.current + 60 : posRef.current - 20;
      setShurikens(prev => [...prev, { id: Date.now() + Math.random(), x: startX, y: posYRef.current + 14, dir: facingRef.current }]);
      setStamina(s => Math.max(s - 25, 0));
    }
  }, [gameStarted, hp, isJumping, stamina, showLevelUp, gameVictory, staminaRegenJump, posY]);

  const handleKeyUp = useCallback((e) => { keysPressed.current[e.key] = false; }, []);
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown); window.addEventListener("keyup", handleKeyUp);
    return () => { window.removeEventListener("keydown", handleKeyDown); window.removeEventListener("keyup", handleKeyUp); };
  }, [handleKeyDown, handleKeyUp]);

  // --- ENGINE ---
  useEffect(() => {
    if (!gameStarted || showLevelUp || gameVictory) return;
    const engine = setInterval(() => {
      setPos(p => {
        let n = p;
        if (keysPressed.current["ArrowRight"]) { n = Math.min(p + 8, window.innerWidth - 110); setFacing(1); }
        if (keysPressed.current["ArrowLeft"]) { n = Math.max(p - 8, 0); setFacing(-1); }
        return n;
      });

      let hitShurikenIds = [];
      setEnemies(prev => prev.map(enemy => {
        if (enemy.isDying && enemy.type === 3) {
           const t = Date.now();
           if (t - enemy.lastFrameUpdate > 150) return { ...enemy, currentFrame: Math.min(enemy.currentFrame + 1, 12), lastFrameUpdate: t };
           return enemy;
        }
        if (enemy.hp <= 0 && enemy.type !== 3) return enemy;
        const now = Date.now();
        if (now - enemy.lastFrameUpdate > 100) {
          if (enemy.type === 3) {
            enemy.currentFrame = enemy.isHurt ? Math.min(enemy.currentFrame + 1, 2) : enemy.isAttacking ? (enemy.currentFrame + 1) % 6 : (enemy.currentFrame + 1) % 8;
          } else {
            enemy.currentFrame = enemy.isHurt ? Math.min(enemy.currentFrame + 1, 3) : (enemy.currentFrame + 1) % 6;
          }
          enemy.lastFrameUpdate = now;
        }
        if (enemy.isHurt && now - enemy.lastHurt > 600) { enemy.isHurt = false; enemy.isAttacking = false; enemy.currentFrame = 0; }
        let nX = enemy.x + (enemy.isHurt || enemy.isDying ? 0 : enemy.dir * enemy.speed);
        let nDir = enemy.dir;
        if (nX > window.innerWidth - 100) nDir = -1; if (nX < -100) nDir = 1;

        const dist = Math.abs(nX - posRef.current);
        if (dist < (enemy.type === 3 ? 110 : 65) && posYRef.current < (enemy.type === 3 ? 120 : 100)) {
           if (enemy.type === 3 && !enemy.isDying) { enemy.isAttacking = true; setHp(h => Math.max(h - 1.5, 0)); }
           else if (!enemy.isDying) setHp(h => Math.max(h - 0.8, 0));
        } else if (enemy.type === 3) enemy.isAttacking = false;

        const coll = shurikens.find(s => s.x > nX - 20 && s.x < nX + (enemy.type === 3 ? 160 : 80));
        if (coll && !hitShurikenIds.includes(coll.id) && !enemy.isDying) {
          hitShurikenIds.push(coll.id);
          let nHp = enemy.hp - shurikenDamage; // DANO ESCALÁVEL
          if (nHp <= 0) {
             if (enemy.type === 3) {
                if (bossAudioRef.current) bossAudioRef.current.pause();
                if (levelVictoryRef.current) levelVictoryRef.current.play();
                setTimeout(() => setGameVictory(true), 10000);
                return { ...enemy, x: nX, hp: 0, isDying: true, currentFrame: 0, lastFrameUpdate: Date.now() };
             }
             setScore(s => s + 100);
          }
          return { ...enemy, x: nX, dir: nDir, hp: nHp, isHurt: true, lastHurt: now, currentFrame: 0 };
        }
        return { ...enemy, x: nX, dir: nDir };
      }));
      setShurikens(prev => prev.filter(s => !hitShurikenIds.includes(s.id)).map(s => ({ ...s, x: s.x + 25 * s.dir })).filter(s => s.x > -100 && s.x < window.innerWidth + 100));
    }, 1000 / 60);
    return () => clearInterval(engine);
  }, [gameStarted, showLevelUp, gameVictory, shurikens, shurikenDamage]);

  // --- ANIMAÇÕES BASHIRA ---
  useEffect(() => {
    const anim = setInterval(() => setIdleFrame(prev => prev === 1 ? 2 : 1), 500);
    return () => clearInterval(anim);
  }, []);
  useEffect(() => {
    let jumpAnim;
    if (isJumping) { setJumpFrame(1); jumpAnim = setInterval(() => setJumpFrame(prev => Math.min(prev + 1, 12)), 60); }
    return () => clearInterval(jumpAnim);
  }, [isJumping]);
  useEffect(() => {
    let runAnim;
    if (!isJumping && gameStarted && !showLevelUp) {
      runAnim = setInterval(() => {
        if (keysPressed.current["ArrowRight"] || keysPressed.current["ArrowLeft"]) setRunFrame(prev => prev < 4 ? prev + 1 : 1);
        else setRunFrame(1);
      }, 100);
    }
    return () => clearInterval(runAnim);
  }, [isJumping, gameStarted, showLevelUp]);

  const theBoss = enemies.find(e => e.type === 3);

  return (
    <div className="game-container">
      {!gameStarted ? (
        <div className="start-menu">
          <h1 className="title-glow">BREAKOUT</h1>
          <button className="btn-start" onClick={() => { setGameStarted(true); if (levelAudioRef.current) levelAudioRef.current.play(); }}>INICIAR FUGA</button>
        </div>
      ) : (
        <>
          <div className="hud">
            <div>NÍVEL: {level}</div>
            <div className="hud-center">PONTOS: {score}</div>
            <div>INIMIGOS: {enemies.filter(e => e.hp > 0 || (e.type === 3 && e.isDying)).length}</div>
          </div>

          <div className="stats-container">
            <div className="stat-group">
              <div className="bar-label">VIDA</div>
              <div className="life-bar-outer" style={{ width: `${maxHp * 2.5}px` }}>
                <div className="life-bar-fill" style={{ width: `${(hp / maxHp) * 100}%` }}></div>
              </div>
            </div>
            <div className="stat-group">
              <div className="bar-label">STAMINA</div>
              <div className="stamina-bar-outer" style={{ width: `${maxStamina * 2.5}px` }}>
                <div className="stamina-bar-fill" style={{ width: `${(stamina / maxStamina) * 100}%` }}></div>
              </div>
            </div>
          </div>

          {theBoss && (
            <div className="boss-hud-container">
              <div className="bar-label" style={{ color: "#8a2be2" }}>BOSS HP</div>
              <div className="boss-bar-outer">
                <div className="boss-bar-fill" style={{ width: `${(theBoss.hp / theBoss.maxHp) * 100}%` }}></div>
              </div>
            </div>
          )}

          <div className={`bashira ${isJumping ? `jump-frame-${jumpFrame}` : keysPressed.current["ArrowRight"] || keysPressed.current["ArrowLeft"] ? `run-frame-${runFrame}` : `frame-${idleFrame}`}`}
            style={{ left: `${pos}px`, bottom: `${50 + posY}px`, transform: `scaleX(${facing}) scale(0.85)` }}></div>

          {enemies.map((enemy) => (enemy.hp > 0 || enemy.isDying) && (
            <div key={enemy.id} style={{ left: `${enemy.x}px`, bottom: "50px", position: "absolute", transform: `scaleX(${enemy.dir})`, zIndex: 100 }}>
              {enemy.type !== 3 && (
                <div style={{ background: "#333", width: enemy.type === 2 ? "100px" : "80px", height: "6px", marginBottom: "5px" }}>
                  <div style={{ background: "red", height: "100%", width: `${(enemy.hp / enemy.maxHp) * 100}%` }}></div>
                </div>
              )}
              <img src={enemy.type === 3 ? (enemy.isDying ? bossDeathFrames[enemy.currentFrame] : enemy.isHurt ? bossHurtFrames[enemy.currentFrame] : enemy.isAttacking ? bossAtkFrames[enemy.currentFrame] : bossMoveFrames[enemy.currentFrame]) : enemy.type === 1 ? (enemy.isHurt ? enemy1HurtFrames[enemy.currentFrame] : enemy1IdleFrames[enemy.currentFrame]) : (enemy.isHurt ? enemy2HurtFrames[enemy.currentFrame] : enemy2WalkFrames[enemy.currentFrame])}
                style={{ width: enemy.type === 3 ? "330px" : enemy.type === 2 ? "125px" : "100px", height: "auto", imageRendering: "pixelated" }} alt="inimigo" />
            </div>
          ))}

          {shurikens.map((s) => <div key={s.id} className="shuriken" style={{ left: `${s.x}px`, bottom: `${90 + s.y}px` }}></div>)}

          {showLevelUp && (
            <div className="overlay level-up">
              <h1>NÍVEL CONCLUÍDO!</h1>
              <div className="powerup-container">
                {powerUpOptions.map((opt) => (
                  <button key={opt.id} className="btn-powerup" onClick={() => applyPowerUp(opt.id)}>
                    {opt.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {gameVictory && (
            <div className="overlay"><h1 className="title-glow">VITÓRIA TOTAL!</h1><button className="btn-retry" onClick={() => window.location.reload()}>JOGAR NOVAMENTE</button></div>
          )}
          {hp <= 0 && (
            <div className="overlay"><h1>DERROTADO</h1><button className="btn-retry" onClick={() => window.location.reload()}>RECOMEÇAR</button></div>
          )}
        </>
      )}
    </div>
  );
}
export default App;
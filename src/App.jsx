import React, { useState, useEffect, useCallback, useRef } from "react";
import "./App.css";

// --- SPRITES (Mantidos todos os frames para não quebrar animações) ---
import e1Idle0 from "./assets/sprite_idle0.png"; import e1Idle1 from "./assets/sprite_idle1.png"; import e1Idle2 from "./assets/sprite_idle2.png"; import e1Idle3 from "./assets/sprite_idle3.png"; import e1Idle4 from "./assets/sprite_idle4.png"; import e1Idle5 from "./assets/sprite_idle5.png"; 
import e1Hurt0 from "./assets/sprite_hurt0.png"; import e1Hurt1 from "./assets/sprite_hurt1.png"; import e1Hurt2 from "./assets/sprite_hurt2.png"; import e1Hurt3 from "./assets/sprite_hurt3.png";
import e2Walk0 from "./assets/yellowninjawalk0.png"; import e2Walk1 from "./assets/yellowninjawalk1.png"; import e2Walk2 from "./assets/yellowninjawalk2.png"; import e2Walk3 from "./assets/yellowninjawalk3.png"; import e2Walk4 from "./assets/yellowninjawalk4.png"; import e2Walk5 from "./assets/yellowninjawalk5.png"; 
import e2Hurt0 from "./assets/yellowninjahurt0.png"; import e2Hurt1 from "./assets/yellowninjahurt1.png"; import e2Hurt2 from "./assets/yellowninjahurt2.png"; import e2Hurt3 from "./assets/yellowninjahurt3.png";
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
  const [score, setScore] = useState(0);

  // --- STATS E NÍVEIS (Regras de 40 DMG e HP 125/350/5000) ---
  const BASE_DMG = 40;
  const BASE_HP = 100;
  const BASE_STAMINA = 100;
  const BASE_REGEN = 4;

  const [lvls, setLvls] = useState({ hp: 1, dmg: 1, stamina: 1, regen: 1 });
  const [hp, setHp] = useState(BASE_HP);
  const [maxHp, setMaxHp] = useState(BASE_HP);
  const [stamina, setStamina] = useState(BASE_STAMINA);
  const [maxStamina, setMaxStamina] = useState(BASE_STAMINA);
  const [currentDmg, setCurrentDmg] = useState(BASE_DMG);
  const [currentRegen, setCurrentRegen] = useState(BASE_REGEN);
  const [hasInfRegen, setHasInfRegen] = useState(false);
  const [hasBossHeal, setHasBossHeal] = useState(false);

  const [enemies, setEnemies] = useState([]);
  const [shurikens, setShurikens] = useState([]);
  const [pos, setPos] = useState(window.innerWidth / 2 - 50);
  const [facing, setFacing] = useState(1);
  const [posY, setPosY] = useState(0);
  const [velY, setVelY] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [isRegenBlocked, setIsRegenBlocked] = useState(false);
  const [powerUpOptions, setPowerUpOptions] = useState([]);

  const [idleFrame, setIdleFrame] = useState(1);
  const [runFrame, setRunFrame] = useState(1);
  const [jumpFrame, setJumpFrame] = useState(1);

  const levelAudioRef = useRef(null);
  const bossAudioRef = useRef(null);
  const throwSoundRef = useRef(null);
  const levelVictoryRef = useRef(null);
  const keysPressed = useRef({});
  const posRef = useRef(pos);
  const posYRef = useRef(posY);
  const facingRef = useRef(facing);

  useEffect(() => {
    levelAudioRef.current = new Audio("./LevelMusic.mp3");
    bossAudioRef.current = new Audio("./BossMusic.mp3");
    throwSoundRef.current = new Audio("./Throw.wav");
    levelVictoryRef.current = new Audio("./LevelVictory.mp3");
    if (levelAudioRef.current) levelAudioRef.current.loop = true;
    if (bossAudioRef.current) bossAudioRef.current.loop = true;
  }, []);

  useEffect(() => {
    posRef.current = pos; posYRef.current = posY; facingRef.current = facing;
  }, [pos, posY, facing]);

  const generateEnemies = (lvl) => {
    if (lvl === 3) {
      return Array.from({ length: 5 }, (_, i) => ({
        id: `l3-${i}`, x: i % 2 === 0 ? -400 - i * 500 : window.innerWidth + 400 + i * 500,
        hp: 350, maxHp: 350, dir: i % 2 === 0 ? 1 : -1, speed: 2.2, type: 2,
        currentFrame: 0, lastFrameUpdate: Date.now(), isHurt: false, lastHurt: 0
      }));
    }
    const count = lvl === 1 ? 15 : 20;
    return Array.from({ length: count }, (_, i) => {
      const type = lvl === 1 ? 1 : (Math.random() > 0.6 ? 2 : 1);
      const ehp = type === 1 ? 125 : 350;
      const side = Math.random() > 0.5 ? 1 : -1;
      return {
        id: `e-${lvl}-${i}`, x: side === 1 ? -300 - i * 450 : window.innerWidth + 300 + i * 450,
        hp: ehp, maxHp: ehp, dir: side, speed: type === 1 ? 3 : 2.2, type: type,
        currentFrame: 0, lastFrameUpdate: Date.now(), isHurt: false, lastHurt: 0
      };
    });
  };

  useEffect(() => { if (gameStarted) setEnemies(generateEnemies(1)); }, [gameStarted]);

  useEffect(() => {
    if (!gameStarted || showLevelUp || gameVictory) return;
    const aliveCount = enemies.filter(e => e.hp > 0 || (e.type === 3 && e.isDying)).length;

    if (aliveCount === 0 && enemies.length > 0) {
      if (level < 3) {
        let pool = [];
        if (lvls.dmg < 5) pool.push({ id: "dmg", name: "+20 Damage" });
        if (lvls.hp < 5) pool.push({ id: "hp", name: "+50 HP" });
        if (lvls.stamina < 5) pool.push({ id: "stamina", name: "+50 Stamina" });
        if (lvls.regen < 5) pool.push({ id: "regen", name: "+25% Stamina Regen" });
        if (!hasInfRegen) pool.push({ id: "inf_regen", name: "Infinite Stamina Regen" });
        if (!hasBossHeal) pool.push({ id: "boss_heal", name: "100% HP When Boss Spawns" });

        setPowerUpOptions(pool.sort(() => 0.5 - Math.random()).slice(0, 3));
        setShowLevelUp(true);
      } else if (level === 3 && !enemies.some(e => e.type === 3)) {
        if (hasBossHeal) setHp(maxHp);
        setEnemies([{
          id: "BOSS", x: -500, hp: 5000, maxHp: 5000, dir: 1, speed: 2.4, type: 3,
          currentFrame: 0, lastFrameUpdate: Date.now(), isHurt: false, lastHurt: 0, isAttacking: false, isDying: false
        }]);
        if (levelAudioRef.current) levelAudioRef.current.pause();
        if (bossAudioRef.current) bossAudioRef.current.play().catch(() => {});
      }
    }
  }, [enemies, level, gameStarted, showLevelUp, lvls, hasInfRegen, hasBossHeal, maxHp, gameVictory]);

  const applyPowerUp = (id) => {
    if (id === "dmg") { setLvls(p => ({...p, dmg: p.dmg + 1})); setCurrentDmg(d => d + 20); }
    if (id === "hp") { setLvls(p => ({...p, hp: p.hp + 1})); setMaxHp(m => m + 50); setHp(h => h + 50); }
    if (id === "stamina") { setLvls(p => ({...p, stamina: p.stamina + 1})); setMaxStamina(s => s + 50); setStamina(s => s + 50); }
    if (id === "regen") { setLvls(p => ({...p, regen: p.regen + 1})); setCurrentRegen(r => r + (BASE_REGEN * 0.25)); }
    if (id === "inf_regen") setHasInfRegen(true);
    if (id === "boss_heal") setHasBossHeal(true);

    const nextLvl = level + 1;
    setLevel(nextLvl);
    setEnemies(generateEnemies(nextLvl));
    setShurikens([]);
    setShowLevelUp(false);
    setPos(window.innerWidth / 2 - 50);
    setPosY(0);
  };

  useEffect(() => {
    if (!gameStarted || hp <= 0 || showLevelUp || gameVictory) return;
    const interval = setInterval(() => {
      setPos(p => {
        let n = p;
        if (keysPressed.current["ArrowRight"]) { n = Math.min(p + 8, window.innerWidth - 110); setFacing(1); }
        if (keysPressed.current["ArrowLeft"]) { n = Math.max(p - 8, 0); setFacing(-1); }
        return n;
      });
      setPosY(y => {
        if (y > 0 || velY !== 0) {
          let nY = y + velY; setVelY(v => v - 1.8);
          if (nY <= 0) { setVelY(0); setIsJumping(false); return 0; }
          return nY;
        }
        return 0;
      });

      let hitIds = [];
      setEnemies(prev => prev.map(enemy => {
        if (enemy.isDying) {
          if (Date.now() - enemy.lastFrameUpdate > 150) return { ...enemy, currentFrame: Math.min(enemy.currentFrame + 1, 12), lastFrameUpdate: Date.now() };
          return enemy;
        }
        if (enemy.hp <= 0 && enemy.type !== 3) return enemy;
        const now = Date.now();
        if (now - enemy.lastFrameUpdate > 100) {
          if (enemy.type === 3) enemy.currentFrame = enemy.isHurt ? Math.min(enemy.currentFrame + 1, 2) : enemy.isAttacking ? (enemy.currentFrame + 1) % 6 : (enemy.currentFrame + 1) % 8;
          else enemy.currentFrame = enemy.isHurt ? Math.min(enemy.currentFrame + 1, 3) : (enemy.currentFrame + 1) % 6;
          enemy.lastFrameUpdate = now;
        }
        if (enemy.isHurt && now - enemy.lastHurt > 500) enemy.isHurt = false;
        let nX = enemy.x + (enemy.isHurt ? 0 : enemy.dir * enemy.speed);
        let nDir = enemy.dir;
        if (nX > window.innerWidth - 100) nDir = -1; if (nX < -100) nDir = 1;
        if (Math.abs(nX - posRef.current) < (enemy.type === 3 ? 140 : 75) && posYRef.current < 100) {
          setHp(h => Math.max(h - (enemy.type === 3 ? 1.5 : 0.8), 0));
          if (enemy.type === 3) enemy.isAttacking = true;
        } else if (enemy.type === 3) enemy.isAttacking = false;
        const hit = shurikens.find(s => s.x > nX - 20 && s.x < nX + (enemy.type === 3 ? 220 : 85));
        if (hit && !hitIds.includes(hit.id)) {
          hitIds.push(hit.id);
          const newHp = enemy.hp - currentDmg;
          if (newHp <= 0 && enemy.type === 3) {
            if (bossAudioRef.current) bossAudioRef.current.pause();
            if (levelVictoryRef.current) levelVictoryRef.current.play();
            setTimeout(() => setGameVictory(true), 9000);
            return { ...enemy, hp: 0, isDying: true, currentFrame: 0, lastFrameUpdate: now };
          }
          if (newHp <= 0) setScore(s => s + 100);
          return { ...enemy, x: nX, hp: newHp, isHurt: true, lastHurt: now, currentFrame: 0 };
        }
        return { ...enemy, x: nX, dir: nDir };
      }));
      setShurikens(prev => prev.filter(s => !hitIds.includes(s.id)).map(s => ({...s, x: s.x + 25 * s.dir})).filter(s => s.x > -150 && s.x < window.innerWidth + 150));
    }, 1000/60);
    return () => clearInterval(interval);
  }, [gameStarted, showLevelUp, gameVictory, shurikens, currentDmg, velY, hp]);

  useEffect(() => {
    if (!gameStarted || hp <= 0 || showLevelUp || gameVictory) return;
    const regenInt = setInterval(() => { if (hasInfRegen || !isRegenBlocked) setStamina(s => Math.min(s + currentRegen, maxStamina)); }, 250);
    return () => clearInterval(regenInt);
  }, [gameStarted, hp, showLevelUp, gameVictory, maxStamina, currentRegen, isRegenBlocked, hasInfRegen]);

  useEffect(() => {
    const idleInt = setInterval(() => setIdleFrame(f => (f === 1 ? 2 : 1)), 500);
    return () => clearInterval(idleInt);
  }, []);
  useEffect(() => {
    let runInt;
    if (!isJumping && gameStarted) runInt = setInterval(() => { if (keysPressed.current["ArrowRight"] || keysPressed.current["ArrowLeft"]) setRunFrame(f => (f < 4 ? f + 1 : 1)); else setRunFrame(1); }, 100);
    return () => clearInterval(runInt);
  }, [isJumping, gameStarted]);
  useEffect(() => {
    let jumpInt;
    if (isJumping) { setJumpFrame(1); jumpInt = setInterval(() => setJumpFrame(f => Math.min(f + 1, 12)), 60); }
    return () => clearInterval(jumpInt);
  }, [isJumping]);

  const handleKeyDown = useCallback((e) => {
    keysPressed.current[e.key] = true;
    if (!gameStarted || hp <= 0 || showLevelUp || gameVictory) return;
    if ((e.key === "ArrowUp" || e.code === "Space") && !isJumping) {
      setIsJumping(true); setVelY(28);
      if (!hasInfRegen) { setIsRegenBlocked(true); setTimeout(() => setIsRegenBlocked(false), 500); }
    }
    if (e.key.toLowerCase() === "f" && stamina >= 25) {
      if (throwSoundRef.current) { throwSoundRef.current.currentTime = 0; throwSoundRef.current.play(); }
      setShurikens(prev => [...prev, { id: Math.random(), x: facingRef.current === 1 ? posRef.current + 60 : posRef.current - 20, y: posYRef.current + 25, dir: facingRef.current }]);
      setStamina(s => Math.max(s - 25, 0));
    }
  }, [gameStarted, hp, isJumping, stamina, showLevelUp, gameVictory, hasInfRegen]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", (e) => { keysPressed.current[e.key] = false; });
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const boss = enemies.find(e => e.type === 3);

  return (
    <div className="game-container">
      {!gameStarted ? (
        <div className="start-menu">
          <h1 className="title-glow">BREAKOUT</h1>
          <button className="btn-start" onClick={() => { setGameStarted(true); levelAudioRef.current.play(); }}>INICIAR FUGA</button>
        </div>
      ) : (
        <>
          {/* HUD ORIGINAL RESTAURADO */}
          <div className="hud">
            <div className="hud-left">
              <div>NÍVEL: {level}</div>
              {/* LISTA DE NÍVEIS ABAIXO DO NÍVEL ATUAL */}
              <div className="shopping-list">
                <p>HP - lvl {lvls.hp}</p>
                <p>DMG - lvl {lvls.dmg}</p>
                <p>Stamina - lvl {lvls.stamina}</p>
                <p>Stamina Regen - lvl {lvls.regen}</p>
                {hasInfRegen && <p style={{color: 'gold'}}>Infinite Regen</p>}
                {hasBossHeal && <p style={{color: 'gold'}}>Heal on Boss</p>}
              </div>
            </div>
            <div className="hud-center">PONTOS: {score}</div>
            <div className="hud-right">INIMIGOS: {enemies.filter(e => e.hp > 0 || e.isDying).length}</div>
          </div>

          <div className="stats-container">
            <div className="stat-group">
              <div className="bar-label">VIDA ({Math.ceil(hp)}/{maxHp})</div>
              <div className="life-bar-outer"><div className="life-bar-fill" style={{ width: `${(hp/maxHp)*100}%` }}></div></div>
            </div>
            <div className="stat-group">
              <div className="bar-label">STAMINA ({Math.ceil(stamina)}/{maxStamina})</div>
              <div className="stamina-bar-outer"><div className="stamina-bar-fill" style={{ width: `${(stamina/maxStamina)*100}%` }}></div></div>
            </div>
          </div>

          {boss && (
            <div className="boss-hud-container">
              <div className="bar-label">BOSS HP ({Math.ceil(boss.hp)}/5000)</div>
              <div className="boss-bar-outer"><div className="boss-bar-fill" style={{ width: `${(boss.hp/5000)*100}%` }}></div></div>
            </div>
          )}

          <div className={`bashira ${isJumping ? `jump-frame-${jumpFrame}` : (keysPressed.current["ArrowRight"] || keysPressed.current["ArrowLeft"] ? `run-frame-${runFrame}` : `frame-${idleFrame}`)}`}
               style={{ left: `${pos}px`, bottom: "80px", transform: `scaleX(${facing}) translateY(${-posY}px)` }}></div>

          {enemies.map(e => (e.hp > 0 || e.isDying) && (
            <div key={e.id} style={{ left: `${e.x}px`, bottom: "80px", position: "absolute", transform: `scaleX(${e.dir})` }}>
              {e.type !== 3 && (
                <div className="enemy-hp-bar"><div className="enemy-hp-fill" style={{ width: `${(e.hp/e.maxHp)*100}%` }}></div></div>
              )}
              <img src={e.type === 3 ? (e.isDying ? bossDeathFrames[e.currentFrame] : e.isHurt ? bossHurtFrames[e.currentFrame] : e.isAttacking ? bossAtkFrames[e.currentFrame] : bossMoveFrames[e.currentFrame]) 
                        : e.type === 1 ? (e.isHurt ? enemy1HurtFrames[e.currentFrame] : enemy1IdleFrames[e.currentFrame]) 
                        : (e.isHurt ? enemy2HurtFrames[e.currentFrame] : enemy2WalkFrames[e.currentFrame])} 
                   style={{ width: e.type === 3 ? "350px" : e.type === 2 ? "120px" : "100px", imageRendering: 'pixelated' }} />
            </div>
          ))}

          {shurikens.map(s => <div key={s.id} className="shuriken" style={{ left: `${s.x}px`, bottom: `${115 + s.y}px` }}></div>)}

          {showLevelUp && (
            <div className="overlay level-up">
              <h1>NÍVEL CONCLUÍDO</h1>
              <div className="powerup-container">
                {powerUpOptions.map(opt => (
                  <button key={opt.id} className="btn-powerup" onClick={() => applyPowerUp(opt.id)}>{opt.name}</button>
                ))}
              </div>
            </div>
          )}
          {gameVictory && <div className="overlay"><h1>VITÓRIA TOTAL!</h1></div>}
          {hp <= 0 && <div className="overlay"><h1>DERROTA</h1><button onClick={() => window.location.reload()}>RECOMEÇAR</button></div>}
        </>
      )}
    </div>
  );
}

export default App;
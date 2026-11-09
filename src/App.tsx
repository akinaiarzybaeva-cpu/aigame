import { useEffect, useMemo, useState } from "react";
import { authenticate, fetchCurrentUser } from "./services/api";
import {
  Code2, Trophy, Gamepad2, UserRound, Zap, Menu, X, ChevronRight,
  Flame, Target, Medal, Play, CheckCircle2, LogOut
} from "lucide-react";

type Game = {
  id: string; title: string; subtitle: string; level: string;
  icon: string; color: string; xp: number; questions: { q: string; options: string[]; answer: number; explain: string }[];
};

const games: Game[] = [
  { id: "html", title: "HTML Challenge", subtitle: "HTML тегдерин үйрөн жана тапшырмаларды аткар.", level: "Башталгыч", icon: "🌐", color: "green", xp: 10,
    questions: [
      { q: "HTML документиндеги эң чоң баш аталыш кайсы тег менен жазылат?", options: ["<head>", "<h1>", "<title>", "<p>"], answer: 1, explain: "<h1> — биринчи деңгээлдеги баш аталыш." },
      { q: "Шилтеме түзүү үчүн кайсы тег колдонулат?", options: ["<link>", "<a>", "<href>", "<url>"], answer: 1, explain: "<a> теги шилтеме түзөт, дареги href атрибутунда берилет." },
      { q: "Сүрөт кошуучу тег кайсы?", options: ["<image>", "<picture-src>", "<img>", "<src>"], answer: 2, explain: "<img> теги сүрөттү баракка чыгарат." }
    ] },
  { id: "css", title: "CSS Battle", subtitle: "Элементтердин көрүнүшүн жана стилдерин тап.", level: "Орто", icon: "🎨", color: "blue", xp: 15,
    questions: [
      { q: "Тексттин түсүн өзгөртүүчү CSS касиети кайсы?", options: ["font-style", "background", "color", "text-size"], answer: 2, explain: "color тексттин түсүн аныктайт." },
      { q: "Flexbox иштетүү үчүн эмне жазылат?", options: ["display: flex", "position: flex", "flex: display", "layout: flex"], answer: 0, explain: "display: flex элементтерди flex-контейнер кылат." },
      { q: "Сырткы боштук кайсы касиет?", options: ["padding", "margin", "border", "gap"], answer: 1, explain: "margin элементтин сыртындагы боштукту аныктайт." }
    ] },
  { id: "js", title: "JavaScript Quiz", subtitle: "Логикаңды текшерип, JavaScript билимиңди арттыр.", level: "Орто", icon: "⚡", color: "yellow", xp: 20,
    questions: [
      { q: "JavaScript'те өзгөрбөс өзгөрмө кайсы сөз менен жарыяланат?", options: ["let", "var", "const", "static"], answer: 2, explain: "const менен жарыяланган өзгөрмөгө кайра маани ыйгарууга болбойт." },
      { q: "Консолго маалымат чыгаруу?", options: ["print()", "console.log()", "echo()", "write()"], answer: 1, explain: "console.log() маалыматты браузердин консолуна чыгарат." },
      { q: "Массивдин биринчи элементинин индекси канча?", options: ["1", "-1", "0", "2"], answer: 2, explain: "JavaScript массивдери нөлдөн баштап индекстелет." }
    ] },
  { id: "bug", title: "Bug Hunter", subtitle: "Коддогу каталарды таап, оңдоону үйрөн.", level: "Кыйын", icon: "🐞", color: "pink", xp: 25,
    questions: [
      { q: "Кайсы сапта синтаксистик ката бар?", options: ["let age = 18;", "const name = 'Ali';", "if (true { console.log('Hi'); }", "console.log('OK');"], answer: 2, explain: "if шартынан кийин жабуучу кашаа ) жетишпейт." },
      { q: "HTML'де жабылбаган абзац тегин тап.", options: ["<p>Hello</p>", "<p>Hello", "<div>Hi</div>", "<h2>Title</h2>"], answer: 1, explain: "Абзацты </p> менен жабуу керек." },
      { q: "CSS'те туура жазылышы кайсы?", options: ["color = red;", "color: red;", "color -> red;", "color red;"], answer: 1, explain: "CSS касиети менен маани кош чекит аркылуу бөлүнөт." }
    ] }
];

const initialUsers = [
  { name: "CodeMaster", xp: 980, avatar: "🧑‍💻" },
  { name: "AidarDev", xp: 760, avatar: "👨‍🚀" },
  { name: "Nurai", xp: 540, avatar: "👩‍💻" }
];

export default function App() {
  const [page, setPage] = useState<"home" | "games" | "rating" | "profile">("home");
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const [question, setQuestion] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [earned, setEarned] = useState(0);
  const [xp, setXp] = useState(() => Number(localStorage.getItem("cb-xp") || 0));
  const [completed, setCompleted] = useState<string[]>(() => JSON.parse(localStorage.getItem("cb-completed") || "[]"));
  const [menuOpen, setMenuOpen] = useState(false);
  const [name, setName] = useState(() => localStorage.getItem("cb-name") || "");
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("register");
  const [nameInput, setNameInput] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem("cb-token")) return;
    fetchCurrentUser().then(({ user }) => {
      setName(user.username);
      setXp(user.xp);
      setCompleted(user.completedGames);
      localStorage.setItem("cb-name", user.username);
      localStorage.setItem("cb-xp", String(user.xp));
      localStorage.setItem("cb-completed", JSON.stringify(user.completedGames));
    }).catch(() => {
      localStorage.removeItem("cb-token");
    });
  }, []);
  const [dark, setDark] = useState(true);

  const level = Math.floor(xp / 100) + 1;
  const progress = xp % 100;
  const rankings = useMemo(() => [...initialUsers, ...(name ? [{ name, xp, avatar: "🧑‍💻" }] : [])].sort((a,b) => b.xp-a.xp), [name, xp]);

  function startGame(game: Game) {
    setActiveGame(game); setQuestion(0); setSelected(null); setDone(false); setEarned(0);
  }
  function finishQuestion() {
    if (!activeGame || selected === null) return;
    const correct = selected === activeGame.questions[question].answer;
    const newEarned = earned + (correct ? activeGame.xp : 0);
    setEarned(newEarned);
    if (question + 1 < activeGame.questions.length) {
      setQuestion(question + 1); setSelected(null);
    } else {
      const nextXp = xp + newEarned;
      setXp(nextXp); localStorage.setItem("cb-xp", String(nextXp));
      const nextCompleted = completed.includes(activeGame.id) ? completed : [...completed, activeGame.id];
      setCompleted(nextCompleted); localStorage.setItem("cb-completed", JSON.stringify(nextCompleted));
      setDone(true);
    }
  }
  async function submitAuth() {
    setAuthError("");
    setAuthLoading(true);
    try {
      const payload: Record<string, string> = authMode === "register"
        ? { name: nameInput.trim(), username: usernameInput.trim(), email: emailInput.trim(), password: passwordInput }
        : { email: emailInput.trim(), password: passwordInput };
      const user = await authenticate(authMode, payload);
      setName(user.username);
      setXp(user.xp);
      setCompleted(user.completedGames);
      localStorage.setItem("cb-name", user.username);
      localStorage.setItem("cb-xp", String(user.xp));
      localStorage.setItem("cb-completed", JSON.stringify(user.completedGames));
      setAuthOpen(false);
      setNameInput(""); setUsernameInput(""); setEmailInput(""); setPasswordInput("");
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : "Ката кетти. Кайра аракет кылыңыз.");
    } finally {
      setAuthLoading(false);
    }
  }
  function logout() {
    localStorage.removeItem("cb-token"); localStorage.removeItem("cb-name");
    setName(""); setPage("home");
  }
  const nav = [
    { id: "home", label: "Башкы бет", icon: Code2 },
    { id: "games", label: "Оюндар", icon: Gamepad2 },
    { id: "rating", label: "Рейтинг", icon: Trophy },
    { id: "profile", label: "Профиль", icon: UserRound }
  ] as const;

  return <div className={dark ? "app" : "app light"}>
    <header className="topbar">
      <button className="brand" onClick={() => { setPage("home"); setActiveGame(null); }}><span className="brand-mark"><Code2 size={22}/></span><span>CodeBattle <b>KG</b></span></button>
      <nav className="desktop-nav">{nav.map(n => <button key={n.id} className={page === n.id && !activeGame ? "nav-link active" : "nav-link"} onClick={() => {setPage(n.id);setActiveGame(null);}}>{n.label}</button>)}</nav>
      <div className="top-actions">
        <span className="xp-pill"><Zap size={15} fill="currentColor"/> {xp} XP</span>
        <button className="theme-btn" onClick={() => setDark(!dark)} title="Теманы өзгөртүү">{dark ? "☀️" : "🌙"}</button>
        {name ? <button className="user-chip" onClick={() => setPage("profile")}>👤 {name}</button> : <button className="login-btn" onClick={() => {setAuthMode("login");setAuthOpen(true);}}>Кирүү</button>}
        <button className="mobile-menu" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X/> : <Menu/>}</button>
      </div>
    </header>

    {menuOpen && <div className="mobile-nav">{nav.map(n => <button key={n.id} onClick={() => {setPage(n.id);setActiveGame(null);setMenuOpen(false);}}><n.icon size={17}/>{n.label}</button>)}</div>}

    <main className="container">
      {activeGame ? <section className="game-view">
        <button className="back-link" onClick={() => setActiveGame(null)}>← Оюндарга кайтуу</button>
        {!done ? <>
          <div className="game-heading"><span className={`game-icon ${activeGame.color}`}>{activeGame.icon}</span><div><p className="eyebrow">CODE CHALLENGE · {question + 1}/{activeGame.questions.length}</p><h1>{activeGame.title}</h1></div></div>
          <div className="progress-track"><div style={{width: `${((question+1)/activeGame.questions.length)*100}%`}}/></div>
          <article className="question-card">
            <div className="question-meta"><span>ТАПШЫРМА {question+1}</span><span className="xp-reward">+{activeGame.xp} XP</span></div>
            <h2>{activeGame.questions[question].q}</h2>
            <div className="answers">{activeGame.questions[question].options.map((option,i) => <button key={option} className={selected === i ? "answer selected" : "answer"} onClick={() => setSelected(i)}><span className="answer-letter">{String.fromCharCode(65+i)}</span>{option}</button>)}</div>
            <button className="primary-btn wide" disabled={selected === null} onClick={finishQuestion}>{question + 1 === activeGame.questions.length ? "Жыйынтыкты көрүү" : "Жоопту текшерүү"} <ChevronRight size={18}/></button>
          </article>
        </> : <article className="result-card"><div className="result-icon"><Trophy size={36}/></div><p className="eyebrow">ТАПШЫРМА АЯКТАДЫ</p><h1>Мыкты аракет!</h1><p className="result-xp">+{earned} XP</p><p className="muted">Сенин жалпы упайың: {xp} XP</p><button className="primary-btn" onClick={() => setActiveGame(null)}>Оюндарга кайтуу <ChevronRight size={18}/></button></article>}
      </section> : page === "home" ? <>
        <section className="hero">
          <div className="hero-copy"><div className="live-tag"><span/> PROGRAMMING • LEARNING • GAMING</div><h1>Код жаз.<br/><span>Ойноп үйрөн.</span><br/>Жеңишке жет!</h1><p>Программалоону кызыктуу тапшырмалар, таймаштар жана оюндар аркылуу үйрөн. Өз деңгээлиңди көтөр!</p><div className="hero-actions"><button className="primary-btn" onClick={() => setPage("games")}>Оюнду баштоо <Play size={17} fill="currentColor"/></button><button className="secondary-btn" onClick={() => setPage("rating")}>Рейтингди көрүү <Trophy size={17}/></button></div><div className="hero-trust"><span><CheckCircle2 size={15}/> Акысыз башта</span><span><CheckCircle2 size={15}/> Өз темпиңде үйрөн</span></div></div>
          <div className="hero-art"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="code-window"><div className="window-top"><span/><span/><span/><small>challenge.js</small></div><div className="code-lines"><p><i>01</i> <b>const</b> <em>future</em> = <strong>"Developer"</strong>;</p><p><i>02</i></p><p><i>03</i> <b>function</b> <em>levelUp</em>() {"{"}</p><p><i>04</i> &nbsp; return <strong>"Keep coding!"</strong>;</p><p><i>05</i> {"}"}</p><p><i>06</i></p><p><i>07</i> <em>levelUp</em>(); <span className="cursor">|</span></p></div><div className="code-footer"><span><span className="status-dot"/> Бардыгы даяр</span><span>JavaScript</span></div></div><div className="float-card float-xp"><Zap size={17}/> <b>+100 XP</b><small>Жаңы деңгээл!</small></div><div className="float-card float-rank"><Trophy size={18}/><div><b>TOP 10</b><small>Рейтингде</small></div></div></div>
        </section>
        <section className="stats-grid"><Stat icon={<UsersIcon/>} value="40+" label="Даяр тапшырма"/><Stat icon={<Gamepad2/>} value="4" label="Оюн категориясы"/><Stat icon={<Flame/>} value={String(completed.length)} label="Аяктаган оюн"/><Stat icon={<Trophy/>} value={String(xp)} label="Сенин XP упайың"/></section>
        <section className="section-block"><div className="section-heading"><div><p className="eyebrow">ӨЗ БИЛИМИҢДИ СЫНA</p><h2>Популярдуу оюндар</h2><p className="muted">Ар бир тапшырма сени максатыңа жакындатат.</p></div><button className="text-btn" onClick={() => setPage("games")}>Баарын көрүү <ChevronRight size={17}/></button></div><div className="game-grid">{games.map(g => <GameCard key={g.id} game={g} completed={completed.includes(g.id)} onClick={() => startGame(g)}/>)}</div></section>
        <section className="bottom-cta"><div><p className="eyebrow">СЕНИН КЕЗЕГИҢ</p><h2>Биринчи кадамыңды бүгүн жаса.</h2><p>Кичинекей тапшырмалардан башта. Чоң жетишкендиктерге жет.</p></div><button className="primary-btn" onClick={() => setPage("games")}>Баштоо <ChevronRight size={18}/></button></section>
      </> : page === "games" ? <section className="section-page"><p className="eyebrow">PRACTICE ARENA</p><h1>Оюндар</h1><p className="muted">Багытты тандап, билимиңди текшер.</p><div className="game-grid">{games.map(g => <GameCard key={g.id} game={g} completed={completed.includes(g.id)} onClick={() => startGame(g)}/>)}</div></section> : page === "rating" ? <section className="section-page"><p className="eyebrow">LEADERBOARD</p><h1>Оюнчулардын рейтинги</h1><p className="muted">Эң көп XP топтогон оюнчулар.</p><div className="leaderboard">{rankings.map((u,i) => <div className="leader-row" key={u.name}><span className="rank-number">{i+1}</span><span className="leader-avatar">{u.avatar}</span><b>{u.name}{u.name === name && <small> (Сен)</small>}</b><span className="leader-xp"><Zap size={15}/>{u.xp} XP</span></div>)}</div></section> : <section className="section-page"><p className="eyebrow">PLAYER PROFILE</p><h1>Менин профилим</h1><div className="profile-card"><div className="profile-avatar">🧑‍💻</div><div><h2>{name || "Конок оюнчу"}</h2><p className="muted">Level {level} · {level === 1 ? "Beginner" : "Learner"}</p></div>{name ? <button className="secondary-btn small" onClick={logout}><LogOut size={15}/> Чыгуу</button> : <button className="primary-btn small" onClick={() => setAuthOpen(true)}>Катталуу</button>}</div><div className="level-card"><div className="level-line"><b>Level {level}</b><span>{progress}/100 XP</span></div><div className="progress-track"><div style={{width:`${progress}%`}}/></div><p className="muted">Кийинки деңгээлге жетүү үчүн дагы {100-progress} XP топто.</p></div><div className="profile-stats"><Stat icon={<Zap/>} value={String(xp)} label="Жалпы XP"/><Stat icon={<Target/>} value={String(completed.length)} label="Аяктаган оюн"/><Stat icon={<Medal/>} value={String(level)} label="Деңгээл"/></div></section>}
    </main>
    <footer><div className="footer-brand"><span className="brand-mark"><Code2 size={19}/></span><b>CodeBattle KG</b></div><span>Код жаз. Ойноп үйрөн. Жеңишке жет!</span><small>© 2026 CodeBattle KG</small></footer>
    {authOpen && <div className="modal-backdrop" onClick={() => setAuthOpen(false)}><div className="auth-modal" onClick={e => e.stopPropagation()}><button className="modal-close" onClick={() => setAuthOpen(false)}><X/></button><div className="brand-mark large"><Code2/></div><h2>{authMode === "register" ? "CodeBattle'ге кошул!" : "Кош келиңиз!"}</h2><p className="muted">{authMode === "register" ? "Аккаунт түзүп, прогрессиңди сакта." : "Аккаунтуңа кирүү үчүн маалыматтарыңды жаз."}</p>
      {authMode === "register" && <><label>Аты-жөнү</label><input value={nameInput} onChange={e => setNameInput(e.target.value)} placeholder="Атыңыз"/><label>Username</label><input value={usernameInput} onChange={e => setUsernameInput(e.target.value)} placeholder="Мисалы: AkiDev"/> </>}
      <label>Email</label><input type="email" value={emailInput} onChange={e => setEmailInput(e.target.value)} placeholder="name@example.com"/>
      <label>Сырсөз</label><input type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} onKeyDown={e => e.key === "Enter" && submitAuth()} placeholder="Кеминде 8 белги"/>
      {authError && <p className="auth-error">{authError}</p>}
      <button className="primary-btn wide" onClick={submitAuth} disabled={authLoading || !emailInput.trim() || passwordInput.length < 8 || (authMode === "register" && (!nameInput.trim() || !usernameInput.trim()))}>{authLoading ? "Күтүңүз..." : authMode === "register" ? "Катталуу" : "Кирүү"} <ChevronRight size={17}/></button>
      <button className="auth-switch" onClick={() => {setAuthMode(authMode === "register" ? "login" : "register");setAuthError("");}}>{authMode === "register" ? "Аккаунтуңуз барбы? Кирүү" : "Аккаунтуңуз жокпу? Катталуу"}</button>
      <small className="muted">Чыныгы аккаунт MongoDB базасында сакталат.</small></div></div>}
  </div>;
}

function UsersIcon() { return <UserRound/>; }
function Stat({icon,value,label}:{icon:import("react").ReactNode;value:string;label:string}) {
  return <div className="stat-card"><span className="stat-icon">{icon}</span><div><b>{value}</b><small>{label}</small></div></div>;
}
function GameCard({game,completed,onClick}:{game:Game;completed:boolean;onClick:()=>void}) {
  return <button className="game-card" onClick={onClick}><div className="game-card-top"><span className={`game-icon ${game.color}`}>{game.icon}</span><span className="game-xp"><Zap size={14}/>{game.xp} XP</span></div><h3>{game.title}</h3><p>{game.subtitle}</p><div className="game-card-bottom"><span className="difficulty">{game.level}</span><span className="play-link">{completed ? "Кайра ойноо" : "Ойноо"} <ChevronRight size={16}/></span></div>{completed && <span className="completed-tag"><CheckCircle2 size={13}/> Аяктады</span>}</button>;
}
let scenarios=[],samples=[],templates={},forced=new Set(),excluded=new Set(),lastReport="";
const $=id=>document.getElementById(id);

async function load(p,f){
  try{
    let r=await fetch(p);
    return r.ok?await r.json():f;
  }catch{
    return f;
  }
}

async function init(){
  scenarios=await load("data/scenarios.json",[]);
  samples=await load("data/sample_cases.json",[]);
  templates=await load("data/message_templates.json",{});
  $("sample").innerHTML=samples.map((s,i)=>`<option value="${i}">${s.title}</option>`).join("");
  bind();
  render([]);
  loadSample(0);
}

function bind(){
  $("load").onclick=()=>loadSample(+$("sample").value);
  $("go").onclick=analyze;
  $("copy").onclick=async()=>{
    await navigator.clipboard.writeText(lastReport);
    $("copy").textContent="Copié";
    setTimeout(()=>$("copy").textContent="Copier rapport",1000);
  };
}

function loadSample(i){
  let s=samples[i];
  if(!s)return;

  forced.clear();
  excluded.clear();

  $("situation").value=s.text;
  let m=s.m||{};

  ["visitors","energy","water","health","rescue","logistics","lagoon","temp"].forEach(id=>{
    if(m[id]!==undefined)$(id).value=m[id];
  });

  analyze();
}

function render(active){
  let activeSet=new Set(active);

  $("cards").innerHTML=scenarios.map(s=>{
    const isExcluded=excluded.has(s.id);
    const isActive=activeSet.has(s.id)||forced.has(s.id);
    const state=isExcluded?"excluded":(isActive?"active":"");
    const label=isExcluded?" · exclu":"";
    return `<div class="card ${state}" data-id="${s.id}" title="Cliquer : activer / exclure / réactiver"><b>${s.id}</b><br><small>${s.name}${label}</small></div>`;
  }).join("");

  document.querySelectorAll(".card").forEach(card=>{
    card.onclick=()=>{
      const id=card.dataset.id;
      const isActive=activeSet.has(id)||forced.has(id);

      if(excluded.has(id)){
        excluded.delete(id);
      }else if(isActive){
        forced.delete(id);
        excluded.add(id);
      }else{
        forced.add(id);
      }

      analyze();
    };
  });
}

function metrics(){
  return {
    visitors:+$("visitors").value||0,
    energy:+$("energy").value||0,
    water:+$("water").value||0,
    health:+$("health").value||0,
    rescue:+$("rescue").value||0,
    logistics:+$("logistics").value||0,
    lagoon:$("lagoon").value,
    temp:$("temp").value
  };
}

function detect(text,m){
  let low=text.toLowerCase();
  let ids=new Set();

  scenarios.forEach(s=>{
    if(s.keys.some(k=>low.includes(k)))ids.add(s.id);
  });

  if(m.visitors>40000){
    ids.add("V4-001");
    ids.add("V4-012");
  }

  if(m.temp==="canicule")ids.add("V4-010");
  if(m.energy<50)ids.add("V4-003");
  if(m.water<21)ids.add("V4-004");
  if(m.health<30)ids.add("V4-007");
  if(m.rescue>8)ids.add("V4-012");
  if(m.lagoon!=="normal")ids.add("V4-005");
  if(m.logistics<21)ids.add("V4-006");

  forced.forEach(id=>ids.add(id));
  excluded.forEach(id=>ids.delete(id));

  return [...ids].map(id=>scenarios.find(s=>s.id===id)).filter(Boolean);
}

function level(active,m){
  let x=0;

  if(m.energy<15)x=Math.max(x,4);
  else if(m.energy<30)x=Math.max(x,3);
  else if(m.energy<50)x=Math.max(x,2);
  else if(m.energy<70)x=Math.max(x,1);

  if(m.water<7)x=Math.max(x,4);
  else if(m.water<14)x=Math.max(x,3);
  else if(m.water<21)x=Math.max(x,2);
  else if(m.water<30)x=Math.max(x,1);

  if(m.health<15)x=Math.max(x,3);
  else if(m.health<30)x=Math.max(x,2);
  else if(m.health<50)x=Math.max(x,1);

  if(m.rescue>12)x=Math.max(x,3);
  else if(m.rescue>8)x=Math.max(x,2);

  if(m.lagoon==="pollution confirmée")x=Math.max(x,3);
  else if(m.lagoon==="trouble")x=Math.max(x,2);

  if(m.temp==="canicule"||m.visitors>40000)x=Math.max(x,2);

  if(active.some(s=>["V4-002","V4-008","V4-011","V4-014"].includes(s.id)))x=Math.max(x,3);

  if(!active.length)x=0;

  return ["Normal","Vigilance","Tension","Crise","Mode dégradé"][x];
}

function decision(primary,levelValue,m){
  if(!primary)return "Aucune décision : situation insuffisante.";

  if(primary.id==="V4-002")return "Fermeture préventive des zones exposées, mode énergie sobre et rapatriement vers zones abritées.";
  if(primary.id==="V4-010"&&m.visitors>40000)return "Festival maintenu sous conditions strictes : jauge ramenée à 40 000, zones fraîches ouvertes, eau et santé prioritaires.";
  if(primary.id==="V4-005")return "Fermeture immédiate du lagon concerné et réduction des activités littorales.";
  if(primary.id==="V4-009")return "Passage en manuel, isolation réseau, fonctions vitales sous contrôle humain.";
  if(levelValue==="Crise")return `Activer cellule de crise ${primary.name} et suspendre le non vital.`;

  return `${primary.name} : décision sous niveau ${levelValue}.`;
}

function freq(levelValue){
  return {
    "Normal":"quotidienne",
    "Vigilance":"toutes les 12 heures",
    "Tension":"toutes les 2 à 6 heures",
    "Crise":"toutes les 2 heures",
    "Mode dégradé":"continue"
  }[levelValue]||"à définir";
}

function analyze(){
  let text=$("situation").value.trim();
  let m=metrics();
  let active=detect(text,m);
  let primary=active.slice().sort((a,b)=>a.prio-b.prio)[0];
  let secondaries=active.filter(s=>!primary||s.id!==primary.id);
  let levelValue=level(active,m);
  let decisionText=decision(primary,levelValue,m);
  let actions=[...(primary?primary.actions:[]),...secondaries.flatMap(s=>s.actions.slice(0,1))];

  if(m.visitors>40000&&!excluded.has("V4-012"))actions.unshift("Ramener la jauge publique à 40 000 visiteurs maximum.");
  if(m.temp==="canicule"&&!excluded.has("V4-010"))actions.unshift("Ouvrir zones fraîches et décaler les activités extérieures.");
  if(m.lagoon!=="normal"&&!excluded.has("V4-005"))actions.unshift("Fermer provisoirement la zone lagon concernée.");

  actions=[...new Set(actions)].slice(0,10);

  let msg=(templates[levelValue]||templates.Tension)
    .replace("{situation}",(text.split(".")[0]||"situation en cours"))
    .replace("{decision}",decisionText)
    .replace("{update}",freq(levelValue));

  lastReport=`Décision Harmonia V4.5

Situation :
${text}

Scénario principal :
${primary?`${primary.id} — ${primary.name}`:"Non détecté"}

Scénarios secondaires :
${secondaries.length?secondaries.map(s=>`${s.id} — ${s.name}`).join("\n"):"Aucun"}

Scénarios exclus manuellement :
${excluded.size?[...excluded].join(", "):"Aucun"}

Niveau cockpit :
${levelValue}

Décision :
${decisionText}

Actions immédiates :
${actions.map((a,i)=>`${i+1}. ${a}`).join("\n")}

Réévaluation :
${freq(levelValue)}

Message public :
${msg}`;

  render(active.map(s=>s.id));

  $("primary").textContent=primary?`${primary.id} — ${primary.name}`:"—";
  $("secondary").textContent=secondaries.length?secondaries.map(s=>`${s.id} — ${s.name}`).join(", "):"—";
  $("level").textContent=$("levelTop").textContent=levelValue;
  $("decision").textContent=decisionText;
  $("actions").innerHTML=actions.map(a=>`<li>${a}</li>`).join("");
  $("message").textContent=msg;
  $("report").textContent=lastReport;
}

init();


const{useState,useRef,useEffect}=React;

const C={navy:"#12243B",gold:"#C49A48",goldLight:"#F5E9C8",ink:"#1C2D58",blue:"#2A4178",bgPage:"#F5F3EE",white:"#FFFFFF",gray:"#8CA0C8",lightGray:"#F0F4FA",red:"#C84B30",orange:"#E07030",green:"#2D6A4F",darkGold:"#B98A3A"};
const EC={"\u6728":{bg:"#D0EAD8",border:"#4A8C6A",text:"#2D5A3D"},"\u706b":{bg:"#FAEAE6",border:"#C84B30",text:"#8B2A18"},"\u76f8\u706b":{bg:"#FAEEE0",border:"#E07030",text:"#8B4010"},"\u571f":{bg:"#FDF3DC",border:"#B8860B",text:"#7A5A06"},"\u91d1":{bg:"#EBEBEB",border:"#6B7A6A",text:"#3A4A3A"},"\u6c34":{bg:"#DCE8F5",border:"#2E5F8A",text:"#1A3A5A"}};
const ec=e=>EC[e]||EC["\u571f"];

const SUPABASE_URL="https://dqcxpevxkbgwqqzackjd.supabase.co";
const SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRxY3hwZXZ4a2Jnd3FxemFja2pkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5ODQ2MjcsImV4cCI6MjA5NjU2MDYyN30.FzupfG-0YG30sUBVo3I7BO4y5S3QZwTOPmrDGWqSNYY";
const sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
const BOOKING="https://blossom-skin-and-health-acupuncture-clinic.au2.cliniko.com/bookings";

async function sbSignUp(email,pw,name,dob,lang,conds){
  const{data,error}=await sb.auth.signUp({email,password:pw,options:{data:{name,dob,pref_lang:lang}}});
  if(error)throw error;
  const uid=data.user?.id||data.session?.user?.id;
  if(!uid)throw new Error("CHECK_EMAIL");
  const{error:ie}=await sb.from("users").upsert(
    {id:uid,email,name,dob:dob||null,pref_lang:lang||"en",conditions:conds||[],plan:"free"},
    {onConflict:"id"}
  );
  if(ie)console.warn("users upsert:",ie.message);
  return{id:uid,email,name,dob,pref_lang:lang||"en",conditions:conds||[],plan:"free"};
}
async function sbSignIn(email,pw){
  const{data,error}=await sb.auth.signInWithPassword({email,password:pw});
  if(error)throw error;
  const{data:p,error:pe}=await sb.from("users").select("*").eq("id",data.user.id).single();
  if(pe||!p){
    // users 레코드 없으면 생성
    const nm=data.user.user_metadata?.name||email.split("@")[0];
    const{data:np}=await sb.from("users").upsert({id:data.user.id,email,name:nm,plan:"free"},{onConflict:"id"}).select().single();
    return np||{id:data.user.id,email,name:nm,plan:"free"};
  }
  return p;
}
async function sbSignOut(){await sb.auth.signOut();}
async function sbSession(){
  const{data}=await sb.auth.getSession();
  if(!data.session)return null;
  const uid=data.session.user.id;
  const{data:p,error:pe}=await sb.from("users").select("*").eq("id",uid).single();
  if(pe||!p){
    const email=data.session.user.email;
    const nm=data.session.user.user_metadata?.name||email.split("@")[0];
    const{data:np}=await sb.from("users").upsert({id:uid,email,name:nm,plan:"free"},{onConflict:"id"}).select().single();
    return np||{id:uid,email,name:nm,plan:"free"};
  }
  return p;
}
async function sbUpdate(uid,obj){const{error}=await sb.from("users").update(obj).eq("id",uid);if(error)throw error;}
async function sbForgot(email){const{error}=await sb.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin});if(error)throw error;}
async function sbChangePw(pw){const{error}=await sb.auth.updateUser({password:pw});if(error)throw error;}

const STEMS=["\u7532","\u4e59","\u4e19","\u4e01","\u620a","\u5df1","\u5e9a","\u8f9b","\u58ec","\u7678"];
const BRANCHES=["\u5b50","\u4e11","\u5bc5","\u536f","\u8fb0","\u5df3","\u5348","\u672a","\u7533","\u9149","\u620c","\u4ea5"];
const JIAZI=["\u7532\u5b50","\u4e59\u4e11","\u4e19\u5bc5","\u4e01\u536f","\u620a\u8fb0","\u5df1\u5df3","\u5e9a\u5348","\u8f9b\u672a","\u58ec\u7533","\u7678\u9149","\u7532\u620c","\u4e59\u4ea5","\u4e19\u5b50","\u4e01\u4e11","\u620a\u5bc5","\u5df1\u536f","\u5e9a\u8fb0","\u8f9b\u5df3","\u58ec\u5348","\u7678\u672a","\u7532\u7533","\u4e59\u9149","\u4e19\u620c","\u4e01\u4ea5","\u620a\u5b50","\u5df1\u4e11","\u5e9a\u5bc5","\u8f9b\u536f","\u58ec\u8fb0","\u7678\u5df3","\u7532\u5348","\u4e59\u672a","\u4e19\u7533","\u4e01\u9149","\u620a\u620c","\u5df1\u4ea5","\u5e9a\u5b50","\u8f9b\u4e11","\u58ec\u5bc5","\u7678\u536f","\u7532\u8fb0","\u4e59\u5df3","\u4e19\u5348","\u4e01\u672a","\u620a\u7533","\u5df1\u9149","\u5e9a\u620c","\u8f9b\u4ea5","\u58ec\u5b50","\u7678\u4e11","\u7532\u5bc5","\u4e59\u536f","\u4e19\u8fb0","\u4e01\u5df3","\u620a\u5348","\u5df1\u672a","\u5e9a\u7533","\u8f9b\u9149","\u58ec\u620c","\u7678\u4ea5"];

const SY={"\u7532":["\u571f\u904b\u592a\u904e","\u571f"],"\u4e59":["\u91d1\u904b\u4e0d\u53ca","\u91d1"],"\u4e19":["\u6c34\u904b\u592a\u904e","\u6c34"],"\u4e01":["\u6728\u904b\u4e0d\u53ca","\u6728"],"\u620a":["\u706b\u904b\u592a\u904e","\u706b"],"\u5df1":["\u571f\u904b\u4e0d\u53ca","\u571f"],"\u5e9a":["\u91d1\u904b\u592a\u904e","\u91d1"],"\u8f9b":["\u6c34\u904b\u4e0d\u53ca","\u6c34"],"\u58ec":["\u6728\u904b\u592a\u904e","\u6728"],"\u7678":["\u706b\u904b\u4e0d\u53ca","\u706b"]};

const BQ={"\u5b50":{si:"\u5c11\u9670\u541b\u706b",zai:"\u967d\u660e\u71e5\u91d1"},"\u5348":{si:"\u5c11\u9670\u541b\u706b",zai:"\u967d\u660e\u71e5\u91d1"},"\u4e11":{si:"\u592a\u9670\u6e7f\u571f",zai:"\u592a\u9633\u5bd2\u6c34"},"\u672a":{si:"\u592a\u9670\u6e7f\u571f",zai:"\u592a\u9633\u5bd2\u6c34"},"\u5bc5":{si:"\u5c11\u9633\u76f8\u706b",zai:"\u5a25\u9670\u98a8\u6728"},"\u7533":{si:"\u5c11\u9633\u76f8\u706b",zai:"\u5a25\u9670\u98a8\u6728"},"\u536f":{si:"\u967d\u660e\u71e5\u91d1",zai:"\u5c11\u9670\u541b\u706b"},"\u9149":{si:"\u967d\u660e\u71e5\u91d1",zai:"\u5c11\u9670\u541b\u706b"},"\u8fb0":{si:"\u592a\u9633\u5bd2\u6c34",zai:"\u592a\u9670\u6e7f\u571f"},"\u620c":{si:"\u592a\u9633\u5bd2\u6c34",zai:"\u592a\u9670\u6e7f\u571f"},"\u5df3":{si:"\u5a25\u9670\u98a8\u6728",zai:"\u5c11\u9633\u76f8\u706b"},"\u4ea5":{si:"\u5a25\u9670\u98a8\u6728",zai:"\u5c11\u9633\u76f8\u706b"}};

const SQ=["\u5a25\u9670\u98a8\u6728","\u5c11\u9670\u541b\u706b","\u5c11\u9633\u76f8\u706b","\u592a\u9670\u6e7f\u571f","\u967d\u660e\u71e5\u91d1","\u592a\u9633\u5bd2\u6c34"];
const SQE={"\u5a25\u9670\u98a8\u6728":"\u6728","\u5c11\u9670\u541b\u706b":"\u706b","\u5c11\u9633\u76f8\u706b":"\u76f8\u706b","\u592a\u9670\u6e7f\u571f":"\u571f","\u967d\u660e\u71e5\u91d1":"\u91d1","\u592a\u9633\u5bd2\u6c34":"\u6c34"};
const FY=["\u6728","\u706b","\u571f","\u91d1","\u6c34"];
const YG={"\u6728":"\u706b","\u706b":"\u571f","\u571f":"\u91d1","\u91d1":"\u6c34","\u6c34":"\u6728"};
const SL=["\u4e00\u904b\u4e00\u6c23","\u4e00\u904b\u4e8c\u6c23","\u4e8c\u904b\u4e8c\u6c23","\u4e8c\u904b\u4e09\u6c23","\u4e09\u904b\u4e09\u6c23","\u4e09\u904b\u56db\u6c23","\u56db\u904b\u56db\u6c23","\u56db\u904b\u4e94\u6c23","\u4e94\u904b\u4e94\u6c23","\u4e94\u904b\u516d\u6c23"];
const DN=["1.20~3.21","3.21~4.3","4.3~5.21","5.21~6.16","6.16~7.22","7.22~8.29","8.29~9.22","9.22~11.11","11.11~11.22","11.22~1.20"];
const DS=["7.22~9.22","9.22~10.3","10.3~11.21","11.21~12.16","12.16~1.21","1.21~2.28","2.28~3.21","3.21~5.11","5.11~5.21","5.21~7.22"];

const SP={"\u4e01\u536f1987":"\u6b72\u6703","\u5e9a\u54481990":"\u540c\u5929\u7b26","\u8f9b\u672a1991":"\u540c\u6b72\u6703","\u58ec\u75331992":"\u540c\u5929\u7b26","\u7678\u914d1993":"\u540c\u6b72\u6703","\u7532\u620c1994":"\u540c\u5929\u7b26","\u4e19\u5b501996":"\u6b72\u6703","\u620a\u5bc51998":"\u5929\u7b26","\u4e59\u914d2005":"\u592a\u4e59\u5929\u7b26","\u4e19\u620c2006":"\u5929\u7b26","\u4e01\u4ea52007":"\u5929\u7b26","\u620a\u5b502008":"\u5929\u7b26","\u5df1\u4e112009":"\u592a\u4e59\u5929\u7b26","\u7532\u53482014":"\u6b72\u6703","\u5e9a\u5b502020":"\u540c\u5929\u7b26","\u8f9b\u4e112021":"\u540c\u6b72\u6703","\u58ec\u5bc52022":"\u540c\u5929\u7b26","\u7678\u536f2023":"\u540c\u6b72\u6703","\u7532\u8fb02024":"\u540c\u5929\u7b26","\u620a\u75332028":"\u5929\u7b26","\u8f9b\u4ea52031":"\u540c\u6b72\u6703","\u7678\u4e112033":"\u540c\u6b72\u6703","\u4e59\u536f2035":"\u5929\u7b26","\u4e19\u8fb02036":"\u5929\u7b26","\u4e01\u5df32037":"\u5929\u7b26","\u620a\u53482038":"\u592a\u4e59\u5929\u7b26","\u5df1\u672a2040":"\u592a\u4e59\u5929\u7b26"};

const RS={"雙火":{label:"★★ EXTREME",bg:"#FFF0EE",border:"#C84B30",color:"#C84B30"},"雙土":{label:"★★ HIGH",bg:"#FFF5EC",border:"#E07030",color:"#E07030"},"逆":{label:"★ HIGH",bg:"#FFFBE8",border:"#B8860B",color:"#B8860B"},"順":{label:"— OK",bg:"#F0FBF5",border:"#2D6A4F",color:"#2D6A4F"}};

const LANGS=[{v:"en",l:"English"},{v:"ko",l:"Korean (한국어)"},{v:"zh",l:"Chinese (中文)"},{v:"ja",l:"Japanese (日本語)"},{v:"es",l:"Spanish (Español)"},{v:"fr",l:"French (Français)"},{v:"de",l:"German (Deutsch)"},{v:"id",l:"Bahasa Indonesia"},{v:"pt",l:"Portuguese"},{v:"ar",l:"Arabic (العربية)"}];
const HC=["Cardiovascular disease","Hypertension","Diabetes","Respiratory conditions","Digestive disorders","Liver / Gallbladder conditions","Kidney / Urinary conditions","Joint / Arthritis pain","Autoimmune conditions","Anxiety / Depression","Insomnia / Sleep disorders","Hormonal / Menstrual disorders","Skin conditions","Chronic fatigue","Migraine / Headaches","Cancer (in treatment or remission)","Thyroid conditions","Allergies / Immune issues","Weight management","Other"];

function judgeRisk(ke,zh){
  if((ke==="火"||ke==="相火")&&(zh==="火"||zh==="相火"))return"雙火";
  if(ke==="土"&&zh==="土")return"雙土";
  // 客克主 = 逆 (객기가 주기를 克할 때만)
  const ctrl={"木":"土","土":"水","水":"火","火":"金","金":"木","相火":"金"};
  const keBase=ke==="相火"?"火":ke;
  if(ctrl[keBase]===zh)return"逆";
  return"順";
}

function calcYear(yr){
  const idx=((yr-1984)%60+60)%60;
  const jz=JIAZI[idx],stem=STEMS[idx%10],branch=BRANCHES[idx%12];
  const[dyName,dyEl]=SY[stem];
  const{si,zai}=BQ[branch];
  const keQi=SQ.map((_,j)=>SQ[(SQ.indexOf(si)-2+j+6)%6]);
  const keYun=(e=>{const r=[e];let c=e;for(let i=1;i<5;i++){c=YG[c];r.push(c);}return r;})(dyEl);
  const special=SP[jz+yr]||SP[jz]||"\u2014";
  const siEl=SQE[si];
  const gen={木:"火",火:"土",土:"金",金:"水",水:"木",相火:"土"};const ctrl={木:"土",土:"水",水:"火",火:"金",金:"木",相火:"金"};const yqr=siEl===dyEl?"天符":gen[siEl]===dyEl?"氣生運(順化)":gen[dyEl]===siEl?"運生氣(小逆)":ctrl[siEl]===dyEl?"氣克運(天刑)":ctrl[dyEl]===siEl?"運克氣(不和)":"—";
  const segs=SL.map((name,i)=>{
    const yi=[0,0,1,1,2,2,3,3,4,4][i],qi=[0,1,1,2,2,3,3,4,4,5][i];
    const zYun=FY[yi],kYun=keYun[yi],zQi=SQ[qi],kQiName=keQi[qi];
    const kQiEl=SQE[kQiName],zQiEl=SQE[zQi];
    return{name,zYun,kYun,zQi,kQiName,kQiEl,zQiEl,risk:judgeRisk(kQiEl,zQiEl)};
  });
  return{jz,dyName,dyEl,si,zai,special,yqr,segs,siEl};
}

function getUpcoming(segs,hemi,yr){
  const now=new Date(),dates=hemi==="S"?DS:DN,out=[];
  segs.forEach((s,i)=>{
    if(s.risk==="雙火"||s.risk==="雙土"||s.risk==="逆"){
      const[ms,ds]=dates[i].split("~")[0].split(".").map(Number);
      const start=new Date(yr,ms-1,ds);
      const a0=new Date(start);a0.setDate(a0.getDate()-30);
      const a1=new Date(start);a1.setDate(a1.getDate()+14);
      if(now>=a0&&now<=a1){
        out.push({...s,start,daysUntil:Math.ceil((start-now)/86400000),dateStr:dates[i]});
      }
    }
  });
  return out;
}

const CL={
  "雙火":{w:"Both Qi are Fire — extreme heat, drought, sudden storms.",d:"Febrile epidemics · Cardiovascular crisis · Insomnia · Palpitations · Heat stroke",food:"Bitter melon · Lotus seed · Mung beans · Cucumber · Chrysanthemum tea · Green tea",tea:"Chrysanthemum & Wolfberry Tea: 10 flowers + 1 tsp goji berries, steep 5 min.\n\nLotus Seed & Lily Bulb Tea: 10g lotus seeds + 10g lily bulb, simmer 20 min, add honey.",lifestyle:"Avoid peak sun (11am-3pm) · Light cotton clothing · Cold foot bath before bed · Limit spicy & alcohol · Choose gentle walking or swimming",lay:"Heat peaks. Cool from the inside out. Hydrate constantly.",a:"HT 7 神門 · HT 8 少府 · PC 6 內關 · LI 11 曲池 · BL 15 心俞 · GV 14 大椎",h:"Huang Lian Jie Du Tang 黃連解毒湯 · Zhu Ye Shi Gao Tang 竹葉石膏湯"},
  "雙土":{w:"Both Qi are Earth — heavy rain, flooding, oppressive humidity.",d:"Damp-heat epidemic · Gastroenteritis · Oedema · Skin infections · Fatigue",food:"Barley (薏苡仁) · Adzuki beans · Pumpkin · Congee · Cooked ginger · Daikon",tea:"Ginger & Tangerine Peel Tea: 3 ginger slices + 5g dried peel (陳皮), simmer 10 min.\n\nBarley & Red Bean Tea: 30g barley + 20g adzuki beans, soak 1hr, simmer 40 min. Drink warm.",lifestyle:"Avoid cold drinks & raw food · Keep spaces dry · Eat smaller meals · Morning walks · Gentle abdominal massage after meals",lay:"Dampness accumulates. Keep warm, eat cooked foods, avoid cold or heavy meals.",a:"SP 9 陰陵泉 · ST 40 豐隆 · REN 9 水分 · LI 11 曲池 · BL 20 脾俞 · ST 36 足三里",h:"Huo Xiang Zheng Qi San 藿香正氣散 · San Ren Tang 三仁湯"},
  "逆":{w:"Guest Qi overacts Host Qi — climate contradicts the season.",d:"Immune fluctuation · Seasonal allergies · Erratic symptoms · Infection risk",food:"Warming easy-to-digest foods · Ginger · Spring onion · Cooked garlic · Bone broth",tea:"Ginger, Spring Onion & Brown Sugar Tea: 3 ginger slices + 2 spring onion roots + 1 tsp brown sugar, simmer 10 min.\n\nCinnamon & Honey Tea: half tsp cinnamon in warm water + 1 tsp honey.",lifestyle:"Dress in layers · Keep neck & lower back warm · Adequate sleep · Reduce alcohol & sugar",lay:"Seasons clash. Dress warmly, eat simply, rest well.",a:"LI 4 合谷 · ST 36 足三里 · LU 7 列缺 · BL 12 風門 · GV 14 大椎",h:"Yu Ping Feng San 玉屏風散 · Gui Zhi Tang 桂枝湯"},
  "順":{w:"Qi harmonise — normal seasonal pattern.",d:"Mild seasonal patterns. Standard self-care applies.",food:"Spring=leafy greens, Summer=cooling fruits, Late summer=root vegetables, Autumn=pears, Winter=black foods & nuts",tea:"Seasonal tea: Spring=chrysanthemum; Summer=mint & honey; Autumn=pear & white fungus; Winter=cinnamon & goji.",lifestyle:"Regular sleep · Gentle seasonal exercise · Eat with the season · Spend time in nature",lay:"Harmonious period. Maintain regular routines.",a:"ST 36 足三里 · SP 6 三陰交 · LI 4 合谷 · BL 23 腎俞",h:"Seasonal tonic formulas as appropriate"}
};

function buildSys(u){
  const lang=u&&u.pref_lang?LANGS.find(l=>l.v===u.pref_lang):null;
  const conds=u&&u.conditions&&u.conditions.length>0?"\nHealth conditions: "+u.conditions.join(", "):"";
  const dob=u&&u.dob?"\nDOB: "+u.dob:"";
  const profile=conds||dob?"\nUSER PROFILE:"+dob+conds:"";
  return"You are the Wu Yun Liu Qi (五運六氣) expert health assistant for Sang Hee Park, PhD — AHPRA registered acupuncturist, Doctor of TCM, Blossom Skin & Health, Wahroonga NSW Australia.\n"+(lang?"Default reply language: "+lang.l+". ":"")+profile+"\nCRITICAL: Always reply in the same language as the user's question.\nFor existing health conditions: always recommend consulting a qualified TCM practitioner.\nKnowledge base: 甲=土太過|乙=金不及|丙=水太過|丁=木不及|戊=火太過|己=土不及|庚=金太過|辛=水不及|壬=木太過|癸=火不及. 子午=少陰君火/陽明燥金|丑未=太陰濕土/太陽寒水|寅申=少陽相火/厥陰風木|卯酉=陽明燥金/少陰君火|辰戌=太陽寒水/太陰濕土|巳亥=厥陰風木/少陽相火. 2026:水太過,少陰君火 Si Tian,KID-HT axis. 2027:木不及,太陰濕土 Si Tian,digestive watch.\nEnd every answer: 'Educational purposes only. Consult a qualified practitioner. Book: "+BOOKING+"'";
}

const iS={display:"block",width:"100%",padding:"8px 10px",borderRadius:6,border:"1px solid #ddd",fontSize:12,marginBottom:8,outline:"none",boxSizing:"border-box"};

function Sec({title,bg,tc,pre,children}){
  return <div style={{marginBottom:14}}>
    <div style={{fontWeight:"bold",color:C.ink,fontSize:12,marginBottom:6}}>{title}</div>
    <div style={{color:tc||"#444",fontSize:12,lineHeight:1.7,background:bg||"#F5F5F5",borderRadius:8,padding:"10px 12px",whiteSpace:pre?"pre-line":"normal"}}>{children}</div>
  </div>;
}

function App(){
  const mob=window.innerWidth<=600;

  // Stripe 결제 완료 후 URL 파라미터 처리
  useEffect(()=>{
    const params=new URLSearchParams(window.location.search);
    if(params.get("payment")==="success"){
      // 세션 재로딩으로 최신 plan 상태 반영
      sbSession().then(p=>{if(p)setUser(p);});
      window.history.replaceState({},"","/");
    }
  },[]);
  const[tab,setTab]=useState("features");
  const[yr,setYr]=useState(2026);
  const[hemi,setHemi]=useState("S");
  const[data,setData]=useState(()=>calcYear(2026));
  const[user,setUser]=useState(null);
  const[ready,setReady]=useState(false);
  const[authMode,setAuthMode]=useState("login");
  const[email,setEmail]=useState("");
  const[pw,setPw]=useState("");
  const[nm,setNm]=useState("");
  const[dob,setDob]=useState("");
  const[lang,setLang]=useState("en");
  const[conds,setConds]=useState([]);
  const[authErr,setAuthErr]=useState("");
  const[acctSec,setAcctSec]=useState("main");
  const[editNm,setEditNm]=useState("");
  const[editEm,setEditEm]=useState("");
  const[nPw,setNPw]=useState("");
  const[nPw2,setNPw2]=useState("");
  const[acctMsg,setAcctMsg]=useState({t:"",ok:true});
  const[fgEmail,setFgEmail]=useState("");
  const[fgSent,setFgSent]=useState(false);
  const[obConds,setObConds]=useState([]);
  const[obStep,setObStep]=useState(0);
  const[msgs,setMsgs]=useState([{role:"assistant",content:"Hello! I am the Wu Yun Liu Qi (五運六氣) health assistant.\n\n🌐 Ask in any language — I reply in your language.\n📅 Sign up for personalised seasonal health guidance.\n\nWhat would you like to know?"}]);
  const[inp,setInp]=useState("");
  const[loading,setLoading]=useState(false);
  const[rModal,setRModal]=useState(null);
  const chatRef=useRef(null);

  useEffect(()=>{
    sbSession().then(p=>{if(p)setUser(p);setReady(true);});
    const{data:{subscription}}=sb.auth.onAuthStateChange(async(event,session)=>{
      if(event==="SIGNED_IN"&&session){
        const uid=session.user.id;
        const email=session.user.email;
        const nm=session.user.user_metadata?.name||email.split("@")[0];
        const{data:p,error:pe}=await sb.from("users").select("*").eq("id",uid).single();
        if(pe||!p){
          const{data:np}=await sb.from("users").upsert({id:uid,email,name:nm,plan:"free"},{onConflict:"id"}).select().single();
          if(np)setUser(np);
        } else {
          setUser(p);
        }
      } else if(event==="SIGNED_OUT"){
        setUser(null);
      }
    });
    return()=>subscription.unsubscribe();
  },[]);
  useEffect(()=>{if(chatRef.current)chatRef.current.scrollTop=chatRef.current.scrollHeight;},[msgs]);

  const isPaid=user&&user.plan==="paid";
  const uConds=(user&&user.conditions)||[];
  const uPT=user&&(user.plan_type||user.planType);
  const upcoming=isPaid?getUpcoming(data.segs,hemi,yr):[];

  function tog(c,arr,set){set(p=>p.includes(c)?p.filter(x=>x!==c):[...p,c]);}

  async function handleAuth(){
    setAuthErr("");
    if(authMode==="register"){
      if(!email||!pw||!nm){setAuthErr("Please fill in all required fields.");return;}
      if(pw.length<6){setAuthErr("Password must be at least 6 characters.");return;}
      try{
        const p=await sbSignUp(email,pw,nm,dob,lang,conds);
        setUser(p);setObConds(conds);setObStep(1);
      }catch(e){
        const msg=e.message||"";
        if(msg==="CHECK_EMAIL"){
          setAuthErr("Account created! Please check your email to confirm, then sign in.");
          setAuthMode("login");
        } else if(msg.includes("already registered")||msg.includes("already exists")||msg.includes("User already registered")){
          setAuthErr("Email already registered. Please sign in.");
          setAuthMode("login");
        } else {
          setAuthErr(msg||"Registration failed.");
        }
      }
    }else{
      try{const p=await sbSignIn(email,pw);setUser(p);}
      catch(e){setAuthErr("Incorrect email or password.");}
    }
  }

  async function finishOnboard(){
    try{await sbUpdate(user.id,{conditions:obConds});}catch(e){}
    setUser(u=>({...u,conditions:obConds}));
    setObStep(0);setTab("qa");
  }

  async function handleSub(planType){
    if(!user){setAuthMode("register");setTab("account");return;}
    try{
      const res=await fetch("/api/create-checkout",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({planType,email:user.email,userId:user.id})
      });
      const d=await res.json();
      if(d.url){window.location.href=d.url;return;}
      // Stripe 미설정 시 임시 직접 업그레이드
      throw new Error(d.error||"stripe_not_configured");
    }catch(e){
      // Stripe 미설정 상태 - 개발용 임시 처리
      try{await sbUpdate(user.id,{plan:"paid",plan_type:planType});}catch(e2){}
      setUser(u=>({...u,plan:"paid",plan_type:planType}));
      setTab("qa");
    }
  }

  async function saveProfile(){
    if(!editNm.trim()||!editEm.trim()){setAcctMsg({t:"Name and email required.",ok:false});return;}
    try{
      await sbUpdate(user.id,{name:editNm,email:editEm});
      setUser(u=>({...u,name:editNm,email:editEm}));
      setAcctMsg({t:"Profile updated.",ok:true});
      setTimeout(()=>{setAcctSec("main");setAcctMsg({t:"",ok:true});},1200);
    }catch(e){setAcctMsg({t:"Update failed.",ok:false});}
  }

  async function savePw(){
    if(nPw.length<6){setAcctMsg({t:"Password must be at least 6 characters.",ok:false});return;}
    if(nPw!==nPw2){setAcctMsg({t:"Passwords do not match.",ok:false});return;}
    try{
      await sbChangePw(nPw);
      setAcctMsg({t:"Password changed.",ok:true});
      setTimeout(()=>{setAcctSec("main");setNPw("");setNPw2("");setAcctMsg({t:"",ok:true});},1200);
    }catch(e){setAcctMsg({t:"Failed: "+e.message,ok:false});}
  }

  async function cancelSub(){
    try{await sbUpdate(user.id,{plan:"free",plan_type:null});}catch(e){}
    setUser(u=>({...u,plan:"free",plan_type:null}));
    setAcctSec("main");
  }

  async function sendMsg(){
    if(!inp.trim()||loading)return;
    const uMsg={role:"user",content:inp};
    setMsgs(m=>[...m,uMsg]);setInp("");setLoading(true);
    try{
      const res=await fetch("/api/chat",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({system:buildSys(user),messages:[...msgs,uMsg].map(m=>({role:m.role,content:m.content}))})
      });
      const d=await res.json();
      // Anthropic 에러 응답 처리
      if(d.error){
        const errMsg=typeof d.error==="object"?d.error.message:d.error;
        setMsgs(m=>[...m,{role:"assistant",content:"Service error: "+errMsg+". Please try again."}]);
      } else if(d.content&&d.content[0]&&d.content[0].text){
        setMsgs(m=>[...m,{role:"assistant",content:d.content[0].text}]);
      } else {
        setMsgs(m=>[...m,{role:"assistant",content:"Unexpected response. Please try again."}]);
      }
    }catch(e){
      setMsgs(m=>[...m,{role:"assistant",content:"Connection error. Please check your network and try again."}]);
    }
    setLoading(false);
  }

  if(!ready)return <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:C.bgPage}}><div style={{color:C.navy,fontSize:14}}>Loading...</div></div>;

  const obModal=obStep>0&&(
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.65)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:C.white,borderRadius:12,padding:20,maxWidth:460,width:"100%",maxHeight:"90vh",overflowY:"auto"}}>
        <div style={{color:C.gold,fontSize:11,letterSpacing:1,marginBottom:4}}>ALMOST DONE</div>
        <div style={{fontWeight:"bold",color:C.ink,fontSize:15,marginBottom:4}}>Any health conditions?</div>
        <div style={{color:C.gray,fontSize:12,marginBottom:14,lineHeight:1.6}}>Optional — helps us send personalised seasonal alerts. Update anytime in My Account.</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:16}}>
          {HC.map(c=><div key={c} onClick={()=>tog(c,obConds,setObConds)} style={{border:"1.5px solid "+(obConds.includes(c)?C.gold:"#eee"),borderRadius:6,padding:"7px 10px",cursor:"pointer",background:obConds.includes(c)?C.goldLight:"#FAFAFA",fontSize:11,color:obConds.includes(c)?C.ink:C.gray,display:"flex",alignItems:"center",gap:5}}>
            <span style={{color:obConds.includes(c)?C.gold:"#ddd",fontSize:13,flexShrink:0}}>✓</span>{c}
          </div>)}
        </div>
        <button onClick={finishOnboard} style={{width:"100%",padding:"10px 0",borderRadius:6,border:"none",cursor:"pointer",background:C.navy,color:C.white,fontWeight:"bold",fontSize:12}}>
          {obConds.length>0?"Save & Go to Q&A":"Skip & Go to Q&A"}
        </button>
      </div>
    </div>
  );

  const riskModal=rModal&&(
    <div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.65)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:C.white,borderRadius:12,padding:0,maxWidth:500,width:"100%",maxHeight:"92vh",overflowY:"auto"}}>
        <div style={{background:rModal.risk==="雙火"?C.red:rModal.risk==="雙土"?C.orange:C.darkGold,borderRadius:"12px 12px 0 0",padding:"16px 20px",color:C.white}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={{fontSize:11,opacity:0.85,marginBottom:3}}>{RS[rModal.risk].label} · {rModal.name}</div>
              <div style={{fontWeight:"bold",fontSize:17,marginBottom:2}}>{rModal.risk==="雙火"?"Double Fire":rModal.risk==="雙土"?"Double Earth":"High-Risk"} Period</div>
              <div style={{fontSize:12,opacity:0.9}}>{rModal.daysUntil>0?"Starts in "+rModal.daysUntil+" days":"Currently active"} · {rModal.dateStr} ({hemi==="S"?"Southern":"Northern"} Hemisphere)</div>
            </div>
            <button onClick={()=>setRModal(null)} style={{background:"rgba(255,255,255,0.2)",border:"none",borderRadius:6,color:C.white,cursor:"pointer",padding:"4px 8px",fontSize:14,marginLeft:8}}>X</button>
          </div>
        </div>
        <div style={{padding:20}}>
          <Sec title="Climate Forecast" bg={C.lightGray}>{CL[rModal.risk].w}</Sec>
          <Sec title="General Health Risks" bg="#FFF8F0">{CL[rModal.risk].d}</Sec>
          {uConds.length>0?(
            <div style={{marginBottom:14,background:"#FFF0EE",borderRadius:8,padding:"12px 14px",border:"1px solid #FABFB0"}}>
              <div style={{fontWeight:"bold",color:C.red,fontSize:12,marginBottom:6}}>Your Conditions & This Period</div>
              <div style={{color:"#555",fontSize:12,lineHeight:1.7,marginBottom:8}}>
                You have noted: <strong>{uConds.join(", ")}</strong>.<br/><br/>
                {rModal.risk==="雙火"?"Fire periods place extra stress on the cardiovascular system and nervous system.":rModal.risk==="雙土"?"Earth periods stress the digestive system. Damp accumulation may worsen symptoms.":"Climate mismatch can trigger immune fluctuation and aggravate existing conditions."}
              </div>
              <div style={{background:C.white,borderRadius:6,padding:"10px 12px",border:"1px solid #FABFB0",fontSize:11,color:"#555",lineHeight:1.7}}>
                Because you have existing conditions, please consult Sang Hee for a personalised treatment plan ideally 2-4 weeks before this period.
              </div>
            </div>
          ):(
            <div style={{marginBottom:14,background:C.lightGray,borderRadius:8,padding:"10px 12px",fontSize:11,color:"#666",lineHeight:1.6}}>
              Add your health conditions in My Account for personalised guidance.
            </div>
          )}
          <Sec title="Recommended Foods" bg="#F0FBF5" tc="#2D5A3D">{CL[rModal.risk].food}</Sec>
          <Sec title="Lifestyle & Habits" bg="#F8F6F0">{CL[rModal.risk].lifestyle}</Sec>
          <Sec title="Home Teas to Make" bg="#FDFAF0" pre>{CL[rModal.risk].tea}</Sec>
          <Sec title="Key Takeaway" bg="#F0F4FA">{CL[rModal.risk].lay}</Sec>
          <div style={{background:C.navy,borderRadius:10,padding:16,textAlign:"center"}}>
            <div style={{color:C.gold,fontWeight:"bold",fontSize:14,marginBottom:4}}>Prepare before this period</div>
            <div style={{color:C.gray,fontSize:12,marginBottom:14,lineHeight:1.6}}>
              {uConds.length>0?"With your conditions, a personalised plan 2-4 weeks ahead is strongly recommended.":"A preventive session before high-risk periods helps your body adapt."}
            </div>
            <a href={BOOKING} target="_blank" rel="noopener noreferrer" style={{display:"block",padding:"12px 0",borderRadius:8,background:C.gold,color:C.white,fontWeight:"bold",fontSize:14,textDecoration:"none",marginBottom:8}}>Book with Sang Hee</a>
            <button onClick={()=>{setRModal(null);setTab("qa");setInp("What should I do to prepare for this period?");}} style={{width:"100%",padding:"9px 0",borderRadius:8,border:"1px solid "+C.gray,background:"transparent",color:C.gray,fontSize:12,cursor:"pointer"}}>Ask Q&A for advice</button>
          </div>
        </div>
      </div>
    </div>
  );

  const rBanners=upcoming.length>0&&(
    <div style={{marginBottom:12}}>
      {upcoming.map((s,i)=>(
        <div key={i} style={{background:s.risk==="雙火"?"#FFF0EE":s.risk==="雙土"?"#FFF5EC":"#FFFBE8",border:"1px solid "+(s.risk==="雙火"?C.red:s.risk==="雙土"?C.orange:C.darkGold),borderRadius:8,padding:"12px 14px",marginBottom:8,display:"flex",gap:10,alignItems:"flex-start"}}>
          <div style={{fontSize:22,flexShrink:0}}>{s.risk==="雙火"?"!":s.risk==="雙土"?"~":"?"}</div>
          <div style={{flex:1}}>
            <div style={{fontWeight:"bold",color:s.risk==="雙火"?C.red:s.risk==="雙土"?C.orange:C.darkGold,fontSize:12,marginBottom:2}}>{RS[s.risk].label} · {s.name} · {s.dateStr}</div>
            <div style={{color:"#555",fontSize:11,lineHeight:1.5,marginBottom:8}}>
              {s.daysUntil>0?"Starting in "+s.daysUntil+" day"+(s.daysUntil===1?"":"s")+" — ":"Currently active — "}
              {s.risk==="雙火"?"Extreme fire period. Cardiovascular risk elevated.":s.risk==="雙土"?"Damp-heat period. Digestive & immune vulnerability.":"Climate mismatch. Immune fluctuation risk."}
              {uConds.length>0&&" Relevant to your health profile."}
            </div>
            <button onClick={()=>setRModal(s)} style={{fontSize:11,padding:"5px 12px",borderRadius:6,border:"1px solid "+(s.risk==="雙火"?C.red:s.risk==="雙土"?C.orange:C.darkGold),background:C.white,cursor:"pointer",color:s.risk==="雙火"?C.red:s.risk==="雙土"?C.orange:C.darkGold,fontWeight:"bold",marginRight:6}}>Read More</button>
            <a href={BOOKING} target="_blank" rel="noopener noreferrer" style={{fontSize:11,padding:"5px 12px",borderRadius:6,background:C.navy,color:C.white,fontWeight:"bold",textDecoration:"none",display:"inline-block"}}>Book with Sang Hee</a>
          </div>
        </div>
      ))}
    </div>
  );

  const NAV=[{t:"features",l:"Home",ic:"Home"},{t:"analyzer",l:"Analyser",ic:"Chart",badge:"FREE"},{t:"qa",l:"Q&A",ic:"Chat"},{t:"subscribe",l:"Subscribe",ic:"Star"},{t:"account",l:"My Account",ic:"User"},{t:"book",l:"Book Now",ic:"Cal",ext:true}];

  const hdr=(
    <div style={{background:C.navy,borderRadius:10,padding:"12px 16px 0 16px",marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div>
          <div style={{color:C.gold,fontSize:10,letterSpacing:2}}>五運六氣 · WU YUN LIU QI</div>
          <div style={{color:C.white,fontSize:mob?16:20,fontWeight:"bold",margin:"2px 0"}}>Yun Qi Analyzer</div>
          <div style={{color:C.gray,fontSize:10}}>Sang Hee Park, PhD · sangheeparkacupuncture.com</div>
        </div>
        {user&&<div style={{background:isPaid?C.gold:C.blue,color:C.white,borderRadius:6,padding:"3px 9px",fontSize:10,fontWeight:"bold",marginTop:4}}>{isPaid?"Pro":"Free"}</div>}
      </div>
      <div style={{display:"flex",marginTop:10,borderTop:"1px solid rgba(255,255,255,0.1)",overflowX:"auto"}}>
        {NAV.map(({t,l,badge,ext})=>ext
          ?<a key={t} href={BOOKING} target="_blank" rel="noopener noreferrer" style={{flex:1,minWidth:mob?50:68,padding:mob?"8px 2px":"9px 4px",display:"flex",flexDirection:"column",alignItems:"center",gap:2,color:C.gold,fontSize:mob?9:11,fontWeight:"bold",textDecoration:"none",borderBottom:"2px solid "+C.gold}}>
            <span style={{fontSize:mob?14:13}}>📅</span><span style={{whiteSpace:"nowrap"}}>{l}</span>
          </a>
          :<button key={t} onClick={()=>setTab(t)} style={{flex:1,minWidth:mob?50:68,padding:mob?"8px 2px":"9px 4px",border:"none",cursor:"pointer",background:"transparent",color:tab===t?C.gold:C.gray,borderBottom:tab===t?"2px solid "+C.gold:"2px solid transparent",fontWeight:tab===t?"bold":"normal",fontSize:mob?9:11,display:"flex",flexDirection:"column",alignItems:"center",gap:2,position:"relative"}}>
            <span style={{fontSize:mob?14:13}}>{t==="features"?"🏠":t==="analyzer"?"📊":t==="qa"?"💬":t==="subscribe"?"💎":"👤"}</span>
            <span style={{whiteSpace:"nowrap"}}>{l}</span>
            {badge&&<span style={{position:"absolute",top:3,right:mob?0:4,background:C.green,color:C.white,fontSize:7,fontWeight:"bold",padding:"1px 4px",borderRadius:6}}>{badge}</span>}
          </button>
        )}
      </div>
    </div>
  );

  const homeTab=(
    <div>
      <div style={{background:"linear-gradient(135deg,"+C.navy+","+C.ink+")",borderRadius:10,padding:20,marginBottom:14,textAlign:"center"}}>
        <div style={{color:C.gold,fontSize:22,fontWeight:"bold",marginBottom:4}}>五運六氣 · Wu Yun Liu Qi</div>
        <div style={{color:C.white,fontSize:13,marginBottom:6}}>The World's First Southern Hemisphere Validated Wu Yun Liu Qi Clinical Tool</div>
        <div style={{color:C.gray,fontSize:11}}>Sang Hee Park, PhD · AHPRA Registered Acupuncturist · Liaoning University of TCM</div>
      </div>
      <div style={{background:C.white,borderRadius:10,padding:16,marginBottom:12,border:"1px solid #ddd"}}>
        <div style={{background:C.lightGray,borderRadius:6,padding:"4px 10px",fontWeight:"bold",fontSize:12,color:C.ink,display:"inline-block",marginBottom:12}}>FREE — No sign-in required</div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:8}}>
          {[{ic:"📊",t:"Yun Qi Analyser",d:"Da Yun, Si Tian, Zai Quan, Special classification, any year 1924-2103"},{ic:"🗓️",t:"10-Segment Calendar",d:"Full risk calendar, colour-coded, North and South hemisphere dates"},{ic:"🌏",t:"Hemisphere Toggle",d:"Auto date shift for Southern Hemisphere (Australia/NZ)"},{ic:"⚠️",t:"Risk Classification",d:"Extreme, High, OK per segment with clinical significance"},{ic:"🧮",t:"Special Year Lookup",d:"天符 · 歲會 · 太乙天符 · 同天符 · 同歲會"},{ic:"📱",t:"PWA",d:"Install on phone, works on any device"}].map((f,i)=>
            <div key={i} style={{background:"#FAFAF8",borderRadius:8,padding:12,border:"1px solid #eee"}}>
              <div style={{fontSize:20,marginBottom:4}}>{f.ic}</div>
              <div style={{fontWeight:"bold",color:C.ink,fontSize:12,marginBottom:3}}>{f.t}</div>
              <div style={{color:"#666",fontSize:11,lineHeight:1.5}}>{f.d}</div>
            </div>
          )}
        </div>
        <button onClick={()=>setTab("analyzer")} style={{width:"100%",marginTop:12,padding:"9px 0",borderRadius:6,border:"none",cursor:"pointer",background:C.blue,color:C.white,fontWeight:"bold",fontSize:12}}>Try Analyser Free</button>
      </div>
      <div style={{background:"linear-gradient(135deg,#1a2f50,"+C.navy+")",borderRadius:10,padding:16,marginBottom:12,border:"2px solid "+C.gold}}>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:12,flexWrap:"wrap",gap:6}}>
          <div style={{background:C.gold,borderRadius:6,padding:"4px 10px",fontWeight:"bold",fontSize:12,color:C.white}}>PRO SUBSCRIPTION</div>
          <div style={{color:C.gold,fontWeight:"bold",fontSize:13}}>$8/mo · $50/yr</div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:8,marginBottom:14}}>
          {[{ic:"💬",t:"Unlimited Q&A",d:"Ask anything — theory, calculations, clinical application"},{ic:"🌐",t:"All Languages",d:"Korean, English, Chinese, Japanese, Spanish, French and more"},{ic:"📚",t:"Dr Park's Materials",d:"Answers from Su Wen Ch.66-74, course modules and clinical handouts"},{ic:"⏰",t:"30-Day Risk Alerts",d:"Personalised alerts 30 days before high-risk segments"},{ic:"❤️",t:"Personalised Guidance",d:"Tailored to your date of birth, conditions and preferred language"},{ic:"🔄",t:"Auto-renewing",d:"Cancel anytime, new year profiles added automatically"}].map((f,i)=>
            <div key={i} style={{background:"rgba(255,255,255,0.07)",borderRadius:8,padding:12,border:"1px solid rgba(196,154,72,0.3)"}}>
              <div style={{fontSize:20,marginBottom:4}}>{f.ic}</div>
              <div style={{fontWeight:"bold",color:C.gold,fontSize:12,marginBottom:3}}>{f.t}</div>
              <div style={{color:C.gray,fontSize:11,lineHeight:1.5}}>{f.d}</div>
            </div>
          )}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
          <button onClick={()=>setTab("subscribe")} style={{padding:"10px 0",borderRadius:6,border:"none",cursor:"pointer",background:C.blue,color:C.white,fontWeight:"bold",fontSize:12}}>Monthly $8</button>
          <button onClick={()=>setTab("subscribe")} style={{padding:"10px 0",borderRadius:6,border:"1px solid "+C.gold,cursor:"pointer",background:C.gold,color:C.white,fontWeight:"bold",fontSize:12}}>Annual $50 — Best Value</button>
        </div>
      </div>
      <div style={{background:"linear-gradient(135deg,#1a3a1a,#2D5A3D)",borderRadius:10,padding:16,marginBottom:12,border:"1px solid #4A8C6A"}}>
        <div style={{color:"#A8D8A8",fontSize:11,letterSpacing:1,marginBottom:4}}>NOT JUST FOR PRACTITIONERS</div>
        <div style={{color:C.white,fontWeight:"bold",fontSize:15,marginBottom:6}}>For Everyone Who Wants to Live in Harmony with the Seasons</div>
        <div style={{color:"#c8e6c8",fontSize:12,lineHeight:1.7,marginBottom:12}}>You do not need to be a doctor to benefit. This 2,000-year-old system tells you when to rest, what to eat, and how to protect your health — based on the season's energy.</div>
        <button onClick={()=>setTab("subscribe")} style={{width:"100%",padding:"10px 0",borderRadius:6,border:"1px solid #4A8C6A",cursor:"pointer",background:"rgba(255,255,255,0.1)",color:C.white,fontWeight:"bold",fontSize:12}}>Start Your Seasonal Health Journey</button>
      </div>
      <div style={{background:C.white,borderRadius:10,overflow:"hidden",marginBottom:12,border:"1px solid #eee"}}>
        <div style={{background:C.navy,padding:"10px 14px",color:C.white,fontWeight:"bold",fontSize:12}}>Feature Comparison</div>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
          <thead><tr style={{background:C.lightGray}}>
            <th style={{padding:"8px 10px",textAlign:"left",color:C.ink}}>Feature</th>
            <th style={{padding:"8px 6px",textAlign:"center",color:C.ink}}>Free</th>
            <th style={{padding:"8px 6px",textAlign:"center",color:C.orange}}>Monthly $8/mo</th>
            <th style={{padding:"8px 6px",textAlign:"center",color:C.gold}}>Annual $50/yr</th>
          </tr></thead>
          <tbody>
            {[["Yun Qi Analyser (any year)","Y","Y","Y"],["10-Segment Calendar + Clinical Data","Y","Y","Y"],["N & S Hemisphere","Y","Y","Y"],["Unlimited Q&A (all languages)","—","Y","Y"],["Dr Park's Materials as Source","—","Y","Y"],["30-Day Advance Risk Alerts","—","Y","Y"],["Personalised Health Profile","—","Y","Y"],["New Year Profiles","—","Current year","All years"],["Price","Free","$8/month","$50/year (Save $46)"]].map(([f,fr,mo,an],i)=>(
              <tr key={i} style={{borderBottom:"1px solid #f0f0f0",background:i%2===0?"#FAFAFA":"#FFF"}}>
                <td style={{padding:"7px 10px",color:"#333"}}>{f}</td>
                <td style={{padding:"7px 6px",textAlign:"center",color:fr==="Y"?C.green:fr==="—"?"#ccc":C.ink,fontWeight:"bold"}}>{fr==="Y"?"✅":fr}</td>
                <td style={{padding:"7px 6px",textAlign:"center",color:mo==="Y"?C.orange:mo==="—"?"#ccc":C.orange,fontWeight:"bold"}}>{mo==="Y"?"✅":mo}</td>
                <td style={{padding:"7px 6px",textAlign:"center",color:an==="Y"?C.gold:an==="—"?"#ccc":C.gold,fontWeight:"bold"}}>{an==="Y"?"✅":an}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{fontSize:10,color:"#999",textAlign:"center",paddingBottom:16}}>Educational purposes only · Blossom Skin & Health Pty Ltd</div>
    </div>
  );

  const analyserTab=(
    <div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",alignItems:"center",marginBottom:12}}>
        <input type="number" value={yr} onChange={e=>setYr(+e.target.value)} style={{width:80,padding:"6px 8px",borderRadius:6,border:"2px solid "+C.gold,background:C.blue,color:C.white,fontSize:15,fontWeight:"bold",textAlign:"center"}}/>
        {["N","S"].map(h=><button key={h} onClick={()=>setHemi(h)} style={{padding:"6px 12px",borderRadius:6,border:"none",cursor:"pointer",fontWeight:"bold",fontSize:12,background:hemi===h?C.gold:C.blue,color:C.white}}>{h==="N"?"Northern":"Southern"}</button>)}
        <button onClick={()=>setData(calcYear(yr))} style={{padding:"6px 14px",borderRadius:6,border:"none",cursor:"pointer",fontWeight:"bold",fontSize:12,background:C.red,color:C.white}}>Analyze</button>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(108px,1fr))",gap:8,marginBottom:12}}>
        {[{l:"Year",v:yr+" "+data.jz,bg:"#E8EEF8",tc:C.ink},{l:"Da Yun",v:data.dyName,e:data.dyEl},{l:"Si Tian",v:data.si,e:data.siEl},{l:"Zai Quan",v:data.zai,e:SQE[data.zai]},
          {l:"Yun Qi Rel",v:data.yqr,bg:(data.yqr.includes("不和")||data.yqr.includes("天刑"))?"#FFF0EE":"#F0FBF5",tc:(data.yqr.includes("不和")||data.yqr.includes("天刑"))?C.red:C.green},
          {l:"Special Year",v:data.special,bg:data.special==="\u592a\u4e59\u5929\u7b26"?"#FFF0EE":data.special==="\u5929\u7b26"?"#FFF5EC":data.special==="\u6b72\u6703"?"#F0FBF5":"#F5F5F5",tc:data.special.includes("\u592a\u4e59")?C.red:data.special.includes("\u5929\u7b26")?C.orange:data.special==="\u6b72\u6703"?C.green:C.navy}
        ].map((item,i)=>{const col=item.e?ec(item.e):{bg:item.bg,border:"#ddd",text:item.tc};return(
          <div key={i} style={{borderRadius:8,padding:"9px 11px",background:col.bg,border:"1px solid "+col.border}}>
            <div style={{fontSize:9,color:"#888",marginBottom:2}}>{item.l}</div>
            <div style={{fontWeight:"bold",fontSize:11,color:col.text}}>{item.v}</div>
          </div>
        );})}
      </div>
      <div style={{background:C.white,borderRadius:8,overflow:"hidden",marginBottom:4,boxShadow:"0 1px 4px rgba(0,0,0,.08)"}}>
        <div style={{padding:"9px 14px",background:C.navy,color:C.white,fontWeight:"bold",fontSize:13}}>Ten Segments (十節段) · {hemi==="S"?"Southern":"Northern"} Hemisphere</div>
        <div style={{background:"#FFFBE8",borderLeft:"4px solid "+C.darkGold,padding:"10px 14px",fontSize:11,color:"#5A4A00",lineHeight:1.6}}>
          Acupuncture Points and Herbal Formulas shown below are general climate-based seasonal recommendations from Su Wen Ch.66-74. They are NOT personalised to any individual's constitution or health conditions. If you have existing health conditions, please consult a qualified TCM practitioner for a diagnosis-based treatment plan.
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:10,minWidth:800}}>
            <thead><tr style={{background:C.lightGray}}>
              {["Segment","Date","Zhu Yun","Ke Yun","Zhu Qi","Ke Qi","Risk","Climate","Disease","Acu Points","Herbs"].map(h=>
                <th key={h} style={{padding:"5px 7px",textAlign:"left",color:C.ink,borderBottom:"1px solid #ddd",whiteSpace:"nowrap",fontSize:10}}>{h}</th>
              )}
            </tr></thead>
            <tbody>
              {data.segs.map((s,i)=>{
                const ri=RS[s.risk]||RS["順"];
                const dates=hemi==="N"?DN:DS;
                const cl=CL[s.risk]||CL["順"];
                const zYC=ec(s.zYun),kYC=ec(s.kYun),zQC=ec(s.zQiEl),kQC=ec(s.kQiEl);
                return(
                  <tr key={i} style={{background:i%2===0?"#FAFAFA":"#FFF",borderLeft:"3px solid "+ri.border,verticalAlign:"top"}}>
                    <td style={{padding:"6px 7px",fontWeight:"bold",color:C.navy,whiteSpace:"nowrap"}}>{SL[i]}</td>
                    <td style={{padding:"6px 7px",color:"#555",whiteSpace:"nowrap"}}>{dates[i]}</td>
                    <td style={{padding:"6px 7px"}}><span style={{background:zYC.bg,color:zYC.text,border:"1px solid "+zYC.border,borderRadius:4,padding:"1px 5px",fontWeight:"bold"}}>{s.zYun}</span></td>
                    <td style={{padding:"6px 7px"}}><span style={{background:kYC.bg,color:kYC.text,border:"1px solid "+kYC.border,borderRadius:4,padding:"1px 5px",fontWeight:"bold"}}>{s.kYun}</span></td>
                    <td style={{padding:"6px 7px",color:zQC.text,whiteSpace:"nowrap",fontSize:9}}>{s.zQi}</td>
                    <td style={{padding:"6px 7px",color:kQC.text,whiteSpace:"nowrap",fontSize:9}}>{s.kQiName}</td>
                    <td style={{padding:"6px 7px"}}><span style={{background:ri.bg,color:ri.color,border:"1px solid "+ri.border,borderRadius:4,padding:"2px 6px",fontWeight:"bold",fontSize:9,whiteSpace:"nowrap",display:"block"}}>{ri.label}</span></td>
                    <td style={{padding:"6px 7px",fontSize:9,color:"#444",lineHeight:1.5,minWidth:100}}>{cl.w}</td>
                    <td style={{padding:"6px 7px",fontSize:9,color:"#444",lineHeight:1.5,minWidth:120}}>{cl.d}</td>
                    <td style={{padding:"6px 7px",fontSize:9,color:C.ink,lineHeight:1.6,minWidth:110}}>{cl.a}</td>
                    <td style={{padding:"6px 7px",fontSize:9,color:"#2D5A3D",lineHeight:1.5,minWidth:110}}>{cl.h}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div style={{fontSize:9,color:"#999",textAlign:"center",padding:"8px 0 16px"}}>Educational purposes only · sangheeparkacupuncture.com</div>
    </div>
  );

  const subTab=(
    <div>
      <div style={{background:"linear-gradient(135deg,"+C.navy+","+C.ink+")",borderRadius:10,padding:16,marginBottom:14,textAlign:"center",border:"2px solid "+C.gold}}>
        <div style={{color:C.gold,fontSize:18,fontWeight:"bold"}}>Upgrade to Pro</div>
        <div style={{color:C.white,fontSize:12,marginTop:4}}>Unlimited Q&A · 30-Day Risk Alerts · Personalised Health Guidance</div>
        <div style={{color:C.gray,fontSize:11,marginTop:3}}>Based on Dr Sang Hee Park's Su Wen translations and course materials</div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
        <div style={{background:C.white,borderRadius:10,padding:16,border:"2px solid "+C.blue}}>
          <div style={{color:C.ink,fontWeight:"bold",fontSize:13}}>Monthly</div>
          <div style={{color:C.red,fontSize:30,fontWeight:"bold",margin:"6px 0"}}>$8</div>
          <div style={{color:C.gray,fontSize:11,marginBottom:10}}>/month</div>
          <div style={{background:C.lightGray,borderRadius:6,padding:"8px 10px",fontSize:11,color:C.ink,lineHeight:1.8,marginBottom:10}}>
            Unlimited Q&A<br/>All languages<br/>30-day risk alerts<br/>Personal health profile<br/>Current year profile<br/>Cancel anytime
          </div>
          <div style={{fontSize:10,color:"#aaa",marginBottom:10}}>New year profiles: current year only</div>
          <button onClick={()=>handleSub("monthly")} style={{width:"100%",padding:"9px 0",borderRadius:6,border:"none",cursor:"pointer",background:C.blue,color:C.white,fontWeight:"bold",fontSize:12}}>Start Monthly</button>
        </div>
        <div style={{background:C.navy,borderRadius:10,padding:16,border:"2px solid "+C.gold,position:"relative"}}>
          <div style={{position:"absolute",top:-10,right:10,background:C.gold,color:C.white,fontSize:9,fontWeight:"bold",padding:"3px 8px",borderRadius:10}}>BEST VALUE</div>
          <div style={{color:C.gold,fontWeight:"bold",fontSize:13}}>Annual</div>
          <div style={{color:C.white,fontSize:30,fontWeight:"bold",margin:"6px 0"}}>$50</div>
          <div style={{color:C.gray,fontSize:11,marginBottom:6}}>/year — Save $46</div>
          <div style={{background:"rgba(196,154,72,0.15)",borderRadius:6,padding:"8px 10px",border:"1px solid rgba(196,154,72,0.3)",fontSize:11,color:C.gray,lineHeight:1.8,marginBottom:6}}>
            Everything in Monthly<br/>ALL future year profiles<br/>12 months full access<br/>Priority knowledge updates
          </div>
          <div style={{fontSize:10,color:C.gold,marginBottom:10,fontWeight:"bold"}}>approx $4.17/month</div>
          <button onClick={()=>handleSub("annual")} style={{width:"100%",padding:"9px 0",borderRadius:6,border:"1px solid "+C.gold,cursor:"pointer",background:C.gold,color:C.white,fontWeight:"bold",fontSize:12}}>Start Annual</button>
        </div>
      </div>
      {!user&&(
        <div style={{background:C.white,borderRadius:8,padding:14,border:"1px solid #ddd"}}>
          <div style={{fontWeight:"bold",color:C.ink,marginBottom:10,fontSize:12}}>Create Account to Subscribe</div>
          <input placeholder="Full name *" value={nm} onChange={e=>setNm(e.target.value)} style={iS}/>
          <input placeholder="Email *" value={email} onChange={e=>setEmail(e.target.value)} style={iS}/>
          <input placeholder="Password *" type="password" value={pw} onChange={e=>setPw(e.target.value)} style={iS}/>
          {authErr&&<div style={{color:C.red,fontSize:11,marginBottom:8}}>{authErr}</div>}
          <button onClick={()=>{setAuthMode("register");handleAuth();}} style={{width:"100%",padding:"8px 0",borderRadius:6,border:"none",cursor:"pointer",background:C.gold,color:C.white,fontWeight:"bold",fontSize:12}}>Create Account and Subscribe</button>
        </div>
      )}
      <div style={{fontSize:9,color:"#999",textAlign:"center",marginTop:8,paddingBottom:16}}>Stripe integration coming · Educational only · Blossom Skin & Health Pty Ltd</div>
    </div>
  );

  const langEx=[{f:"KR",l:"Korean",q:"\uc624\ub298 \uc2dc\uc4f0\uae30\uc5d0 \ub300\ud574 \uc124\uba85\ud574\uc918"},{f:"EN",l:"English",q:"What should I eat this season?"},{f:"CN",l:"Chinese",q:"\u5929\u7b26\u5e74\u7684\u4e34\u5e8a\u610f\u4e49\u662f\u4ec0\u4e48\uff1f"},{f:"JP",l:"Japanese",q:"\u4eca\u306e\u5b63\u7bc0\u306b\u4f55\u3092\u98df\u3079\u308c\u3070\u3044\u3044\u3067\u3059\u304b\uff1f"},{f:"ES",l:"Spanish",q:"\xbfQu\xe9 debo comer esta temporada?"},{f:"FR",l:"French",q:"Comment me pr\xe9parer pour la p\xe9riode \xe0 risque?"}];

  const qaTab=(
    <div style={{display:"flex",flexDirection:"column",height:"calc(100vh - 220px)",minHeight:380}}>
      {!user?(
        <div style={{background:C.white,borderRadius:8,padding:24,textAlign:"center"}}>
          <div style={{fontSize:40,marginBottom:8}}>🔒</div>
          <div style={{fontWeight:"bold",color:C.ink,marginBottom:4}}>Sign in required</div>
          <div style={{color:C.gray,fontSize:12,marginBottom:12}}>Create a free account, then subscribe for Q&A access</div>
          <button onClick={()=>setTab("account")} style={{padding:"8px 20px",borderRadius:6,border:"none",cursor:"pointer",background:C.blue,color:C.white,fontWeight:"bold",marginRight:8}}>Sign In</button>
          <button onClick={()=>setTab("subscribe")} style={{padding:"8px 20px",borderRadius:6,border:"none",cursor:"pointer",background:C.gold,color:C.white,fontWeight:"bold"}}>Subscribe</button>
        </div>
      ):!isPaid?(
        <div style={{background:C.white,borderRadius:8,padding:24,textAlign:"center"}}>
          <div style={{fontSize:40,marginBottom:8}}>💎</div>
          <div style={{fontWeight:"bold",color:C.ink,marginBottom:4}}>Pro subscription required</div>
          <div style={{color:C.gray,fontSize:12,marginBottom:12}}>$8/mo · $50/yr — Unlimited Q&A + 30-day risk alerts</div>
          <button onClick={()=>setTab("subscribe")} style={{padding:"8px 24px",borderRadius:6,border:"none",cursor:"pointer",background:C.gold,color:C.white,fontWeight:"bold"}}>Subscribe Now</button>
        </div>
      ):(
        <>
          <div style={{background:C.navy,borderRadius:"8px 8px 0 0",padding:"8px 14px",display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:4}}>
            <div style={{color:C.gold,fontWeight:"bold",fontSize:12}}>Wu Yun Liu Qi Q&A</div>
            <div style={{color:C.gray,fontSize:10}}>All Languages · Dr Park's Materials</div>
          </div>
          <div style={{background:"#F8F6F2",padding:"6px 10px",display:"flex",gap:5,flexWrap:"wrap",borderBottom:"1px solid #eee"}}>
            {langEx.map((l,i)=><button key={i} onClick={()=>setInp(l.q)} style={{fontSize:10,padding:"2px 8px",borderRadius:10,border:"1px solid #ddd",background:C.white,cursor:"pointer",color:C.ink}}>{l.f} {l.l}</button>)}
          </div>
          <div ref={chatRef} style={{flex:1,overflowY:"auto",padding:12,background:"#FAFAF8",display:"flex",flexDirection:"column",gap:10}}>
            {msgs.map((m,i)=>(
              <div key={i} style={{display:"flex",justifyContent:m.role==="user"?"flex-end":"flex-start"}}>
                <div style={{maxWidth:"85%",padding:"10px 13px",borderRadius:m.role==="user"?"12px 12px 2px 12px":"12px 12px 12px 2px",background:m.role==="user"?C.blue:C.white,color:m.role==="user"?C.white:"#222",fontSize:12,lineHeight:1.6,boxShadow:"0 1px 3px rgba(0,0,0,.08)",whiteSpace:"pre-wrap"}}>{m.content}</div>
              </div>
            ))}
            {loading&&<div style={{display:"flex",justifyContent:"flex-start"}}><div style={{background:C.white,borderRadius:"12px 12px 12px 2px",padding:"10px 14px",boxShadow:"0 1px 3px rgba(0,0,0,.08)"}}><span style={{color:C.gray,fontSize:12}}>Searching knowledge base...</span></div></div>}
          </div>
          <div style={{padding:10,background:C.white,borderTop:"1px solid #eee",borderRadius:"0 0 8px 8px",display:"flex",gap:8}}>
            <input value={inp} onChange={e=>setInp(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&sendMsg()} placeholder="Ask in any language..." style={{flex:1,padding:"8px 10px",borderRadius:6,border:"1px solid #ddd",fontSize:12,outline:"none"}}/>
            <button onClick={sendMsg} disabled={loading} style={{padding:"8px 14px",borderRadius:6,border:"none",cursor:"pointer",background:loading?C.gray:C.gold,color:C.white,fontWeight:"bold",fontSize:13}}>Send</button>
          </div>
        </>
      )}
    </div>
  );

  const aMsg=acctMsg.t&&<div style={{padding:"8px 12px",borderRadius:6,marginBottom:8,fontSize:11,background:acctMsg.ok?"#F0FBF5":"#FFF0EE",color:acctMsg.ok?C.green:C.red,border:"1px solid "+(acctMsg.ok?C.green:C.red)}}>{acctMsg.t}</div>;

  const acctTab=(
    <div style={{paddingBottom:24}}>
      {!user?(
        <div style={{background:C.white,borderRadius:8,padding:16}}>
          {acctSec==="forgot"?(
            <div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                <button onClick={()=>{setAcctSec("main");setFgSent(false);setFgEmail("");}} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:C.gray}}>←</button>
                <div style={{fontWeight:"bold",color:C.ink,fontSize:13}}>Reset Password</div>
              </div>
              {fgSent?(
                <div style={{textAlign:"center",padding:"16px 8px"}}>
                  <div style={{fontSize:40,marginBottom:10}}>📧</div>
                  <div style={{fontWeight:"bold",color:C.ink,fontSize:13,marginBottom:6}}>Check your inbox</div>
                  <div style={{color:C.gray,fontSize:12,lineHeight:1.6,marginBottom:4}}>A reset link has been sent to:</div>
                  <div style={{color:C.ink,fontWeight:"bold",fontSize:12,marginBottom:12}}>{fgEmail}</div>
                  <div style={{color:C.gray,fontSize:11,marginBottom:16}}>Link expires in 15 minutes. Check spam folder.</div>
                  <button onClick={()=>{setAcctSec("main");setFgSent(false);setFgEmail("");}} style={{padding:"8px 24px",borderRadius:6,border:"none",cursor:"pointer",background:C.blue,color:C.white,fontWeight:"bold",fontSize:12}}>Back to Sign In</button>
                </div>
              ):(
                <div>
                  <div style={{color:C.gray,fontSize:12,marginBottom:14,lineHeight:1.6}}>Enter your email and we will send a password reset link.</div>
                  <input placeholder="your@email.com" value={fgEmail} onChange={e=>setFgEmail(e.target.value)} style={iS}/>
                  <button onClick={async()=>{if(fgEmail.trim()){try{await sbForgot(fgEmail);}catch(e){}setFgSent(true);}}} style={{width:"100%",padding:"9px 0",borderRadius:6,border:"none",cursor:"pointer",background:C.gold,color:C.white,fontWeight:"bold",fontSize:12,marginBottom:8}}>Send Reset Link</button>
                  <div style={{fontSize:10,color:"#aaa",textAlign:"center"}}>Email sending powered by Supabase Auth.</div>
                </div>
              )}
            </div>
          ):(
            <div>
              <div style={{fontWeight:"bold",color:C.ink,marginBottom:12,fontSize:13}}>{authMode==="register"?"Create Account":"Sign In"}</div>
              {authMode==="register"&&<div>
                <div style={{fontSize:11,color:C.gray,marginBottom:3}}>Full Name *</div>
                <input placeholder="Your name" value={nm} onChange={e=>setNm(e.target.value)} style={iS}/>
                <div style={{fontSize:11,color:C.gray,marginBottom:3}}>Date of Birth</div>
                <input type="date" value={dob} onChange={e=>setDob(e.target.value)} style={iS}/>
                <div style={{fontSize:11,color:C.gray,marginBottom:3}}>Preferred Language</div>
                <select value={lang} onChange={e=>setLang(e.target.value)} style={{...iS,cursor:"pointer"}}>{LANGS.map(l=><option key={l.v} value={l.v}>{l.l}</option>)}</select>
                <div style={{fontSize:11,color:C.gray,marginBottom:6}}>Health Conditions (optional)</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginBottom:10,maxHeight:200,overflowY:"auto",padding:4,border:"1px solid #eee",borderRadius:6}}>
                  {HC.map(c=><div key={c} onClick={()=>tog(c,conds,setConds)} style={{border:"1.5px solid "+(conds.includes(c)?C.gold:"#eee"),borderRadius:5,padding:"6px 8px",cursor:"pointer",background:conds.includes(c)?C.goldLight:"#FAFAFA",fontSize:10,color:conds.includes(c)?C.ink:C.gray,display:"flex",alignItems:"center",gap:4}}>
                    <span style={{color:conds.includes(c)?C.gold:"#ddd",fontSize:12,flexShrink:0}}>✓</span>{c}
                  </div>)}
                </div>
              </div>}
              <div style={{fontSize:11,color:C.gray,marginBottom:3}}>Email *</div>
              <input placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)} style={iS}/>
              <div style={{fontSize:11,color:C.gray,marginBottom:3}}>Password *</div>
              <input placeholder="Password" type="password" value={pw} onChange={e=>setPw(e.target.value)} style={iS}/>
              {authErr&&<div style={{color:C.red,fontSize:11,marginBottom:8}}>{authErr}</div>}
              <button onClick={handleAuth} style={{width:"100%",padding:"9px 0",borderRadius:6,border:"none",cursor:"pointer",background:C.gold,color:C.white,fontWeight:"bold",fontSize:12,marginBottom:10}}>
                {authMode==="register"?"Create Account":"Sign In"}
              </button>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{fontSize:11,color:C.gray,cursor:"pointer"}} onClick={()=>setAuthMode(authMode==="register"?"login":"register")}>
                  {authMode==="register"?"Already have an account? Sign in":"No account? Register free"}
                </div>
                {authMode==="login"&&<div style={{fontSize:11,color:C.blue,cursor:"pointer",textDecoration:"underline"}} onClick={()=>{setAcctSec("forgot");setFgEmail(email);}}>Forgot password?</div>}
              </div>
            </div>
          )}
        </div>
      ):acctSec==="editProfile"?(
        <div style={{background:C.white,borderRadius:8,padding:16}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
            <button onClick={()=>{setAcctSec("main");setAcctMsg({t:"",ok:true});}} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:C.gray}}>←</button>
            <div style={{fontWeight:"bold",color:C.ink,fontSize:13}}>Edit Profile</div>
          </div>
          {aMsg}
          <div style={{fontSize:11,color:C.gray,marginBottom:3}}>Name</div>
          <input value={editNm} onChange={e=>setEditNm(e.target.value)} style={iS}/>
          <div style={{fontSize:11,color:C.gray,marginBottom:3}}>Email</div>
          <input value={editEm} onChange={e=>setEditEm(e.target.value)} style={iS}/>
          <button onClick={saveProfile} style={{width:"100%",padding:"9px 0",borderRadius:6,border:"none",cursor:"pointer",background:C.gold,color:C.white,fontWeight:"bold",fontSize:12}}>Save Changes</button>
        </div>
      ):acctSec==="editPw"?(
        <div style={{background:C.white,borderRadius:8,padding:16}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
            <button onClick={()=>{setAcctSec("main");setAcctMsg({t:"",ok:true});setNPw("");setNPw2("");}} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,color:C.gray}}>←</button>
            <div style={{fontWeight:"bold",color:C.ink,fontSize:13}}>Change Password</div>
          </div>
          {aMsg}
          <div style={{fontSize:11,color:C.gray,marginBottom:3}}>New Password (min 6 characters)</div>
          <input type="password" value={nPw} onChange={e=>setNPw(e.target.value)} style={iS}/>
          <div style={{fontSize:11,color:C.gray,marginBottom:3}}>Confirm New Password</div>
          <input type="password" value={nPw2} onChange={e=>setNPw2(e.target.value)} style={iS}/>
          <button onClick={savePw} style={{width:"100%",padding:"9px 0",borderRadius:6,border:"none",cursor:"pointer",background:C.gold,color:C.white,fontWeight:"bold",fontSize:12}}>Update Password</button>
        </div>
      ):acctSec==="cancelConfirm"?(
        <div style={{background:C.white,borderRadius:8,padding:20,textAlign:"center"}}>
          <div style={{fontSize:36,marginBottom:8}}>⚠️</div>
          <div style={{fontWeight:"bold",color:C.ink,fontSize:13,marginBottom:6}}>Cancel Subscription?</div>
          <div style={{color:C.gray,fontSize:12,marginBottom:16,lineHeight:1.6}}>Q&A access and risk alerts will be removed. You can re-subscribe at any time.</div>
          <button onClick={cancelSub} style={{width:"100%",padding:"9px 0",borderRadius:6,border:"none",cursor:"pointer",background:C.red,color:C.white,fontWeight:"bold",fontSize:12,marginBottom:8}}>Yes, Cancel</button>
          <button onClick={()=>setAcctSec("main")} style={{width:"100%",padding:"9px 0",borderRadius:6,border:"1px solid #ddd",cursor:"pointer",background:C.white,color:C.gray,fontSize:12}}>Keep Subscription</button>
        </div>
      ):(
        <div>
          <div style={{background:C.white,borderRadius:8,padding:14,marginBottom:10,boxShadow:"0 1px 4px rgba(0,0,0,.06)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:42,height:42,borderRadius:"50%",background:C.blue,display:"flex",alignItems:"center",justifyContent:"center",color:C.white,fontWeight:"bold",fontSize:16}}>{(user.name&&user.name[0].toUpperCase())||"U"}</div>
                <div>
                  <div style={{fontWeight:"bold",color:C.ink,fontSize:13}}>{user.name}</div>
                  <div style={{color:C.gray,fontSize:11}}>{user.email}</div>
                  {user.dob&&<div style={{color:C.gray,fontSize:10}}>DOB: {user.dob}</div>}
                  {user.pref_lang&&<div style={{color:C.gray,fontSize:10}}>Language: {(LANGS.find(l=>l.v===user.pref_lang)||{}).l}</div>}
                </div>
              </div>
              <div style={{background:isPaid?C.gold:C.blue,color:C.white,borderRadius:6,padding:"3px 9px",fontSize:10,fontWeight:"bold"}}>{isPaid?"Pro "+(uPT==="annual"?"Annual":"Monthly"):"Free"}</div>
            </div>
            {uConds.length>0&&<div style={{fontSize:11,color:C.gray,marginBottom:8,background:C.lightGray,borderRadius:6,padding:"6px 10px"}}>
              <span style={{fontWeight:"bold",color:C.ink}}>Health conditions: </span>{uConds.join(", ")}
              <span style={{color:C.blue,cursor:"pointer",marginLeft:6}} onClick={()=>setObStep(1)}>(update)</span>
            </div>}
            <button onClick={()=>{setEditNm(user.name||"");setEditEm(user.email||"");setAcctSec("editProfile");}} style={{width:"100%",padding:"7px 0",borderRadius:6,border:"1px solid #ddd",cursor:"pointer",background:"#FAFAFA",color:C.ink,fontSize:12,marginBottom:6}}>Edit Profile</button>
            <button onClick={()=>setAcctSec("editPw")} style={{width:"100%",padding:"7px 0",borderRadius:6,border:"1px solid #ddd",cursor:"pointer",background:"#FAFAFA",color:C.ink,fontSize:12}}>Change Password</button>
          </div>
          <div style={{background:C.white,borderRadius:8,padding:14,marginBottom:10,boxShadow:"0 1px 4px rgba(0,0,0,.06)"}}>
            <div style={{fontWeight:"bold",color:C.ink,fontSize:12,marginBottom:8}}>Subscription</div>
            {isPaid?(
              <div>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:12,color:"#444"}}>Plan</span><span style={{fontWeight:"bold",color:C.gold,fontSize:12}}>{uPT==="annual"?"Annual — $50/yr":"Monthly — $8/mo"}</span></div>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:10}}><span style={{fontSize:12,color:"#444"}}>Status</span><span style={{fontSize:12,color:C.green,fontWeight:"bold"}}>Active</span></div>
                <button onClick={()=>setTab("qa")} style={{width:"100%",padding:"8px 0",borderRadius:6,border:"none",cursor:"pointer",background:C.gold,color:C.white,fontWeight:"bold",fontSize:12,marginBottom:6}}>Go to Q&A</button>
                <button onClick={()=>setAcctSec("cancelConfirm")} style={{width:"100%",padding:"7px 0",borderRadius:6,border:"1px solid #ddd",cursor:"pointer",background:C.white,color:"#999",fontSize:11}}>Cancel Subscription</button>
              </div>
            ):(
              <div>
                <div style={{fontSize:12,color:C.gray,marginBottom:10}}>Free plan. Upgrade for Q&A and 30-day risk alerts.</div>
                <button onClick={()=>setTab("subscribe")} style={{width:"100%",padding:"8px 0",borderRadius:6,border:"none",cursor:"pointer",background:C.gold,color:C.white,fontWeight:"bold",fontSize:12}}>Upgrade to Pro</button>
              </div>
            )}
          </div>
          <button onClick={async()=>{await sbSignOut();setUser(null);setAcctSec("main");}} style={{width:"100%",padding:"8px 0",borderRadius:6,border:"1px solid #ddd",cursor:"pointer",background:C.white,color:C.gray,fontSize:12}}>Sign Out</button>
        </div>
      )}
    </div>
  );

  return(
    <div style={{maxWidth:720,margin:"0 auto",padding:mob?"0":"12px",fontFamily:"'Apple SD Gothic Neo','Segoe UI',sans-serif",background:C.bgPage,minHeight:"100vh"}}>
      {obModal}{riskModal}{hdr}
      <div style={{padding:mob?"0 8px 8px":"0"}}>
        {rBanners}
        {tab==="features"&&homeTab}
        {tab==="analyzer"&&analyserTab}
        {tab==="subscribe"&&subTab}
        {tab==="qa"&&qaTab}
        {tab==="account"&&acctTab}
      </div>
    </div>
  );
}

ReactDOM.render(<App/>,document.getElementById("root"));
if("serviceWorker"in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("/sw.js").catch(()=>{}));

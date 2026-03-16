"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

const API = "https://hse-risk-analyzer-production.up.railway.app";

const MATRIZ_RAM: Record<number, Record<string, string>> = {
  5: { A: "M",  B: "M",  C: "H",  D: "H",  E: "VH" },
  4: { A: "L",  B: "M",  C: "M",  D: "H",  E: "H"  },
  3: { A: "N",  B: "L",  C: "M",  D: "M",  E: "H"  },
  2: { A: "N",  B: "N",  C: "L",  D: "M",  E: "M"  },
  1: { A: "N",  B: "N",  C: "N",  D: "L",  E: "L"  },
  0: { A: "N",  B: "N",  C: "N",  D: "N",  E: "N"  },
};
const PROB_ORDEN = ["A","B","C","D","E"];
const RIESGO_COLOR: Record<string,{bg:string;color:string;label:string}> = {
  N:  {bg:"#E8F5E9",color:"#2E7D32",label:"Negligible"},
  L:  {bg:"#E3F2FD",color:"#1565C0",label:"Low"},
  M:  {bg:"#FFF9C4",color:"#F57F17",label:"Medium"},
  H:  {bg:"#FFE0B2",color:"#E65100",label:"High"},
  VH: {bg:"#FFCDD2",color:"#C62828",label:"Very High"},
};

function calcularRiesgo(g:number,p:string){return MATRIZ_RAM[g]?.[p]??"N";}
function bajarProbabilidad(p:string){const i=PROB_ORDEN.indexOf(p);return PROB_ORDEN[Math.max(0,i-1)];}

interface RiesgoItem{Fuente:string;Detalle:string;Peligro:string;Consecuencia:string;Controles:string;Responsable:string;}
interface ARResponse{message:string;registro_id:string;titulo_actividad:string;creditos_usados:number;creditos_restantes:number;fecha:string;riesgo_inherente:string;riesgo_residual:string;analisis:RiesgoItem[];excel_base64:string;}

function getToken(){return typeof window!=="undefined"?localStorage.getItem("generar_token"):null;}
function today(){return new Date().toISOString().split("T")[0];}
function addDays(d:string,n:number){const dt=new Date(d);dt.setDate(dt.getDate()+n);return dt.toISOString().split("T")[0];}
function daysBetween(a:string,b:string){return Math.round((new Date(b).getTime()-new Date(a).getTime())/86400000);}
async function fileToBase64(file:File):Promise<string>{return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res((r.result as string).split(",")[1]);r.onerror=()=>rej(new Error("Error"));r.readAsDataURL(file);});}

function SectionCard({title,icon,children}:{title:string;icon:string;children:React.ReactNode}){
  return(
    <div style={{background:"#fff",borderRadius:16,border:"1.5px solid rgba(27,58,92,0.08)",boxShadow:"0 2px 16px rgba(27,58,92,0.05)",overflow:"hidden",marginBottom:20}}>
      <div style={{display:"flex",alignItems:"center",gap:10,padding:"16px 28px",borderBottom:"1px solid rgba(27,58,92,0.07)",background:"linear-gradient(135deg,rgba(27,58,92,0.03),rgba(46,134,171,0.04))"}}>
        <span style={{fontSize:18}}>{icon}</span>
        <h2 style={{fontFamily:"'DM Serif Display', serif",fontSize:17,fontWeight:400,color:"#1B3A5C"}}>{title}</h2>
      </div>
      <div style={{padding:"22px 28px"}}>{children}</div>
    </div>
  );
}

function Field({label,required,error,hint,children}:{label:string;required?:boolean;error?:string;hint?:string;children:React.ReactNode}){
  return(
    <div style={{marginBottom:16}}>
      <label style={{display:"block",fontFamily:"'Plus Jakarta Sans', sans-serif",fontSize:11,fontWeight:700,color:error?"#C62828":"#1B3A5C",letterSpacing:"0.07em",textTransform:"uppercase" as const,marginBottom:5}}>
        {label}{required&&<span style={{color:"#2E86AB",marginLeft:3}}>*</span>}
      </label>
      {children}
      {hint&&<p style={{fontFamily:"'Plus Jakarta Sans', sans-serif",fontSize:11,color:"#7A8EA0",marginTop:4}}>{hint}</p>}
      {error&&<p style={{fontFamily:"'Plus Jakarta Sans', sans-serif",fontSize:11,color:"#C62828",marginTop:4}}>⚠ {error}</p>}
    </div>
  );
}

function TI({value,onChange,type="text",placeholder,error,disabled}:{value:string;onChange:(v:string)=>void;type?:string;placeholder?:string;error?:boolean;disabled?:boolean}){
  const[f,setF]=useState(false);
  return(
    <input type={type} value={value} placeholder={placeholder} disabled={disabled}
      onChange={e=>onChange(e.target.value)} onFocus={()=>setF(true)} onBlur={()=>setF(false)}
      style={{width:"100%",padding:"10px 12px",borderRadius:9,outline:"none",
        border:error?"1.5px solid #C62828":f?"1.5px solid #2E86AB":"1.5px solid rgba(27,58,92,0.15)",
        fontFamily:"'Plus Jakarta Sans', sans-serif",fontSize:14,color:"#1B3A5C",
        background:disabled?"rgba(27,58,92,0.03)":f?"#fff":"rgba(245,248,251,0.8)",
        boxShadow:f?"0 0 0 3px rgba(46,134,171,0.10)":"none",
        transition:"all 0.18s ease",boxSizing:"border-box" as const}}/>
  );
}

function SI({value,onChange,options}:{value:string;onChange:(v:string)=>void;options:{value:string;label:string}[]}){
  const[f,setF]=useState(false);
  return(
    <select value={value} onChange={e=>onChange(e.target.value)} onFocus={()=>setF(true)} onBlur={()=>setF(false)}
      style={{width:"100%",padding:"10px 32px 10px 12px",borderRadius:9,outline:"none",
        border:f?"1.5px solid #2E86AB":"1.5px solid rgba(27,58,92,0.15)",
        fontFamily:"'Plus Jakarta Sans', sans-serif",fontSize:14,color:"#1B3A5C",
        background:"#fff",boxShadow:f?"0 0 0 3px rgba(46,134,171,0.10)":"none",
        transition:"all 0.18s ease",cursor:"pointer",appearance:"none" as const,boxSizing:"border-box" as const}}>
      {options.map(o=><option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function TA({value,onChange,placeholder,rows=3,error}:{value:string;onChange:(v:string)=>void;placeholder?:string;rows?:number;error?:boolean}){
  const[f,setF]=useState(false);
  return(
    <textarea value={value} placeholder={placeholder} rows={rows}
      onChange={e=>onChange(e.target.value)} onFocus={()=>setF(true)} onBlur={()=>setF(false)}
      style={{width:"100%",padding:"10px 12px",borderRadius:9,outline:"none",
        border:error?"1.5px solid #C62828":f?"1.5px solid #2E86AB":"1.5px solid rgba(27,58,92,0.15)",
        fontFamily:"'Plus Jakarta Sans', sans-serif",fontSize:14,color:"#1B3A5C",
        background:f?"#fff":"rgba(245,248,251,0.8)",
        boxShadow:f?"0 0 0 3px rgba(46,134,171,0.10)":"none",
        transition:"all 0.18s ease",resize:"vertical" as const,boxSizing:"border-box" as const}}/>
  );
}

function RadioGroup({value,onChange,options}:{value:string;onChange:(v:string)=>void;options:{value:string;label:string}[]}){
  return(
    <div style={{display:"flex",gap:10,flexWrap:"wrap" as const}}>
      {options.map(opt=>(
        <label key={opt.value} style={{display:"flex",alignItems:"center",gap:8,padding:"10px 18px",borderRadius:10,cursor:"pointer",border:value===opt.value?"1.5px solid #2E86AB":"1.5px solid rgba(27,58,92,0.15)",background:value===opt.value?"rgba(46,134,171,0.07)":"#fff",transition:"all 0.18s ease"}}>
          <div style={{width:16,height:16,borderRadius:"50%",flexShrink:0,border:value===opt.value?"5px solid #2E86AB":"2px solid rgba(27,58,92,0.25)",transition:"all 0.18s ease"}}/>
          <input type="radio" value={opt.value} checked={value===opt.value} onChange={()=>onChange(opt.value)} style={{display:"none"}}/>
          <span style={{fontFamily:"'Plus Jakarta Sans', sans-serif",fontSize:14,fontWeight:value===opt.value?700:500,color:value===opt.value?"#1B3A5C":"#5A7080"}}>{opt.label}</span>
        </label>
      ))}
    </div>
  );
}

function G2({children}:{children:React.ReactNode}){return <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 18px"}}>{children}</div>;}
function G3({children}:{children:React.ReactNode}){return <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0 18px"}}>{children}</div>;}

function RamBadge({code,label}:{code:string;label:string}){
  const c=RIESGO_COLOR[code]??{bg:"#F5F5F5",color:"#666",label:code};
  return(
    <div style={{display:"flex",flexDirection:"column" as const,alignItems:"center",gap:6,flex:1}}>
      <span style={{fontFamily:"'Plus Jakarta Sans', sans-serif",fontSize:10,fontWeight:700,color:"#7A8EA0",letterSpacing:"0.08em",textTransform:"uppercase" as const}}>{label}</span>
      <div style={{width:"100%",padding:"14px 8px",borderRadius:12,background:c.bg,border:`2px solid ${c.color}30`,display:"flex",flexDirection:"column" as const,alignItems:"center",gap:2}}>
        <span style={{fontFamily:"'DM Serif Display', serif",fontSize:36,fontWeight:400,color:c.color,lineHeight:1}}>{code}</span>
        <span style={{fontFamily:"'Plus Jakarta Sans', sans-serif",fontSize:11,fontWeight:700,color:c.color,opacity:0.8}}>{c.label}</span>
      </div>
    </div>
  );
}

function Nav(){
  const router=useRouter();
  const[h,setH]=useState(false);
  return(
    <nav style={{background:"#fff",borderBottom:"1px solid rgba(27,58,92,0.08)",boxShadow:"0 1px 16px rgba(27,58,92,0.06)",position:"sticky" as const,top:0,zIndex:100}}>
      <div style={{maxWidth:1000,margin:"0 auto",padding:"0 24px",height:64,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <a href="/" style={{textDecoration:"none",display:"flex",alignItems:"center",gap:9}}>
          <div style={{width:34,height:34,borderRadius:9,background:"linear-gradient(135deg,#1B3A5C,#2E86AB)",display:"flex",alignItems:"center",justifyContent:"center",boxShadow:"0 2px 10px rgba(46,134,171,0.30)"}}>
            <span style={{color:"#fff",fontSize:15,fontWeight:800,fontFamily:"'DM Serif Display', serif"}}>G</span>
          </div>
          <span style={{fontFamily:"'DM Serif Display', serif",fontSize:20,fontWeight:700,color:"#1B3A5C"}}>Gener<span style={{color:"#2E86AB"}}>AR</span></span>
        </a>
        <button onClick={()=>router.push("/dashboard")} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
          style={{display:"flex",alignItems:"center",gap:7,padding:"8px 18px",borderRadius:8,cursor:"pointer",border:"1.5px solid rgba(27,58,92,0.15)",background:h?"rgba(27,58,92,0.04)":"#fff",color:"#1B3A5C",fontFamily:"'Plus Jakarta Sans', sans-serif",fontSize:13,fontWeight:600,transition:"all 0.2s ease"}}>
          ← Volver al dashboard
        </button>
      </div>
    </nav>
  );
}

function BtnA({primary,loading,onClick,icon,children}:{primary:boolean;loading:boolean;onClick:()=>void;icon:string;children:React.ReactNode}){
  const[h,setH]=useState(false);
  return(
    <button onClick={onClick} disabled={loading} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{display:"flex",alignItems:"center",justifyContent:"center",gap:7,padding:"11px 18px",borderRadius:9,border:primary?"none":"1px solid rgba(255,255,255,0.20)",cursor:loading?"not-allowed":"pointer",
        background:primary?(loading?"rgba(255,255,255,0.30)":h?"#fff":"rgba(255,255,255,0.92)"):(h?"rgba(255,255,255,0.12)":"rgba(255,255,255,0.08)"),
        color:primary?"#1B3A5C":"#fff",fontFamily:"'Plus Jakarta Sans', sans-serif",fontSize:13,fontWeight:700,transition:"all 0.2s ease",
        transform:h&&!loading?"translateY(-1px)":"translateY(0)"} as React.CSSProperties}>
      {loading?<span style={{width:14,height:14,border:"2px solid rgba(27,58,92,0.3)",borderTopColor:"#1B3A5C",borderRadius:"50%",display:"inline-block",animation:"spin 0.7s linear infinite"}}/>:<span>{icon}</span>}
      {children}
    </button>
  );
}

function Results({result,onReset}:{result:ARResponse;onReset:()=>void}){
  const[dl,setDl]=useState(false);
  const COLS=["Fuente","Detalle","Peligro","Consecuencia","Controles","Responsable"] as const;
  const pc=(p:string)=>{
    const t=p.toLowerCase();
    if(t.includes("eléctric"))return{bg:"rgba(244,162,97,0.12)",color:"#B8620A"};
    if(t.includes("mecánic"))return{bg:"rgba(224,82,82,0.10)",color:"#B83232"};
    if(t.includes("químic"))return{bg:"rgba(155,89,182,0.10)",color:"#7B4A8C"};
    if(t.includes("ergonóm"))return{bg:"rgba(46,134,171,0.10)",color:"#1B6A8C"};
    if(t.includes("locativ"))return{bg:"rgba(39,174,96,0.10)",color:"#1A7A44"};
    if(t.includes("alturas"))return{bg:"rgba(255,152,0,0.12)",color:"#E65100"};
    if(t.includes("confinado"))return{bg:"rgba(103,58,183,0.10)",color:"#4527A0"};
    return{bg:"rgba(27,58,92,0.07)",color:"#1B3A5C"};
  };
  const dl_excel=async()=>{
    setDl(true);
    try{
      const bytes=Uint8Array.from(atob(result.excel_base64),c=>c.charCodeAt(0));
      const blob=new Blob([bytes],{type:"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"});
      const url=URL.createObjectURL(blob);const a=document.createElement("a");
      a.href=url;a.download=`AR_${result.titulo_actividad.replace(/\s+/g,"_").slice(0,40)}_${Date.now()}.xlsx`;
      a.click();URL.revokeObjectURL(url);
    }catch{alert("Error al descargar.");}
    finally{setDl(false);}
  };
  return(
    <div style={{animation:"fadeUp 0.5s ease both"}}>
      <div style={{background:"linear-gradient(160deg,#1B3A5C 0%,#1e4d74 55%,#2E86AB 100%)",borderRadius:16,padding:"28px 32px",marginBottom:20,boxShadow:"0 16px 48px rgba(27,58,92,0.25)"}}>
        <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap" as const,gap:24}}>
          <div>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:6}}>
              <span style={{fontSize:22}}>✅</span>
              <p style={{fontFamily:"'Plus Jakarta Sans', sans-serif",fontSize:16,fontWeight:800,color:"#fff"}}>¡Análisis generado exitosamente!</p>
            </div>
            <p style={{fontFamily:"'Plus Jakarta Sans', sans-serif",fontSize:13,color:"rgba(255,255,255,0.60)",marginBottom:18}}>{result.analisis.length} riesgos · {result.creditos_restantes} créditos restantes</p>
            <div style={{display:"flex",gap:14,flexWrap:"wrap" as const}}>
              {[{label:"Riesgo Inherente",code:result.riesgo_inherente},{label:"Riesgo Residual",code:result.riesgo_residual}].map(({label,code})=>{
                const c=RIESGO_COLOR[code]??{bg:"rgba(255,255,255,0.15)",color:"#fff",label:code};
                return(
                  <div key={label} style={{background:"rgba(255,255,255,0.10)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:12,padding:"12px 20px",display:"flex",alignItems:"center",gap:12}}>
                    <div>
                      <p style={{fontFamily:"'Plus Jakarta Sans', sans-serif",fontSize:10,fontWeight:700,color:"rgba(255,255,255,0.50)",letterSpacing:"0.08em",textTransform:"uppercase" as const}}>{label}</p>
                      <p style={{fontFamily:"'DM Serif Display', serif",fontSize:34,fontWeight:400,color:"#fff",lineHeight:1,marginTop:2}}>{code}</p>
                    </div>
                    <div style={{background:c.bg,borderRadius:8,padding:"4px 10px"}}>
                      <span style={{fontFamily:"'Plus Jakarta Sans', sans-serif",fontSize:11,fontWeight:700,color:c.color}}>{c.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column" as const,gap:10,minWidth:170}}>
            <BtnA primary loading={dl} onClick={dl_excel} icon="⬇">{dl?"Descargando...":"Descargar Excel"}</BtnA>
            <BtnA primary={false} loading={false} onClick={onReset} icon="↺">Generar otro AR</BtnA>
          </div>
        </div>
      </div>
      <div style={{background:"#fff",borderRadius:16,border:"1.5px solid rgba(27,58,92,0.08)",overflow:"hidden",boxShadow:"0 2px 20px rgba(27,58,92,0.06)"}}>
        <div style={{padding:"18px 28px",borderBottom:"1px solid rgba(27,58,92,0.07)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <h2 style={{fontFamily:"'DM Serif Display', serif",fontSize:20,fontWeight:400,color:"#1B3A5C"}}>Riesgos identificados</h2>
            <p style={{fontFamily:"'Plus Jakarta Sans', sans-serif",fontSize:13,color:"#7A8EA0",marginTop:3}}>{result.titulo_actividad}</p>
          </div>
          <span style={{background:"rgba(46,134,171,0.08)",border:"1px solid rgba(46,134,171,0.15)",borderRadius:100,padding:"4px 14px",fontFamily:"'Plus Jakarta Sans', sans-serif",fontSize:13,fontWeight:700,color:"#2E86AB"}}>{result.analisis.length} riesgos</span>
        </div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse" as const,minWidth:900}}>
            <thead>
              <tr style={{background:"#F8FAFC"}}>
                {COLS.map(col=>(
                  <th key={col} style={{padding:"11px 13px",textAlign:"left" as const,fontFamily:"'Plus Jakarta Sans', sans-serif",fontSize:10,fontWeight:700,color:"#7A8EA0",letterSpacing:"0.08em",textTransform:"uppercase" as const,borderBottom:"1px solid rgba(27,58,92,0.07)",whiteSpace:"nowrap" as const}}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.analisis.map((r,i)=>{
                const p=pc(r.Peligro);
                return(
                  <tr key={i} style={{borderBottom:i<result.analisis.length-1?"1px solid rgba(27,58,92,0.05)":"none"}}
                    onMouseEnter={e=>(e.currentTarget as HTMLElement).style.background="rgba(46,134,171,0.025)"}
                    onMouseLeave={e=>(e.currentTarget as HTMLElement).style.background="transparent"}>
                    <td style={{padding:"13px",fontFamily:"'Plus Jakarta Sans', sans-serif",fontSize:13,color:"#2A4A60",lineHeight:1.5,verticalAlign:"top"}}>{r.Fuente}</td>
                    <td style={{padding:"13px",fontFamily:"'Plus Jakarta Sans', sans-serif",fontSize:13,color:"#2A4A60",lineHeight:1.5,verticalAlign:"top",maxWidth:220}}>{r.Detalle}</td>
                    <td style={{padding:"13px",verticalAlign:"top"}}><span style={{background:p.bg,color:p.color,borderRadius:100,padding:"3px 10px",fontSize:11,fontWeight:700,fontFamily:"'Plus Jakarta Sans', sans-serif",whiteSpace:"nowrap" as const}}>{r.Peligro}</span></td>
                    <td style={{padding:"13px",fontFamily:"'Plus Jakarta Sans', sans-serif",fontSize:13,color:"#2A4A60",lineHeight:1.5,verticalAlign:"top",maxWidth:200}}>{r.Consecuencia}</td>
                    <td style={{padding:"13px",fontFamily:"'Plus Jakarta Sans', sans-serif",fontSize:13,color:"#2A4A60",lineHeight:1.5,verticalAlign:"top",maxWidth:240}}>{r.Controles}</td>
                    <td style={{padding:"13px",fontFamily:"'Plus Jakarta Sans', sans-serif",fontSize:13,color:"#2A4A60",lineHeight:1.5,verticalAlign:"top"}}>{r.Responsable}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SubmitBtn({loading}:{loading:boolean}){
  const[h,setH]=useState(false);
  return(
    <button type="submit" disabled={loading} onMouseEnter={()=>setH(true)} onMouseLeave={()=>setH(false)}
      style={{width:"100%",padding:"15px",borderRadius:12,border:"none",cursor:loading?"not-allowed":"pointer",
        background:loading?"rgba(27,58,92,0.25)":h?"linear-gradient(135deg,#16304d,#2677a0)":"linear-gradient(135deg,#1B3A5C,#2E86AB)",
        color:"#fff",fontFamily:"'Plus Jakarta Sans', sans-serif",fontSize:16,fontWeight:800,
        boxShadow:!loading&&h?"0 8px 28px rgba(46,134,171,0.45)":!loading?"0 3px 14px rgba(46,134,171,0.30)":"none",
        transform:h&&!loading?"translateY(-1px)":"translateY(0)",transition:"all 0.22s ease",
        display:"flex",alignItems:"center",justifyContent:"center",gap:10}}>
      {loading?<><span style={{width:18,height:18,border:"2.5px solid rgba(255,255,255,0.35)",borderTopColor:"#fff",borderRadius:"50%",display:"inline-block",animation:"spin 0.7s linear infinite"}}/> Generando análisis con IA...</>
        :<><span style={{fontSize:18}}>⚡</span> Generar Análisis de Riesgos</>}
    </button>
  );
}

export default function GeneratePage(){
  const router=useRouter();
  const resultRef=useRef<HTMLDivElement>(null);
  useEffect(()=>{if(!getToken())router.replace("/login");},[router]);

  const[tipoAnalisis,setTipoAnalisis]=useState("Análisis de riesgos de un trabajo");
  const[fecha,setFecha]=useState(today());
  const[inicio,setInicio]=useState(today());
  const[fin,setFin]=useState(addDays(today(),1));
  const[lugar,setLugar]=useState("");
  const[area,setArea]=useState("");
  const[empresa,setEmpresa]=useState("");
  const[ot,setOt]=useState("");
  const[proc,setProc]=useState("");
  const[contacto,setContacto]=useState("");
  const[titulo,setTitulo]=useState("");
  const[pdfFile,setPdfFile]=useState<File|null>(null);
  const[pasos,setPasos]=useState(["","",""]);
  const[categoria,setCategoria]=useState("P");
  const[gravedad,setGravedad]=useState(3);
  const[probabilidad,setProbabilidad]=useState("C");
  const[spEvento,setSpEvento]=useState("NO");
  const[medidasOps,setMedidasOps]=useState("");
  const[equipoResp,setEquipoResp]=useState("");
  const[errors,setErrors]=useState<Record<string,string>>({});
  const[loading,setLoading]=useState(false);
  const[apiError,setApiError]=useState("");
  const[result,setResult]=useState<ARResponse|null>(null);

  const inherente=calcularRiesgo(gravedad,probabilidad);
  const residual=calcularRiesgo(gravedad,bajarProbabilidad(probabilidad));

  useEffect(()=>{
    if(daysBetween(inicio,fin)>30)setFin(addDays(inicio,30));
    if(daysBetween(inicio,fin)<0)setFin(addDays(inicio,1));
  },[inicio]);

  const addPaso=()=>setPasos(p=>[...p,""]);
  const removePaso=(i:number)=>setPasos(p=>p.filter((_,idx)=>idx!==i));
  const setPaso=(i:number,v:string)=>{setPasos(p=>{const n=[...p];n[i]=v;return n;});if(errors[`paso_${i}`])setErrors(e=>{const n={...e};delete n[`paso_${i}`];return n;});};
  const clearErr=(k:string)=>{if(errors[k])setErrors(e=>{const n={...e};delete n[k];return n;});};

  const validate=()=>{
    const errs:Record<string,string>={};
    if(!titulo.trim()||titulo.trim().length<5)errs.titulo="Mínimo 5 caracteres.";
    if(!lugar.trim())errs.lugar="Campo obligatorio.";
    if(!area.trim())errs.area="Campo obligatorio.";
    if(!empresa.trim())errs.empresa="Campo obligatorio.";
    if(!equipoResp.trim())errs.equipoResp="Campo obligatorio.";
    if(daysBetween(inicio,fin)>30)errs.fin="Máximo 30 días desde inicio.";
    if(daysBetween(inicio,fin)<0)errs.fin="La fecha fin debe ser posterior al inicio.";
    const pl=pasos.filter(p=>p.trim());
    if(!pdfFile&&pl.length<3)errs.pasos="Adjunta un PDF o ingresa al menos 3 pasos.";
    pasos.forEach((p,i)=>{if(!pdfFile&&!p.trim())errs[`paso_${i}`]="Paso vacío.";});
    return errs;
  };

  const handleSubmit=async(e:React.FormEvent)=>{
    e.preventDefault();
    const errs=validate();
    if(Object.keys(errs).length>0){setErrors(errs);return;}
    setLoading(true);setApiError("");
    try{
      let pdfBase64:string|undefined;
      if(pdfFile)pdfBase64=await fileToBase64(pdfFile);
      const pl=pasos.filter(p=>p.trim());
      const body={
        tipo_analisis:tipoAnalisis,fecha,inicio,fin,
        lugar:lugar.trim(),area:area.trim(),empresa:empresa.trim(),
        ot:ot.trim()||undefined,proc:proc.trim()||undefined,contacto:contacto.trim()||undefined,
        sp_evento:spEvento,medidas_ops:medidasOps.trim()||undefined,
        titulo_actividad:titulo.trim(),
        pasos:pl.length>=3?pl:undefined,
        equipo:equipoResp.trim(),gravedad,probabilidad,
        pdf_procedimiento:pdfBase64,
      };
      const res=await fetch(`${API}/ar/generate`,{method:"POST",headers:{"Content-Type":"application/json","Authorization":`Bearer ${getToken()}`},body:JSON.stringify(body)});
      const data=await res.json();
      if(res.ok){setResult(data);setTimeout(()=>resultRef.current?.scrollIntoView({behavior:"smooth",block:"start"}),100);}
      else if(res.status===401){localStorage.removeItem("generar_token");router.push("/login");}
      else{const msg=data?.detail||"Error al generar el análisis.";setApiError(typeof msg==="string"?msg:JSON.stringify(msg));}
    }catch{setApiError("No se pudo conectar con el servidor.");}
    finally{setLoading(false);}
  };

  return(
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
        body{-webkit-font-smoothing:antialiased;background:#F5F8FB;}
        @keyframes spin{to{transform:rotate(360deg);}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
        input[type="date"]::-webkit-calendar-picker-indicator{opacity:0.5;cursor:pointer;}
        select{background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%231B3A5C' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");background-repeat:no-repeat;background-position:right 12px center;}
      `}</style>
      <Nav/>
      <main style={{maxWidth:860,margin:"0 auto",padding:"36px 24px 80px",fontFamily:"'Plus Jakarta Sans', sans-serif"}}>
        <div style={{marginBottom:26,animation:"fadeUp 0.5s ease both"}}>
          <h1 style={{fontFamily:"'DM Serif Display', serif",fontSize:"clamp(22px,4vw,30px)",fontWeight:400,color:"#1B3A5C",letterSpacing:"-0.02em",marginBottom:5}}>
            {result?"Análisis de Riesgos HSE — Generado":"Nuevo Análisis de Riesgos HSE"}
          </h1>
          <p style={{fontSize:14,color:"#7A8EA0"}}>{result?"Revisa los riesgos identificados y descarga el Excel.":"Completa todos los datos para generar el análisis con IA."}</p>
        </div>

        {result&&<div ref={resultRef}><Results result={result} onReset={()=>{setResult(null);window.scrollTo({top:0,behavior:"smooth"});}}/></div>}

        {!result&&(
          <form onSubmit={handleSubmit} noValidate style={{animation:"fadeUp 0.5s ease 0.05s both"}}>
            {apiError&&(
              <div style={{background:"rgba(198,40,40,0.06)",border:"1.5px solid rgba(198,40,40,0.25)",borderRadius:12,padding:"14px 18px",marginBottom:18,display:"flex",gap:10}}>
                <span style={{fontSize:16,flexShrink:0}}>⚠️</span>
                <p style={{fontSize:14,color:"#C62828",lineHeight:1.5,fontFamily:"'Plus Jakarta Sans', sans-serif"}}>{apiError}</p>
              </div>
            )}

            <SectionCard title="Tipo de análisis" icon="📋">
              <RadioGroup value={tipoAnalisis} onChange={setTipoAnalisis} options={[
                {value:"Análisis de riesgos de un trabajo",label:"Análisis de riesgos de un trabajo"},
                {value:"Análisis de riesgos integral",label:"Análisis de riesgos integral"},
              ]}/>
            </SectionCard>

            <SectionCard title="Datos Generales" icon="📄">
              <G3>
                <Field label="Fecha diligenciamiento" required><TI type="date" value={fecha} onChange={setFecha}/></Field>
                <Field label="Fecha inicio" required><TI type="date" value={inicio} onChange={v=>{setInicio(v);clearErr("fin");}}/></Field>
                <Field label="Fecha fin" required error={errors.fin} hint={`Máx. ${addDays(inicio,30)}`}>
                  <TI type="date" value={fin} onChange={v=>{setFin(v);clearErr("fin");}} error={!!errors.fin}/>
                </Field>
              </G3>
              <G2>
                <Field label="Planta / Lugar" required error={errors.lugar}><TI value={lugar} onChange={v=>{setLugar(v);clearErr("lugar");}} placeholder="Ej: Planta Barrancabermeja" error={!!errors.lugar}/></Field>
                <Field label="Área" required error={errors.area}><TI value={area} onChange={v=>{setArea(v);clearErr("area");}} placeholder="Ej: Área de producción" error={!!errors.area}/></Field>
              </G2>
              <G2>
                <Field label="Empresa ejecutora" required error={errors.empresa}><TI value={empresa} onChange={v=>{setEmpresa(v);clearErr("empresa");}} placeholder="Ej: Ecopetrol S.A." error={!!errors.empresa}/></Field>
                <Field label="Orden de Trabajo (OT)"><TI value={ot} onChange={setOt} placeholder="Ej: OT-2024-0451"/></Field>
              </G2>
              <G2>
                <Field label="Procedimiento"><TI value={proc} onChange={setProc} placeholder="Ej: PRO-HSE-001"/></Field>
                <Field label="Contactos de emergencia"><TI value={contacto} onChange={setContacto} placeholder="Ej: 123, Bomberos 119"/></Field>
              </G2>
            </SectionCard>

            <SectionCard title="Detalle de la Actividad" icon="⚙️">
              <Field label="Nombre de la actividad" required error={errors.titulo}>
                <TA value={titulo} onChange={v=>{setTitulo(v);clearErr("titulo");}} placeholder="Describe la actividad..." rows={2} error={!!errors.titulo}/>
              </Field>
              <Field label="PDF de procedimiento" hint="Opcional. Si adjuntas PDF los pasos manuales son opcionales.">
                <div style={{border:"2px dashed rgba(46,134,171,0.30)",borderRadius:10,padding:"14px 18px",background:"rgba(46,134,171,0.03)",display:"flex",alignItems:"center",gap:14}}
                  onDragOver={e=>e.preventDefault()}
                  onDrop={e=>{e.preventDefault();const f=e.dataTransfer.files[0];if(f?.type==="application/pdf")setPdfFile(f);}}>
                  <span style={{fontSize:26}}>📄</span>
                  <div style={{flex:1}}>
                    {pdfFile?(
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                        <div><p style={{fontSize:13,fontWeight:700,color:"#1B3A5C"}}>{pdfFile.name}</p><p style={{fontSize:11,color:"#7A8EA0"}}>{(pdfFile.size/1024).toFixed(1)} KB</p></div>
                        <button type="button" onClick={()=>setPdfFile(null)} style={{background:"rgba(198,40,40,0.08)",border:"none",borderRadius:6,padding:"4px 10px",color:"#C62828",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"'Plus Jakarta Sans', sans-serif"}}>Quitar</button>
                      </div>
                    ):(
                      <><p style={{fontSize:13,fontWeight:600,color:"#2E86AB"}}>Arrastra un PDF o haz clic para seleccionar</p>
                      <p style={{fontSize:11,color:"#7A8EA0"}}>Se extraerá el texto del procedimiento automáticamente</p></>
                    )}
                  </div>
                  {!pdfFile&&(<label style={{cursor:"pointer"}}>
                    <input type="file" accept=".pdf" style={{display:"none"}} onChange={e=>{if(e.target.files?.[0])setPdfFile(e.target.files[0]);}}/>
                    <span style={{padding:"8px 14px",borderRadius:8,background:"rgba(46,134,171,0.10)",border:"1px solid rgba(46,134,171,0.20)",color:"#2E86AB",fontSize:12,fontWeight:700,fontFamily:"'Plus Jakarta Sans', sans-serif",whiteSpace:"nowrap" as const}}>Seleccionar PDF</span>
                  </label>)}
                </div>
              </Field>
              <div>
                <label style={{display:"block",fontFamily:"'Plus Jakarta Sans', sans-serif",fontSize:11,fontWeight:700,color:errors.pasos?"#C62828":"#1B3A5C",letterSpacing:"0.07em",textTransform:"uppercase" as const,marginBottom:8}}>
                  Pasos de la actividad{!pdfFile&&<span style={{color:"#2E86AB",marginLeft:3}}>*</span>}
                  {pdfFile&&<span style={{color:"#7A8EA0",fontWeight:400,marginLeft:6,textTransform:"none" as const,letterSpacing:0}}>(opcional con PDF)</span>}
                </label>
                {errors.pasos&&<p style={{fontSize:11,color:"#C62828",marginBottom:8,fontFamily:"'Plus Jakarta Sans', sans-serif"}}>⚠ {errors.pasos}</p>}
                <div style={{display:"flex",flexDirection:"column" as const,gap:8}}>
                  {pasos.map((paso,i)=>(
                    <div key={i} style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                      <div style={{width:26,height:26,borderRadius:"50%",flexShrink:0,marginTop:8,background:"linear-gradient(135deg,rgba(27,58,92,0.08),rgba(46,134,171,0.12))",border:"1px solid rgba(46,134,171,0.15)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#2E86AB"}}>{i+1}</div>
                      <div style={{flex:1}}>
                        <TI value={paso} onChange={v=>setPaso(i,v)} placeholder={`Paso ${i+1}...`} error={!!errors[`paso_${i}`]}/>
                        {errors[`paso_${i}`]&&<p style={{fontSize:11,color:"#C62828",marginTop:3,fontFamily:"'Plus Jakarta Sans', sans-serif"}}>⚠ {errors[`paso_${i}`]}</p>}
                      </div>
                      {pasos.length>3&&(<button type="button" onClick={()=>removePaso(i)} style={{width:32,height:32,borderRadius:8,flexShrink:0,marginTop:5,background:"rgba(198,40,40,0.07)",border:"1px solid rgba(198,40,40,0.18)",color:"#C62828",cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>)}
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addPaso} style={{marginTop:10,display:"flex",alignItems:"center",gap:6,padding:"8px 14px",borderRadius:8,border:"1.5px dashed rgba(46,134,171,0.35)",background:"rgba(46,134,171,0.04)",color:"#2E86AB",fontFamily:"'Plus Jakarta Sans', sans-serif",fontSize:13,fontWeight:700,cursor:"pointer"}}>
                  <span style={{fontSize:16}}>+</span> Agregar paso
                </button>
              </div>
            </SectionCard>

            <SectionCard title="Calculadora RAM" icon="📊">
              <G3>
                <Field label="Categoría"><SI value={categoria} onChange={setCategoria} options={[{value:"P",label:"P — Personas"},{value:"E",label:"E — Económica"},{value:"A",label:"A — Ambiental"},{value:"C",label:"C — Cliente"},{value:"I",label:"I — Imagen"}]}/></Field>
                <Field label="Gravedad (0–5)"><SI value={String(gravedad)} onChange={v=>setGravedad(Number(v))} options={[0,1,2,3,4,5].map(n=>({value:String(n),label:`${n} — ${["Sin daño","Leve","Moderado","Serio","Mayor","Catastrófico"][n]}`}))}/></Field>
                <Field label="Probabilidad (A–E)"><SI value={probabilidad} onChange={setProbabilidad} options={[{value:"A",label:"A — Casi imposible"},{value:"B",label:"B — Improbable"},{value:"C",label:"C — Posible"},{value:"D",label:"D — Probable"},{value:"E",label:"E — Casi seguro"}]}/></Field>
              </G3>
              <div style={{marginTop:6,padding:"18px 22px",borderRadius:12,background:"linear-gradient(135deg,rgba(27,58,92,0.03),rgba(46,134,171,0.05))",border:"1px solid rgba(46,134,171,0.12)"}}>
                <p style={{fontFamily:"'Plus Jakarta Sans', sans-serif",fontSize:11,fontWeight:700,color:"#7A8EA0",letterSpacing:"0.08em",textTransform:"uppercase" as const,marginBottom:14}}>Resultado RAM — Categoría {categoria}</p>
                <div style={{display:"flex",gap:14,alignItems:"center"}}>
                  <RamBadge code={inherente} label="Riesgo Inherente"/>
                  <span style={{color:"#7A8EA0",fontSize:22,paddingBottom:20}}>→</span>
                  <RamBadge code={residual} label="Riesgo Residual"/>
                </div>
                <p style={{fontFamily:"'Plus Jakarta Sans', sans-serif",fontSize:11,color:"#7A8EA0",marginTop:10}}>
                  Residual: probabilidad baja de <strong>{probabilidad}</strong> → <strong>{bajarProbabilidad(probabilidad)}</strong>
                </p>
              </div>
            </SectionCard>

            <SectionCard title="Seguridad de Procesos" icon="🛡️">
              <Field label="¿La actividad puede generar evento de seguridad de procesos?" required>
                <RadioGroup value={spEvento} onChange={setSpEvento} options={[{value:"SI",label:"SÍ"},{value:"NO",label:"NO"}]}/>
              </Field>
              {spEvento==="SI"&&(
                <Field label="Medidas transitorias de operación">
                  <TA value={medidasOps} onChange={setMedidasOps} placeholder="Describe las medidas transitorias..." rows={3}/>
                </Field>
              )}
              <Field label="Equipo responsable" required error={errors.equipoResp}>
                <TI value={equipoResp} onChange={v=>{setEquipoResp(v);clearErr("equipoResp");}} placeholder="Ej: Soldador, Supervisor HSE, Operario" error={!!errors.equipoResp}/>
              </Field>
            </SectionCard>

            <SubmitBtn loading={loading}/>
          </form>
        )}
      </main>
    </>
  );
}

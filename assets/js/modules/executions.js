import { getAll } from "../core/storage.js";
const $=id=>document.getElementById(id);
let runs=[];
function toast(message){const n=document.createElement("div");n.className="toast";n.textContent=message;$("toast-region").append(n);setTimeout(()=>n.remove(),3000);}
function formatDate(value){const date=new Date(value);return Number.isNaN(date.getTime())?"Unknown time":date.toLocaleString();}
function render(){
 const query=$("execution-search").value.trim().toLowerCase(),filter=$("execution-filter").value;
 const filtered=runs.filter(run=>(!query||(run.workflowName+" "+run.id).toLowerCase().includes(query))&&(filter==="all"||run.status===filter));
 $("run-total").textContent=runs.length;$("run-success").textContent=runs.filter(x=>x.status==="succeeded").length;$("run-failed").textContent=runs.filter(x=>x.status==="failed").length;$("run-active").textContent=runs.filter(x=>x.status==="running").length;
 $("execution-visible").textContent=filtered.length;$("execution-list").replaceChildren();$("execution-empty").hidden=filtered.length>0;
 for(const run of filtered){
  const card=document.createElement("article");card.className="execution-card";
  const head=document.createElement("div");head.className="execution-card-head";
  const title=document.createElement("div");const h=document.createElement("h3");h.textContent=run.workflowName||"Untitled workflow";const id=document.createElement("span");id.className="subtle-label";id.textContent="Run "+run.id.slice(0,8);title.append(h,id);
  const status=document.createElement("span");status.className="execution-status status-"+run.status;status.textContent=run.status;head.append(title,status);
  const meta=document.createElement("div");meta.className="execution-meta";meta.textContent="Started "+formatDate(run.startedAt||run.createdAt)+" · "+(run.durationMs??"—")+" ms · "+(run.steps?.length||0)+" step(s)";
  card.append(head,meta);
  if(run.error){const error=document.createElement("p");error.className="execution-error";error.textContent=run.error;card.append(error);}
  const details=document.createElement("details");details.className="execution-details";const summary=document.createElement("summary");summary.textContent="View step log and output";details.append(summary);
  for(const [index,step] of (run.steps||[]).entries()){
   const row=document.createElement("div");row.className="execution-step";
   const label=document.createElement("b");label.textContent=(index+1)+". "+(step.label||step.type)+" · "+step.status;
   const timing=document.createElement("small");timing.textContent=(step.durationMs??"—")+" ms";row.append(label,timing);
   if(step.output){const output=document.createElement("pre");output.textContent=step.output;row.append(output);}
   if(step.error){const error=document.createElement("p");error.className="execution-error";error.textContent=step.error;row.append(error);}
   details.append(row);
  }
  card.append(details);$("execution-list").append(card);
 }
}
async function load(){try{runs=await getAll("executions");runs.sort((a,b)=>new Date(b.startedAt||b.createdAt||0)-new Date(a.startedAt||a.createdAt||0));render();}catch(e){toast(e.message||"Could not load execution history.");}}
function exportRuns(){const payload={application:"AutoPilot Hub",schemaVersion:1,exportedAt:new Date().toISOString(),executions:runs};const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="autopilot-hub-executions-"+new Date().toISOString().slice(0,10)+".json";document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);toast(runs.length+" execution record(s) exported.");}
document.addEventListener("DOMContentLoaded",()=>{$("execution-search").addEventListener("input",render);$("execution-filter").addEventListener("change",render);$("execution-export").addEventListener("click",exportRuns);load();});

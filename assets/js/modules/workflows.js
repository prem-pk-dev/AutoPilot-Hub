import { getAll, deleteRecord, putManyRecords } from "../core/storage.js";
import { runWorkflow } from "../core/engine.js";
const $ = (id) => document.getElementById(id);
const escapeHTML = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let records = [];
function toast(message) { const el=$("toast-region"); if(!el)return; const n=document.createElement("div"); n.className="toast"; n.textContent=message; el.append(n); setTimeout(()=>n.remove(),3500); }
function render() {
  const query=$("workflow-search").value.trim().toLowerCase(), filter=$("workflow-filter").value;
  const list=records.filter(w=>(!query || (w.name+" "+(w.description||"")+" "+(w.tags||[]).join(" ")).toLowerCase().includes(query)) && (filter==="all" || w.status===filter));
  $("workflow-total").textContent=records.length;$("workflow-export").disabled=records.length===0;
  $("workflow-list").replaceChildren();$("workflow-empty").hidden=list.length>0;
  $("workflow-empty").querySelector("b").textContent=records.length?"No matching workflows":"No workflows yet";
  $("workflow-empty").querySelector("p").textContent=records.length?"Try a different search term or status filter.":"Create a workflow with action steps, or import a compatible workflow definition.";
  for(const w of list) {
    const card=document.createElement("article");card.className="workflow-card";
    const top=document.createElement("div");top.className="workflow-card-top";
    const title=document.createElement("div");title.innerHTML="<span class='subtle-label'>"+escapeHTML(w.triggerLabel||"Manual trigger")+"</span><h3>"+escapeHTML(w.name)+"</h3>";
    const status=document.createElement("span");status.className="workflow-state";status.textContent=w.status==="active"?"Marked active":"Draft";top.append(title,status);
    const desc=document.createElement("p");desc.className="muted";desc.textContent=w.description||"No description added.";
    const meta=document.createElement("div");meta.className="workflow-meta";meta.textContent=(w.steps?.length||0)+" action step(s) · Updated "+new Date(w.updatedAt||w.createdAt||Date.now()).toLocaleString();
    const actions=document.createElement("div");actions.className="workflow-actions";
    const edit=document.createElement("a");edit.className="button button-secondary";edit.href="./workflow-builder.html?id="+encodeURIComponent(w.id);edit.textContent="Edit";
    const run=document.createElement("button");run.className="button button-primary";run.type="button";run.textContent="▶ Run now";run.disabled=!Array.isArray(w.steps)||w.steps.length===0;run.title=run.disabled?"Edit this workflow and add action steps first":"Runs locally in this browser tab";
    run.addEventListener("click",async()=>{run.disabled=true;run.textContent="Running…";try{const result=await runWorkflow(w);await load();if(result.status==="succeeded")toast("Workflow completed in "+result.durationMs+" ms.");else toast(result.error||"Workflow failed. See Execution Center.");}catch(e){toast(e.message||"Workflow could not run.");}finally{run.disabled=false;run.textContent="▶ Run now";}});
    const remove=document.createElement("button");remove.className="button button-danger";remove.type="button";remove.textContent="Delete";
    remove.addEventListener("click",async()=>{if(!confirm('Delete "'+w.name.replace(/"/g,'')+'" from this browser?'))return;try{await deleteRecord("workflows",w.id);await load();toast("Workflow deleted.");}catch(e){toast(e.message);}});
    actions.append(run,edit,remove);card.append(top,desc,meta,actions);$("workflow-list").append(card);
  }
  $("workflow-visible").textContent=list.length;
}
async function load(){try{records=await getAll("workflows");records.sort((a,b)=>new Date(b.updatedAt||b.createdAt||0)-new Date(a.updatedAt||a.createdAt||0));render();}catch(e){$("workflow-empty").hidden=false;$("workflow-empty").querySelector("b").textContent="Local storage unavailable";$("workflow-empty").querySelector("p").textContent=e.message;toast(e.message);}}
function exportWorkflows(){const payload={application:"AutoPilot Hub",schemaVersion:2,exportedAt:new Date().toISOString(),workflows:records};const blob=new Blob([JSON.stringify(payload,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob),anchor=document.createElement("a");anchor.href=url;anchor.download="autopilot-hub-workflows-"+new Date().toISOString().slice(0,10)+".json";document.body.append(anchor);anchor.click();anchor.remove();window.setTimeout(()=>URL.revokeObjectURL(url),1000);toast(records.length+" workflow(s) exported.");}
function normalizeImported(items){if(!Array.isArray(items))throw new Error("JSON must contain a workflows array.");const now=new Date().toISOString();return items.map((w,index)=>{if(!w||typeof w.name!=="string"||w.name.trim().length<3)throw new Error("Workflow "+(index+1)+" needs a name of at least 3 characters. Nothing was imported.");if(w.id!==undefined&&(typeof w.id!=="string"||!w.id.trim()))throw new Error("Workflow "+(index+1)+" has an invalid id. Nothing was imported.");return{...w,id:w.id||crypto.randomUUID(),name:w.name.trim(),description:typeof w.description==="string"?w.description.slice(0,300):"",steps:Array.isArray(w.steps)?w.steps:[],createdAt:w.createdAt||now,updatedAt:now,schemaVersion:2,executionEnabled:false,manualExecutionEnabled:true};});}
document.addEventListener("DOMContentLoaded",()=>{$("workflow-search").addEventListener("input",render);$("workflow-filter").addEventListener("change",render);$("workflow-export").addEventListener("click",exportWorkflows);$("workflow-import").addEventListener("change",async(e)=>{const file=e.target.files[0];if(!file)return;try{const data=JSON.parse(await file.text()),items=normalizeImported(Array.isArray(data)?data:(data.workflows||data.data?.workflows));await putManyRecords("workflows",items);await load();toast(items.length+" workflow(s) imported.");}catch(err){toast(err.message||"Import failed.");}finally{e.target.value="";}});load();});

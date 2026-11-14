import { getAll, deleteRecord, putManyRecords } from "../core/storage.js";
const $ = (id) => document.getElementById(id);
const escapeHTML = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
let records = [];
function toast(message) { const el=$("toast-region"); if(!el)return; const n=document.createElement("div"); n.className="toast"; n.textContent=message; el.append(n); setTimeout(()=>n.remove(),3000); }
function render() {
  const query=$("workflow-search").value.trim().toLowerCase(), filter=$("workflow-filter").value;
  const list=records.filter(w=>(!query || (w.name+" "+(w.description||"")).toLowerCase().includes(query)) && (filter==="all" || w.status===filter));
  $("workflow-total").textContent=records.length;
  $("workflow-list").replaceChildren();
  $("workflow-empty").hidden=list.length>0;
  $("workflow-empty").querySelector("b").textContent=records.length?"No matching workflows":"No workflows yet";
  $("workflow-empty").querySelector("p").textContent=records.length?"Try a different search term or status filter.":"Create a workflow definition or import a JSON workflow to get started.";
  for(const w of list) {
    const card=document.createElement("article"); card.className="workflow-card";
    const top=document.createElement("div"); top.className="workflow-card-top";
    const title=document.createElement("div"); title.innerHTML="<span class='subtle-label'>"+escapeHTML(w.triggerLabel||"Manual trigger")+"</span><h3>"+escapeHTML(w.name)+"</h3>";
    const status=document.createElement("span"); status.className="workflow-state"; status.textContent=w.status==="active"?"Marked active":"Draft";
    top.append(title,status);
    const desc=document.createElement("p"); desc.className="muted"; desc.textContent=w.description||"No description added.";
    const meta=document.createElement("div"); meta.className="workflow-meta"; meta.textContent="Updated "+new Date(w.updatedAt||w.createdAt||Date.now()).toLocaleString();
    const actions=document.createElement("div"); actions.className="workflow-actions";
    const edit=document.createElement("a"); edit.className="button button-secondary"; edit.href="./workflow-builder.html?id="+encodeURIComponent(w.id); edit.textContent="Edit";
    const remove=document.createElement("button"); remove.className="button button-danger"; remove.type="button"; remove.textContent="Delete";
    remove.addEventListener("click",async()=>{if(!confirm('Delete "'+w.name.replace(/"/g,'')+'" from this browser?'))return; try{await deleteRecord("workflows",w.id);await load();toast("Workflow deleted.");}catch(e){toast(e.message);}});
    actions.append(edit,remove); card.append(top,desc,meta,actions); $("workflow-list").append(card);
  }
  $("workflow-visible").textContent=list.length;
}
async function load(){try{records=await getAll("workflows");records.sort((a,b)=>new Date(b.updatedAt||b.createdAt||0)-new Date(a.updatedAt||a.createdAt||0));render();}catch(e){$("workflow-empty").hidden=false;$("workflow-empty").querySelector("b").textContent="Local storage unavailable";$("workflow-empty").querySelector("p").textContent=e.message;toast(e.message);}}
function normalizeImported(items) {
  if (!Array.isArray(items)) throw new Error("JSON must contain a workflows array.");
  const now=new Date().toISOString();
  return items.map((w,index)=>{
    if(!w||typeof w.name!=="string"||w.name.trim().length<3) throw new Error("Workflow "+(index+1)+" needs a name of at least 3 characters. Nothing was imported.");
    if(w.id!==undefined && (typeof w.id!=="string" || !w.id.trim())) throw new Error("Workflow "+(index+1)+" has an invalid id. Nothing was imported.");
    return {...w,id:w.id||crypto.randomUUID(),name:w.name.trim(),description:typeof w.description==="string"?w.description.slice(0,300):"",createdAt:w.createdAt||now,updatedAt:now,schemaVersion:1,executionEnabled:false};
  });
}
document.addEventListener("DOMContentLoaded",()=>{
  $("workflow-search").addEventListener("input",render);
  $("workflow-filter").addEventListener("change",render);
  $("workflow-import").addEventListener("change",async(e)=>{
    const file=e.target.files[0];if(!file)return;
    try {
      const data=JSON.parse(await file.text());
      const items=normalizeImported(Array.isArray(data)?data:data.workflows);
      await putManyRecords("workflows",items);
      await load();toast(items.length+" workflow(s) imported.");
    } catch(err) { toast(err.message||"Import failed."); }
    finally { e.target.value=""; }
  });
  load();
});

import { getAll, deleteRecord } from "../core/storage.js";
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
  for(const w of list) {
    const card=document.createElement("article"); card.className="workflow-card";
    const top=document.createElement("div"); top.className="workflow-card-top";
    const title=document.createElement("div"); title.innerHTML="<span class='subtle-label'>"+escapeHTML(w.triggerLabel||"Manual trigger")+"</span><h3>"+escapeHTML(w.name)+"</h3>";
    const status=document.createElement("span"); status.className="workflow-state"; status.textContent=w.status==="active"?"Saved · enabled flag":"Draft";
    top.append(title,status);
    const desc=document.createElement("p"); desc.className="muted"; desc.textContent=w.description||"No description added.";
    const meta=document.createElement("div"); meta.className="workflow-meta"; meta.textContent="Updated "+new Date(w.updatedAt||w.createdAt).toLocaleString();
    const actions=document.createElement("div"); actions.className="workflow-actions";
    const edit=document.createElement("a"); edit.className="button button-secondary"; edit.href="./workflow-builder.html?id="+encodeURIComponent(w.id); edit.textContent="Edit";
    const remove=document.createElement("button"); remove.className="button button-danger"; remove.type="button"; remove.textContent="Delete";
    remove.addEventListener("click",async()=>{if(!confirm('Delete "'+w.name.replace(/"/g,'')+'" from this browser?'))return; try{await deleteRecord("workflows",w.id);await load();toast("Workflow deleted.");}catch(e){toast(e.message);}});
    actions.append(edit,remove); card.append(top,desc,meta,actions); $("workflow-list").append(card);
  }
  $("workflow-visible").textContent=list.length;
}
async function load(){try{records=await getAll("workflows");records.sort((a,b)=>new Date(b.updatedAt||b.createdAt)-new Date(a.updatedAt||a.createdAt));render();}catch(e){toast(e.message);}}
document.addEventListener("DOMContentLoaded",()=>{$("workflow-search").addEventListener("input",render);$("workflow-filter").addEventListener("change",render);$("workflow-import").addEventListener("change",async(e)=>{const file=e.target.files[0];if(!file)return;try{const data=JSON.parse(await file.text());const items=Array.isArray(data)?data:data.workflows;if(!Array.isArray(items))throw new Error("JSON must contain a workflows array.");for(const w of items){if(!w||typeof w.name!=="string"||!w.name.trim())throw new Error("Every workflow needs a name.");const {putRecord}=await import("../core/storage.js");await putRecord("workflows",{...w,id:typeof w.id==="string"?w.id:crypto.randomUUID(),createdAt:w.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()});}await load();toast(items.length+" workflow(s) imported.");}catch(err){toast(err.message||"Import failed.");}finally{e.target.value="";}});load();});

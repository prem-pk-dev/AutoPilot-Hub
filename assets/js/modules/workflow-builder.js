import { getAll, putRecord } from "../core/storage.js";
const $=(id)=>document.getElementById(id);
function toast(message){const el=$("toast-region");const n=document.createElement("div");n.className="toast";n.textContent=message;el.append(n);setTimeout(()=>n.remove(),3200);}
document.addEventListener("DOMContentLoaded",async()=>{
 const params=new URLSearchParams(location.search), id=params.get("id"); let existing=null;
 if(id){try{existing=(await getAll("workflows")).find(w=>w.id===id)||null;}catch(e){toast(e.message);}}
 if(existing){$("workflow-name").value=existing.name||"";$("workflow-description").value=existing.description||"";$("workflow-trigger").value=existing.trigger||"manual";$("workflow-status").value=existing.status||"draft";$("workflow-tags").value=(existing.tags||[]).join(", ");$("builder-title").textContent="Edit workflow";$("workflow-id").value=existing.id;}
 $("workflow-form").addEventListener("submit",async(e)=>{
  e.preventDefault();const name=$("workflow-name").value.trim(),description=$("workflow-description").value.trim();
  if(name.length<3){$("workflow-name").setCustomValidity("Use at least 3 characters.");$("workflow-name").reportValidity();return;}
  $("workflow-name").setCustomValidity("");
  const now=new Date().toISOString(),trigger=$("workflow-trigger").value;
  const record={id:existing?.id||crypto.randomUUID(),name,description,trigger,triggerLabel:({manual:"Manual",schedule:"Scheduled (definition only)",webhook:"Webhook (definition only)"})[trigger],status:$("workflow-status").value,tags:$("workflow-tags").value.split(",").map(x=>x.trim()).filter(Boolean).slice(0,10),createdAt:existing?.createdAt||now,updatedAt:now,schemaVersion:1,executionEnabled:false};
  try{await putRecord("workflows",record);toast("Workflow definition saved in this browser. It has not been executed.");setTimeout(()=>location.href="./workflows.html",700);}catch(err){toast(err.message||"Could not save workflow.");}
 });
});

import { exportWorkspace, importWorkspace, clearWorkspace } from "../core/storage.js";
const $=(id)=>document.getElementById(id);
function toast(message){const el=$("toast-region");const n=document.createElement("div");n.className="toast";n.textContent=message;el.append(n);setTimeout(()=>n.remove(),3200);}
function download(data){const blob=new Blob([JSON.stringify(data,null,2)],{type:"application/json"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download="autopilot-hub-backup-"+new Date().toISOString().slice(0,10)+".json";document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
document.addEventListener("DOMContentLoaded",()=>{
 $("settings-export").addEventListener("click",async()=>{try{download(await exportWorkspace());toast("Backup downloaded.");}catch(e){toast(e.message);}});
 $("settings-import").addEventListener("change",async(e)=>{const file=e.target.files[0];if(!file)return;try{const payload=JSON.parse(await file.text());if(!confirm("Restore this backup? Current local workflows, executions and settings will be replaced."))return;await importWorkspace(payload);toast("Backup restored. Reloading…");setTimeout(()=>location.reload(),700);}catch(err){toast(err.message||"Restore failed.");}finally{e.target.value="";}});
 $("settings-clear").addEventListener("click",async()=>{if(!confirm("Permanently clear all local workflows, executions and settings from this browser? Export a backup first if needed."))return;if(!confirm("Final confirmation: this cannot be undone unless you have a backup."))return;try{await clearWorkspace();toast("Local workspace cleared.");}catch(e){toast(e.message);}});
});

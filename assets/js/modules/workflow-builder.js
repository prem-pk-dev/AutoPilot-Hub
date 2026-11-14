import { getAll, putRecord } from "../core/storage.js";
const $=(id)=>document.getElementById(id);
const TYPES=[
 {value:"text_transform",label:"Transform text"},
 {value:"json_validate",label:"Validate JSON"},
 {value:"timestamp",label:"Generate timestamp"},
 {value:"wait",label:"Wait"}
];
const operations=[{value:"uppercase",label:"Convert to uppercase"},{value:"lowercase",label:"Convert to lowercase"},{value:"trim",label:"Trim whitespace"},{value:"replace",label:"Find and replace"}];
function toast(message){const el=$("toast-region");const n=document.createElement("div");n.className="toast";n.textContent=message;el.append(n);setTimeout(()=>n.remove(),3200);}
function makeField(labelText,control,help){const label=document.createElement("label");label.className="form-field";const title=document.createElement("span");title.textContent=labelText;label.append(title,control);if(help){const small=document.createElement("small");small.textContent=help;label.append(small);}return label;}
function makeSelect(options,value){const select=document.createElement("select");for(const option of options){const node=document.createElement("option");node.value=option.value;node.textContent=option.label;select.append(node);}select.value=value||options[0].value;return select;}
function renderStepConfig(editor,definition){
 const type=editor.querySelector(".step-type").value,config=definition?.config||{},area=editor.querySelector(".step-config");area.replaceChildren();
 if(type==="text_transform"){
  const input=document.createElement("textarea");input.className="step-input";input.rows=3;input.maxLength=5000;input.placeholder="Enter text, or use {{previous}}";input.value=config.input??"Hello from AutoPilot Hub";
  const operation=makeSelect(operations,config.operation||"uppercase");operation.className="step-operation";
  const row=document.createElement("div");row.className="form-grid step-config-grid";row.append(makeField("Operation",operation),makeField("Input text",input,"Maximum 5,000 characters."));
  const replaceRow=document.createElement("div");replaceRow.className="form-grid step-config-grid replace-fields";
  const find=document.createElement("input");find.className="step-find";find.maxLength=500;find.value=config.find||"";find.placeholder="Text to find";
  const replaceWith=document.createElement("input");replaceWith.className="step-replace";replaceWith.maxLength=500;replaceWith.value=config.replaceWith||"";replaceWith.placeholder="Replace with";
  replaceRow.append(makeField("Find",find),makeField("Replace with",replaceWith));
  const update=()=>{replaceRow.hidden=operation.value!=="replace";};operation.addEventListener("change",update);update();area.append(row,replaceRow);
 }else if(type==="json_validate"){
  const input=document.createElement("textarea");input.className="step-input";input.rows=4;input.maxLength=5000;input.placeholder='{"status":"ready"} or {{previous}}';input.value=config.input??'{"status":"ready"}';
  area.append(makeField("JSON input",input,"The step parses JSON and returns pretty-printed JSON. Maximum 5,000 characters."));
 }else if(type==="wait"){
  const input=document.createElement("input");input.className="step-duration";input.type="number";input.min="100";input.max="10000";input.step="100";input.value=String(config.durationMs??1000);
  area.append(makeField("Wait duration (milliseconds)",input,"Allowed range: 100–10,000 ms."));
 }else{
  const note=document.createElement("p");note.className="muted";note.textContent="Generates the current timestamp in ISO 8601 format.";area.append(note);
 }
}
function addStep(definition={type:"text_transform",config:{input:"Hello from AutoPilot Hub",operation:"uppercase"}}){
 const editors=$("step-list");if(editors.children.length>=10){toast("A workflow can contain at most 10 steps.");return;}
 const editor=document.createElement("article");editor.className="step-editor";editor.dataset.stepId=definition.id||crypto.randomUUID();
 const head=document.createElement("div");head.className="step-editor-head";
 const title=document.createElement("b");title.className="step-title";title.textContent="Action step "+(editors.children.length+1);
 const remove=document.createElement("button");remove.type="button";remove.className="button button-danger step-remove";remove.textContent="Remove";
 remove.addEventListener("click",()=>{if(editors.children.length===1){toast("Keep at least one action step.");return;}editor.remove();refreshStepLabels();});
 head.append(title,remove);
 const type=makeSelect(TYPES,definition.type);type.className="step-type";type.addEventListener("change",()=>renderStepConfig(editor));
 const typeRow=makeField("Action type",type);
 const config=document.createElement("div");config.className="step-config";
 editor.append(head,typeRow,config);editors.append(editor);renderStepConfig(editor,definition);refreshStepLabels();
}
function refreshStepLabels(){const items=[...$("step-list").children];items.forEach((item,index)=>{item.querySelector(".step-title").textContent="Action step "+(index+1);item.querySelector(".step-remove").disabled=items.length===1;});$("step-count").textContent=items.length+" / 10 steps";$("add-step").disabled=items.length>=10;}
function collectSteps(){
 return [...$("step-list").children].map((editor,index)=>{
  const type=editor.querySelector(".step-type").value,config={};
  if(type==="text_transform"){config.operation=editor.querySelector(".step-operation").value;config.input=editor.querySelector(".step-input").value;if(config.operation==="replace"){config.find=editor.querySelector(".step-find").value;config.replaceWith=editor.querySelector(".step-replace").value;}}
  if(type==="json_validate")config.input=editor.querySelector(".step-input").value;
  if(type==="wait")config.durationMs=Number(editor.querySelector(".step-duration").value);
  const label=TYPES.find(item=>item.value===type).label;
  return{id:editor.dataset.stepId,type,label,config};
 });
}
document.addEventListener("DOMContentLoaded",async()=>{
 const params=new URLSearchParams(location.search),id=params.get("id");let existing=null;
 if(id){try{existing=(await getAll("workflows")).find(w=>w.id===id)||null;}catch(e){toast(e.message);}}
 if(existing){$("workflow-name").value=existing.name||"";$("workflow-description").value=existing.description||"";$("workflow-trigger").value=existing.trigger||"manual";$("workflow-status").value=existing.status||"draft";$("workflow-tags").value=(existing.tags||[]).join(", ");$("builder-title").textContent="Edit workflow";$("workflow-id").value=existing.id;}
 const initial=existing?.steps?.length?existing.steps:[{type:"text_transform",label:"Transform text",config:{input:"Hello from AutoPilot Hub",operation:"uppercase"}}];
 initial.slice(0,10).forEach(addStep);$("add-step").addEventListener("click",()=>addStep({type:"timestamp",config:{}}));
 $("workflow-form").addEventListener("submit",async(e)=>{
  e.preventDefault();const name=$("workflow-name").value.trim(),description=$("workflow-description").value.trim();
  if(name.length<3){$("workflow-name").setCustomValidity("Use at least 3 characters.");$("workflow-name").reportValidity();return;}
  $("workflow-name").setCustomValidity("");
  const steps=collectSteps(),now=new Date().toISOString(),trigger=$("workflow-trigger").value;
  if(steps.length<1||steps.length>10){toast("Add between 1 and 10 action steps.");return;}
  if(steps.some(step=>(step.type==="text_transform"||step.type==="json_validate")&&step.config.input.length>5000)){toast("Text and JSON inputs are limited to 5,000 characters.");return;}
  if(steps.some(step=>step.type==="wait"&&(!Number.isInteger(step.config.durationMs)||step.config.durationMs<100||step.config.durationMs>10000))){toast("Wait steps must be between 100 and 10,000 milliseconds.");return;}
  if(steps.some(step=>step.type==="text_transform"&&step.config.operation==="replace"&&!step.config.find)){toast("Find and replace needs a non-empty Find value.");return;}
  const record={id:existing?.id||crypto.randomUUID(),name,description,trigger,triggerLabel:({manual:"Manual",schedule:"Scheduled (not active)",webhook:"Webhook (not active)"})[trigger],status:$("workflow-status").value,tags:$("workflow-tags").value.split(",").map(x=>x.trim()).filter(Boolean).slice(0,10),steps,createdAt:existing?.createdAt||now,updatedAt:now,schemaVersion:2,executionEnabled:false,manualExecutionEnabled:true};
  try{await putRecord("workflows",record);toast("Workflow saved. You can run its supported steps manually from Workflows.");setTimeout(()=>location.href="./workflows.html",700);}catch(err){toast(err.message||"Could not save workflow.");}
 });
});

const input=document.getElementById("fileInput"),choose=document.getElementById("chooseBtn"),drop=document.getElementById("dropZone"),analyse=document.getElementById("analyseBtn"),workspace=document.getElementById("workspace"),canvas=document.getElementById("chartCanvas"),ctx=canvas.getContext("2d"),reset=document.getElementById("resetBtn");
let image=null,lastAnalysis=null;

choose.onclick=e=>{e.preventDefault();input.click()};
input.onchange=()=>input.files[0]&&loadImage(input.files[0]);
drop.addEventListener("dragover",e=>e.preventDefault());
drop.addEventListener("drop",e=>{e.preventDefault();e.dataTransfer.files[0]&&loadImage(e.dataTransfer.files[0])});

function loadImage(file){
  if(!file.type.startsWith("image/"))return;
  const r=new FileReader();
  r.onload=()=>{
    image=new Image();
    image.onload=()=>{analyse.disabled=false;drawBase()};
    image.src=r.result;
  };
  r.readAsDataURL(file);
}

function drawBase(){
  const s=Math.min(1,1200/image.width);
  canvas.width=Math.round(image.width*s);
  canvas.height=Math.round(image.height*s);
  ctx.drawImage(image,0,0,canvas.width,canvas.height);
  workspace.hidden=false;
}

analyse.onclick=()=>{
  drawBase();
  const a=analysePixels();
  lastAnalysis=a;
  render(a);
  drawOverlay(a);
};

reset.onclick=()=>{
  input.value="";
  analyse.disabled=true;
  workspace.hidden=true;
  image=null;
  lastAnalysis=null;
};

function analysePixels(){
  const w=canvas.width,h=canvas.height,d=ctx.getImageData(0,0,w,h).data;
  const bins=Math.max(36,Math.min(96,Math.floor(w/14)));
  const up=new Array(bins).fill(0),down=new Array(bins).fill(0),activity=new Array(bins).fill(0);
  const yActivity=new Array(h).fill(0),priceY=new Array(bins).fill(null);

  for(let y=0;y<h;y+=2){
    for(let x=0;x<w;x+=2){
      const i=(y*w+x)*4,r=d[i],g=d[i+1],b=d[i+2],v=(r+g+b)/3;
      const k=Math.min(bins-1,Math.floor(x/w*bins));
      const bullish=g>r*1.10&&g>b*1.04&&g>75;
      const bearish=r>g*1.10&&r>b*1.04&&r>75;
      const dark=v<135;
      if(bullish){up[k]++;activity[k]++;yActivity[y]+=1}
      if(bearish){down[k]++;activity[k]++;yActivity[y]+=1}
      if(dark)yActivity[y]+=0.15;
    }
  }

  for(let k=0;k<bins;k++){
    let weightedY=0,weight=0;
    for(let y=0;y<h;y+=2){
      const q=yActivity[y];
      if(q>0){weightedY+=y*q;weight+=q}
    }
    priceY[k]=weight?weightedY/weight:h/2;
  }

  const smooth=a=>{
    const out=new Array(a.length).fill(0);
    for(let i=0;i<a.length;i++){
      let sum=0,n=0;
      for(let j=Math.max(0,i-2);j<=Math.min(a.length-1,i+2);j++){sum+=a[j];n++}
      out[i]=sum/n;
    }
    return out;
  };

  const pu=smooth(up),pd=smooth(down);

  let pocY=h/2,pocScore=-1;
  for(let y=Math.floor(h*.08);y<Math.floor(h*.92);y+=2){
    const score=yActivity[y]+(y>1?yActivity[y-1]:0)+(y<h-1?yActivity[y+1]:0);
    if(score>pocScore){pocScore=score;pocY=y}
  }

  const rangeStart=Math.floor(bins*.32),rangeEnd=Math.floor(bins*.62);
  let rangeTop=h,rangeBottom=0;
  for(let k=rangeStart;k<=rangeEnd;k++){
    const yy=priceY[k];
    if(Number.isFinite(yy)){rangeTop=Math.min(rangeTop,yy);rangeBottom=Math.max(rangeBottom,yy)}
  }
  if(rangeTop===h){rangeTop=pocY-h*.07;rangeBottom=pocY+h*.07}

  const rangePad=Math.max(10,h*.018);
  rangeTop=Math.max(5,rangeTop-rangePad);
  rangeBottom=Math.min(h-5,rangeBottom+rangePad);

  const recentStart=Math.floor(bins*.72);
  const priorStart=Math.floor(bins*.52);
  const recentY=priceY.slice(recentStart);
  const priorY=priceY.slice(priorStart,recentStart);
  const avg=a=>a.reduce((s,v)=>s+v,0)/Math.max(1,a.length);
  const recentAvg=avg(recentY),priorAvg=avg(priorY);
  const latestAvg=avg(priceY.slice(Math.floor(bins*.88)));
  const midAvg=avg(priceY.slice(Math.floor(bins*.68),Math.floor(bins*.80)));

  const bullishBreak=latestAvg<rangeTop;
  const bearishBreak=latestAvg>rangeBottom;
  const bullishPull=midAvg<=rangeTop+rangePad*2&&latestAvg<midAvg;
  const bearishPull=midAvg>=rangeBottom-rangePad*2&&latestAvg>midAvg;
  const bullishTrend=recentAvg<priorAvg-rangePad*.45;
  const bearishTrend=recentAvg>priorAvg+rangePad*.45;

  let recentBull=0,recentBear=0,rangeBull=0,rangeBear=0;
  for(let k=0;k<bins;k++){
    if(k>=recentStart){recentBull+=pu[k];recentBear+=pd[k]}
    if(k>=rangeStart&&k<=rangeEnd){rangeBull+=pu[k];rangeBear+=pd[k]}
  }

  const longScore=(bullishBreak?3:0)+(bullishPull?3:0)+(bullishTrend?2:0)+(recentBull>recentBear*1.05?1:0)+(rangeBull>=rangeBear*.75?1:0);
  const shortScore=(bearishBreak?3:0)+(bearishPull?3:0)+(bearishTrend?2:0)+(recentBear>recentBull*1.05?1:0)+(rangeBear>=rangeBull*.75?1:0);

  let direction="WAIT";
  if(longScore>=6&&longScore>=shortScore+2)direction="LONG";
  else if(shortScore>=6&&shortScore>=longScore+2)direction="SHORT";

  // WAIT now means there is still a plan. Pick the stronger side as the setup to watch.
  const pendingSetup=longScore>shortScore?"LONG":shortScore>longScore?"SHORT":"BOTH";
  const pendingEntryY=pendingSetup==="LONG"?rangeTop:pendingSetup==="SHORT"?rangeBottom:pocY;
  const pendingStopY=pendingSetup==="LONG"
    ?Math.min(h-12,rangeBottom+Math.max(14,h*.025))
    :pendingSetup==="SHORT"
      ?Math.max(12,rangeTop-Math.max(14,h*.025))
      :pocY;
  const pendingTargetY=pendingSetup==="LONG"
    ?Math.max(12,pendingEntryY-(pendingStopY-pendingEntryY)*2)
    :pendingSetup==="SHORT"
      ?Math.min(h-12,pendingEntryY+(pendingEntryY-pendingStopY)*2)
      :pocY;

  const confidence=direction==="WAIT"?0:Math.min(95,Math.round(58+Math.abs(longScore-shortScore)*5));

  let breakoutY=pocY,pullbackY=pocY,entryY=pocY,slY=pocY,tpY=pocY;
  if(direction==="LONG"){
    breakoutY=rangeTop;
    pullbackY=Math.max(rangeTop,Math.min(rangeBottom,midAvg));
    entryY=Math.min(pocY,pullbackY);
    slY=Math.min(h-12,rangeBottom+Math.max(14,h*.025));
    tpY=Math.max(12,entryY-(slY-entryY)*2);
  }else if(direction==="SHORT"){
    breakoutY=rangeBottom;
    pullbackY=Math.min(rangeBottom,Math.max(rangeTop,midAvg));
    entryY=Math.max(pocY,pullbackY);
    slY=Math.max(12,rangeTop-Math.max(14,h*.025));
    tpY=Math.min(h-12,entryY+(entryY-slY)*2);
  }

  return{
    w,h,pY:pocY,rangeTop,rangeBottom,breakoutY,pullbackY,entryY,slY,tpY,
    pendingSetup,pendingEntryY,pendingStopY,pendingTargetY,
    direction,confidence,longScore,shortScore,
    accum:(rangeBottom-rangeTop)>h*.025?"Detected":"Possible",
    breakout:direction==="WAIT"?"Waiting for "+(pendingSetup==="BOTH"?"a directional breakout":pendingSetup.toLowerCase()+" breakout"):direction==="LONG"?"Bullish breakout":"Bearish breakout",
    pullback:direction==="WAIT"?"After breakout, wait for pullback toward POC/value":direction==="LONG"?"Pullback toward value":"Pullback toward value",
    continuation:direction==="WAIT"?"Then wait for continuation in the setup direction":direction==="LONG"?"Bullish continuation":"Bearish continuation",
    bias:direction==="WAIT"?"Waiting for confirmation":direction==="LONG"?"Bullish":"Bearish"
  };
}

function render(a){
  const set=(id,v)=>document.getElementById(id).textContent=v;
  set("accum",a.accum);
  set("poc",Math.round(a.pY/a.h*100)+"% chart height");
  set("breakout",a.breakout);
  set("pullback",a.pullback);
  set("continuation",a.continuation);
  set("bias",a.bias);

  const d=document.getElementById("direction");
  d.textContent=a.direction;
  d.className="direction "+a.direction.toLowerCase();

  if(a.direction==="WAIT"){
    set("entry",a.pendingSetup==="BOTH"?"Wait for LONG or SHORT breakout":"Wait for "+a.pendingSetup+" trigger at marked entry");
    set("invalid","Marked pending setup");
    set("target","Marked pending setup");
  }else{
    set("entry","Marked on chart");
    set("invalid","Marked on chart");
    set("target","Marked on chart");
  }

  document.getElementById("summary").textContent=
    a.direction==="WAIT"
      ?"WAIT: "+(a.pendingSetup==="BOTH"?"both directions need confirmation":a.pendingSetup+" setup is forming. Wait for the marked breakout/entry, then pullback and continuation.")
      :"Detected a "+a.direction.toLowerCase()+" structure using accumulation, breakout, pullback and continuation geometry.";
}

function downloadAnnotated(){
  if(!lastAnalysis||!canvas.width)return;
  const link=document.createElement("a");
  link.download="technical-analysis-annotated.png";
  link.href=canvas.toDataURL("image/png");
  link.click();
}

function drawOverlay(a){
  const w=a.w,h=a.h;
  ctx.save();

  const isLong=a.direction==="LONG",isShort=a.direction==="SHORT";
  const accent=isLong?"#79d6a4":isShort?"#e59a9a":"#8ab4ff";

  ctx.lineWidth=2;
  ctx.setLineDash([8,6]);
  ctx.strokeStyle="#8ab4ff";
  ctx.beginPath();
  ctx.moveTo(0,a.pY);
  ctx.lineTo(w,a.pY);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.font="900 13px system-ui";
  ctx.fillStyle="#8ab4ff";
  ctx.fillText("POC",12,Math.max(18,a.pY-8));

  ctx.fillStyle="#8ab4ff18";
  ctx.strokeStyle="#8ab4ff";
  ctx.lineWidth=2;
  ctx.strokeRect(w*.08,a.rangeTop,w*.56,a.rangeBottom-a.rangeTop);
  ctx.font="800 12px system-ui";
  ctx.fillStyle="#8ab4ff";
  ctx.fillText("ACCUMULATION / VALUE",w*.09,Math.max(18,a.rangeTop-7));

  if(!isLong&&!isShort){
    const pendingColor=a.pendingSetup==="SHORT"?"#e59a9a":a.pendingSetup==="LONG"?"#79d6a4":"#8ab4ff";
    ctx.fillStyle=pendingColor;
    ctx.font="900 15px system-ui";
    ctx.fillText(
      a.pendingSetup==="BOTH"?"WAIT — WAITING FOR DIRECTION": "WAIT — WATCH "+a.pendingSetup+" SETUP",
      w*.08,Math.min(h-16,a.rangeBottom+28)
    );

    if(a.pendingSetup!=="BOTH"){
      drawLevel(a.pendingEntryY,"ENTRY TRIGGER",pendingColor,true);
      drawLevel(a.pendingStopY,"INVALIDATION",pendingColor,true);
      drawLevel(a.pendingTargetY,"TARGET",pendingColor,true);
      ctx.font="800 12px system-ui";
      ctx.fillStyle=pendingColor;
      ctx.fillText(
        a.pendingSetup==="LONG"?"LONG: breakout above value → pullback → continuation":"SHORT: breakout below value → pullback → continuation",
        w*.08,Math.min(h-34,a.rangeBottom+46)
      );
    }else{
      drawLevel(a.pY,"WAIT / POC",pendingColor,true);
    }

    ctx.restore();
    return;
  }

  const bx=w*.08,bw=w*.58;
  ctx.fillStyle=accent+"22";
  ctx.strokeStyle=accent;
  ctx.lineWidth=2;
  ctx.fillRect(bx,a.rangeTop,bw,a.rangeBottom-a.rangeTop);
  ctx.strokeRect(bx,a.rangeTop,bw,a.rangeBottom-a.rangeTop);

  ctx.font="900 16px system-ui";
  ctx.fillStyle=accent;
  ctx.fillText(isLong?"LONG SETUP":"SHORT SETUP",bx+10,Math.max(22,a.rangeTop+22));

  drawLevel(a.tpY,"TP",accent,true);
  drawLevel(a.entryY,"ENTRY",accent,false);
  drawLevel(a.slY,"SL",accent,true);
  drawLevel(a.breakoutY,"BREAKOUT",accent,true);

  ctx.font="900 12px system-ui";
  ctx.fillStyle=accent;
  ctx.fillText("PULLBACK",w*.09,Math.max(18,Math.min(h-18,a.pullbackY-8)));

  ctx.restore();

  function drawLevel(y,label,color,dash){
    y=Math.max(18,Math.min(h-18,y));
    ctx.save();
    ctx.strokeStyle=color;
    ctx.fillStyle=color;
    ctx.lineWidth=3;
    ctx.setLineDash(dash?[10,7]:[]);
    ctx.beginPath();
    ctx.moveTo(w*.04,y);
    ctx.lineTo(w*.96,y);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.font="900 13px system-ui";
    const tw=Math.max(54,ctx.measureText(label).width+24);
    const lx=w*.72;
    ctx.fillStyle=color;
    ctx.fillRect(lx,y-13,tw,26);
    ctx.fillStyle="#07100d";
    ctx.fillText(label,lx+12,y+5);
    ctx.restore();
  }
}

const saveBtn=document.getElementById("saveBtn");
if(saveBtn)saveBtn.onclick=downloadAnnotated;

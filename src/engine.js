// CW SHAPE ENGINE v2 — adds dome, side tabs, stacked pills; hole = circle only
const RATIOS = { '5:4':[1000,800], '4:5':[800,1000], '1:1':[900,900], '16:9':[1280,720], '9:16':[720,1280] };

const COLORS = [
  { hex:'#A56C38', name:'Brown' }, { hex:'#F9E982', name:'Yellow' }, { hex:'#F8CCAC', name:'Peach' },
  { hex:'#FA632B', name:'Red' }, { hex:'#B0CB43', name:'Lime' }, { hex:'#B5DBF4', name:'Light Blue' },
  { hex:'#65B07B', name:'Spearmint' }, { hex:'#C5D1FF', name:'Aqua' }, { hex:'#A98B48', name:'Dirty Brown' },
  { hex:'#EFEEBD', name:'Eucalypt' }, { hex:'#EDE8E4', name:'Limewash' }, { hex:'#CCCBCA', name:'Concrete' },
  { hex:'#FFFAF5', name:'Linen' }, { hex:'#191814', name:'Charcoal' },
];

const CORNER_SIZES=[1.5,2.25,3.0], PINCH_SIZES=[1.5,2.25,3.0], NOTCH_SIZES=[1.5,2.25,3.0];
const BUMP_SIZES=[2.0,2.75,3.5], BITE_SIZES=[1.2,1.8,2.4], TAB_SIZES=[1.75,2.5,3.25], STACK_R=[0.5,0.65,0.85];
const ARCH_W=[0.28,0.34,0.40], ARCH_H=[0.40,0.50,0.60], HOLE_CIRCLE=[1.0,1.5,2.0], HOLE_SQUARE=[1.6,2.4,3.2];

const DEFAULT_PARAMS = {
  ratio:'5:4', color:'#FA632B',
  corners:{ style:'none', which:'all', size:2 },
  edge:{ type:'none', side:'bottom', count:3, size:2 },   // scallops|bites|arch|bump|dome
  sides:{ type:'none', count:3, size:2 },                  // pinch|notch|tabs|stack
  hole:{ type:'none', size:2 },                            // circle only
};

const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
const fmt=n=>Math.round(n*100)/100;

function validScallopCounts(ratio){ const [W,H]=RATIOS[ratio]; return [2,3,4].filter(n=>W/(2*n)<=H*0.4); }
function domeAvailable(ratio){ const [W,H]=RATIOS[ratio]; return W/2<=0.85*H; }

function activeCategories(p){
  const c=[];
  if(p.corners.style!=='none')c.push('corners');
  if(p.edge.type!=='none')c.push('edge');
  if(p.sides.type!=='none')c.push('sides');
  if(p.hole.type!=='none')c.push('hole');
  return c;
}

function resolve(p){
  const [W,H]=RATIOS[p.ratio];
  const U=Math.min(W,H)/8, PAD=U*0.4;
  const edge=p.edge.type!=='none'?{...p.edge}:null;
  let sides=p.sides.type!=='none'?{...p.sides}:null;
  const hole=p.hole.type!=='none'?{...p.hole}:null;
  const cornersOn=p.corners.style!=='none';

  // STYLE BAN: scallops never combine with notch (soft full-edge vs sharp side cuts)
  if(edge&&edge.type==='scallops'&&sides&&sides.type==='notch') sides=null;

  // ---- 1. horizontal insets (tabs protrude outward) ----
  let tabR=0;
  if(sides&&sides.type==='tabs'){
    tabR=clamp(TAB_SIZES[sides.size-1]*U, U, Math.min(W*0.22, H*0.4));
  }
  const bodyLeft=tabR, bodyRight=W-tabR, bodyW=bodyRight-bodyLeft;

  // ---- 2. vertical insets (outward edge features) ----
  let scallopR=0,bumpR=0,domeR=0;
  if(edge&&edge.type==='scallops'){
    const counts=validScallopCounts(p.ratio);
    const n=counts.includes(edge.count)?edge.count:counts[0];
    edge._count=n; scallopR=bodyW/(2*n);
  }
  if(edge&&edge.type==='bump') bumpR=clamp(BUMP_SIZES[edge.size-1]*U,U,Math.min(bodyW/2-PAD,H*0.4));
  if(edge&&edge.type==='dome'){
    if(!domeAvailable(p.ratio)){ edge.type='bump'; bumpR=clamp(BUMP_SIZES[2]*U,U,Math.min(bodyW/2-PAD,H*0.4)); }
    else domeR=bodyW/2;
  }
  const outward=scallopR||bumpR||domeR;
  const topInset=edge&&edge.side==='top'?outward:0;
  const bottomInset=edge&&edge.side==='bottom'?outward:0;
  const bodyTop=topInset, bodyBottom=H-bottomInset, bodyH=bodyBottom-bodyTop;
  const bodyCx=bodyLeft+bodyW/2;

  // ---- 3. feature sizes, bounded by body dims only (features never yield to corners) ----
  let stackR=0, stackN=0;
  if(sides&&sides.type==='stack'){
    stackN=clamp(sides.count,2,4);
    stackR=clamp(STACK_R[sides.size-1]*U, U*0.3, Math.min(bodyH/(2*stackN)-2, W*0.12));
  }
  let sideHalf=0,sideDepth=0;
  if(sides&&(sides.type==='pinch'||sides.type==='notch')){
    const raw=(sides.type==='pinch'?PINCH_SIZES:NOTCH_SIZES)[sides.size-1]*U;
    sideHalf=Math.min(raw, bodyH/2-PAD*2, bodyW*0.32);
    sideDepth=sideHalf;
  }
  if(sides&&sides.type==='tabs'){
    tabR=Math.min(tabR, bodyH/2-PAD*2);
  }
  const cy=bodyTop+bodyH/2;

  let biteR=0,biteCenters=[],archW=0,archH=0,c0=0;
  if(edge){
    if(edge.type==='bites'){
      const n=clamp(edge.count,1,3); edge._count=n;
      c0=bodyW/(2*n);
      biteR=Math.min(BITE_SIZES[edge.size-1]*U, bodyH*0.45, c0-PAD);
      for(let i=0;i<n;i++)biteCenters.push(bodyLeft+bodyW*(2*i+1)/(2*n));
    }
    if(edge.type==='arch'){
      archW=clamp(ARCH_W[edge.size-1]*bodyW,U,bodyW-2*PAD);
      archH=clamp(ARCH_H[edge.size-1]*bodyH,archW/2+PAD,bodyH-PAD);
    }
  }

  // ---- 4. cross-feature clearance: arch vs pinch/notch (thin-wall guard) ----
  if(edge&&edge.type==='arch'&&sides&&(sides.type==='pinch'||sides.type==='notch')){
    sideHalf=Math.min(sideHalf,(bodyW-archW)/2-PAD);
    sideDepth=sideHalf;
    if(sideHalf<U*0.6){ sides=null; sideHalf=0; sideDepth=0; }
  }
  // bites vs pinch/notch vertical clearance
  if(edge&&edge.type==='bites'&&sides&&(sides.type==='pinch'||sides.type==='notch')){
    biteR=Math.min(biteR, bodyH/2-sideHalf-PAD);
    if(biteR<U*0.8){ biteR=Math.max(biteR,U*0.8); sideHalf=Math.min(sideHalf,bodyH/2-biteR-PAD); sideDepth=sideHalf; }
  }

  // ---- 5. corners yield to everything; slivers removed ----
  const fullEdge = edge && (edge.type==='scallops'||edge.type==='dome') ? edge.side : null;
  let crBase=cornersOn?CORNER_SIZES[p.corners.size-1]*U:0;
  let cornerStyle=p.corners.style;
  const stackAuto = stackR&&!cornersOn;
  if(stackAuto){ cornerStyle='round'; crBase=stackR; }
  crBase=Math.min(crBase, Math.min(bodyW,bodyH)/2-1);
  if(sides&&(sides.type==='pinch'||sides.type==='notch')) crBase=Math.min(crBase, bodyH/2-sideHalf-PAD);
  if(sides&&sides.type==='tabs') crBase=Math.min(crBase, bodyH/2-tabR-PAD);
  if(stackR&&!stackAuto) crBase=Math.min(crBase, bodyH/stackN-stackR-PAD);
  let crEdgeAdj=crBase; // corners adjacent to the featured edge
  if(edge&&edge.type==='bites') crEdgeAdj=Math.min(crEdgeAdj, c0-biteR-PAD);
  if(edge&&edge.type==='bump') crEdgeAdj=Math.min(crEdgeAdj, bodyW/2-bumpR-PAD);
  if(edge&&edge.type==='arch') crEdgeAdj=Math.min(crEdgeAdj, (bodyW-archW)/2-PAD);
  // remove sliver corners (tiny cuts read as defects)
  const clean=(v)=>(v<U*0.5?0:v);
  crBase=clean(Math.max(0,crBase)); crEdgeAdj=clean(Math.max(0,crEdgeAdj));
  const wantTop=(cornersOn&&(p.corners.which==='all'||p.corners.which==='top'))||stackAuto;
  const wantBottom=(cornersOn&&(p.corners.which==='all'||p.corners.which==='bottom'))||stackAuto;
  const topVal = edge&&edge.side==='top'?crEdgeAdj:crBase;
  const botVal = edge&&edge.side==='bottom'?crEdgeAdj:crBase;
  const cr={
    TL:wantTop&&fullEdge!=='top'?topVal:0, TR:wantTop&&fullEdge!=='top'?topVal:0,
    BR:wantBottom&&fullEdge!=='bottom'?botVal:0, BL:wantBottom&&fullEdge!=='bottom'?botVal:0,
  };

  // ---- 6. hole in the free interior (circle or square) ----
  let holeGeo=null;
  if(hole){
    const sideIntrude = sideDepth ? sideDepth : (stackR ? stackR : 0);
    const xLo=bodyLeft+sideIntrude+PAD, xHi=bodyRight-sideIntrude-PAD;
    let yLo=bodyTop+PAD,yHi=bodyBottom-PAD;
    if(edge){
      const intrude=edge.type==='bites'?biteR:edge.type==='arch'?archH:0;
      if(edge.side==='top')yLo=bodyTop+intrude+PAD; else yHi=bodyBottom-intrude-PAD;
    }
    const freeW=xHi-xLo,freeH=yHi-yLo;
    const hx=(xLo+xHi)/2, hy=(yLo+yHi)/2;
    if(hole.type==='square'){
      const s=Math.min(HOLE_SQUARE[hole.size-1]*U, Math.min(freeW,freeH)-PAD);
      if(s>U*0.8)holeGeo={type:'square',cx:hx,cy:hy,s};
    }else{
      const r=clamp(HOLE_CIRCLE[hole.size-1]*U,U*0.5,Math.min(freeW,freeH)/2-PAD*0.5);
      if(r>U*0.3)holeGeo={type:'circle',cx:hx,cy:hy,r};
    }
  }

  return {W,H,U,PAD,bodyLeft,bodyRight,bodyW,bodyCx,bodyTop,bodyBottom,bodyH,cr,cornerStyle,
    edge,scallopR,bumpR,domeR,biteR,biteCenters,archW,archH,
    sides,sideDepth,sideHalf,tabR,stackR,stackN,cy,hole:holeGeo};
}

function fmtx(x,lo,hi){ return Math.abs(x-hi)<0.01?hi:Math.abs(x-lo)<0.01?lo:x; }

function buildSegments(g){
  const {W,cr,bodyTop,bodyBottom,bodyLeft,bodyRight,bodyW,bodyCx,cy}=g;
  const segs=[];
  const L=(x,y)=>segs.push({c:'L',x,y});
  const A=(r,sweep,x,y)=>segs.push({c:'A',r,sweep,x,y});
  const corner=(name,x1,y1)=>{
    const r=g.cr[name]; if(r<=0)return;
    segs.push(g.cornerStyle==='round'?{c:'A',r,sweep:1,x:x1,y:y1}:{c:'L',x:x1,y:y1});
  };
  const e=g.edge;
  const topFeat=e&&e.side==='top'?e.type:null;
  const botFeat=e&&e.side==='bottom'?e.type:null;
  const s=g.sides?g.sides.type:null;

  // stack junction ys
  const junctions=[];
  if(s==='stack')for(let j=1;j<g.stackN;j++)junctions.push(bodyTop+g.bodyH*j/g.stackN);

  segs.push({c:'M',x:bodyLeft+cr.TL,y:bodyTop});

  // ---- top edge L->R ----
  if(topFeat==='dome'){
    A(g.domeR,1,bodyRight,bodyTop);
  } else if(topFeat==='scallops'){
    for(let i=0;i<e._count;i++)A(g.scallopR,1,fmtx(bodyLeft+(i+1)*2*g.scallopR,bodyLeft,bodyRight),bodyTop);
  } else if(topFeat==='bites'){
    for(const c of g.biteCenters){L(c-g.biteR,bodyTop);A(g.biteR,0,c+g.biteR,bodyTop);}
    L(bodyRight-cr.TR,bodyTop);
  } else if(topFeat==='bump'){
    L(bodyCx-g.bumpR,bodyTop);A(g.bumpR,1,bodyCx+g.bumpR,bodyTop);L(bodyRight-cr.TR,bodyTop);
  } else if(topFeat==='arch'){
    const hw=g.archW/2,yD=bodyTop+g.archH-hw;
    L(bodyCx-hw,bodyTop);L(bodyCx-hw,yD);A(hw,0,bodyCx+hw,yD);L(bodyCx+hw,bodyTop);L(bodyRight-cr.TR,bodyTop);
  } else L(bodyRight-cr.TR,bodyTop);

  corner('TR',bodyRight,bodyTop+cr.TR);

  // ---- right edge T->B ----
  if(s==='pinch'||s==='notch'){
    L(bodyRight,cy-g.sideHalf);
    if(s==='pinch')A(g.sideHalf,0,bodyRight,cy+g.sideHalf);
    else{L(bodyRight-g.sideDepth,cy);L(bodyRight,cy+g.sideHalf);}
  } else if(s==='tabs'){
    L(bodyRight,cy-g.tabR);A(g.tabR,1,bodyRight,cy+g.tabR);
  } else if(s==='stack'){
    for(const yj of junctions){
      L(bodyRight,yj-g.stackR);
      A(g.stackR,1,bodyRight-g.stackR,yj);
      A(g.stackR,1,bodyRight,yj+g.stackR);
    }
  }
  L(bodyRight,bodyBottom-cr.BR);
  corner('BR',bodyRight-cr.BR,bodyBottom);

  // ---- bottom edge R->L ----
  if(botFeat==='dome'){
    A(g.domeR,1,bodyLeft,bodyBottom);
  } else if(botFeat==='scallops'){
    for(let i=e._count-1;i>=0;i--)A(g.scallopR,1,fmtx(bodyLeft+i*2*g.scallopR,bodyLeft,bodyRight),bodyBottom);
  } else if(botFeat==='bites'){
    for(const c of [...g.biteCenters].reverse()){L(c+g.biteR,bodyBottom);A(g.biteR,0,c-g.biteR,bodyBottom);}
    L(bodyLeft+cr.BL,bodyBottom);
  } else if(botFeat==='bump'){
    L(bodyCx+g.bumpR,bodyBottom);A(g.bumpR,1,bodyCx-g.bumpR,bodyBottom);L(bodyLeft+cr.BL,bodyBottom);
  } else if(botFeat==='arch'){
    const hw=g.archW/2,yD=bodyBottom-g.archH+hw;
    L(bodyCx+hw,bodyBottom);L(bodyCx+hw,yD);A(hw,0,bodyCx-hw,yD);L(bodyCx-hw,bodyBottom);L(bodyLeft+cr.BL,bodyBottom);
  } else L(bodyLeft+cr.BL,bodyBottom);

  corner('BL',bodyLeft,bodyBottom-cr.BL);

  // ---- left edge B->T ----
  if(s==='pinch'||s==='notch'){
    L(bodyLeft,cy+g.sideHalf);
    if(s==='pinch')A(g.sideHalf,0,bodyLeft,cy-g.sideHalf);
    else{L(bodyLeft+g.sideDepth,cy);L(bodyLeft,cy-g.sideHalf);}
  } else if(s==='tabs'){
    L(bodyLeft,cy+g.tabR);A(g.tabR,1,bodyLeft,cy-g.tabR);
  } else if(s==='stack'){
    for(const yj of [...junctions].reverse()){
      L(bodyLeft,yj+g.stackR);
      A(g.stackR,1,bodyLeft+g.stackR,yj);
      A(g.stackR,1,bodyLeft,yj-g.stackR);
    }
  }
  L(bodyLeft,bodyTop+cr.TL);
  corner('TL',bodyLeft+cr.TL,bodyTop);
  segs.push({c:'Z'});

  const holes=[];
  if(g.hole){
    const h=g.hole;
    if(h.type==='square'){
      const q=h.s/2;
      holes.push([
        {c:'M',x:h.cx-q,y:h.cy-q},{c:'L',x:h.cx+q,y:h.cy-q},
        {c:'L',x:h.cx+q,y:h.cy+q},{c:'L',x:h.cx-q,y:h.cy+q},{c:'Z'},
      ]);
    }else{
      holes.push([
        {c:'M',x:h.cx+h.r,y:h.cy},
        {c:'A',r:h.r,sweep:1,x:h.cx-h.r,y:h.cy},
        {c:'A',r:h.r,sweep:1,x:h.cx+h.r,y:h.cy},
        {c:'Z'},
      ]);
    }
  }
  return {outline:segs,holes};
}

function segsToD(list){
  return list.map(x=>
    x.c==='M'?`M ${fmt(x.x)} ${fmt(x.y)}`:
    x.c==='L'?`L ${fmt(x.x)} ${fmt(x.y)}`:
    x.c==='A'?`A ${fmt(x.r)} ${fmt(x.r)} 0 0 ${x.sweep} ${fmt(x.x)} ${fmt(x.y)}`:'Z').join(' ');
}

function buildShape(params){
  const p={...DEFAULT_PARAMS,...params,
    corners:{...DEFAULT_PARAMS.corners,...(params.corners||{})},
    edge:{...DEFAULT_PARAMS.edge,...(params.edge||{})},
    sides:{...DEFAULT_PARAMS.sides,...(params.sides||{})},
    hole:{...DEFAULT_PARAMS.hole,...(params.hole||{})}};
  const g=resolve(p);
  const {outline,holes}=buildSegments(g);
  const d=[segsToD(outline),...holes.map(segsToD)].join(' ');
  const svg=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${g.W} ${g.H}" width="${g.W}" height="${g.H}"><path d="${d}" fill="${p.color}" fill-rule="evenodd"/></svg>`;
  return {d,svg,W:g.W,H:g.H,geo:g,params:p,outline,holes};
}

function pick(arr,rng){return arr[Math.floor(rng()*arr.length)];}
function randomParams(ratio,rng=Math.random){
  const p=JSON.parse(JSON.stringify(DEFAULT_PARAMS));
  p.ratio=ratio||pick(Object.keys(RATIOS),rng);
  p.color=pick(COLORS.slice(0,10),rng).hex;
  const first=pick(['corners','edge','sides'],rng);
  const two=rng()<0.55;
  let second=null;
  if(two)second=pick(['corners','edge','sides','hole','hole'].filter(c=>c!==first),rng);
  for(const cat of [first,second]){
    if(!cat)continue;
    if(cat==='corners')p.corners={style:pick(['round','chamfer'],rng),which:pick(['all','top','bottom'],rng),size:1+Math.floor(rng()*3)};
    if(cat==='edge'){
      const types=p.sides.type==='notch'?['bites','arch','bump']:['scallops','bites','arch','bump'];
      if(domeAvailable(p.ratio))types.push('dome');
      const type=pick(types,rng);
      const count=type==='scallops'?pick(validScallopCounts(p.ratio),rng):1+Math.floor(rng()*3);
      p.edge={type,side:pick(['top','bottom'],rng),count,size:1+Math.floor(rng()*3)};
    }
    if(cat==='sides'){const sOpts=p.edge.type==='scallops'?['pinch','tabs','stack']:['pinch','notch','tabs','stack'];p.sides={type:pick(sOpts,rng),count:2+Math.floor(rng()*3),size:1+Math.floor(rng()*3)};}
    if(cat==='hole')p.hole={type:rng()<0.65?'circle':'square',size:1+Math.floor(rng()*3)};
  }
  return p;
}

const PRESETS={
  Tag:{color:'#F8CCAC',corners:{style:'chamfer',which:'bottom',size:3},hole:{type:'circle',size:2}},
  Pinch:{color:'#F9E982',sides:{type:'pinch',size:3}},
  Bump:{color:'#A56C38',edge:{type:'bump',side:'bottom',count:1,size:3}},
  Scallop:{color:'#FA632B',edge:{type:'scallops',side:'bottom',count:3,size:2}},
  Arch:{color:'#B0CB43',edge:{type:'arch',side:'bottom',count:1,size:2}},
  Bowtie:{color:'#B5DBF4',sides:{type:'notch',size:2}},
  Dome:{color:'#A56C38',edge:{type:'dome',side:'top',count:1,size:2}},
  Pills:{color:'#A56C38',sides:{type:'stack',count:3,size:2}},
  Tabs:{color:'#A56C38',sides:{type:'tabs',size:2}},
};



export { RATIOS, COLORS, DEFAULT_PARAMS, PRESETS, buildShape, randomParams, validScallopCounts, domeAvailable, activeCategories };

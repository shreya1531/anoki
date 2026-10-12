(() => {
  'use strict';
  const story = document.querySelector('.see-reveal');
  const stage = document.querySelector('.see-stage');
  const canvas = document.querySelector('.sea-canvas');
  const image = document.querySelector('.sea-photograph img');
  if (!story || !stage || !canvas || !image) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const photo = document.querySelector('.sea-photograph');
  const title = document.querySelector('.sea-title');
  const caption = document.querySelector('.sea-caption');
  const ending = document.querySelector('.sea-ending');
  const jewel = document.querySelector('.sea-jewel');
  const chapterLabel = document.querySelector('.sea-chapter');
  const chapterCount = document.querySelector('.sea-count');
  const track = document.querySelector('.sea-track span');
  const progressBar = document.querySelector('.scroll-progress span');
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const chapters = [
    {at:0,label:'01 · The sea',title:'A rhythm in velvet.',copy:'Waves hold a thousand passing reflections.'},
    {at:.23,label:'02 · The movement',title:'Water finds its form.',copy:'A crest unfolds. A curve begins to catch the light.'},
    {at:.46,label:'03 · The setting',title:'A tide of brilliance.',copy:'Fluid gold and diamond follow the rhythm of the sea.'},
    {at:.79,label:'04 · The reveal',title:'The ocean, held in light.',copy:'Aquamarine droplets complete a luminous jewellery suite.'}
  ];
  const clamp = v => Math.max(0,Math.min(1,v));
  const range = (v,a,b) => {const t=clamp((v-a)/(b-a));return t*t*(3-2*t);};
  let width=1,height=1,current=-1,frame=0,inView=true;
  let smoothed=window.scrollY,lastFrame=0;
  function measure() {
    width=stage.clientWidth;height=stage.clientHeight;
    const dpr=Math.min(window.devicePixelRatio||1,2);
    canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  function setOpacity(element,value){if(element)element.style.opacity=String(value);}
  function showText(element,value){
    if(!element)return;
    element.style.opacity=String(value);
    element.style.visibility=value>.01?'visible':'hidden';
    element.inert=value<=.01;
  }
  function drawWaves(time,p) {
    ctx.clearRect(0,0,width,height);
    if(!image.complete || !image.naturalWidth || p>.9)return;
    // A real sea photograph ripples in horizontal strips. Its rolling crest
    // moves down the viewport with scroll, physically uncovering the jewel.
    const phase=motion.matches?0:time*.00048;
    const uncover=range(p,.28,.86);
    const front=height*(-.08+uncover*1.32);
    const amp=height*(.023+.012*(1-uncover));
    ctx.save();ctx.beginPath();ctx.moveTo(-20,height+20);
    ctx.lineTo(-20,front);
    for(let x=-20;x<=width+24;x+=12){
      const y=front+Math.sin(x/width*7.5+phase*2)*amp+Math.sin(x/width*13-phase)*amp*.32;
      ctx.lineTo(x,y);
    }
    ctx.lineTo(width+24,height+20);ctx.closePath();ctx.clip();
    const scale=Math.max(width/image.naturalWidth,height/image.naturalHeight)*1.12;
    const dw=image.naturalWidth*scale,dh=image.naturalHeight*scale;
    const dx=(width-dw)/2,dy=(height-dh)/2;
    for(let y=0;y<height;y+=5){
      const shift=motion.matches?0:Math.sin(y/height*11+phase*3)*10+Math.sin(y/height*23-phase*2)*3;
      const sy=Math.max(0,(y-dy)/scale);
      const sh=Math.min(6/scale,image.naturalHeight-sy);
      if(sh>0)ctx.drawImage(image,0,sy,image.naturalWidth,sh,dx+shift,y,dw,6);
    }
    ctx.restore();
  }
  function render(time) {
    frame=0;
    const target=window.scrollY;
    smoothed=motion.matches?target:window.AnokhiSmooth.step(smoothed,target,lastFrame?time-lastFrame:16.7);lastFrame=time;
    if(Math.abs(target-smoothed)<.3){smoothed=target;lastFrame=0;}
    const header=document.querySelector('.header');
    const top=story.getBoundingClientRect().top+target-(header?header.offsetHeight:0);
    const p=clamp((smoothed-top)/Math.max(1,story.offsetHeight-height));
    story.dataset.revealProgress=p.toFixed(3);
    setOpacity(photo,0);
    showText(title,1-range(p,.05,.15));
    showText(caption,range(p,.16,.23)*(1-range(p,.82,.89)));
    showText(ending,range(p,.88,.96));
    const visible=range(p,.26,.43);
    setOpacity(jewel,visible);
    if(track)track.style.transform=`scaleY(${p})`;
    if(progressBar)progressBar.style.transform=`scaleX(${target/Math.max(1,document.documentElement.scrollHeight-window.innerHeight)})`;
    const next=chapters.reduce((n,c,i)=>p>=c.at?i:n,0);
    if(next!==current){
      current=next;const c=chapters[next];
      if(caption){caption.querySelector('.eyebrow').textContent=c.label;caption.querySelector('h2').textContent=c.title;caption.querySelector('p:last-child').textContent=c.copy;}
      if(chapterLabel)chapterLabel.textContent=c.label;
      if(chapterCount)chapterCount.textContent=`0${next+1} / 04`;
    }
    drawWaves(time,p);
    if(!document.hidden && inView && (!motion.matches || smoothed!==target))frame=requestAnimationFrame(render);
  }
  function schedule(){if(!frame)frame=requestAnimationFrame(render);}
  if('IntersectionObserver' in window){new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;if(inView)schedule();},{rootMargin:'100px'}).observe(story);}
  window.addEventListener('resize',()=>{measure();schedule();});
  window.addEventListener('scroll',schedule,{passive:true});
  image.addEventListener('load',schedule);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)schedule();});
  motion.addEventListener('change',schedule);
  measure();schedule();
})();
'use strict';
// Native HTML, CSS and JavaScript. No installation or framework is required.
document.documentElement.classList.add('js');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const menu = document.querySelector('.menu-button');
const navigation = document.querySelector('#navigation');
function closeMenu() { navigation.classList.remove('open'); menu.setAttribute('aria-expanded','false'); menu.setAttribute('aria-label','Open menu'); menu.textContent='☰'; }
menu.addEventListener('click', () => { const open = navigation.classList.toggle('open'); menu.setAttribute('aria-expanded',String(open)); menu.setAttribute('aria-label',open?'Close menu':'Open menu'); menu.textContent=open?'×':'☰'; });
navigation.querySelectorAll('a').forEach(link => link.addEventListener('click',closeMenu));
document.addEventListener('keydown',event=>{if(event.key==='Escape')closeMenu();});
if ('IntersectionObserver' in window && !reducedMotion) {
 const observer = new IntersectionObserver(entries => entries.forEach(entry => { if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);} }),{threshold:0.1});
 document.querySelectorAll('.reveal').forEach(element=>observer.observe(element));
} else document.querySelectorAll('.reveal').forEach(element=>element.classList.add('visible'));
if (document.querySelector('.squeeze-gallery')) {
const selections = [
 {title:'The Solitaire.',description:'A quiet statement. An extraordinary centre. A diamond that needs nothing more.',category:'Ring'},
 {title:'The Pendant.',description:'A small signature, close to your heart. For the moments you carry with you.',category:'Pendant'},
 {title:'The Earring.',description:'Light in movement. Beautifully balanced drops, with a character all their own.',category:'Earrings'}
];
let selected=0;
const panels=Array.from(document.querySelectorAll('.jewel-panel'));
function setSelection(index){
 selected=(index+selections.length)%selections.length;
 panels.forEach((panel,i)=>{panel.classList.toggle('active',i===selected);panel.querySelector('button').setAttribute('aria-pressed',String(i===selected));});
 document.querySelector('#selection-count').textContent=`${String(selected+1).padStart(2,'0')} / 03`;
 document.querySelector('#selection-title').textContent=selections[selected].title;
 document.querySelector('#selection-description').textContent=selections[selected].description;
}
panels.forEach((panel,i)=>{
 panel.querySelector('button').addEventListener('click',()=>setSelection(i));
 panel.querySelector('button').addEventListener('focus',()=>setSelection(i));
 panel.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse')setSelection(i);});
});
document.querySelector('#selection-next').addEventListener('click',()=>setSelection(selected+1));
document.querySelector('#selection-prev').addEventListener('click',()=>setSelection(selected-1));
document.querySelector('#selection-enquiry').addEventListener('click',()=>{document.querySelector('[name="category"]').value=selections[selected].category;});
document.querySelector('.squeeze-gallery').addEventListener('keydown',event=>{if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();setSelection(selected+(event.key==='ArrowRight'?1:-1));panels[selected].querySelector('button').focus();}});
}
if ('IntersectionObserver' in window && !reducedMotion) {
 const lineObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');lineObserver.unobserve(entry.target);}}),{rootMargin:'0px 0px -18% 0px',threshold:.6});
 document.querySelectorAll('.belief-line').forEach(line=>lineObserver.observe(line));
} else document.querySelectorAll('.belief-line').forEach(line=>line.classList.add('visible'));

(function(){const c=document.createElement("link").relList;if(c&&c.supports&&c.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))o(t);new MutationObserver(t=>{for(const r of t)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&o(a)}).observe(document,{childList:!0,subtree:!0});function n(t){const r={};return t.integrity&&(r.integrity=t.integrity),t.referrerPolicy&&(r.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?r.credentials="include":t.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function o(t){if(t.ep)return;t.ep=!0;const r=n(t);fetch(t.href,r)}})();function S(){const e=document.querySelectorAll(".js-study-button"),c=document.querySelectorAll(".js-study-section"),n=()=>{const o=window.innerHeight;c.forEach(t=>{const r=t.getBoundingClientRect(),a=t.getAttribute("id");e.forEach(i=>{i.getAttribute("data-scroll-to")===a&&(r.top<=o/2&&r.bottom>=o/2?i.classList.add("study-active-button"):i.classList.remove("study-active-button"))})})};window.addEventListener("scroll",n),n(),e.forEach(o=>{o.addEventListener("click",()=>{const t=o.getAttribute("data-scroll-to"),r=document.getElementById(t);r&&window.scrollTo({top:r.offsetTop-100,behavior:"smooth"})})})}const A=e=>String(Math.floor(e/1e6)),D=async()=>{const e=document.querySelector(".js-market-cap"),c=document.querySelector(".js-volume"),n=document.querySelector(".js-holders");if(!(!e||!c||!n))try{const t=await(await fetch("https://clicker-api.joincommunity.xyz/site/proxy")).json();if(!t.ok)return;const{data:{marketCapData:{marketCap:r},transactionsData:{txsStats:a},addressesData:{addressesStats:i}}}=t,[{marketCapUSD:s}]=r,[{totalVolumeUSD:u}]=a,[{totalWithBalance:f}]=i;e.innerHTML=`$${A(s)}M`,c.innerHTML=`$${A(u)}M`,n.innerHTML=`${(f/1e6).toFixed(1).replace(".",",")}M`}catch(o){console.error("Error fetching data:",o)}};function P(e,c,n){const a=(n-c)/36;let i=c;const s=setInterval(()=>{i=i+a,e.innerHTML=Math.round(i).toLocaleString(),i>=n&&(e.innerHTML=n.toLocaleString(),clearInterval(s))},600/36)}const b=()=>{const e=document.querySelector(".js-nums-counter");if(!e)return;const c=parseInt(e.innerHTML.replace(/,/g,"")),n=103e5,o=()=>{const t=window.innerHeight;e.getBoundingClientRect().top<=t/2&&(P(e,c,n),window.removeEventListener("scroll",o))};window.addEventListener("scroll",o)};function l(){return/Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)}const E=l()?128:512,T=200,R=new Float32Array([-1,-1,1,-1,-1,1,1,1]),w=new Uint8Array([7,7,7,31,31,31,47,47,47,71,71,71,87,87,87,103,103,103,119,119,119,143,143,143,159,159,159,175,175,175,191,191,191,199,199,199,207,207,207,223,223,223,239,239,239,255,255,255]),p=w.length/3,h={vert:`precision mediump float;
attribute vec2 a_point;
varying   vec2 v_point;
void main() {
    v_point = (a_point + 1.0) / 2.0;
    gl_Position = vec4(a_point, 0, 1);
}`,frag:`precision mediump float;
uniform sampler2D u_state;
uniform sampler2D u_palette;
varying vec2 v_point;
void main() {
    float v = texture2D(u_state, v_point).r;
    vec4 color = texture2D(u_palette, vec2(v, 0));
    gl_FragColor = vec4(color);
}`},v={vert:`precision mediump float;
attribute vec2 a_point;
varying   vec2 v_point;
void main() {
    v_point = (a_point + 1.0) / 2.0;
    gl_Position = vec4(a_point, 0, 1);
}`,frag:`precision mediump float;
uniform sampler2D u_state;
uniform float u_temperature;
uniform float u_flame_height;
uniform vec4 u_random;
varying vec2 v_point;

float get(vec2 p) {
    float depth = float(${p-1});
    vec2 scale = vec2(${E-1}, ${T-1});
    return floor(texture2D(u_state, p / scale).r * depth + 0.5);
}

float rand(vec2 s) {
    s += v_point;
    float a = sin(dot(v_point + s, vec2(12.9898, 78.233)));
    return fract(fract(a * 41.0744) * 86.9083);
}

void main() {
    vec2 scale = vec2(${E-1}, ${T-1});
    vec2 pos = floor(v_point * scale + 0.5);
    if (pos.y == 0.0) {
        gl_FragColor = vec4(u_temperature, 0, 0, 0);
    } else {
        float dx = floor(rand(u_random.xy) * 3.0) - 1.0;
        float dy = floor(rand(u_random.zw) * 3.0) - 2.0;
        float r  = floor(rand(u_random.wx) + 1.0 - u_flame_height);
        float v = get(pos + vec2(dx, dy)) - r;
        float depth = float(${p-1});
        gl_FragColor = vec4(v / depth, 0, 0, 0);
    }
}`};function U(e,c,n){let o=e.createShader(e.VERTEX_SHADER);e.shaderSource(o,c);let t=e.createShader(e.FRAGMENT_SHADER);if(e.shaderSource(t,n),e.compileShader(o),!e.getShaderParameter(o,e.COMPILE_STATUS))throw new Error(e.getShaderInfoLog(o));if(e.compileShader(t),!e.getShaderParameter(t,e.COMPILE_STATUS))throw new Error(e.getShaderInfoLog(t));let r=e.createProgram();if(e.attachShader(r,o),e.attachShader(r,t),e.linkProgram(r),!e.getProgramParameter(r,e.LINK_STATUS))throw new Error(e.getProgramInfoLog(r));e.deleteShader(o),e.deleteShader(t);let a={program:r},i=e.getProgramParameter(r,e.ACTIVE_ATTRIBUTES);for(let u=0;u<i;u++){let f=e.getActiveAttrib(r,u).name;a[f]=e.getAttribLocation(r,f)}let s=e.getProgramParameter(r,e.ACTIVE_UNIFORMS);for(let u=0;u<s;u++){let f=e.getActiveUniform(r,u).name;a[f]=e.getUniformLocation(r,f)}return a}function y(e){let c=e.createBuffer();e.bindBuffer(e.ARRAY_BUFFER,c),e.bufferData(e.ARRAY_BUFFER,R,e.STATIC_DRAW);let n=e.createTexture();e.bindTexture(e.TEXTURE_2D,n),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.REPEAT),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,E,T,0,e.RGBA,e.UNSIGNED_BYTE,null);let o=e.createTexture();e.bindTexture(e.TEXTURE_2D,o),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.REPEAT),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texImage2D(e.TEXTURE_2D,0,e.RGBA,E,T,0,e.RGBA,e.UNSIGNED_BYTE,null);let t=e.createTexture();e.bindTexture(e.TEXTURE_2D,t),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_S,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_WRAP_T,e.CLAMP_TO_EDGE),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MIN_FILTER,e.NEAREST),e.texParameteri(e.TEXTURE_2D,e.TEXTURE_MAG_FILTER,e.NEAREST),e.texImage2D(e.TEXTURE_2D,0,e.RGB,p,1,0,e.RGB,e.UNSIGNED_BYTE,w);let r=e.createFramebuffer(),a=U(e,v.vert,v.frag),i=U(e,h.vert,h.frag);e.bindTexture(e.TEXTURE_2D,null),e.bindBuffer(e.ARRAY_BUFFER,null);let s={temperature:1,flame_height:.75,update:function(){e.useProgram(a.program),e.uniform1f(a.u_temperature,s.temperature),e.uniform1f(a.u_flame_height,s.flame_height),e.uniform4f(a.u_random,Math.random(),Math.random(),Math.random(),Math.random()),e.bindFramebuffer(e.FRAMEBUFFER,r),e.framebufferTexture2D(e.FRAMEBUFFER,e.COLOR_ATTACHMENT0,e.TEXTURE_2D,o,0),e.viewport(0,0,E,T),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,n),e.uniform1i(a.u_state,0),e.enableVertexAttribArray(i.a_point),e.bindBuffer(e.ARRAY_BUFFER,c),e.vertexAttribPointer(i.a_point,2,e.FLOAT,!1,0,0),e.drawArrays(e.TRIANGLE_STRIP,0,R.length/2),e.bindFramebuffer(e.FRAMEBUFFER,null),e.bindBuffer(e.ARRAY_BUFFER,null),e.useProgram(null),[n,o]=[o,n]},render:function(){e.clear(e.COLOR_BUFFER_BIT),e.viewport(0,0,e.drawingBufferWidth,e.drawingBufferHeight),e.useProgram(i.program),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,n),e.uniform1i(i.u_state,0),e.activeTexture(e.TEXTURE1),e.bindTexture(e.TEXTURE_2D,t),e.uniform1i(i.u_palette,1),e.enableVertexAttribArray(i.a_point),e.bindBuffer(e.ARRAY_BUFFER,c),e.vertexAttribPointer(i.a_point,2,e.FLOAT,!1,0,0),e.drawArrays(e.TRIANGLE_STRIP,0,R.length/2),e.bindBuffer(e.ARRAY_BUFFER,null),e.useProgram(null)},clear:function(){e.bindTexture(e.TEXTURE_2D,n),e.texSubImage2D(e.TEXTURE_2D,0,0,0,E,T,e.RGBA,e.UNSIGNED_BYTE,new Uint8Array(E*T*4)),e.bindTexture(e.TEXTURE_2D,null)},destroy:function(){e.deleteProgram(a.program),e.deleteProgram(i.program),e.deleteBuffer(c),e.deleteTexture(n),e.deleteTexture(o),e.deleteTexture(t),e.deleteFramebuffer(r)}};return s}(function(){let e=document.querySelector("canvas");if(!e)return;let c=e.getContext("webgl"),n=new y(c),o=!1,t=!1,r=1e3/70,a=0;const i=document.getElementById("burn-title");function s(x){const d=x.getBoundingClientRect(),m=window.innerHeight||document.documentElement.clientHeight,_=window.innerWidth||document.documentElement.clientWidth;return d.top<m*.25&&d.bottom>0&&d.left<_&&d.right>0}function u(){s(i)?(o=!0,e.style.opacity="1"):o&&(e.style.opacity="0",window.removeEventListener("scroll",u))}window.addEventListener("scroll",u);function f(x){let d=window.innerWidth,m=window.innerHeight;if((e.width!=d||e.height!=m)&&(e.width=d,e.height=m,t=!0),o){let _=Date.now();_-a>r&&(n.update(),t=!0,a=_)}t&&(n.render(),t=!1),window.requestAnimationFrame(f)}window.requestAnimationFrame(f)})();S();D();b();

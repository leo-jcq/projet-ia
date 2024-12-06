var M=Object.defineProperty;var S=(l,e,t)=>e in l?M(l,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):l[e]=t;var a=(l,e,t)=>S(l,typeof e!="symbol"?e+"":e,t);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const n of s)if(n.type==="childList")for(const r of n.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&i(r)}).observe(document,{childList:!0,subtree:!0});function t(s){const n={};return s.integrity&&(n.integrity=s.integrity),s.referrerPolicy&&(n.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?n.credentials="include":s.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function i(s){if(s.ep)return;s.ep=!0;const n=t(s);fetch(s.href,n)}})();var _=(l=>(l.Easy="easy",l.Medium="medium",l.Hard="hard",l))(_||{});const C={easy:{size:10,nbMines:10},medium:{size:18,nbMines:40},hard:{size:24,nbMines:99}},w=_.Easy,b=100,m=0,y=500;var c=(l=>(l.Discover="d",l.Mark="m",l))(c||{});const k={d:"Découverte",m:"Marquage"};var o=(l=>(l.Covered="covered",l.Marked="marked",l.Discovered="discovered",l))(o||{});function u(l){return new Promise(e=>setTimeout(e,l))}class G{constructor(e){a(this,"_hasMine");a(this,"_state");a(this,"nbMinesAround");this._hasMine=e,this._state=o.Covered,this.nbMinesAround=0}get hasMine(){return this._hasMine}get state(){return this._state}discover(){this._state===o.Covered&&(this._state=o.Discovered)}toggleMarked(){this._state!==o.Discovered&&(this._state=this._state===o.Marked?o.Covered:o.Marked)}toString(){switch(this._state){case o.Covered:return"  ";case o.Marked:return"🚩";case o.Discovered:return this._hasMine?"💣":`${this.nbMinesAround} `}}toHtml(e,t){const i="game-cell";let s=`${i} ${i}--${this._state}`;return this._state===o.Discovered&&(s+=` ${i}--${this._hasMine?"mine":this.nbMinesAround}`),`
        <button class="${s}" data-row="${e}" data-column="${t}">
            ${this.toString().trim().replace("0","")}
        </button>
        `}}class z{constructor(e){a(this,"_size");a(this,"_nbMines");a(this,"_cells");const{size:t,nbMines:i}=C[e];this._size=t,this._nbMines=i,this._cells=[],this.initCells(),this.calculateNbMinesAround()}initCells(){let e=this._nbMines,t=this.nbCells;for(let i=0;i<this._size;i++){const s=[];for(let n=0;n<this._size;n++){let r=!1;const h=e/t;Math.random()<h&&(r=!0,e--),s.push(new G(r)),t--}this._cells.push(s)}}calculateNbMinesAround(){for(let e=0;e<this._size;e++)for(let t=0;t<this._size;t++){const i=this._cells[e][t];this.forEachNeighbors({row:e,column:t},(s,n)=>{n.hasMine&&i.nbMinesAround++})}}getCell(e){var t;return(t=this._cells[e.row])==null?void 0:t[e.column]}forEachNeighbors(e,t){const{row:i,column:s}=e;for(let n=i-1;n<=i+1;n++)for(let r=s-1;r<=s+1;r++){const h={row:n,column:r},d=this.getCell(h);d&&t(h,d)}}discoverNeighbors(e){this._cells[e.row][e.column].nbMinesAround===0&&this.forEachNeighbors(e,(i,s)=>{s.state!==o.Discovered&&(s.discover(),this.discoverNeighbors(i))})}get size(){return this._size}get nbCells(){return this._size*this._size}get nbMines(){return this._nbMines}get cells(){return this._cells}get nbMinesLeft(){const e=this._cells.flat().filter(t=>t.state===o.Marked);return this.nbMines-e.length}get isWin(){return this._cells.flat().every(e=>e.hasMine&&e.state!==o.Discovered||!e.hasMine&&e.state===o.Discovered)}get isLoose(){return this._cells.flat().some(e=>e.state===o.Discovered&&e.hasMine)}get isEnd(){return this.isWin||this.isLoose}performAction(e){const{coordinates:t,type:i}=e,s=this.getCell(t);if(!s)throw new Error(`Aucune cellule aux coordonnées (${t.row}, ${t.column}).`);switch(i){case c.Discover:s.discover(),!s.hasMine&&s.state===o.Discovered&&this.discoverNeighbors(t);break;case c.Mark:s.toggleMarked();break}}toString(){let e="";e+=this.printColNumbers();for(let t=0;t<this._size;t++)e+=this.lineHeaderToString()+this.printRowNumber(t)+this.printCells(t);return e+=this.lineHeaderToString(),e}lineHeaderToString(){let e="   -";for(let t=0;t<this._size;t++)e+="---";return e+=`
`,e}printColNumbers(){let e="  ";for(let t=0;t<this._size;t++){const i=t+1;i<10?e+=`  ${i}`:e+=`  ${i}`}return e+=`
`,e}printRowNumber(e){let t="";const i=e+1;return i<10?t+=` ${i}`:t+=i,t+=" ",t}printCells(e){let t="|";for(let i=0;i<this._size;i++)t+=`${this._cells[e][i].toString()}|`;return t+=`
`,t}toHtml(){let e="";e+='<span class="grid-number"></span>';for(let t=0;t<this._size;t++)e+=`<span class="grid-number">${t+1}</span>`;for(let t=0;t<this._size;t++){e+=`<span class="grid-number">${t+1}</span>`;for(let i=0;i<this._size;i++)e+=this.cells[t][i].toHtml(t,i)}return e}}class p{constructor(e,t,i,s,n){a(this,"grid");a(this,"_knownGrid");a(this,"_delay");a(this,"showFullSolving");a(this,"_continueSolve");a(this,"_gameGrid");a(this,"_history");this.grid=new z(e),this._knownGrid=[],this._delay=t,this.showFullSolving=i,this._continueSolve=!0,this._gameGrid=s,this._history=n,this.initializeKnownGrid()}initializeKnownGrid(){for(let e=0;e<this.grid.size;e++){this._knownGrid[e]=[];for(let t=0;t<this.grid.size;t++)this._knownGrid[e][t]={state:o.Covered}}}updateKnownGrid(){for(let e=0;e<this.grid.size;e++)for(let t=0;t<this.grid.size;t++){const i=this.grid.cells[e][t],s=this._knownGrid[e][t];s.state=i.state,i.state===o.Discovered&&(s.nbMinesAround=i.nbMinesAround)}}getNeighbors(e){const{row:t,column:i}=e,s=[];for(let n=t-1;n<=t+1;n++)for(let r=i-1;r<=i+1;r++)n>=0&&n<this.grid.size&&r>=0&&r<this.grid.size&&s.push({row:n,column:r});return s}async findSafeAction(){for(let e=0;e<this.grid.size;e++)for(let t=0;t<this.grid.size;t++){this.showFullSolving&&this.display({row:e,column:t});const i=this._knownGrid[e][t];if(i.state===o.Discovered&&i.nbMinesAround!==void 0){const s=this.getNeighbors({row:e,column:t}),n=s.filter(h=>this._knownGrid[h.row][h.column].state===o.Covered);if(n.length===0)continue;const r=s.filter(h=>this._knownGrid[h.row][h.column].state===o.Marked);if(r.length===i.nbMinesAround)return{type:c.Discover,coordinates:n[0]};if(n.length===i.nbMinesAround-r.length)return{type:c.Mark,coordinates:n[0]};this.showFullSolving&&await u(this._delay)}}return null}async findLeastRiskyMove(){const e=[],t=this._knownGrid.flat(),i=t.filter(r=>r.state===o.Covered),s=t.filter(r=>r.state===o.Marked),n=i.length===0?0:(this.grid.nbMinesLeft-s.length)/i.length;for(let r=0;r<this.grid.size;r++)for(let h=0;h<this.grid.size;h++){if(this.showFullSolving&&this.display({row:r,column:h}),this._knownGrid[r][h].state===o.Covered){const d={row:r,column:h},f=await this.calculateMineProbability(d,n);e.push({coordinates:d,probability:f})}this.showFullSolving&&await u(this._delay)}return e.length===0?null:(e.sort((r,h)=>r.probability-h.probability),{type:c.Discover,coordinates:e[0].coordinates})}async calculateMineProbability(e,t){this.showFullSolving&&(await u(this.delay),this.display(e));const i=this.getNeighbors(e).filter(r=>this._knownGrid[r.row][r.column].state===o.Discovered);if(i.length===0)return t;let s=0,n=0;for(const r of i){this.showFullSolving&&(await u(this.delay),this.display(e));const h=this._knownGrid[r.row][r.column];if(h.nbMinesAround!==void 0){const d=this.getNeighbors(r),f=d.filter(g=>this._knownGrid[g.row][g.column].state===o.Covered),v=d.filter(g=>this._knownGrid[g.row][g.column].state===o.Marked);s+=Math.max(0,h.nbMinesAround-v.length),n+=f.length}}return n>0?s/n:t}displayAction(e){if(!this._history)return;const{coordinates:t,type:i}=e,s=k[i],n=`(${t.row+1}, ${t.column+1})`;this._history.textContent+=`${s} de la case ${n}
`}get delay(){return this._delay}set delay(e){e>=m&&e<y&&(this._delay=e)}display(e){if(this._gameGrid){if(this._gameGrid.innerHTML=this.grid.toHtml(),e){const t=document.querySelector(`.game-cell[data-row="${e.row}"][data-column="${e.column}"]`);t&&t.classList.add("game-cell--current")}}else console.clear(),console.log(this.grid.toString())}stopSolving(){this._continueSolve=!1}async solve(){const e={coordinates:{row:0,column:0},type:c.Discover};for(this.display(this.showFullSolving?e.coordinates:void 0),this.grid.performAction(e),this.display(this.showFullSolving?e.coordinates:void 0);!this.grid.isEnd&&this._continueSolve;){this.updateKnownGrid();let t=await this.findSafeAction();if(!t&&(t=await this.findLeastRiskyMove(),!t))break;this.showFullSolving&&this.display(t.coordinates),this.grid.performAction(t),this.displayAction(t),this.showFullSolving&&this.display(t.coordinates),this.display(),await u(this._delay)}if(this.grid.isWin){for(let t=0;t<this.grid.size;t++)for(let i=0;i<this.grid.size;i++)if(this._knownGrid[t][i].state===o.Covered){const n={coordinates:{row:t,column:i},type:c.Mark};this.grid.performAction(n),this.display(),this.displayAction(n),await u(this._delay)}}}}class D{constructor(){a(this,"_bot");a(this,"_gameGrid");a(this,"_history");a(this,"_difficultySelect");a(this,"_delayInput");a(this,"_delayLabel");a(this,"_showFullInput");a(this,"_newGameBtn");a(this,"_startGameBtn");a(this,"_gameOverMessage");a(this,"_isSolving");this._gameGrid=document.getElementById("game-grid"),this._history=document.getElementById("history"),this._newGameBtn=document.getElementById("new-game"),this._startGameBtn=document.getElementById("start-game"),this._gameOverMessage=document.getElementById("game-over-message"),this._difficultySelect=document.getElementById("difficulty-select"),this._difficultySelect.value=w,this._delayInput=document.getElementById("delay-input"),this._delayInput.value=b.toString(),this._delayInput.min=m.toString(),this._delayInput.max=y.toString(),this._delayLabel=document.getElementById("delay-input-label"),this.displayDelay(),this._showFullInput=document.getElementById("show-full-input"),this._bot=new p(this.getCurrentDifficulty(),parseInt(this._delayInput.value),this._showFullInput.checked,this._gameGrid,this._history),this._isSolving=!1,this.initEventListeners(),this._gameGrid.style.setProperty("--grid-size",this._bot.grid.size.toString()),this._bot.display()}getCurrentDifficulty(){switch(this._difficultySelect.value){case _.Easy:case _.Medium:case _.Hard:break;default:this._difficultySelect.value=w;break}return this._difficultySelect.value}initEventListeners(){this._difficultySelect.addEventListener("change",this.newGame.bind(this)),this._delayInput.addEventListener("input",this.handleDelayChange.bind(this)),this._showFullInput.addEventListener("change",this.handleShowFullChange.bind(this)),this._newGameBtn.addEventListener("click",this.newGame.bind(this)),this._startGameBtn.addEventListener("click",this.startGame.bind(this))}newGame(){this._bot.stopSolving(),this._bot=new p(this.getCurrentDifficulty(),parseInt(this._delayInput.value),this._showFullInput.checked,this._gameGrid,this._history),this._gameGrid.style.setProperty("--grid-size",this._bot.grid.size.toString()),this._gameOverMessage.style.display="none",this._history.textContent="",this._bot.display()}handleDelayChange(){let e=parseInt(this._delayInput.value);(isNaN(e)||e<m||e>y)&&(e=b,this._delayInput.value=e.toString()),this.displayDelay(),this._bot.delay=e}displayDelay(){this._delayLabel.textContent=`Délais : ${this._delayInput.value}ms`}handleShowFullChange(){this._bot.showFullSolving=this._showFullInput.checked}async startGame(){this._gameOverMessage.style.display="none",this._isSolving||(this._isSolving=!0,await this._bot.solve(),this._isSolving=!1,this._bot.grid.isEnd?this._bot.grid.isWin?this._gameOverMessage.textContent="Gagné":this._gameOverMessage.textContent="Perdu":this._gameOverMessage.textContent="Impossible de résoudre complètement la grille",this._gameOverMessage.style.display="block",this._bot.display())}}document.addEventListener("DOMContentLoaded",()=>{new D});

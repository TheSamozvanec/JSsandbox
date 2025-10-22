'use strict'

const settings={
select:true, // выделение снипета
description:true, // описание снипета
closeSnip:true, // закрыть после вывода
};


let stop = false;
const monitor=document.getElementById('monitor');
const print = function (...rest){
    let res='';
    for (let str of rest){
        res+=str+'\n';
    }
    monitor.innerHTML+=res
}
const cls = function () {monitor.textContent=''}

function printObj(obj) {
 for(let i in obj){  
  monitor.innerHTML +='<b>'+i+': </b>'+obj[i]+'<br>'
  }
 }

function run (){
    if (stop)return
    cls();
    try{
        if (code.value.trim()) {
            eval(code.value)
        } else {throw new Error ('нет кода!!!')}
    } catch(err){
        print(err)
    }
}
;(function (){
    let code=document.getElementById('code');
    let btLoad=document.getElementById('load');
    let btSave=document.getElementById('save');
    let btLocal=document.getElementById('local');
    let btRun=document.getElementById('run');
    let btCode=document.getElementById('cmd');
    let dvKeyboard=document.getElementById('keyboard');
    let file=document.getElementById('file');
    let btClsCode=document.getElementById('clsCode');
    let local = localStorage.getItem('sandboxJSv2.0');
    let keyboardActive=false;
    
    file.value='NewFile-'+String((new Date()).getTime())+'.js';
    if (local) code.value=local;

    function save(){
        let blob = new Blob ([code.value], {type:'text/plain; charset=utf-8'});
        let link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = file.value;
        link.click();
    }

    function load(){
        print(`загружен файл: ${this.value.replace('C:\\fakepath\\','')}`);
        let reader = new FileReader();
        reader.onload = function(event) {
            code.value=event.target.result;
            local=code.value;
        }
        reader.readAsText(this.files[0]);
    }

    function clsCode(){code.value=''}

    function test(){
        cls();
        local=code.value;
        try {
            new Function(code.value); 
            print("Код синтаксически верен.");
            btRun.classList.remove('err');
            stop=false;
        } catch (err) {
            btRun.classList.add('err');
            stop=true;
            if (err instanceof SyntaxError) {
                print("Ошибка синтаксиса:", err.message);
            } else {
                 print(err)
            }  
        }
    }
    function keyboard(){
        btCode.classList.toggle('active');
        keyboardActive=!keyboardActive;
       if(keyboardActive) {
            dvKeyboard.hidden=false;
        } else {
            dvKeyboard.hidden=true;
        };  
    }
    btSave.addEventListener('click', save);
    btLoad.addEventListener('change', load);
    btClsCode.addEventListener('click',clsCode);
    btRun.addEventListener('click', run); 
    code.addEventListener('input', test);
    btLocal.addEventListener('click',()=>{
        cls();
        print('local storage:','_____________',local); 
        localStorage.setItem('sandboxJSv2.0',local);
    });
    btCode.addEventListener('click',keyboard);
    test();



    //keyboard________________________________________________
    let cursor=0;
    let levelOne = [
        {key:'let', fn:()=>{paste('let','Объявление переменной')}},
        {key:'con', fn:()=>{paste('const','Объявление константы')}},
        {key:'fnc', fn:()=>{paste('function name( ) { }',
            'Объявление функции function declaration\nСтоит помнить о существовании  function expression\n const fn=function() {}\nи стрелочных функций ()=>, не имеющих контекста')}},
        //{key:'gen', fn:()=>{paste(`\nfunction *name(){\n\tyield 1;\n\tyield 2;\n\tyield 3\n}\n;let iter=name()`)}, bg:'green'}, 
        {key:'itr', fn:()=>{paste(`[Symbol.iterator]=function *(){\n\tfor (let key in this){\n\t\tyield this[key];\n\t}\n}\n`,
            'Symbol.iterator встроен во все итерируемые объекты (for of)\nлн служет методом итерации в цикле и через [...]\nв случае необходимости можно встроить его в объект с применением дополнительной обработки ' )}, bg:'green'}, 
        {br:true},
        {key:'for', fn:()=>{paste('for(let i=0; i<10; i++){  }')}},
        {key:'f of', fn:()=>{paste('for(let i of array){  }')}},
        {key:'f in', fn:()=>{paste('for(let i in obj){  }')}},
        {key:'whi', fn:()=>{paste('while (i!=10){  }')}},
        {key:'bre', fn:()=>{paste('break')}},
        {key:'ctn', fn:()=>{paste('continue')}},
        {br:true},
        {key:'if', fn:()=>{paste('if(  ) {  }')}},
        {key:'ife', fn:()=>{paste('if(  ) {\n  \n} else {  }')}, bg:'green'},
        {key:'swt', fn:()=>{paste('switch (int){\n\tcase 1:\n\n\tbreak;\n\tcase 2:\n\n\tbreak; \n\tcase 3:\n\n\tbreak; \n}')}, bg:'green'},
        {key:'and', fn:()=>{paste('&&')}},
        {key:'or', fn:()=>{paste('||')}},
        {key:'type', fn:()=>{paste('typeof')}},
        {key:'num', fn:()=>{paste('Number(  )')}},
        {key:'prI', fn:()=>{paste('parseInt( \'str\' )')}},
        {key:'prF', fn:()=>{paste('parseFloat( \'str\' )')}},
        {key:'str', fn:()=>{paste('String(  )')}},
        {key:'boo', fn:()=>{paste('Boolean(  )')}},
        {br:true}, 
        {key:'obj', fn:()=>{
            paste('Object.','',true);
            defineKeyboard(levelObject);
        }, bg:'blue'}, 
        {key:'arr', fn:()=>{
            paste('Array.','',true);
            defineKeyboard(levelArray);
        }, bg:'blue'},
        {key:'del', fn:()=>{paste('delete')}},
        {key:'tr-c', fn:()=>{paste('try {\n\n}catch(err){\n\n}')},bg:'green'},
        {key:'trw', fn:()=>{paste('throw new Error(\'  \')')}},
        {key:'new', fn:()=>{paste('new')}},
        {key:'cla', fn:()=>{paste('class')}},
        {key:'ext', fn:()=>{paste('extends')}},

    ]
    let levelObject=[
        {key:'key',fn:()=>{
            paste('keys(  )');
            defineKeyboard(levelOne);
        }, bg:'red'},
        {key:'val',fn:()=>{
            paste('values(  )');
            defineKeyboard(levelOne);
        }, bg:'red'},
        {key:'ent',fn:()=>{
            paste('entries(  )');
            defineKeyboard(levelOne);
        }, bg:'red'},
        {key:'asi',fn:()=>{
            paste('assign(target, src1, src2 )');
            defineKeyboard(levelOne);
        }, bg:'red'},
        {key:'def',fn:()=>{
            paste('defineProperty(obj, \'prop\',{writable: false})');
            defineKeyboard(levelOne);
        }, bg:'red'},
        {key:'frz',fn:()=>{
            paste('freeze(  )');
            defineKeyboard(levelOne);
        }, bg:'red'},
        {key:'seal',fn:()=>{
            paste('seal(  )');
            defineKeyboard(levelOne);
        }, bg:'red'},
        {key:'prE',fn:()=>{
            paste=('preventExtensions(  )');
            defineKeyboard(levelOne);
        }, bg:'red'},

    ]
    let levelArray = [
       {key:'isArray',fn:()=>{
            paste('isArray(  )');
            defineKeyboard(levelOne);
        }, bg:'red'}, 
        {key:'of',fn:()=>{
            paste('of(  )');
            defineKeyboard(levelOne);
        }, bg:'red'},
        {key:'from',fn:()=>{
            paste('from(  )');
            defineKeyboard(levelOne);
        }, bg:'red'},
    ]

    defineKeyboard(levelOne);
    function position(){cursor=code.selectionStart}
    function paste(v,d,opt){
        let txt=code.value;
        code.value=txt.substring(0,cursor)+v+txt.substring(cursor);
        code.focus();
        code.selectionStart = settings.select&&!opt? cursor:cursor+v.length;
        code.selectionEnd = cursor+v.length;
        cursor=cursor+v.length
        if (settings.description && d)print(d)
        if (settings.closeSnip && !opt) keyboard();
    }
    function defineKeyboard(level){
        dvKeyboard.innerHTML='';
        for (let key of level){
            if (key.br){
                dvKeyboard.appendChild(document.createElement('br'));
                continue;
            }
            let bt=document.createElement('button');
            bt.innerHTML=key.key;
            if(key.bg) bt.style.background=key.bg;
            bt.addEventListener('click',key.fn)
            dvKeyboard.appendChild(bt);
        }
    }
    code.addEventListener('mouseup',()=>setTimeout(position,0));
    code.addEventListener('keydown',()=>setTimeout(position,0));
})()
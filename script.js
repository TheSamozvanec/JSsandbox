'use strict'
let stop = false;
const monitor=document.getElementById('monitor');
const print = function (...rest){
    let res='';
    for (let str of rest){
        res+=str+'\n';
    }
    monitor.textContent+=res
}
const cls = function () {monitor.textContent=''}
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
(function (){
    let code=document.getElementById('code');
    let btLoad=document.getElementById('load');
    let btSave=document.getElementById('save');
    let btLocal=document.getElementById('local');
    let btRun=document.getElementById('run');
    let btCode=document.getElementById('cmd');
    let dvKeyboard=document.getElementById('keyboard');
    let file=document.getElementById('file');
    let btClsCode=document.getElementById('clsCode');
    let local = localStorage.getItem('sandboxJSv1.0');
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
        this.classList.toggle('active');
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
        localStorage.setItem('sandboxJSv1.0',local);
    });
    btCode.addEventListener('click',keyboard);
    test();



    //keyboard________________________________________________
    let levelOne = [
        {key:'let', fn:()=>{code.value+='let'}},
        {key:'con', fn:()=>{code.value+='const'}},
        {key:'fnc', fn:()=>{code.value+='function name( ) { }'}},
        //{key:'gen', fn:()=>{code.value+=`\nfunction *name(){\n\tyield 1;\n\tyield 2;\n\tyield 3\n}\n;let iter=name()`}}, 
        {key:'itr', fn:()=>{code.value+=`[Symbol.iterator]=function *(){\n\tfor (let key in this){\n\t\tyield this[key];\n\t}\n}`}, bg:'green'}, 
        {key:'for', fn:()=>{code.value+='for(let i=0; i<10; i++){  }'}},
        {key:'f of', fn:()=>{code.value+='for(let i of array){  }'}},
        {key:'f in', fn:()=>{code.value+='for(let i in obj){  }'}},
        {key:'whi', fn:()=>{code.value+='while (i!=10){  }'}},
        {key:'bre', fn:()=>{code.value+='break'}},
        {key:'ctn', fn:()=>{code.value+='continue'}},
        {key:'if', fn:()=>{code.value+='if(  ) {  }'}},
        {key:'ife', fn:()=>{code.value+='if(  ) {\n  \n} else {  }'}, bg:'green'},
        {key:'swt', fn:()=>{code.value+='switch (int){\n\tcase 1:\n\n\tbreak;\n\tcase 2:\n\n\tbreak; \n\tcase 3:\n\n\tbreak; \n}'}, bg:'green'},
        {key:'type', fn:()=>{code.value+='typeof'}},
        {key:'del', fn:()=>{code.value+='delete'}},
        {key:'num', fn:()=>{code.value+='Number(  )'}},
        {key:'str', fn:()=>{code.value+='String(  )'}},
        {key:'boo', fn:()=>{code.value+='Boolean(  )'}},
        {key:'prI', fn:()=>{code.value+='parseInt( \'str\' )'}},
        {key:'prF', fn:()=>{code.value+='parseFloat( \'str\' )'}},
        {key:'and', fn:()=>{code.value+='&&'}},
        {key:'or', fn:()=>{code.value+='||'}},
        {key:'obj', fn:()=>{
            code.value+='Object.';
            defineKeyboard(levelObject);
        }, bg:'blue'}, 
        {key:'arr', fn:()=>{
            code.value+='Array.';
            defineKeyboard(levelArray);
        }, bg:'blue'},
        {key:'tr-c', fn:()=>{code.value+='try {\n\n}catch(err){\n\n}'},bg:'green'},
        {key:'trw', fn:()=>{code.value+='throw new Error(\'  \')'}},
        //{key:'new', fn:()=>{code.value+='new'}},
        {key:'cla', fn:()=>{code.value+='class'}},
        {key:'ext', fn:()=>{code.value+='extends'}},

    ]
    let levelObject=[
        {key:'key',fn:()=>{
            code.value+='keys(  )';
            defineKeyboard(levelOne);
        }, bg:'red'},
        {key:'val',fn:()=>{
            code.value+='values(  )';
            defineKeyboard(levelOne);
        }, bg:'red'},
        {key:'ent',fn:()=>{
            code.value+='entries(  )';
            defineKeyboard(levelOne);
        }, bg:'red'},
        {key:'asi',fn:()=>{
            code.value+='assign(target, src1, src2 )';
            defineKeyboard(levelOne);
        }, bg:'red'},
        {key:'def',fn:()=>{
            code.value+='defineProperty(obj, \'prop\',{writable: false})';
            defineKeyboard(levelOne);
        }, bg:'red'},
        {key:'frz',fn:()=>{
            code.value+='freeze(  )';
            defineKeyboard(levelOne);
        }, bg:'red'},
        {key:'seal',fn:()=>{
            code.value+='seal(  )';
            defineKeyboard(levelOne);
        }, bg:'red'},
        {key:'prE',fn:()=>{
            code.value+='preventExtensions(  )';
            defineKeyboard(levelOne);
        }, bg:'red'},

    ]
    let levelArray = [
       {key:'isArray',fn:()=>{
            code.value+='isArray(  )';
            defineKeyboard(levelOne);
        }, bg:'red'}, 
        {key:'of',fn:()=>{
            code.value+='of(  )';
            defineKeyboard(levelOne);
        }, bg:'red'},
        {key:'from',fn:()=>{
            code.value+='from(  )';
            defineKeyboard(levelOne);
        }, bg:'red'},
    ]

    defineKeyboard(levelOne)

    function defineKeyboard(level){
        dvKeyboard.innerHTML='';
        for (let key of level){
            let bt=document.createElement('button');
            bt.innerHTML=key.key;
            if(key.bg) bt.style.background=key.bg;
            bt.addEventListener('click',key.fn)
            dvKeyboard.appendChild(bt);
        }
    }
    
}())
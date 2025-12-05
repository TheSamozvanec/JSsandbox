'use strict'
const settingsDefault={
    point:'select', // выделение снипета - select, начало снипета - start, конец - end, авто - index
    description:true, // описание снипета
    closeSnip:true, // закрыть после вывода
    autosave:true, // автосохранение кода в LS при RUN
    tab:3, // количество пробелов кнопки tab
};
const settings={
    point:'index', // выделение снипета
    description:true, // описание снипета
    closeSnip:true, // закрыть после вывода
    autosave:true, // автосохранение кода в LS при RUN
    tab:3, // количество пробелов кнопки tab  
};
Object.seal(settings);

let stop = false;
const monitor=document.getElementById('monitor');
const style=document.querySelector('style');

const print = function (...rest){
    let res='';
    for (let str of rest){
        res+=str+'\n';
    }
    monitor.textContent+=res
}
const cls = function () {monitor.textContent=''}

const printObj = function(...rest) {
    for (let obj of rest) {
        for(let i in obj){  
            monitor.innerHTML +='<b>'+i+': </b>'+obj[i]+'<br>'
        }
        monitor.innerHTML+='<br>-----------<br>'
    }
}

function run (){ 
    if(settings.autosave){
        localStorage.setItem('sandboxJSv2.0',document.querySelector('#code').value);
    }
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

function setup(cmd,set){
    let settingsLocal=localStorage.getItem('SettingsSandboxJS');
    cls();
    try{

        if(!cmd && !set){
            if(settingsLocal){
                let obj=JSON.parse(settingsLocal);
                Object.assign(settings, obj);
                print('Settings from local storage');
                printObj(settings);
            } else {
                Object.assign(settings, settingsDefault);
                print('Settings default');
                printObj(settings);
            }
            return
        }

        if (typeof cmd==='object'){
            Object.assign(settings, cmd);
            print('Current settings:');
            printObj(settings);
            return
        } else {
            switch (cmd) {

                case 'local':
                    if (settingsLocal){
                        let obj=JSON.parse(settingsLocal);
                        Object.assign(settings,obj);
                        print('Settings from local storage')
                        printObj(settings) 
                        return
                    } else {
                        print ('Сохраните настройки в localStorage\nМожно сохранить текущие настройки setup(\'save\'),\nЛибо передать объект настроек setup(\'save\',{\npoint:\'end\',\n ...\n})');
                        return
                    }
                case  'save':
                    if (set) Object.assign(settings, set);
                    localStorage.setItem('SettingsSandboxJS',JSON.stringify(settings)); 
                    print ('The settings are saved to the local storage');
                    printObj(settings);
                    return
                case 'default':
                    Object.assign(settings,settingsDefault);
                    print('Settings default');
                    printObj(settings);
                    return
                case 'delete':
                    localStorage.removeItem('SettingsSandboxJS');
                    Object.assign(settings,settingsDefault);
                    print('Settings deleted from local storage', 'Settings default');
                    printObj(settings);
                    return
                case 'help':
                    cls();
                    print(`
Настройки редактора вызываются командой setup()
В setup() можно передавать 2 параметра: 1 - ключь, 2 - объект
Ключи: 
   local - загрузка из локального хранилища
   save - сохранение в локальное хранилище текущих настроек
      если передать с объектом, настройки будут сохранены с внесенными изменениями
   default - настройки по умолчанию 
   delete - удаление настроек из локального хранилища и сброс \'по умолчанию\'
   объект без ключа - текущая установка настроек, действует до перезагрузки страницы
   help - помощь
Объект имеет 3 свойства
   point: курсор после выбора снипета end - конец снипета, start - начало снипета, select - выделить снипет, index - по настройкам снипета
   description: true вывод описания снипета в монитор при выборе
   closeSnip: true закрыть панель снипетов после выбора снипета 
   uatosave: true автосохранение текста в localStorage при нажатии RUN
   tab: количество пробелов кнопки tab
Пустой вызов setup() загрузит настройки хранилища или установит их по умолчанию (если их нет)
                       `)
            }
        }
    } catch (err) {
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
    let curLf=document.getElementById('curLf');
    let curRt=document.getElementById('curRt');
    let TAB=document.getElementById('tab');
    let btClsCode=document.getElementById('clsCode');
    let hidC=document.getElementById('hidd-c');
    let monitorMini=document.getElementById('monitor-mini');
    let help = document.getElementById('help');
    let local = localStorage.getItem('sandboxJSv2.0');
    let isHelp = false;
    let keyboardActive=false;
    let specColor = '#805499ff';
    let syntColor = 'green';
    let groupColor = 'yellow';
    let subgropColor = 'blue';
    let retColor = '#ff8080';

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

    function clsCode(){
        code.value=''
        cursor=0;
    }

    function test(e){
        let data=e?.data
        cls();
        local=code.value;
        if(data){
            switch (data){
                case '\'':
                    paste('\'')
                break;
                case '(':
                    paste(')')
                break;
                case '[':
                    paste(']')
                break;
                case '{':
                    paste('}')
                break;
                case '"':
                    paste('"')
                break;
                case '`':
                    paste('`')
            }
        }
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
        function paste(v){
            let txt=code.value;
            code.value=txt.substring(0,cursor+1)+v+txt.substring(cursor+1);
            code.selectionStart = cursor+v.length;
            code.selectionEnd = cursor+v.length;
            cursor= cursor+v.length;
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
    function toggleMonitor(){
        code.classList.toggle('mini');
        monitor.classList.toggle('mini');
        monitorMini.classList.toggle('sel');
    }
    function toggleCode(){
        code.classList.toggle('hidd');
        hidC.classList.toggle('sel');
    }
    hidC.addEventListener('click',toggleCode);
    monitorMini.addEventListener('click',toggleMonitor);
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

        {key:'let', fn:()=>{paste('let','\nlet\nОбъявление переменной')}},
       
        {key:'con', fn:()=>{paste('const','\nconst\nОбъявление константы')}},
        
        {key:'func', fn:()=>{paste(
'function name( ) { }',
`
function 
Объявление функции function declaration
Стоит помнить о существовании  function expression
const fn=function() {}
и стрелочных функций const fn = ()=>{}.
Стрелочные функции не имеют контекста this`,
false,13)}},
       
        //{key:'gen', fn:()=>{paste(`\nfunction *name(){\n\tyield 1;\n\tyield 2;\n\tyield 3\n}\n;let iter=name()`)}, bg:'green'}, 
       
        {key:'itr', fn:()=>{paste(
`[Symbol.iterator]=function *(){
  for (let key in this){
    
    yield this[key];
  }
}\n`,
`
Symbol.iterator встроен во все итерируемые объекты (for of)
он служет методом итерации в цикле и через rest [...]
в случае необходимости можно встроить его в объект 
с применением дополнительной обработки.
`,
false, 60)}, bg:syntColor}, 
        
//        {br:true},

        {key:'for', fn:()=>{paste('for(let i=0; i<10; i++){  }',
`
for (let i=0; i<10; i++){ваш код, работающий в цикле}
Стандартный цикл i - счетчик, i<10 - условие лиммита,
i++ шаг прирощения можно i+=0.5 или другое
`,false, 24)}},

        {key:'f of', fn:()=>{paste('for(let elem of array){  }',
`
for (let elem of array){ваш код обработки очередного элемента массива}
Цикл перебора массива. Цикл переберает весь 1 уровень массив array,
В каждой итерации elem получает значение очередного элемента массива 
`,false,23)}},

        {key:'f in', fn:()=>{paste('for(let key in obj){  }',
`
for (let key in obj){ваш код для обработки ключа }
Цикл перебора объектаю Цикл переберает весь 1 уровень объекта obj.
В каждой итерации key имеет значение очередного ключа (свойства) объекта
`,false,20)}},

        {key:'whi', fn:()=>{paste('while (i!=10){  }',
`
while (i!=10){ваш код цикла}
Цикл, который будет выполняться до тех пор, пока выполняется условие в скобках.
С таким циклом нужно быть очень осторожным. если поставить невыполнимое условие,
Это будет бесконечный цикл, что приведет к проблемам (тормоза, потом ошибка...)
`,
            false,14)}},

        {key:'bre', fn:()=>{paste('break;',
`
break
Используется в циклах для прерывания цикла.
`)}},

        {key:'ctn', fn:()=>{paste('continue;',
`
continue
Используется в цикле для "досрочного" перехода
к следующей итерации. Есть также синтаксис 
опреатора с меткой (редко используется)
`)}},

         {key:'new', fn:()=>{paste('new',
`
пример let date = new Date()
Вызов конструктора для создания объекта кдасса.
Это может быть встроенный клас let date = new Date()
Также это может быть объект класса, созданный
с помощью оператора class 
`)}},

        {br:true},

        {key:'if', fn:()=>{paste('if(  ) {  }',
`
if (условие){код, который выполняется если да}
Условие. Код в фигурных скобках выполняется только
при выполнения условия
`,false, 4)}},

        {key:'ife', fn:()=>{paste('if(  ) {\n  \n} else {  }',
`
if (условие) {
   код, который выполняется если да
} else {
   код который выполняется если нет    
}
Условие с альтернативой. Если условие не верное - выполняется код else.
Данная конструкция полезна, когда есть код, который выполняется только
в случае не выполнения условия. 
`,false,4)}, bg:syntColor},

        {key:'swt', fn:()=>{paste('switch (int){\n  case 1:\n\n  break;\n  case 2:\n\n  break; \n  case 3:\n\n  break; \n  default:\n\n}',
`
swith - case
Многовариантное условие. В скобках указывается переменная
Каждый кейс содержит значение переменной и блок, который будет выполнен при указанном значении
Блок default будет выполнен, если ниодно значение не совпало
`,false,11)}, bg:syntColor},

        {key:'and', fn:()=>{paste('&&',`\n&&\nДанная команда введена для удобства набора в телефоне`)}},

        {key:'or', fn:()=>{paste('||',`\n||\nДанная команда введена для удобства набора в телефоне`)}},

        {key:'type', fn:()=>{paste('typeof',
`
typeof
Получение типа переменной print (typeof int) или let type=typeof int
`)}},

        {key:'num', fn:()=>{paste('Number(  )',
`
Number ('123')
Преобразование строки в число '123'=>123
`,false,8)}},

        {key:'prI', fn:()=>{paste('parseInt(\'str\')', 
`
parseInt('10px')
Получение целого числа из строки числа с единицами измерения
parseint('10px') => 10
`,false,13)}},

        {key:'prF', fn:()=>{paste('parseFloat(\'str\')',
`
parseFloat('10.3kg')
Получение дробного числа из строки числа с единицами измерения
parseint('10.3kg') => 10.3
`,false,15)}},

        {key:'str', fn:()=>{paste('String()','\nString(125)\nПеревести значение в строку',false,7)}},

        {key:'boo', fn:()=>{paste('\nBoolean()','\nBoolean(\'false\')\nПеревести значение в булеву единицу (true/false)',false,8)}},

//        {br:true}, 

        {key:'obj', fn:()=>{
            paste('Object.','\nObject.\nСтатические методы объектов',true,7);
            defineKeyboard(levelObject);
        }, bg:subgropColor}, 

        {key:'arr', fn:()=>{
            paste('Array.','\nArray.\nСтатические методы массивов',true,6);
            defineKeyboard(levelArray);
        }, bg:subgropColor},

        {key:'del', fn:()=>{paste('delete','\ndelete\nУдаление свойства объекта или элемента массива\n delete arr[1]')}},

        {key:'tr-c', fn:()=>{paste('try {\n\n}catch(err){\n\n}finally{  }',
`
try - catch - finally
Данная конструкция применяется для отслеживания
и обработки ошибок. В блок try {код} пишется код,
в котором возможна ошибка (к примеру ошибка поступающих данных).
В блоке catch код, который будет выполняться при возникновении ошибки, 
к примеру он может вернуть текст ошибки или вывести его
в консоль без прерывания кода. Если в блоке try определить 
условие ошибки (например ошибка валидации) с помощью оператора
throw, данная ошибка автоматически попадет в catch/
Блок finally выполняется как итог. Его чаще всего применяют в
асинхронном режиме. 
`)},bg:syntColor},

        {key:'trw', fn:()=>{paste('throw new Error(\'  \')',
`
throw new Error('произошла ошибка!')
Синтаксис объявления пользовательской ошибки.
JS может и не воспринемать ошибку (к примеру деление на 0),
в таком случае можно перед операцие сделать проверку
и если это является ошибкой валидации или другой, 
не предустмотренной ошибкой, создать её. такой синтаксис применяется 
в блоке try - catch
`)}},

        //{key:'cla', fn:()=>{paste('class')}},

        //{key:'ext', fn:()=>{paste('extends')}},

        {key:'Math', fn:()=>{
            paste('Math.','\nMath\nМатематические функции и константы',true,5);
            defineKeyboard(levelMath);
        }, bg:subgropColor},

        {key:'STR', fn:()=>{
            defineKeyboard(levelSTR);
        }, bg:groupColor},

        {key:'ARR', fn:()=>{
            defineKeyboard(leveARRAY);
        }, bg:groupColor},

        {key:'TIME', fn:()=>{
            defineKeyboard(levelTIME);
        }, bg:groupColor},

        {key:'getDOM', fn:()=>{
            defineKeyboard(levelGetDOM);
        }, bg:groupColor},

        {key:'miscDOM', fn:()=>{
            defineKeyboard(levelMiscDOM);
        }, bg:groupColor},

        {key:'EVENT', fn:()=>{
            defineKeyboard(levelEVENT);
        }, bg:groupColor},

        {key:'ASYNC', fn:()=>{
            defineKeyboard(leveASYNC);
        }, bg:groupColor},

        {key:'OOP', fn:()=>{
            defineKeyboard(LevelOOP);
        }, bg:groupColor},

        {key:'STOR/JSON', fn:()=>{
            defineKeyboard(LevelSTOR);
        }, bg:groupColor},

        {key:'CANVAS', fn:()=>{
            defineKeyboard(levelCANVAS);
        }, bg:groupColor},

        {br:true},

        {key:'HTML', fn:()=>{
         if(!hasHTML()){paste(
`
monitor.innerHTML=\`

\``,'',true,21);
            }
            defineKeyboard(levelHTML)
        }, bg:groupColor},
        
        {key:'CSS', fn:()=>{
           if(!hasCSS()) {paste(
`
style.innerHTML=\`
#monitor .my-class {

}
\``,'',true,37);
            }
            defineKeyboard(levelCSS)
        }, bg:groupColor},

        {key:'SETUP', fn:()=>{defineKeyboard(levelSettings)}, bg:'yellow'},

    ]
    //Math____________________________________________________
    let levelMath=[

        {key:'rnd',fn:()=>{
            paste('random()','\nПолучайные числа',false,7);
            defineKeyboard(levelOne);
        }, bg:retColor},

        {key:'round',fn:()=>{
            paste('round()','\nОкругление до ближайшего целого',false,6);
            defineKeyboard(levelOne);
        }, bg:retColor},

        {key:'ceil',fn:()=>{
            paste('ceil()','\nОкругление в большую сторону',false,5);
            defineKeyboard(levelOne);
        }, bg:retColor},

        {key:'floor',fn:()=>{
            paste('floor()','\nОкругление в меньшую сторону',false,6);
            defineKeyboard(levelOne);
        }, bg:retColor},

        {key:'sqrt',fn:()=>{
            paste('sqrt()','\nКвадратный корень',false,5);
            defineKeyboard(levelOne);
        }, bg:retColor},

        {key:'max',fn:()=>{
            paste('max()','\nМаксимум max(n1,n2...n) можно max(...[n1,n2])',false,4);
            defineKeyboard(levelOne);
        }, bg:retColor},

        {key:'min',fn:()=>{
            paste('min()','\nМинимум min(n1,n2...n) можно min(...[n1,n2])',false,4);
            defineKeyboard(levelOne);
        }, bg:retColor},

        {key:'abs',fn:()=>{
            paste('abs()','\nМодуль числа',false,4);
            defineKeyboard(levelOne);
        }, bg:retColor},

        {key:'sin',fn:()=>{
            paste('sin()','\nСинус (аргумент в радианах)',false,4);
            defineKeyboard(levelOne);
        }, bg:retColor},

        {key:'cos',fn:()=>{
            paste('cos()','\nКосинус (аргумент в радианах)',false,4);
            defineKeyboard(levelOne);
        }, bg:retColor},

        {key:'tan',fn:()=>{
            paste('tan()','\nТангенс (аргумент в радианах)',false,4);
            defineKeyboard(levelOne);
        }, bg:retColor},

        {key:'asin',fn:()=>{
            paste('asin()','\nАрксинус',false,5);
            defineKeyboard(levelOne);
        }, bg:retColor},

        {key:'acos',fn:()=>{
            paste('acos()','\nАрккосинус',false,5);
            defineKeyboard(levelOne);
        }, bg:retColor},

        {key:'atan',fn:()=>{
            paste('atan()','\nАрктангенс',false,5);
            defineKeyboard(levelOne);
        }, bg:retColor},

        {key:'exp',fn:()=>{
            paste('exp()','\nВозведение \'е\' в степень',false,4);
            defineKeyboard(levelOne);
        }, bg:retColor},

        {key:'log',fn:()=>{
            paste('log()','\nНатуральный логорифм',false,4);
            defineKeyboard(levelOne);
        }, bg:retColor},

        {key:'PI',fn:()=>{
            paste('PI','\nПи 3.14');
            defineKeyboard(levelOne);
        }, bg:retColor},

        {key:'E',fn:()=>{
            paste('E','\n\'e\' 2.718');
            defineKeyboard(levelOne);
        }, bg:retColor},

        {key:'SQRT2',fn:()=>{
            paste('SQRT2','\nКорень из 2: 1.4142');
            defineKeyboard(levelOne);
        }, bg:retColor},

    ];
    //STR____________________________________________________
    let levelSTR=[

        {key:'...',fn:()=>defineKeyboard(levelOne),bg:retColor},

        {key:'len',fn:()=>{paste('.length','\nСвойство - длинна строки str.lenght',)}},

        {key:'LowC',fn:()=>{paste('.toLowerCase()','\n.toLowerCase()\nМетод, переводит все символы в нижний регистр.')}},

        {key:'UppC',fn:()=>{paste('.toUpperCase()','\n.toUpperCase()\nМетод, переводит все символы в верхний регистр.')}},

        {key:'subs',fn:()=>{paste('.substring()',
`
.substring()
Метод возвращает подстроку из строки (исходная строка при этом не изменяется). 
Первый параметр задает номер символа, 
с которого метод начинает отрезать (нумерация идет с нуля), 
а второй параметр - номер символа, 
на котором следует закончить вырезание 
(символ с этим номером не включается в вырезанную часть). 
Второй параметр не является обязательным, если он не указан, 
то вырезаны будут все символы до конца строки.
`        
,false,11)}},

        {key:'slice',fn:()=>{paste('.slice()',
`
.slice()
Метод возвращает подстроку из строки (исходная строка при этом не изменяется). 
Первым параметром указывается номер символа строки, 
с которого начинается вырезание, а вторым параметром - номер символа, 
на котором закончится вырезание 
(при этом символ с этим номером не включится в вырезанную часть). 
Второй параметр не является обязательным. 
Если его не указать - подстрока возьмется с указанного в первом параметре 
символа до конца строки. Он также может принимать отрицательные значения. 
В этом случае отсчет символа, на котором закончится обрезание, 
начинается с конца строки. Последний символ имеет номер -1.
`        
,false,7)}},

        {key:'indOf',fn:()=>{paste('.indexOf()',
`
.indexOf()
Метод осуществляет поиск подстроки в строке. 
В первом параметре указываем искомую подстроку в нужном нам регистре. 
Метод вернет позицию первого совпадения, 
а если оно не найдено, то вернет -1. 
Вторым необязательным параметром можно передать номер символа, 
откуда следует начинать поиск.
`        
,false,9)}},

        {key:'lIndOf',fn:()=>{paste('.lastIndexOf()',
`
.lastIndexOf()
Метод аналогичен indexOf но начинает поиск с конца строки.
`        
,false,13)}},

        {key:'stWit',fn:()=>{paste('.startsWith(\'\')',
`
.startsWith()
Метод проверяет начинается ли строка с указанной в первом параметре подстроки. 
Если начинается, то возвращает true, 
а если не начинается, то false. 
Вторым необязательным параметром метод принимает позицию, 
с которой начинать проверку (по умолчанию с начала строки).
`        
,false,13)}},

        {key:'enWit',fn:()=>{paste('.endsWith(\'\')',
`
.endsWith()
Аналогично startsWith, но с конца строки.
Второй параметр - конец строки (если не указан - 
будет реальный конец строки).
`        
,false,11)}},

        {key:'trim',fn:()=>{paste('.trim()',
`
.trim()
Удаляет пробелы в начале и в конце строки.
`        
,)}},

        {key:'chr',fn:()=>{paste('.charCodeAt()',
`
.charCodeAt()
Метод возвращает код символа (числовое значение), 
стоящего на определенной позиции в строке. 
Нумерация символов начинается с 0. 
Если указанное число больше последнего символа строки, 
то метод возвращает NaN.
`        
,false,12)}},

        {key:'StChr',fn:()=>{paste('String.fromCharCode()',
`
Метод String.fromCharCode преобразует указанные значения единиц кода UTF-16 в строку.
let str = String.fromCharCode(65, 66, 67, 68, 69);
'ABCDE'
`        
,false,20)}},

        {key:'repl',fn:()=>{paste('.replace(\'\',\'\')',
`
.replace()
Метод осуществляет поиск и замену частей строки. 
Первым параметром принимается подстрока, 
которую заменяем, а вторым - подстрока, 
на которую заменяем. 
В качестве первого параметра етод принимает регулярные строки и 
поддерживает работу с карманами регулярных строк.
`        
,false,10)}},

        {key:'at',fn:()=>{paste('.at()',
`
.at()
Метод осуществляет поиск символа по номеру его позиции в строке. 
В параметре метода мы указываем целое число, 
которое может быть положительным или отрицательным 
(в этом случае поиск ведется с конца строки).
`        
,false,4)}},

 {key:'incl',fn:()=>{paste('.includes(\'\')',
`
.includes()
Метод выполняет поиск заданной строки в текущей с учетом регистра. 
Первым параметром метод принимает строку, которую нужно найти, 
вторым необязательным - позицию, 
с которой нужно начинать поиск. 
После выполнения метод возвращает true или false.
`        
,false,11)}},

        {key:'pEnd',fn:()=>{paste('.padEnd()',
`
.padEnd()
Метод дополняет конец текущей строки до достижения длины, 
заданной в первом параметре. 
Вторым необязательным параметром указывается строка, 
которой мы хотим заполнить текущую.
`        
,false,8)}},

        {key:'pSta',fn:()=>{paste('.padStart()',
`
.padStart()
Тоже что padEnd, но для начала строки.
`        
,false,10)}},

        {key:'repe',fn:()=>{paste('.repeat()',
`
Метод создает новую строку, 
содержащую указанное количество копий первоначальной строки, 
слитых вместе. str.repeat(3)
`        
,false,8)}},

       
        {br:true},

        {key:'match',fn:()=>{paste('.match(//)',
`
Метод возвращает массив совпадений с регулярным выражением. 
Если совпадений нет, то вернет null. 
Будучи вызван без модификатора g метод возвращает массив, 
в нулевом элементе которого будет лежать найденная подстрока, 
а в остальных элементах - карманы. 
Если метод вызван с модификатором g
он возвращает все найденные совпадения в виде массива.
str.match(/\\d/g)
`        
,false,8)}},

        {key:'matA',fn:()=>{paste('.matchAll(//)',
`
Метод возвращает все совпадения с регулярным выражением 
в виде итерируемого объекта, 
каждый элемент которого содержит массив из найденного 
и его карманов. 
Метод может вызываться только с модификатором g. 
Если совпадений нет, то вернет null.
str.matchAll(/\\d/g)
`        
,false,11)}},

        {key:'exec',fn:()=>{paste('.exec()',
`
Метод осуществляет поиск по строке по 
заданному регулярному выражению. 
Результатом возвращается найденная подстрока и ее карманы. 
При этом каждый последующий вызов данного метода 
будет начинать поиск с того места, 
в котором закончилась предыдущая найденная подстрока. 
Если совпадение не найдено - возвращается null.
let reg = /  /
let str = ''
reg.exec(str)
`        
,false,6)}},

        {key:'test',fn:()=>{paste('.test(//)',
`
.test(//)
Метод проверяет, есть ли в строке хотя бы одно совпадение 
с регулярным выражением. 
Если есть - возвращается true, а если нет - false.
`        
,false,7)}},

        {key:'sear',fn:()=>{paste('.search(//)',
`
.search(//)
Метод находит совпадения строки с регулярным выражением и 
возвращает позицию первого совпадения. 
Если совпадений не найдено, то метод вернет -1.
`        
,false,9)}},

        {key:'split',fn:()=>{paste('.split(\'\')',
`
.split()
Метод разбивает строки в массив по 
указанному в первом параметре разделителю. 
Если он не задан - вернется вся строка. 
Если он задан как пустые кавычки, 
то каждый символ строки попадет 
в отдельный элемент массива. 
Вторым необязательным параметром можно указать 
максимальное количество элементов в получившемся массиве.
`        
,false,8)}},

        {br:true},

        {key:'Fix',fn:()=>{paste('.toFixed()','\nФиксированное округление num.toFixed(n)=> n-знаков после \'.\'',false,9)}},

        {key:'Preci',fn:()=>{paste('.toPrecision()','\nФиксированное округление num.toPrecision(n) => n-знаков всего',false,13)}},
        {key:'toStr',fn:()=>{paste('.toString()',
`
Метод в большенстве случаев равносилен функции String(), но есть некоторые отличия.
В некоторых случаях именно он применим (в nodeJS приводит массив буфера stdIn в строку)
Также есть полезная опция, можно передавать аргумент в метод, 
определяя систему счисления для числового значения:
(10).toString(2)=>'1010'
`)}}   
             
    ];
//ARR________________________________________________
    let leveARRAY = [

        {key:'...',fn:()=>defineKeyboard(levelOne),bg:retColor},

        {key:'len',fn:()=>{paste('.length','\nСвойство - длинна массива arr.lenght',)}},

        {key:'concat',fn:()=>{paste('.concat()',
`
.concat()
Метод сливает указанные массивы в один общий массив. 
Метод применяется к одному из массивов, 
а в параметрах метода передаются остальные массивы для слияния. 
При этом метод не изменяет исходный массив, а возвращает новый.
`,false,8)}},

        {key:'join',fn:()=>{paste('.join(\'\')',
`
Метод объединяет элементы массива в строку с указанным разделителем 
(он будет вставлен между элементами массива). 
Разделитель задается параметром метода и не является обязательным. 
Если он не задан - по умолчанию в качестве разделителя возьмется запятая. 
Если вы хотите слить элементы массива без разделителя - укажите его как пустую строку ''.
`,false,7)}},

        {key:'rev',fn:()=>{paste('.reverse()',
`
.reverse()
Метод изменяет порядок элементов в массиве на обратный.
Метод изменяет исходный массив и возвращает также перевернутый массив.
`)}},

        {key:'incl',fn:()=>{paste('.includes()',
`
Метод проверяет наличие элемента в массиве. 
Параметром принимает значение для поиска. 
Если такой элемент есть в массиве, 
то метод возвращает true, а если нет, то false.
`,false,10)}},

        {key:'fill',fn:()=>{paste('.fill(\'\')',
`
.fill()
Метод заполняет массив заданными значениями. 
В первом параметре метода указывается нужное значение. 
Во втором и третьем необязательных параметрах 
задается начальная и конечная позиция для заполнения.
`        
,false,7)}},

        {key:'indOf',fn:()=>{paste('.indexOf()',
`
.indexOf()
Метод осуществляет поиск элемента в массиве. 
В первом параметре указываем элемент для поиска. 
Метод возвращает номер первого найденного элемента, 
либо -1, если такого элемента нет. 
Второй необязательный параметр метода задает позицию, 
с которой следует начинать поиск.
`        
,false,9)}},

        {key:'lIndOf',fn:()=>{paste('.lastIndexOf()',
`
.lastIndexOf()
Метод аналогичен indexOf но начинает поиск с конца массива.
`        
,false,13)}},

        {key:'slice',fn:()=>{paste('.slice()',
`
.slice()
Метод вырезает и возвращает указанную часть массива. Сам массив при этом не изменяется.
Первым параметром указывается номер элемента массива, с которого начинается вырезание, 
а вторым параметром - номер элемента, на котором закончится вырезание 
(при этом элемент с этим номером не включится в вырезанную часть). 
Второй параметр не является обязательным. 
Если его не указать - подмассив возьмется с указанного в первом параметре элемента до конца массива.
Он также может принимать отрицательные значения. 
В этом случае отсчет элемента, на котором закончится обрезание, 
начинается с конца массива. Последний элемент при этом будет иметь номер -1.
`        
,false,7)}},

        {key:'splice',fn:()=>{paste('.splice()',
`
.splice()
Метод удаляет или добавляет элементы в массив. 
Можно только удалять элементы, только добавлять 
или делать и то и другое одновременно. 
Метод изменяет сам массив и возвращает при этом массив удаленных элементов.
Первым параметром метод принимает номер элемента массива, 
который нужно удалить. 
Вторым параметром - сколько элементов массива следует удалить. 
Если его поставить в 0 - то элементы удалены не будут 
(только добавлены новые). Дальше через запятую идут элементы, 
которые нужно добавить в массив (являются необязательными параметрами). 
Эти элементы добавятся вместо удаленных элементов массива.
Если удаления не было (когда второй параметр 0) - 
элементы вставятся в массив начиная с той позиции, 
которая указана первым параметром метода. 
Первый параметр может иметь отрицательное значение. 
В этом случае отсчет позиции начнется не с начала массива, 
а с конца. Последний элемент при этом будет иметь номер -1.
`        
,false,8)}},

        {key:'shift',fn:()=>{paste('.shift()',
`
.shift()
Метод удаляет первый элемент из массива. 
При этом исходный массив изменяется, 
а результатом метода возвращается удаленный элемент.
`        
)}},

        {key:'pop',fn:()=>{paste('.pop()',
`
.pop()
Метод удаляет последний элемент из массива. 
При этом исходный массив изменяется, 
а результатом метода возвращается удаленный элемент.
`        
)}},

        {key:'unshift',fn:()=>{paste('.unshift()',
`
.unshift()
Метод добавляет неограниченное количество новых элементов 
в начало массива. При этом исходный массив изменяется, 
а результатом возвращается новая длина массива.
`        
,false,9)}},

        {key:'push',fn:()=>{paste('.push()',
`
.push()
Метод добавляет неограниченное количество новых элементов 
в конец массива. При этом исходный массив изменяется, 
а результатом возвращается новая длина массива.
`        
,false,6)}},

        {key:'map',fn:()=>{paste('.map((el,n,arr)=>{  })',
`
.map((el,n,arr)=>{  })
Метод позволяет применить заданную функцию для каждого элемента массива. 
При этом метод не изменяет исходный массив, а возвращает измененный.
Метод в параметре получает функцию, 
которая выполнится для каждого элемента массива. 
To, что вернет эта функция через return для элемента массива, 
станет новым значением этого элемента.
В функцию можно передавать 3 параметра. 
Если эти параметры есть (они не обязательны), 
то в первый автоматически попадет элемент массива, 
во второй попадет его номер в массиве (индекс), 
а в третий - сам массив.
`        
,false,19)}},

{key:'flatMap',fn:()=>{paste('.flatMap((el,n,arr)=>{  })',
`
.flatMap((el,n,arr)=>{  })
Метод возвращает новый массив, созданный после того как 
к каждому элементу исходного массива применился коллбэк, 
указанный в параметре метода. 
На первый взгляд метод flatMap похож на метод map, 
но его главное отличие в том, что он всегда 
возвращает одномерный массив.
`        
,false,23)}},

        {key:'each',fn:()=>{paste('.forEach((el,n,arr)=>{  })',
`
.forEach((el,n,arr)=>{  })
Метод позволяет последовательно перебрать все элементы массива. 
Метод в параметре получает функцию, 
которая выполнится для каждого элемента массива.
В эту функцию можно передавать три параметра. 
Если эти параметры есть (они не обязательны), 
то в первый автоматически попадет элемент массива, 
во второй попадет его номер в массиве (индекс), 
а в третий - сам массив.
Метод ничего не возвращает, просто перебор массива!!!
`        
,false,23)}},

        {key:'filter',fn:()=>{paste('.filter((el,n,arr)=>{  })',
`
.filter((el,n,arr)=>{  })
Метод позволяет отфильтровать элементы массива, 
оставив только подходящие под определенное условие элементы. 
Метод в параметре получает функцию, 
которая выполнится для каждого элемента массива. 
Своим результатом метод возвращает новый массив, 
в который войдут только те элементы, 
для которых переданная функции вернет true.
В функцию можно передавать три параметра. 
Если эти параметры есть (они не обязательны), 
то в первый автоматически попадет элемент массива, 
во второй попадет его номер в массиве (индекс), 
а в третий - сам массив.
`        
,false,22)}},

        {key:'every',fn:()=>{paste('.every((el,n,arr)=>{  })',
`
.every((el,n,arr)=>{  })
Метод проверяет элементы массива в соответствии с переданной функцией. 
Метод возвращает true, если для всех элементов массива 
переданная функция вернет true, в противном случае метод возвращает false.
В функцию можно передавать три параметра. 
Если эти параметры есть (они не обязательны), 
то в первый автоматически попадет элемент массива, 
во второй попадет его номер в массиве (индекс), 
а в третий - сам массив.
`        
,false,21)}},

        {key:'some',fn:()=>{paste('.some((el,n,arr)=>{  })',
`
.some((el,n,arr)=>{  })
Метод проверяет элементы массива в соответствии с переданной функцией. 
Эта функция передается параметром метода и 
выполняется для каждого элемента массива. 
Метод возвращает true, если хотя бы для 
одного элемента массива переданная функция 
вернет true, в противном случае метод возвращает false.
В функцию можно передавать три параметра. 
Если эти параметры есть (они не обязательны), 
то в первый автоматически попадет элемент массива, 
во второй попадет его номер в массиве (индекс), 
а в третий - сам массив.
`        
,false,20)}},

        {key:'reduce',fn:()=>{paste('.reduce((res,el,n,arr)=>{  },0)',
`
.reduce((res,el,n,arr)=>{  },0)
Метод сворачивает массив к одному значению (редуцирует). 
К примеру, с помощью этого метода можно легко найти сумму 
элементов массива. Первым параметром метод reduce получает 
функцию, которая последовательно выполнится для каждого элемента массива, 
начиная с первого. 
В эту функцию можно передавать 4 параметра. 
Если эти параметры есть (они не обязательны), 
то в первый автоматически попадет промежуточный результат, 
во второй попадет элемент массива, 
в третий - его номер в массиве (индекс), 
а в четвертый - сам массив.
Промежуточный результат - это переменная, 
в которой будет накапливаться то значение, 
которое вернет метод reduce, когда переберет все элементы массива. 

Вторым параметром метода reduce указывается начальное значение промежуточного результата. 
Если его не указать, то оно будет равно первому элементу массива, 
а обработка элементов начнется со второго элемента.
`        
,false,26)}},

        {key:'redRg',fn:()=>{paste('.reduceRight((res,el,n,arr)=>{  },0)',
`
.reduceRight((res,el,n,arr)=>{  },0)
Тоже самое что reduce, только обработка начинается с конца массива.
`        
,false,31)}},

       {key:'sort',fn:()=>{paste('.sort()',
`
.sort()
Метод производит сортировку массива в лексикографическом порядке 
и возвращает уже измененный массив. Необязательным параметром можно 
указать собственную функцию для сортировки.
Без функции метод произведет сортировку по алфавиту
Callback-функция принимает два элемента массива 
(a, b - текущий, следующий) и возвращает число:
- Если возвращается отрицательное число, элемент a считается меньше b, и идёт первым.
- Если возвращается положительное число, значит b меньше a, и b перемещается вперёд.
- Возвращение нуля означает равенство элементов, и порядок остаётся прежним.
(a,b)=>a-b отсортирует числа по возрастанию (не в алфовитном порядке)
[1, 111, 123, 2, 4, 7] - алфовитный порядок
[1, 2, 4, 7, 111, 123] - по возрастанию
`        
)}}, 

        {key:'find',fn:()=>{paste('.find((el)=>el>0)',
`
.find((el)=>el>0)
Метод помогает найти первый элемент в массиве согласно 
переданному в параметре коллбэку. 
Если элемента нет, то возвращается undefined.
`        
,false,16)}},

        {key:'fiInd',fn:()=>{paste('.findIndex((el)=>el>0)',
`
.findIndex((el)=>el>0)
Метод позволяет найти индекс первого элемента согласно 
переданному в параметре коллбэку. 
Если элемент не найден, то возвращается -1.
`        
,false,21)}},

        {key:'fiLInd',fn:()=>{paste('.findLastIndex((el)=>el>0)',
`
.findLastIndex((el)=>el>0)
Аналогичен findIndex но поиск с конца массива.
`        
,false,25)}},

         {key:'flat',fn:()=>{paste('.flat()',
`
.flat()
Метод уменьшает уровень вложенности многомерного массива. 
Может либо делать массив одномерным, 
либо уменьшать мерность на заданное значение.
Чтобы сделать одномерным массив любой фложенности
необходимо передать infinity. 
`        
)}},

        {key:'at',fn:()=>{paste('.at()',
`
.at()
Метод возвращает элемент массива с заданным индексом. 
В параметре метода указывается целое положительное или 
отрицательное число. В первом случае - идет поиск элемента 
с начала массива, во втором - с конца.
`        
,false,4)}},

    ];
//TIME ___________________________________________________
    let levelTIME =[

        {key:'...',fn:()=>{defineKeyboard(levelOne);}, bg:retColor}, 

        {br:true},

        {key:'new D',fn:()=>{paste('new Date()',
`
Создание объекта Date. без параметров это будет текущий момент
гггг.мм.дд.чч.мм.сс.мс
Ввод параметров осуществляется в указанном порядке. 
`        
)}},

        {key:'GET', fn:()=>{
            paste('.get','\nМетоды получения данных из объекта Date',true);
            defineKeyboard(leveGetDATE);
        }, bg:subgropColor},

        {key:'SET', fn:()=>{
            paste('.set','\nМетоды установки данных в объекте Date',true);
            defineKeyboard(levelSetDATE);
        }, bg:subgropColor},

        {key:'setInterval',fn:()=>{paste('setInterval(()=>{  },1000)',
`
setInterval(()=>{  },1000)
Функция производит выполнение кода через указанный интервал времени. 
Первым параметром следует передавать коллбэк, 
а вторым - время в миллисекундах, указывающее, 
через какой промежуток будет повторяться код, 
заданный первым параметром. 
Функция возвращает уникальный идентификатор, 
с помощью которого можно остановить таймер. 
Для этого этот идентификатор следует передать функции clearInterval.
`        
,false,18)}},

        {br:true},

        {key:'setTimeout',fn:()=>{paste('setTimeout(()=>{  },3000)',
`
setTimeout(()=>{  },3000)
Функция задает задержку перед выполнением кода. 
Первым параметром следует передавать коллбэк, 
вторым - время в миллисекундах, указывающее через 
какой промежуток начнет выполнятся код, заданный первым параметром. 
Функция возвращает уникальный идентификатор, 
с помощью которого можно остановить таймер. 
Для этого этот идентификатор следует передать функции clearTimeout.
`        
,false,17)}},

        {br:true},

        {key:'clearInterval',fn:()=>{paste('clearInterval()',
`
clearInterval()
Функция останавливает таймер, заданный функцией setInterval. 
Функция принимает идентификатор того таймера, 
который нужно остановить. 
Идентификатор таймера возвращает функция setInterval.
let id=setInterval (()=>{})
`        
,false,14)}},

        {br:true},

        {key:'clearTimeout',fn:()=>{paste('clearTimeout()',
`
clearTimeout()
Функция останавливает таймер, установленный функцией setTimeout. 
Функция принимает идентификатор того таймера, 
который нужно остановить. Идентификатор таймера 
возвращает метод setTimeout.
let id=setTimeout (()=>{})
`        
,false,13)}},

    ];
//getDate_________________________________________________
    let leveGetDATE = [

        {key:'FullYear',fn:()=>{
            paste('FullYear()','\n.getFullYear()\nГод в формате гггг');
            defineKeyboard(levelTIME);
        }, bg:retColor},

         {key:'Month',fn:()=>{
            paste('Month()','\n.getMonth()\nМесяц (начинается с 0!)');
            defineKeyboard(levelTIME);
        }, bg:retColor},

        {key:'Date',fn:()=>{
            paste('Date()','\n.getDate()\nДень месяца');
            defineKeyboard(levelTIME);
        }, bg:retColor},

        {key:'Hours',fn:()=>{
            paste('Hours()','\n.getHours()\nЧасы (0-23)');
            defineKeyboard(levelTIME);
        }, bg:retColor},

        {key:'Minutes',fn:()=>{
            paste('Minutes()','\n.getMinutes()\nМинуты (0-59)');
            defineKeyboard(levelTIME);
        }, bg:retColor},

        {key:'Seconds',fn:()=>{
            paste('Seconds()','\n.getSeconds()\nСекунды (0-59)');
            defineKeyboard(levelTIME);
        }, bg:retColor},

        {key:'Milliseconds',fn:()=>{
            paste('Milliseconds()','\n.getMilliseconds()\nМиллисекунды (0-999)');
            defineKeyboard(levelTIME);
        }, bg:retColor},

        {key:'Day',fn:()=>{
            paste('Day()','\n.getDay()\nДень недели, понедельник - 1, суббота -6, воскресение - 0');
            defineKeyboard(levelTIME);
        }, bg:retColor},

        {key:'Time',fn:()=>{
            paste('Time()','\n.getTime()\nВремя в формате timestamp.');
            defineKeyboard(levelTIME);
        }, bg:retColor},
  
    ];
//setDate_____________________________________________________
    let levelSetDATE=[

        {key:'FullYear',fn:()=>{
            paste('FullYear()','\n.setFullYear()\nГод в формате гггг',false,9);
            defineKeyboard(levelTIME);
        }, bg:retColor},

         {key:'Month',fn:()=>{
            paste('Month()','\n.setMonth()\nМесяц (начинается с 0!)',false,6);
            defineKeyboard(levelTIME);
        }, bg:retColor},

        {key:'Date',fn:()=>{
            paste('Date()','\n.setDate()\nДень месяца',false,5);
            defineKeyboard(levelTIME);
        }, bg:retColor},

        {key:'Hours',fn:()=>{
            paste('Hours()','\n.setHours()\nЧасы (0-23)',false,6);
            defineKeyboard(levelTIME);
        }, bg:retColor},

        {key:'Minutes',fn:()=>{
            paste('Minutes()','\n.setMinutes()\nМинуты (0-59)',false,8);
            defineKeyboard(levelTIME);
        }, bg:retColor},

        {key:'Seconds',fn:()=>{
            paste('Seconds()','\n.setSeconds()\nСекунды (0-59)',false,8);
            defineKeyboard(levelTIME);
        }, bg:retColor},

        {key:'Milliseconds',fn:()=>{
            paste('Milliseconds()','\n.setMilliseconds()\nМиллисекунды (0-999)',false,13);
            defineKeyboard(levelTIME);
        }, bg:retColor},

    ];
//getDOM___________________________________________________
    let levelGetDOM=[

        {key:'...',fn:()=>{defineKeyboard(levelOne);}, bg:retColor},

        {key:'d.qSel',fn:()=>{
            paste('document.querySelector(\'\')',
`
Получение элемента по селектору let div=document.querySelector('div')
Селектор необходимо вводить точно также, как и в css файле: теги пишутся без знаков - 'input',
id элементов после знака # - '#user-login', классы с точкой - '.warn-massage'
querySelector применим не только ко всему документу, но и к конкретному элементу.
let authForm = document.querySelector('.authForm')
let name=authForm.querySelector('.name')
Если селектор будет соответствовать группе элементов, метод вернет первый элемент!
В данном приложении для удобства пользователей есть объект monitor- 
элемент <div>, расположенный в нижней части экрана.
Чтобы не сломать структуру страницы рекомендую использовать синтаксис
monitor.querySelector('')
`,false,24)}},

        {key:'d.qSAll',fn:()=>{
            paste('document.querySelectorAll(\'\')',
`
Получение динамического псевдомассива элементов по селектору let div=document.querySelectorAll('div')
Селектор необходимо вводить точно также, как и в css файле: теги пишутся без знаков - 'input',
id элементов после знака # - '#user-login', классы с точкой - '.warn-massage'
querySelector применим не только ко всему документу, но и к конкретному элементу.
let authForm = document.querySelector('.authForm')
let data=authForm.querySelectorAll('input')
console.log(data[0].value) или print(data[0].value) для данного приложения 
В данном приложении для удобства пользователей есть объект monitor- 
элемент <div>, расположенный в нижней части экрана.
Чтобы не сломать структуру страницы рекомендую использовать синтаксис
monitor.querySelectorAll('')
`,false,27)}},

        {br:true},
        {br:true},

        {key:'d.EById',fn:()=>{
            paste('document.getElementById(\'\')',
`
Получение элемента по id: let div=document.getElementById('id10')
ID элемента вводится без знака # 
`,false,25)}},

        {key:'d.EByTN',fn:()=>{
            paste('document.getElementByTagName(\'\')',
`
Получение псевдомассива элементов по имени тэга
let div=document.getElementByTagName('div')
`,false,30)}},

         {key:'d.EByCN',fn:()=>{
            paste('document.getElementByClassName(\'\')',
`
Получение псевдомассива элементов класса html (атрибут class='inform')
let div=document.getElementByClassName('inform')
`,false,32)}},

        {key:'m.qSel',fn:()=>{
            paste('monitor.querySelector(\'\')',
`
Получение элемента по селектору let div=monitor.querySelector('div')
Селектор необходимо вводить точно также, как и в css файле: теги пишутся без знаков - 'input',
id элементов после знака # - '#user-login', классы с точкой - '.warn-massage'
querySelector применим не только ко всему документу, но и к конкретному элементу.
let authForm = monitor.querySelector('.authForm')
let name=authForm.querySelector('.name')
Если селектор будет соответствовать группе элементов, метод вернет первый элемент!
monitor.querySelector('') применим после создания DOM непосредственно в элементе
monitor путем написаня html кода в monitor.innerHTML или создания элементов
методами JS
`,false,23);
        }},
        {key:'m.qSAll',fn:()=>{
            paste('monitor.querySelectorAll(\'\')',
`
Получение массива элементов по селектору let div=monitor.querySelectorAll('div')
Селектор необходимо вводить точно также, как и в css файле: теги пишутся без знаков - 'input',
id элементов после знака # - '#user-login', классы с точкой - '.warn-massage'
querySelector применим не только ко всему документу, но и к конкретному элементу.
let authForm = monitor.querySelector('.authForm')
let data=authForm.querySelectorAll('input')
console.log(data[0].value) или print(data[0].value) для данного приложения 
monitor.querySelectorAll('') применим после создания DOM непосредственно в элементе
monitor путем написаня html кода в monitor.innerHTML или создания элементов
методами JS
`,false,26)}},

        {key:'closest',fn:()=>{
            paste('.closest(\'\')',
`
Метод ищет ближайший родительский элемент, 
подходящий под указанный CSS селектор, 
при этом сам элемент тоже включается в поиск.
elem.closest('p.message') 
`,false,10)}},

        {key:'matches',fn:()=>{
            paste('.matches(\'\')',
`
Метод позволяет проверить, 
удовлетворяет ли элемент указанному CSS селектору.
elem.matches('p.message')
`,false,10)}},

        {key:'contains',fn:()=>{
            paste('.contains()',
`
.contains()
Метод позволяет проверить, 
содержит ли один элемент внутри себя другой. 
Параметром метода передается элемент (в виде переменной со ссылкой), 
который будет проверяться на то, что он находится внутри элемента, 
к которому применился метод.
`,false,10)}},

        {key:'child',fn:()=>{
            paste('.children',
`
Свойство хранит в себе псевдомассив дочерних элементов. 
Дочерними элементами считаются все теги, 
которые непосредственно расположены внутри блока.
let elems=form.children
`)}},

        {key:'fChild',fn:()=>{
            paste('.firstElementChild',
`
Свойство содержит первый дочерний элемент. 
Дочерними элементами считаются все теги, 
которые непосредственно расположены внутри блока. 
Если у элемента нет дочерних элементов - возвращается null.
let elem=form.firstElementChild
`)}},

        {key:'lChild',fn:()=>{
            paste('.lastElementChild',
`
Свойство содержит последний дочерний элемент. 
Дочерними элементами считаются все теги, 
которые непосредственно расположены внутри блока. 
Если у элемента нет дочерних элементов - возвращается null.
let elem=form.lastElementChild
`)}},

        {key:'prevElem',fn:()=>{
            paste('.previousElementSibling',
`
Свойство содержит предыдущий элемент, 
находящийся в этом же родителе. 
Если такого элемента нет - возвращается null.
let elem=inp.previousElementSibling
`)}},

        {key:'nextElem',fn:()=>{
            paste('.nextElementSibling',
`
Свойство содержит следующий элемент, 
находящийся в этом же родителе. 
Если такого элемента нет - возвращается null.
let elem=inp.nextElementSibling
`)}},

        {key:'parentElement',fn:()=>{
            paste('.parentElement',
`
Свойство содержит родительский элемент.
let elem=inp.parentElement
`)}}, 

        {br:true},

        {key:'rows',fn:()=>{
            paste('.rows',
`
Свойство хранит коллекцию строк tr. 
Может применяться как к таблице, 
так и к ее секциям tHead, tBodies, tFoot.
let rows=table.rows
`)}},

        {key:'tHead',fn:()=>{
            paste('.tHead',
`
.tHead
Свойство хранит ссылку на thead таблицы.
`)}},

        {key:'tFoot',fn:()=>{
            paste('.tFoot',
`
.tFoot
Свойство хранит ссылку на tfoot таблицы.
`)}},

        {key:'tBodies',fn:()=>{
            paste('.tBodies',
`
.tBodies
Свойство хранит псведо-массив всех tbody таблицы (их может быть несколько).
`)}},

    ];
//miscDOM___________________________________________________
    let levelMiscDOM=[

        {key:'...',fn:()=>{defineKeyboard(levelOne)},bg:retColor},

        {key:'create',fn:()=>{
            paste('document.createElement(\'\')',
`
document.createElement('div')
Метод позволяет создать новый элемент, передав в параметре имя тега. 
После создания с элементом можно работать как с обычным элементом, 
а также его можно добавить на страницу методами 
prepend, append, appendChild, insertBefore или insertAdjacentElement.
Если записать результат работы createElement в переменную, 
то в этой переменной будет такой элемент, 
как будто он получекн через querySelector или getElementById. 
Единственное отличие - элемент не будет размещен на странице. 
Элементу можно менять innerHTML, атрибуты, 
навешивать обработчики событий и в конце концов разместить на странице.
`,false,24)}},

        {key:'clone',fn:()=>{
            paste('.cloneNode(true)',
`
.cloneNode()
Метод позволяет клонировать элемент и получить его точную копию. 
Эту копию затем можно вставить на страницу с помощью методов 
prepend, append, appendChild, insertBefore или insertAdjacentElement.
В параметре метод получает true либо false. 
Если передан true, то элемент клонируется полностью, 
вместе со всем атрибутами и дочерними элементами, 
а если false - только сам элемент (без дочерних элементов).
Пример:
let clone=elem.cloneNode(true)
`,false,15)}},

        {key:'prepend',fn:()=>{
            paste('.prepend()',
`
.prepend()
Метод позволяет вставить в начало какого-либо элемента другой элемент. 
Параметром метод принимает элемент, как правило созданный через createElement, 
либо строку. Можно добавить сразу несколько элементов или строк, 
перечислив их через запятую.
`,false,9)}},

        {key:'append',fn:()=>{
            paste('.append()',
`
.append()
Метод позволяет вставить в конец какого-либо элемента другой элемент. 
Параметром метод принимает элемент, как правило созданный через createElement, 
либо строку. Можно добавить сразу несколько элементов или строк, 
перечислив их через запятую.
`,false,9)}},

        {key:'Before',fn:()=>{
            paste('.insertBefore()',
`
.insertBefore()
Метод позволяет вставить элемент перед другим элементом. 
Чаще всего используется после создания элемента с помощью createElement. 
Метод применяется к родителю того элемента, 
перед которым произойдет вставка.
У метода 2 параметра
родитель.insertBefore(вставить элемент, перед кем вставить элемент);
`,false,14)}},

        {key:'insAdjE',fn:()=>{
            paste('.insertAdjacentElement(\'beforeBegin\',elem)',
`
.insertAdjacentElement('beforeBegin',elem)
Метод позволяет вставить элемент в любое место страницы. 
Чаще всего используется после создания элемента с помощью createElement. 
Код вставляется относительно опорного элемента. М
ожно сделать вставку перед опорным элементом (способ вставки beforeBegin), 
после него (способ вставки afterEnd), 
а также в начало (способ вставки afterBegin) 
или в конец (способ вставки beforeEnd) опорного элемента.
опорный элемент.insertAdjacentElement(способ вставки, елемент);
Есть похожие методы: insertAdjacentHTML для строки html кода;
insertAdjacentText для строки текста
`,false,35)}},

        {key:'remove',fn:()=>{
            paste('.remove()',
`
.remove()
Метод позволяет удалить элемент. 
Применяется к тому элементу, который нужно удалить.
`)}},

        {br:true},
        {br:true},

        {key:'text',fn:()=>{
            paste('.textContent',
`
.textContent
Свойство позволяет получить и изменить текст элемента. 
Изменение данного свойства может "сломать" структуру html
элемента, если она есть. Можно пронаблюдать за работой свойства, 
если сначала запустить в данном приложении код
printObj({a:'asd'})
Затем добавить в код строку print('text') (и снова запустить)
В мониторе сломается структура html, созданная функцией printObj()  
`)}},

        {key:'iHT',fn:()=>{
            paste('.innerHTML',
`
.innerHTML
Свойство  позволяет получить и изменить 
HTML код элемента (внутри элемента). 
`)}},

        {key:'oHT',fn:()=>{
            paste('.outerHTML',
`
.outerHTML
Свойство позволяет получить и изменить 
HTML код элемента вместе с его тэгом.
`)}},

        {key:'tag',fn:()=>{
            paste('.tagName',
`
.tagName
Свойство содержит имя тега в верхнем регистре (большими буквами).
`)}},

        {key:'attr',fn:()=>{
            paste('',
`
методы работы с атрибутами элементов 
Получение, установка, удаление, проверка.
`,true);
            defineKeyboard(levelAttr);
        }, bg:subgropColor},

        {key:'dataset',fn:()=>{
            paste('.dataset',
`
.dataset
В языке HTML разрешено добавлять свои атрибуты тегам, 
при этом они должны начинаться с data-, 
а затем должно идти любое название атрибута. 
Для обращения к таким атрибутам через JavaScript 
используется специальное свойство dataset.
В dataset можно передавать данные объектами:
monitor.innerHTML=\`
<div class='dv1'>div</div>
\`
let div=monitor.querySelector('.dv1');
let obj={a:10,b:12}
Object.assign(div.dataset, obj)
print(div.outerHTML)
В результате выполнения этого скрипта вы увидите как 
в html коде элемента появятся атрибуты data-a и data-b
`)}},

        {key:'class',fn:()=>{
            paste('.classList',
`
.classList
Свойство содержит псевдомассив CSS классов элемента, а
также позволяет добавлять и удалять классы элемента, 
проверять наличие определенного класса среди классов элемента.
`,true);
            defineKeyboard(leveClassList);
        }, bg:subgropColor},

        {key:'getComputedStyle',fn:()=>{
            paste('getComputedStyle()',
`
Функция getComputedStyle позволяет получить значение 
любого CSS свойства элемента, даже из CSS файла.
let stl = getComputedStyle(elem)
print(stl.width)
`,false,17)}},

        {br:true},
        {br:true},

        {key:'offsetWdt',fn:()=>{
            paste('.offsetWidth',
`
.offsetWidt
Свойство содержит полную ширину элемента 
(включает собственно ширину элемента, ширину границ, 
внутренние отступы, полосы прокрутки)
`)}},

        {key:'offsetHgt',fn:()=>{
            paste('.offsetHeight',
`
.offsetHeight
Свойство содержит полную высоту элемента 
(включает собственно высоту элемента, высоту границ, 
внутренние отступы, полосы прокрутки)
`)}},

        {key:'clientLeft',fn:()=>{
            paste('.clientLeft',
`
.clientLeft
Свойство содержит ширину левой границы (значение border-left). 
Toчнее clientLeft содержит значение отступа внутренней 
части элемента от внешней. В большинстве случаев clientLeft 
равно border-left, но если документ располагается справа 
налево (например, арабский язык), то в значение clientLeft 
может включатся и ширина полосы прокрутки слева.
`)}},

        {key:'clientTop',fn:()=>{
            paste('.clientTop',
`
.clientTop
Свойство содержит ширину верхней границы (значение border-top).
`)}},

        {key:'clientWdt',fn:()=>{
            paste('.clientWidth',
`
.clientWidth
Свойство содержит ширину элемента внутри границ вместе с padding, но без border и прокрутки.
`)}},

        {key:'clientHgt',fn:()=>{
            paste('.clientHeight',
`
.clientHeight
Свойство содержит высоту элемента внутри границ вместе с padding, но без border и прокрутки.
`)}},

        {key:'offsetPrt',fn:()=>{
            paste('.offsetParent',
`
.offsetParent
Свойство содержит ближайшего родителя, 
относительно которого происходит позиционирование элемента. 
Это будет либо ближайший родитель, 
у которого CSS свойство position не равно static, 
либо тег body, если родителя с таким позиционированием нет.
`)}},

        {key:'offsetTop',fn:()=>{
            paste('.offsetTop',
`
Свойство содержит смещение элемента сверху 
относительно offsetParent (сниппет offsetPrt). 
Содержит расстояние от offsetParent до границы элемента.
`)}},

        {key:'offsetLeft',fn:()=>{
            paste('.offsetTop',
`
.offsetTop
Свойство содержит левое смещение элемента 
относительно offsetParent (сниппет offsetPrt). 
Содержит расстояние от offsetParent до границы элемента.
`)}},

        {key:'ClientRect',fn:()=>{
            paste('.getBoundingClientRect()',
`
.getBoundingClientRect()
Метод содержит объект координат элемента. 
Координаты рассчитываются относительного видимой части страницы 
без учета прокрутки (относительно окна). 
To есть как при свойстве position в значении fixed.
В возвращаемом объекте содержатся свойства: 
left, top, right, bottom, width, height. 
Стоит отметить, что эти свойства не имеют ничего общего с CSS свойствами. 
В них содержатся расстояния до соответствующих сторон элемента. 
Для left/right - от левой границы видимой области страницы, 
а для top/bottom - от верхней.
`)}},

    ];

//EVENT____________________________________________________ 

    let levelEVENT = [

        {key:'...',fn:()=>{defineKeyboard(levelOne);}, bg:retColor},

        {key:'add=>',fn:()=>{
            paste('.addEventListener(\'\', (ev)=>{ })',
`
.addEventListener('', (ev)=>{ })
Метод позволяет назначить на элемент обработчики событий. 
С его помощью, можно указать, например, что делать при клике по кнопке 
или что делать при наборе текста в текстовом поле. 
В первом параметре указываем тип передаваемого события, 
во втором - функцию, которая будет срабатывать после события, 
указанного в первом параметре. 
В третьем необязательном параметре передаем характеристики объекта 
(once, capture, passive) или параметр useCapture.
ev - объект, содержащий событие

В данном синтаксисе используется стрелочная функция внутри метода. 
Стрелочная функция не имеет контекста (нет возможности использовать
this внутри функции). От данного события невозможно отписаться за пределами 
самого события (функция будет не видна) 
`,true,19);
            defineKeyboard(levelEv)},bg:subgropColor},

        {key:'addFn',fn:()=>{
            paste('.addEventListener(\'\', function (ev)=>{ })',
`
.addEventListener('', function (ev)=>{ })
Метод позволяет назначить на элемент обработчики событий. 
С его помощью, можно указать, например, что делать при клике по кнопке 
или что делать при наборе текста в текстовом поле. 
В первом параметре указываем тип передаваемого события, 
во втором - функцию, которая будет срабатывать после события, 
указанного в первом параметре. 
В третьем необязательном параметре передаем характеристики объекта 
(once, capture, passive) или параметр useCapture.
ev - объект, содержащий событие

Данный синтаксис позволяет использовать контекст (this).
Контекст будет именть ссылку на объект, в котором произошло событие. 
От данного события невозможно отписаться за пределами 
самого события (функция будет не видна) 
`,true,19);
            defineKeyboard(levelEv)},bg:subgropColor},

        {key:'addNam',fn:()=>{
            paste('.addEventListener(\'\', NameFn)',
`
.addEventListener('', NameFn)
Метод позволяет назначить на элемент обработчики событий. 
С его помощью, можно указать, например, что делать при клике по кнопке 
или что делать при наборе текста в текстовом поле. 
В первом параметре указываем тип передаваемого события, 
во втором - функцию, которая будет срабатывать после события, 
указанного в первом параметре. 
В третьем необязательном параметре передаем характеристики объекта 
(once, capture, passive) или параметр useCapture.

Вместо NameFn используется имя функции (без скобок),
объявленной за пределами метода. В первый параметр функции будет
попадать событие (его можно использовать внутри функции), если 
в функции использовать this - он будет ссылаться на элемент, 
в котором произошло событие. От события можно отписаться в 
любой части кода, где функция будет "видна". 
`,true,19);
            defineKeyboard(levelEv)},bg:subgropColor},

        {key:'remove',fn:()=>{
            paste('.removeEventListener(\'\', NameFn)',
`
.removeEventListener('', NameFn)
Метод позволяет удалить назначенный ранее 
через addEventListener обработчик события (отписаться). 
Для этого в параметрах нужно передать тип события 
и ту же функцию, которые передавались при назначении события. 
`,false,22);
            defineKeyboard(levelEv)},bg:subgropColor},

        {key:'prevDef',fn:()=>{
            paste('ev.preventDefault()',
`
.preventDefault()
Метод позволяет отменить действия браузера по умолчанию. 
Например, сделать так, чтобы при клике по ссылке не было 
перехода на другую страницу или по нажатию на кнопку форма 
не отправлялась на сервер. 
Как пользоваться: просто внутри функции, 
которая привязана к событию, в любом месте следует вызвать 
ev.preventDefault(), где ev - это объект Event. (первый параметр функции)
`)}},

        {key:'stopProp',fn:()=>{
            paste('ev.stopPropagation()',
`
.stopPropagation()
Метод предотвращает дальнейшее распространение 
события по иерархии DOM (всплытие), 
ограничивая его обработку текущим элементом.
`)}},

        {key:'stImProp',fn:()=>{
            paste('ev.stopImmediatePropagation()',
`
.stopImmediatePropagation()
Метод немедленно прерывает обработку события, 
предотвращая вызов всех оставшихся обработчиков 
на текущем элементе и остановив его дальнейшее распространение.
`)}},

        {key:'type',fn:()=>{
            paste('ev.type',
`
.type
Свойство содержит тип произошедшего события.
`)}},

        {key:'target',fn:()=>{
            paste('ev.target',
`
.target
Свойство содержит элемент, на котором сработало событие. 
Это не тот элемент, к которому был привязан обработчик 
этого события, а именно самый глубокий тег, 
на который непосредственно был, к примеру, совершен клик.
`)}}, 

        {key:'curTarg',fn:()=>{
            paste('ev.currentTarget',
`
.currentTarget
Свойство содержит элемент, для которого было назначено событие. 
В отличие от ev.target, это не самый глубокий тег,
в котором случилось событие, а именно элемент, 
к которому оно было привязано. 
Чаще всего ev.currentTarget совпадает с this, 
но иногда по некоторым причинам это может быть не так. 
В этом случае и нужен currentTarget.
`)}},

        {key:'Trust',fn:()=>{
            paste('ev.isTrusted',
`
.isTrusted
Свойство позволяет проверить реальное ли событие 
(вызвано действием пользователем) или же сымитировано 
на JavaScript с помощью метода dispatchEvent. 
Принимает значение либо true (настоящее), либо false.
`)}},

        {key:'Ctrl',fn:()=>{
            paste('ev.ctrlKey',
`
.ctrlKey
Свойство позволяет узнать, нажата ли клавиша Ctrl во время события.
`)}},

        {key:'Alt',fn:()=>{
            paste('ev.altKey',
`
.altKey
Свойство позволяет узнать, нажата ли клавиша Alt во время события.
`)}},

        {key:'Shift',fn:()=>{
            paste('ev.shiftKey',
`
.shiftKey
Свойство позволяет узнать, нажата ли клавиша Shift во время события.
`)}},

        {key:'win',fn:()=>{
            paste('ev.metaKey',
`
.metaKey
Свойство позволяет узнать, нажата ли клавиша win 
(в linux это super, в mac - Cmd)  во время события.
`)}},

        {key:'clX',fn:()=>{
            paste('ev.clientX',
`
.clientX
Возвращает горизонтальные координаты курсора относительно 
видимой области окна (viewport). 
Это означает, что при скролле страницы положение остаётся 
привязанным именно к видимому экрану, а не ко всей странице целиком.
`)}},

        {key:'clY',fn:()=>{
            paste('ev.clientY',
`
.clientY
Возвращает вертикальные координаты курсора относительно 
видимой области окна (viewport). 
Это означает, что при скролле страницы положение остаётся 
привязанным именно к видимому экрану, а не ко всей странице целиком.
`)}},

        {key:'pgX',fn:()=>{
            paste('ev.pageX',
`
.pageX
Возвращает горизонтальные координаты курсора относительно 
всего документа, в том числе и прокрученной части
за пределами экрана. 
`)}},

        {key:'pgY',fn:()=>{
            paste('ev.pageY',
`
.pageY
Возвращает вертикальные координаты курсора относительно 
всего документа, в том числе и прокрученной части
за пределами экрана. 
`)}},

        {key:'osX',fn:()=>{
            paste('ev.offsetX',
`
.offsetX
Возвращает горизонтальные координаты курсора внутри элемента,
в котором произошло событие.
`)}},

        {key:'osY',fn:()=>{
            paste('ev.offsetY',
`
.offsetY
Возвращает вертикальные координаты курсора  внутри элемента,
в котором произошло событие.
`)}},

        {key:'code',fn:()=>{
            paste('ev.code',
`
.code
Свойство позволяет узнать код нажатой клавиши при вводе текста.
В основном коды записываются KeyA - прификс Key и латинская буква
в верхнем регистре, за исключением некоторых клавишь
`)}},

        {key:'key',fn:()=>{
            paste('ev.key',
`
.key
Свойство позволяет узнать какой символ на нажатой клавише.
Речь идет именно о символах с учетом регистра и расклада
`)}},

        {key:'focus',fn:()=>{
            paste('.focus()',
`
.focus()
Метод устанавливает фокус на элементе (чаще всего на инпуте). 
Это значит, что в этом инпуте начнет моргать курсор и вводимый 
с клавиатуры текст будет попадать именно в этот инпут.
`)}},

        {key:'blur',fn:()=>{
            paste('.blur()',
`
.blur()
Метод снимает фокус с элемента.
`)}},

        {key:'select',fn:()=>{
            paste('.select()',
`
.select()
Метод выделяет элемент формы (удобно для копирования инпутов).
`)}},


        {key:'scrlVi',fn:()=>{
            paste('.scrollIntoView({behavior:\'smooth\', block: \'center\'})',
`
.scrollIntoView({behavior:'smooth', block: 'center'})
Инструмент для управления скроллингом страницы так, 
чтобы определённый элемент гарантированно попал в область 
видимости пользователя. Особенно удобен, если страница длинная, 
а нужный объект далеко внизу или вверху.
Параметры метода позволяют тонко настроить процесс:
- behavior: Определяет анимацию перехода 
("instant" — мгновенный переход, "smooth" — плавный).
- block: Регулирует положение элемента относительно экрана 
(«start» — сверху, «center» — посередине, «end» — снизу).
- inline: Используется для горизонтального выравнивания 
(«start», «center», «end»).
`,false,50)}},

        {key:'scrlBy',fn:()=>{
            paste('.scrollBy({top: ,left: ,behavior:\'smooth\'})',
`
.scrollBy({top: ,left: ,behavior:'smooth'}) или
.scrollBy(x,y)
Прокрутка элемента на указанное количество пикселей 
в качестве параметра могут быть переданы целые числа:
1 - прокрутка по x (+ вправо, - влево)
2- прокрутка по y (+ вниз, - вверх)
Либо передать объект для плавной прокрутки
`,false,15)}},

        {key:'this',fn:()=>{paste(`this`,
`
this
Значение this ссылается на текущий обьект. 
Это значение широко используется JavaScript, 
например в функциях и ООП, его также удобно 
использовать при назначении функций для
прослушивателя событий.
`,false,6)}},

    ];
//OOP___________________________________________________
    let LevelOOP=[

        {key:'...',fn:()=>defineKeyboard(levelOne),bg:retColor},

        {br:true},

        {key:'class',fn:()=>{paste(
`class Name {}`,
`
class Name {
   prop1='text'
   method(){
   this.prop1+='!'
   }
}
Создание нового класса (шаблона объектов)
`,false,10)}},

        {key:'constructor',fn:()=>{paste(
`
  constructor(){}`,
`
constructor(a,b){
   this.prop1=a;
   this.#prop=a-b;
}
Создание конструкктора класса. 
Конструктор нужен для ввода и обработки параметров,
при создании объекта класса.
Все параметры конструктора (в скобках), ддолжны быть указаны при создании
объекта класса. Сам код обработки будет выполняться в момент создания объекта.
Это может быть назначение свойств (в том числе приватных) или вычисление
значений свойств по заданным параметрам. Также можно проводить валидацию
заданных параметров. 
`,false,15)}},

        {key:'prop',fn:()=>{paste(
`
  prop1='';`,
`
prop = 'text'
Простое свойство объекта класса. Значения свойство можно менять
и считывать. Если свойство должно быть изалировано от произвольных
вмешательств, его необходимо сделать приватным.
`,false,8)}},

        {key:'method',fn:()=>{paste(
`
  method1(){};`,
`
method(){
   this.prop1+='!'
}
Простой метод объекта. Это может быть любой код (функция)
с параметрами или без. Методы могут обрабатывать свойства
объекта, втом числе приватные. Для обращения к свойству объекта, 
необходимо использовать this
setPrivate(text){this.#private='text'}
`,false,10)}},

        {key:'#prop',fn:()=>{paste(
`
  #prop='';`,
`
#prop='private text'
Приватное свойство (со знаком #). Такое свойство не может быть прочтено
или установлено стандартным способом objCl.#prop = 'text' 
или print(objCl.#prop) приведет к ошибке.
Для получения и изменения этих свойств можно создавать специальные методы
setPrivate(text){this.#prop='text'}
getPrivate(){return this.#prop}
Стоит отметить, что приватные свойства не наследуются!!!
`,false,8)}},

        {key:'#method',fn:()=>{paste(
`
  #method(){};`,
`
#method(){}
Приватные методы. Данные методы не возможно использовать
за пределами класса. Их могут вцызывать только методы класса,
для обработки, но попытка ObjCl.#method() приведет к ошибке.
Приватные методы не наследуются.
`,false,10)}},

        {key:'extends',fn:()=>{paste(
`class Child extends Parent {};`,
`
class Child extends Parent {}
Наследование свойств и методов. При такой конструкции
Простые свойства и методы класса Patrnt, 
который должен быть заранее объявлен, будут созданы автоматически
в классе Child. При этом классом Child свойства и методы могут быть
дополнены и переназначены.
Приватные свойства и методы не наследуются!!!
`,false,11)}},

        {key:'get',fn:()=>{paste(
`
  get Name(){};`,
`
get Name(){}
Геттеры аксессоров. Этио специальные свойства, конорые будут
выполнять код в фигурных скобках, при попытке получить значение
Name, как обычного свойства. Таким образом можно вернуть значение 
приватного свойства
 get Name() {return this.#name}
Код также может возвращать сборные конструкции из нескольки свойств, 
тем самым создавая псведосвойство, которое будет только для чтения
`,false,11)}},

        {key:'set',fn:()=>{paste(
`
  set Name(){};`,
`
set Name(){}
Сеттеры аксессоров. Этио специальные свойства, конорые будут
выполнять код в фигурных скобках, при попытке присвоить значение
Name через знак равно. Таким образом можно присвоить значение 
приватного свойства
 set Name(name) {this.#name=name}
Код также может совершать валидацию значения или совершать парсинг
значения для расстановки полученных результатов по разным свойствам
`,false,11)}},

        {key:'call',fn:()=>{paste(`.call()`,
`
.call()
Метод позволяет вызвать функцию с заданным контекстом. 
Первым параметром метода следует указывать контекст функции, 
а остальными параметрами - параметры функции.
fn.call(this, param, param)
Вместо this нужно указать элемент или объект, функция fn 
должна использовать объект this
`,false,6)}},

        {key:'apply',fn:()=>{paste(`.apply(el,[params])`,
`
.apply(el,[params])
Метод позволяет вызвать функцию с заданным контекстом. 
Первым параметром метода следует указывать контекст функции, 
а вторым - массив параметров функции.
fn.call(this, param, param)
Вместо this нужно указать элемент или объект, функция fn 
должна использовать объект this
`,false,9)}},

        {key:'bind',fn:()=>{paste(`.bind()`,
`
.bind()
Метод позволяет привязать контекст к функции. 
В качестве первого параметра следует передавать контекст, 
а последующими параметрами - параметры функции. 
Метод возвращает новую функцию, внутри которой this 
будет равным переданному контексту.
fn.call(this, param, param)
Вместо this нужно указать элемент или объект, функция fn 
должна использовать объект this
`,false,6)}},

        {key:'this',fn:()=>{paste(`this`,
`
this
Значение this ссылается на текущий обьект. 
Это значение широко используется JavaScript, 
например в функциях и ООП, его также удобно 
использовать при назначении функций для
прослушивателя событий.
`,false,6)}},

    ];
//ASYNC_________________________________________________
    let leveASYNC = [
        
        {key:'...',fn:()=>{defineKeyboard(levelOne);}, bg:retColor},

        {key:'NEW', fn:()=>{paste(
`new Promise((res,rej)=>{
 if( ) rej (new Error('error promise!'))

 res(reult)
})
`,
`
new Promise
Конструктор создания промиса. В конструктор 
передается функция, первым параметром которой
будет назавние функции успешного выполнения
промиса (обычно resolve), второй параметр 
функции - ошибка(обычно reject).
Сама по себе функция представляет из себя код, 
который выполняется не сразу (в тестовом режиме через 
setTimeout()). В случае если код выполнится с ошибкой - 
ошибка будет передана в reject, результат успешного 
выполнения передается в resolve.
`,false,24)}, bg:syntColor},

        {key:'then', fn:()=>{paste(
`.then(res=>{
  
})
.catch(err=>print(err))
.finally(()=>{
    
})
`,
`
.then
Метод, который позволяет получить результат выполнения промиса.
Если промис возвращает промис, после него можно снова поставить .then.
В конце цепочки обычно ставится .catch для отлова ошибок и можно
использовать finally. Этот блок будет выполнен в любом случае, только 
после получения ответа от промиса (ошибка или результат). Например
в finally можно ставить переключение анимации загрузки после 
вывода результата опреации загрузки. Если результат подвержен 
валидации и не пройдет её, это тоже можно отправить в catch с
помощью инструкции throw.
Стоит отметить что в then промис передает 2 параметра:
1 параметр (response или resolve) содержет результат, 
2 параметр (error) содержит ошибку. Обработка может
выглядеть следующим образом
promise.then((res, err)=>{
    if (err) {print(err); return}
    код обработки результата
})
print является внутренней инструкцией данного приложения, 
которая выводит текст в нижнюю часть экрана, в классической
ситуации обычно это console.error() или console.log()
`,false,13)}, bg:syntColor},

        {key:'all', fn:()=>{paste(`Promise.all()`,
`
Promise.all()
Данный метод позволяет обработать массив промисов,
который должен быть передан в качестве параметра.
Сам посебе метод представляет из себя промис, который 
вернет либо массив результатов, либо ошибку при возникновении
ошибки у хотябы одного из промисов в массиве. 
Обработать можно промис с помощью then либо с помощью 
другого способа обработки.
`,false,12)}},

        {key:'race', fn:()=>{paste(`Promise.race()`,
`
Promise.race()
Данный метод позволяет обработать массив промисов,
который должен быть передан в качестве параметра.
Сам посебе метод представляет из себя промис, который 
вернет либо результат промиса из массива промисов,
который будет завершен самым первым (речь не о порядке)
, либо ошибку при возникновении ошибки у хотябы 
одного из промисов в массиве. 
Обработать можно промис с помощью then либо с помощью 
другого способа обработки.
`,false,13)}},
        
        {key:'then', fn:()=>{paste(`.then(res=>{})`,
`
.then(res=>{})
Метод, который позволяет получить результат выполнения промиса.
В данном случае приведен упрощенный снтаксис.
`,false,12)}},

        {key:'catch', fn:()=>{paste(`.catch(err=>print(err))`,
`
.catch(err=>print(err))
Метод, который позволяет получить ошибку выполнения промиса.
В данном случае приведен упрощенный снтаксис.
print является внутренней инструкцией данного приложения, 
которая выводит текст в нижнюю часть экрана, в классической
ситуации обычно это console.error() или console.log() 
`)}},

        {key:'finally', fn:()=>{paste(`.finally(()=>{})`,
`
.finally(()=>{})
Метод, который выполняется после выполнения промисов и
обработки ошибок и результатов 
`,false,14)}},

        {key:'ASYNC', fn:()=>{paste(
`
async function name(){
  
  try{
   let res1 = await promise

  } catch(err) {
    print(err)
  } finally{
    
  }
}
`,
`
async function name(){}
Здесь представлена конструкция функции в асинхронном стиле
с использованием обработки ошибок try-catch-finally
результаты промисов присваиваются в переменные, инструкция
await позволяет коду дождаться результата и приступить 
к выполнению дальнейшей обработки. Ошибки попадут в 
catch, а блок fanally будет выполнен в конце не зависимо 
от результатов но только после всей обработки.
Стоит отметить, что если написать код вне fanally, он сработает
сразу, тоесть до получения результатов!!!
print является внутренней инструкцией данного приложения, 
которая выводит текст в нижнюю часть экрана, в классической
ситуации обычно это console.error() или console.log()
`,false,20)}, bg:syntColor},

        {key:'async', fn:()=>{paste(`async`,
`
async
Дирректива для создания асинхронной функции 
`)}},

        {key:'await', fn:()=>{paste(`await`,
`
await
Дирректива для получения результатов промиса
в асинхронной функции. НЕ РАБОТАЕТ ВНЕ ФУНКЦИИ!!! 
`)}},

        {key:'try', fn:()=>{paste(`try{}`,
`
try{}
Обработка основного кода, в котором может быть ошибка 
`,false,4)}},

        {key:'catch', fn:()=>{paste(`catch(err){print(err)}`,
`
catch(err){console.error(err)}
Обработка ошибки 
`,false,21)}},

        {key:'throw', fn:()=>{paste(`throw new Error('')`,
`
throw new Error('')
Создание ошибки, чаще всего после условия (например валидации)
`,false,17)}},

        {key:'finally', fn:()=>{paste(`finally{}`,
`
finally{}
Финальная обработка для конструкции try-catch-finally
`,false,8)}},

        {key:'FETCH', fn:()=>{paste(
`fetch('https://',{
headers:{
 mode:'cors',
 method:'post',
 headers:{
  'Content-Type':'application/json',
  'Authorization':'Bearer eyJhbGciOiJI....',
  },
 body:JSON.stringify(obj) 
 }
})
`,
`
fetch('https://adres.org',{
headers:{
 mode:'cors',
 method:'post',
 headers:{
  'Content-Type':'application/json',
  'Authorization':'Bearer eyJhbGciOiJI....',
  },
 body:JSON.stringify(obj) 
 }
})
Эта функция выполнения запросов на сервер. 
Она возвращает промис!
В данном случае представлена конструкция, 
раскрывающая параметры составления запроса:
-первый параметр это URL запроса, сюда
включают втом числе "подразделы" api и 
query string:
https://base.com/users/?name=Egor&age=25
второй параметр представляет из себя (необязательный)
сложный объект:
mode - политика cors (cors/no-cors, есть еще один)
method - метод запроса (GET, POST, PATH, DELETE)
headers - заголовки запроса
body - тело запроса, в котором передаются данные.
В зависимости от заголовка 'Content-Type' тело
может быть строкой, картинкой, JSON, html кодом
или другим. В примере это json именно по этому 
в body передается объект после обработки функцией
JSON.stringify
`,false,15)}, bg:syntColor},
           
        {key:'fetch', fn:()=>{paste(`fetch().then()`,
`
fetch().then()
Эта функция выполнения запросов на сервер. 
Она возвращает промис!
`,false,6)}},

        {key:'ok', fn:()=>{paste(`.ok`,
`
.ok
Свойство объекта (response), который приходит в результате 
fetch. Если свойство в значении true - значит 
ответ имеет статус 2** В других случаях folse
`)}},

        {key:'status', fn:()=>{paste(`.status`,
`
Статус ответа сервера
`)}},

        {key:'body', fn:()=>{paste(`.body`,
`
.body
Свойство объекта, который приходит в результате fetch.
Поток чтения тела ответа ReadableStream 
https://developer.mozilla.org/en-US/docs/Web/API/ReadableStream 
используемый для обработки бинарных данных или текста.
`)}},

        {key:'headers', fn:()=>{paste(`.headers`,
`
.headers
Свойство объекта, который приходит в результате fetch.
Объект заголовков ответа Headers 
https://developer.mozilla.org/en-US/docs/Web/API/Headers.
`)}},

        {key:'arrayBuffer', fn:()=>{paste(`.arrayBuffer()`,
`
.arrayBuffer()
Метод преобразует тело ответа в буфер массива (ArrayBuffer).
Возвращает промис!!!
`)}},

        {key:'blob', fn:()=>{paste(`.blob()`,
`
.blob()
Метод возвращает объект Blob (бинарные большие объекты).
Возвращает промис!!!
`)}},

        {key:'clone', fn:()=>{paste(`.clone()`,
`
.clone()
Метод создаёт копию текущего объекта ответа.
Возвращает промис!!!
`)}},

        {key:'formData', fn:()=>{paste(`.formData()`,
`
.formData()
Метод преобразует тело в форму FormData.
Возвращает промис!!!
`)}},

        {key:'json', fn:()=>{paste(`.json()`,
`
.json()
Метод парсит JSON-тело в объект JavaScript.
Возвращает промис!!!
`)}},

        {key:'text', fn:()=>{paste(`.text()`,
`
.text()
Метод читает тело как строку текста.
Возвращает промис!!!
`)}},

        {key:'get', fn:()=>{paste(`.get('Content-Type')`,
`
.get('Content-Type')
Метод применяется к объекту headers, 
позволяет получить значение заголовка
(первого в списке таких аналогичных),
указанного в качестве аргумента
`,false,19)}},

        {key:'has', fn:()=>{paste(`.has('Content-Type')`,
`
.has('Content-Type')
Метод применяется к объекту headers, 
позволяет получить значение заголовка
(первого в списке таких аналогичных),
указанного в качестве аргумента
`,false,19)}},

        {key:'entries', fn:()=>{paste(`.entries()`,
`
.entries()
Метод применяется к объекту headers, 
является итератором, аналогичным Object.entries()
`)}},

        {key:'keys', fn:()=>{paste(`.keys()`,
`
.keys()
Метод применяется к объекту headers, 
является итератором, аналогичным Object.keys()
`)}},

        {key:'values', fn:()=>{paste(`.values()`,
`
.values()
Метод применяется к объекту headers, 
является итератором, аналогичным Object.values()
`)}},

        {key:'import', fn:()=>{paste(
`
;(async function(){
try{
let {fn1, fn2} = await import('./module.js')

} catch(err) {
print(err)
} 
})()
`,
`
import() (сниппет более расширенный)
Обертка для работы с динамическим импортом.
В данном приложении классический импорт ES
import {func1, func2} from './module'
недоступен, так как код исполняется в виде функции,
а для работы с ES модулями необходимо произвести все импорты
в самом начале кода.
Стоит отметить что динамические импорты возвращают
промис и по этому скрипт пишется в виде асинхронной функции.
Конструкция IIFE позволяет обойтись без вызова функции, 
а print(err) будет выводить ошибки непосредственно в 
монитор. Учитывая, что конструкция сама по себе
в асинхронной функции, можно не создавать дополнительных
асинхронных функций и работать с промисами через await.
`,false,39)}, bg:syntColor},

    ];
//STOR/JSON_____________________________________________
    let LevelSTOR = [

        {key:'...',fn:()=>{defineKeyboard(levelOne)}, bg:retColor},

        {key:'parse', fn:()=>{paste(`JSON.parse()`,
`
JSON.parse()
Преобразование текста в формате JSON
в структуру JS (объект, масси...). 
Аргументом выступает текст имеющий формат JSON
Нессответствие формату приведет к ошибке!!!
`,false,11)}},

        {key:'stringify', fn:()=>{paste(`JSON.stringify()`,
`
JSON.stringify()
С помощью метода JSON.stringify можно преобразовать 
массивы и объекты JavaScript в формат JSON.
`,false,15)}},

        {br:true},
        {br:true},

        {key:'setItem', fn:()=>{paste(`localStorage.setItem('key', 'text')`,
`
localStorage.setItem('key', 'text')
Метод setItem предназначен для 
сохранения данных в локальном хронилище
Первым параметром он принимает ключ, 
а вторым - значение.
`,false,25)}},

        {key:'getItem', fn:()=>{paste(`localStorage.getItem('key')`,
`
localStorage.getItem('key')
Метод getItem предназначен для 
получения данных из локального хронилища
Он принимает один параметр - ключ, 
под которым эти данные были сохранены.
Если данные под указанным ключем еще не сохранялись,
метод вернет null.
`,false,25)}},

        {key:'removeItem', fn:()=>{paste(`localStorage.removeItem('key')`,
`
localStorage.removeItem('key')
С помощью метода removeItem можно удалять
данные и связанный с ними ключ.
`,false,28)}},

        {key:'clear', fn:()=>{paste(`localStorage.clear()`,
`
localStorage.clear()
С помощью метода clear можно очистить все хранилище.
`)}},

        {key:'length', fn:()=>{paste(`localStorage.length`,
`
localStorage.length
С помощью свойства length можно узнать количество записей в локальном хранилище.
`)}},

        {key:'key', fn:()=>{paste(`localStorage.key()`,
`
localStorage.key()
Каждая запись в локальном хранилище имеет свой номер. 
По номеру можно получить ключ этой записи. 
Параметром метода является номер записи.
`,false,17)}},

    ];
//Canvas_______________________________________________ 

    let levelCANVAS=[

        {key:'...',fn:()=>{defineKeyboard(levelOne)}, bg:retColor},

        {key:'context', fn:()=>{paste(`.getContext('2d')`,
`
.getContext('2d')
Получение контекста выполнения (рисование в 2d)
Данный метод применяется 
непосредственно к объекту canvas
let can = document.querySelector('canvas')
let ctx = can.getContext('2d').
или цепочкой
let ctx = document.querySelector('canvas').getContext('2d')
Далее к полученному контексту 
можно применять методы для рисования в двухмерной плоскости.
`)}},

        {key:'context', fn:()=>{paste(
`monitor.innerHTML=\`
<canvas width='330' height='500'></canvas>
\`
style.innerHTML=\`
canvas {border: 1px solid black}
\`
let ctx = document.querySelector('canvas').getContext('2d')
`,
`
.getContext('2d')
Получение контекста выполнения (рисование в 2d)
Данный метод применяется 
непосредственно к объекту canvas
let can = document.querySelector('canvas')
let ctx = can.getContext('2d').
или цепочкой
let ctx = document.querySelector('canvas').getContext('2d')
Далее к полученному контексту 
можно применять методы для рисования в двухмерной плоскости.
`)},bg:syntColor},

        {key:'begin', fn:()=>{paste(`.beginPath()`,
`
.beginPath()
Данным методом необходимо объявить начало рисования фигуры.
beginPath сбрасывает все последние точки незавершенных контуров.
ctx.beginPath();
ctx.moveTo(10,10);
ctx.lineTo(200,10);
ctx.lineTo(100,100);
ctx.stroke(); // рисуем созданные линии
ctx.beginPath(); // эксперементально объявляем новую сессию
ctx.closePath(); // пытаемся закрыть контур
ctx.stroke(); // отрисовка не дает результата.
Текст примера не логичен, но он ярко демонстрирует, что 
beginPath сбрасывает все незавершенные контуры сессии, 
тоесть объявляет новую сессию.
Кроме точек, данный метод закрепляет цвета предыдущей фигуры
(цвета линий и заливки). Тоесть после begimPath можно задать
новые цвета, если это сделать без begimPath света могут либо
смешаться либо принять занчение последнего свойства
strokeStyle и fillStyle
`)}},

        {key:'move', fn:()=>{paste(`.moveTo()`,
`
.moveTo()
Перемещение пера "над холстом", тоесть без рисования линии.
В качестве аргумента указывается координата точки (x,y). Данный метод
применяется в самом начале пути (контура) после .beginPath(), 
для отрисовки новой фигуры, также его необходимо применять для разрыва линий.
Стоит понимать, что разрыв линий влияет на closePath, данный метод завиршит
контур от последнего разрыва линии. 
`,false, 8)}},

        {key:'line', fn:()=>{paste(`.lineTo()`,
`
.lineTo()
Рисование прямой линии в заданную агрументом точку (x,y) от 
предыдущей точки, в которой остановилось рисование lineTo или
перемещение moveTo.
`,false, 8)}},


        {key:'stroke', fn:()=>{paste(`.stroke()`,
`
.stroke()
Данный метод применяется в конце контура (пути) после 
всех манипуляций moveTo, lineTo, arc и других для 
отрисовки всех линий контура. метод отрисовывает именно линии.
Если цвет линии и цвет заливки одинаковый и необходима именно заливка - 
можно просто применить fill() - заливка 
`)}},

        {key:'close', fn:()=>{paste(`.closePath()`,
`
.closePath()
Этот метод пытается закрыть фигуру, 
рисуя прямую линию из конечной точки в начальную. 
Если фигура была уже закрыта или является просто точкой, 
то метод ничего не делает. Первой точкой контура 
считается первая точка после beginPath или после разрыва
moveTo(), есл исессия состояла не из сплошной линии.
Возможно неоднократное применение метода в течении сессии
`)}},

        {key:'fill', fn:()=>{paste(`.fill()`,
`
.fill()
Этот метод аналогичен методу closePath, но он 
не просто замыкет контур, но и закрашивает его
цветом, заданным свойством .fillStyle. 
У данного метода есть особенность, он 
'помнит' все точки разрыва и автоматически закрывает
незавершенные контуры. Метод целесообразно применять
1 раз за сессию, не стоит его использовать в сессиях, 
где есть контурные и закрашенные фигуры, лучше эти 
фигуры разделить на сессии. Также важно отметить, что
разные цвета линии и заливки в сессии требуют и 
отрисвоки линий stroke() и заливки fill(), если необходимо
чтобы фигура была отрсивоана например черными контурами
и закрашена красным цветом. 
`)}},

        {key:'sRect', fn:()=>{paste(`.strokeRect(x,y,w,h)`,
`
.strokeRect(x,y,width,heigth)
Контур прямоугольника. Готовая фигура
`,false, 19)}},

        {key:'fRect', fn:()=>{paste(`.fillRect(x,y,w,h)`,
`
.fillRect(x,y,w,h)
Прямоугольник с заливкой. Готовая фигура
`,false, 17)}},

        {key:'cRect', fn:()=>{paste(`.clearRect(x,y,w,h)`,
`
.clearRect(x,y,w,h)
Прямоугольный ластик. Очищает область прямоугольной формы.
`,false, 18)}},

        {key:'arc', fn:()=>{paste(`.arc(x,y,r,stAn,endAng,dir)`,
`
.arc(x,y,r,stAn,endAng,dir)
Рисует дугу с центром в некоторой точке. Он принимает следующие параметры: 
x, y, радиус r, начальный угол startAngle, конечный угол endAngle, 
рисовать по или против часовой стрелки direction.
Параметр direction принимает следующие значения: 
true заставляет рисовать по часовой стрелке, 
false против часовой (по умолчанию).
При этом углы в методе arc измеряют в радианах, не в градусах. 
`,false, 26)}},

        {key:'ellipse', fn:()=>{paste(`.ellipse(x,y,rx,ry,rotat,d0,d1,a)`,
`
.ellipse(x,y,rx,ry,rotat,d0,d1,a)
Создает элипс с нужным углом наклона. 
Описание аргументов:
- x: горизонтальное положение центра эллипса.
- y: вертикальное положение центра эллипса.
- radiusX: радиус эллипса по оси X (ширина).
- radiusY: радиус эллипса по оси Y (высота).
- rotation: угол поворота эллипса вокруг своего центра (радианы). 
Если равен нулю, эллипс ориентирован вертикально и горизонтально.
- startAngle: угол начала дуги эллипса (радианы).
- endAngle: угол окончания дуги эллипса (радианы).
- anticlockwise: булево значение, 
определяющее направление прорисовки эллипса 
(true — против часовой стрелки, false — по часовой стрелке). 
`,false, 32)}},
       
        {key:'quadratic', fn:()=>{paste(`.quadraticCurveTo(cpx,cpy,x,y)`,
`
.quadraticCurveTo(cpx,cpy,x,y)
Квадратичная кривая Безье. Данный метод используется для 
отрисовки квадратичных плавных кривых диний.
cpx и cpy это координата мнимой точки скривления.
Данная точка будет вытягивать кривую в свою сторону,
точка может распологаться за приделами холста. 
x / y конечная точка кривой (подобно lineTo).
`,false, 29)}},

        {key:'Bezier', fn:()=>{paste(`.bezierCurveTo(cp0x,cp0y,cp1x,cp1y,x,y)`,
`
.bezierCurveTo(cp0x,cp0y,cp1x,cp1y,x,y)
Кубическая кривая Безье. Данный метод используется для 
отрисовки кубических (от степени функции) плавных кривых диний.
Метод имеет 2 точки искривления
cp0x / cp0y и cp1x / сp1y Данные точки будут оттягивать
кривую в своем направлении, создавая плавное искривление.
x / y конечная точка кривой (подобно lineTo).
`,false, 38)}},

        {key:'fillText', fn:()=>{paste(`.fillText(\'text\',x,y)`,
`
.fillText(\'text\',x,y)
Метод рисует на canvas заданный текст. 
Первым параметром он принимает сам текст, 
а вторым и третьим - координаты точки, 
в которой этот текст следует расположить. 
Размер и тип шрифта задаются с помощью свойства font.
`,false, 20)}},

        {key:'strokeText', fn:()=>{paste(`.strokeText(\'text\',x,y)`,
`
.strokeText(\'text\',x,y)
Метод рисует контур текста на canvas. 
Первым параметром принимает текст для рисования, 
а вторым и третьим - координаты этого текста на холсте канваса. 
Размер и тип шрифта задаются с помощью свойства font.
`,false, 20)}},

        {br:true},
        {br:true},

        {key:'stStyle', fn:()=>{paste(`.strokeStyle`,
`
.strokeStyle
Свойство. Цвет линии. Данное свойство задают после 
объявления beginPath()
`)}},

        {key:'flStyle', fn:()=>{paste(`.fillStyle`,
`
.fillStyle
Свойство. Цвет заливки. Данное свойство задают после 
объявления beginPath()
`)}},

        {key:'Width', fn:()=>{paste(`.lineWidth`,
`
.lineWidth
Свойство. Толщина линии. Задается целым числом,
занчение измеряется в пикселях.
Данное свойство задают после 
объявления beginPath()
`)}},

        {key:'Cap', fn:()=>{paste(`.lineCap`,
`
.lineCap
Свойство задает вид конца линии. 
Может принимать следующие значения: 
butt - плоский конец (по умолчанию), 
round - скругленный конец, 
square - квадратный конец.
`)}},

        {key:'Join', fn:()=>{paste(`.lineJoin`,
`
.lineJoin
Свойство задает способ объединения двух линий. 
Может принимать следующие значения: miter - острый угол (по умолчанию), 
round - скругленный угол, bevel - плоский угол.
`)}},

        {key:'font', fn:()=>{paste(`.font`,
`
.font
Свойство задает настройки шрифта при его рисовании на canvas 
с помощью метода fillText или метода strokeText. 
Свойство задается аналогично CSS свойству font.
`)}},

        {key:'textAlign', fn:()=>{paste(`.textAlign`,
`
.textAlign
Свойство задает горизонтальное выравнивание текста, 
нарисованного с помощью метода fillText или метода strokeText. 
Принимает одно из возможных значений: start (по умолчанию), end, left, right, center 
(см. CSS свойство text-align для понимания этих значений):
`)}},

        {key:'textBaseline', fn:()=>{paste(`.textBaseline`,
`
.textBaseline
Свойство задает вертикальное выравнивание текста, 
нарисованного с помощью метода fillText или метода strokeText. 
Принимает одно из возможных значений: 
top, hanging, middle, alphabetic (по умолчанию), 
ideographic, bottom 
см. www.w3schools.com/tags/canvas_textbaseline.asp ).
`)}},

    ]
//Ev____________________________________________________

    let levelEv=[
        {key:'...',fn:()=>{defineKeyboard(levelEVENT)}, bg:retColor},

        {key:'click',fn:()=>{
            paste('click','\nclick\nКлик левой кнопкой мыши')
            defineKeyboard(levelEVENT);
        }, bg:retColor},

        {key:'moDn',fn:()=>{
            paste('mousedown','\nmousedown\nНажата левая кнопка мыши')
            defineKeyboard(levelEVENT);
        }, bg:retColor},

        {key:'moUp',fn:()=>{
            paste('mouseup','\nmouseup\nОтпущена левая кнопка мыши')
            defineKeyboard(levelEVENT);
        }, bg:retColor},

        {key:'moMov',fn:()=>{
            paste('mousemove','\nmousemove\nДвижение указателя мыши')
            defineKeyboard(levelEVENT);
        }, bg:retColor},

        {key:'moOut',fn:()=>{
            paste('mouseout','\nmouseout\nУказатель мыши покинул элемент')
            defineKeyboard(levelEVENT);
        }, bg:retColor},

        {key:'moOvr',fn:()=>{
            paste('mouseover','\nmouseover\nУказатель мыши находится внутри области отображения элемента')
            defineKeyboard(levelEVENT);
        }, bg:retColor},

        {key:'cont',fn:()=>{
            paste('contextmenu','\ncontextmenu\nПравая кнопка мыши')
            defineKeyboard(levelEVENT);
        }, bg:retColor},

        
        // {br:true},

        {key:'keyDn',fn:()=>{
            paste('keydown','\nkeydown\nКлавиша нажата')
            defineKeyboard(levelEVENT);
        }, bg:retColor},

        {key:'keyUp',fn:()=>{
            paste('keyup','\nkeyup\nКлавиша отпущена')
            defineKeyboard(levelEVENT);
        }, bg:retColor},

        {key:'chan',fn:()=>{
            paste('change','\nchange\nЭлемент теряет фокус ввода, \nа содержимое элемента изменилось за время, \nпока элемент был в фокусе.')
            defineKeyboard(levelEVENT);
        }, bg:retColor},

        {key:'inp',fn:()=>{
            paste('input','\ninput\nВвод текста(символа).\n События для input и textarea.\n Ev имеет свойство data - введенный символ')
            defineKeyboard(levelEVENT);
        }, bg:retColor},

        {key:'sel',fn:()=>{
            paste('select','\nselect\nКакая-то часть текста внутри элемента становится выделенной.')
            defineKeyboard(levelEVENT);
        }, bg:retColor},

        {key:'submit',fn:()=>{
            paste('submit','\nsubmit\nСобытие отправки формы(кнопка \'отправить\')')
            defineKeyboard(levelEVENT);
        }, bg:retColor},

        {br:true},

        {key:'blur',fn:()=>{
            paste('blur','\nblur\nПотеря фокуса (текстовые поля, кнопки, чекбокс...)')
            defineKeyboard(levelEVENT);
        }, bg:retColor},

        {key:'focus',fn:()=>{
            paste('focus','\nfocus\nФокус (текстовые поля, кнопки, чекбокс...)')
            defineKeyboard(levelEVENT);
        }, bg:retColor},

        {key:'load',fn:()=>{
            paste('load','\nload\nЗагрузка завершена')
            defineKeyboard(levelEVENT);
        }, bg:retColor},

        {key:'unload',fn:()=>{
            paste('unload','\nunload\nПроизводится выход из документа \n(закрытие или перенаправление страницы на другой адрес).')
            defineKeyboard(levelEVENT);
        }, bg:retColor},

        {key:'scroll',fn:()=>{
            paste('scroll','\nscroll\nСрабатывает при прокрутке элемента.')
            defineKeyboard(levelEVENT);
        }, bg:retColor},

        {key:'error',fn:()=>{
            paste('error','\nerror\nОшибка (например при загрузке картинки)')
            defineKeyboard(levelEVENT);
        }, bg:retColor},

        {key:'deviceorientation',fn:()=>{
            paste('deviceorientation',
`
deviceorientation
Событие относится к девайсам, оснащенным 
героскопом (классический пример - смартфон).
Опрос события необходимо применять к объекту 
window.
Объект события (ev) имеет 3 свойства: 
alpha, beta и gamma. Каждое свойство соответствует
своей плоскости (желательно протестировать).
`)
            defineKeyboard(levelEVENT);
        }, bg:retColor},

    ];
//attr____________________________________________________
    let levelAttr = [

        {key:'...',fn:()=>{
            defineKeyboard(levelMiscDOM);
        }, bg:retColor},

        {key:'get',fn:()=>{
            paste('.getAttribute(\'\')','\n.getAttribute()\nМетод считывает значение заданного атрибута у тега.',false,15);
            defineKeyboard(levelMiscDOM);
        }, bg:retColor},

        {key:'set',fn:()=>{
            paste('.setAttribute(\'\')','\n.setAttribute()\nМетод устанавливает значение заданного атрибута у тега.',false,15);
            defineKeyboard(levelMiscDOM);
        }, bg:retColor},

        {key:'rem',fn:()=>{
            paste('.removeAttribute(\'\')','\n.removeAttribute()\nМетод удаляет атрибут тега.',false,18);
            defineKeyboard(levelMiscDOM);
        }, bg:retColor},

         {key:'has',fn:()=>{
            paste('.hasAttribute(\'\')','\n.hasAttribute()\nМетод проверяет наличие атрибута true/false',false,15);
            defineKeyboard(levelMiscDOM);
        }, bg:retColor},

    ];
//classList_________________________________________________
    let leveClassList = [

        {key:'...',fn:()=>{
            defineKeyboard(levelMiscDOM);
        }, bg:retColor},

        {key:'add',fn:()=>{
            paste('.add(\'\')','\n.add()\nДобавить класс элементу\nНазвание класса без точки!',false,6);
            defineKeyboard(levelMiscDOM);
        },bg:retColor},

        {key:'remove',fn:()=>{
            paste('.remove(\'\')','\n.remove()\nУдалить класс элемента\nНазвание класса без точки!',false,9);
            defineKeyboard(levelMiscDOM);
        },bg:retColor},

        {key:'contains',fn:()=>{
            paste('.contains(\'\')','\n.contains()\nПроверить наличие класса элемента\nНазвание класса без точки!',false,11);
            defineKeyboard(levelMiscDOM);
        },bg:retColor},

        {key:'toggle',fn:()=>{
            paste('.toggle(\'\')','\n.toggle()\nПереключатель(убрать/поставить)\nНазвание класса без точки!',false,9);
            defineKeyboard(levelMiscDOM);
        },bg:retColor},

    ];

//HTML____________________________________________________
    let levelHTML =[
        {key:'...',fn:()=>{
            defineKeyboard(levelOne);
        }, bg:retColor},

        {br:true},

        {key:'p', fn:()=>{paste(`<p class=''> </p>`,'\n<p> абзац',false,10)}},

        {key:'h1', fn:()=>{paste(`<h1 class=''> </h1>`,'\n<h1> заголовок 1',false,11)}},

        {key:'h2', fn:()=>{paste(`<h2 class=''> </h2>`,'\n<h2> заголовок 2',false,11)}},

        {key:'a', fn:()=>{paste(`<a class='' href=''> </a>`,'\n<a> ссылка',false,10)}},

        {key:'img', fn:()=>{paste(`<img class='' src='' alt='' width='300' height='200'>`,'\n<img> картинка (не требует закрытия)',false,12)}},

        {key:'ul', fn:()=>{paste(
`
<ul class=''> 
  <li> text </li>
  <li> text </li>
</ul>
`,'\n<ul> ненумерованный список (внутри должен содержать элементы <li>)',false,12)},bg:syntColor},

        {key:'ol', fn:()=>{paste(
`
<ol class=''> 
  <li> text </li>
  <li> text </li>
</ol>
`,'\n<ul> нумерованный список (внутри должен содержать элементы <li>)',false,12)},bg:syntColor},
        {key:'li', fn:()=>{'<li> <li>','\n<li> элемент списка (пункт)',false,4}},

        {key:'div', fn:()=>{paste(`<div class=''> </div>`,'\n<div> блок - блочный элемент',false,12)}},

        {key:'sp', fn:()=>{paste(`<span class=''> </span>`,'\n<span> строчный элемент. Служит для стилизации части строки.',false,13)}},

        {br:true},
    
        {key:'br', fn:()=>{paste(`<br>`,'\n<br> перенос (не требует закрытия)')}},

        {key:'i', fn:()=>{paste(`<i></i>`,'\n<i> курсив. Внутри данного тега текст отображается курсивом',false,3)}},

        {key:'b', fn:()=>{paste(`<b></b>`,'\n<b> жирный. Внутри данного текста текст отображается жирным ',false,3)}},

        {key:'s', fn:()=>{paste(`<s></s>`,'\n<s> зачеркнутый. Для отображения зачеркнутого текста',false,3)}},

        {key:'hr', fn:()=>{paste(`<hr>`,'\n<hr> перенос с подчеркиванием (не требует закрытия)')}},

        {br:true},

        {key:'table', fn:()=>{paste(
`
<table class=''> 
  <tr>
    <th>head</th>
    <th>head</th>
    <th>head</th>
  </tr>
  <tr>
    <td>text</td>
    <td>text</td>
    <td>text</td>
  </tr>
  <tr>
    <td>text</td>
    <td>text</td>
    <td>text</td>
  </tr>
</table>
`,'\n<table> таблица. Внутри создается структура таблицы',false,15)},bg:syntColor},

        {key:'tr', fn:()=>{paste(
`
  <tr>
    <td>text</td>
    <td>text</td>
    <td>text</td>
  </tr>
`,'\n<tr> строка таблицы. Внутри тега должны быть ячейки td или th (для заголовков)',false,20)},bg:syntColor},

        {key:'td', fn:()=>{paste('<td></td>','простая ячейка таблицы',false,4)}},

        {key:'th', fn:()=>{paste('<th></th>','Ячейка верхней строки',false,4)}},

        {key:'tBo', fn:()=>{paste(
`
  <tbody>
  </tbody>
`,'\nТело таблицы, в этот тег можно заключить середину таблицы',false,10)},bg:syntColor},

        {key:'tFo', fn:()=>{paste(
`
  <tfoot>
  </tfoot>
`,'\nИтоговая часть таблицы (обычно нижняя строка)',false,10)},bg:syntColor},

        {key:'tHe', fn:()=>{paste(
`
  <thead>
  </thead>
`,'\nГоловная часть таблицы',false,10)},bg:syntColor},

        {key:'cap', fn:()=>{paste('<caption></caption>','\n<caption> название таблицы размещается внутри тега <table> на первом месте (до таблицы)',false,9)}},

        {br:true},

        {key:'form', fn:()=>{paste(`<form class='' action='' method=''></form>`,
        `
        <form>
        Тег служит контейнером для тегов input, textarea, select, button, fieldset.
        Указанные теги не обязательно следует размещать в теге form,
        Данный тег объединяет указанные теги и соберает в единый запрос при отправке
        submit
        `,false,13)}},

        {key:'input', fn:()=>{paste(`<input type='text' class=''>`,
`
<input> (не требует закрытия)
Поле вводаю. Вид данного элемента определяется атрибутом type
text - простой текст
color - подбор цвета
number - только цифры
email - электронная почта
checkbox - чекбокс
radio - радиопереключатель
есть много других вариантов!
`,false,17)}},

        {key:'button', fn:()=>{paste(`<button class=''>button</button>`,'\n<button> кнопка',false,15)}}, 

        {key:'textarea', fn:()=>{paste(`<textarea class=''></textarea>`,'\n<textarea> поле ввода больших текстов',false,17)}},

        {key:'select', fn:()=>{paste(
`
<select class=''> 
  <option> sel 1 </option>
  <option> sel 2 </option>
</select>
`,'\n<select> поле для выбора значений, если указать атрибут multiple появится возможность множественного выбора',false,16)},bg:syntColor},
        {key:'option', fn:()=>{paste(`<option value=''></option>`,
`
<option>
Пункт выбора в select, размещается внутри тега select
Атрибут value содержит фактическое значение, которое будет присвоено
тегу select при выборе данного пункта. Внутри тега - отображаемое значение
`,false, 15)}},
        {key:'label', fn:()=>{paste(`<label><input type="checkbox"> mark</label>`,
`
<label>
Метка привязывается к определенному полю ввода с помощью атрибута for. 
В нем следует указывать значение атрибута id поля ввода, к которому 
привязана метка. Также метка привязывается к элементу, 
если этот элемент положить вовнутрь тега label. 
В этом случае атрибут for указывать не надо.
`)},bg:syntColor},

        {key:'datalist', fn:()=>{paste(
`
<input type='text' list='data'>
<datalist id='data'> 
  <option> sel 1 </option>
  <option> sel 2 </option>
</datalist>
`,'\n<datalist> cписок рекомендованных значений для input, привязывается к input через id (см. пример)',false,30)},bg:syntColor},

        {br:true},

        {key:'header', fn:()=>{paste(`<header> </header>`,'\n<header> хедер',false,8)}},

        {key:'main', fn:()=>{paste(`<main> </main>`,'\n<main> поле для контента',false,6)}},

        {key:'aside', fn:()=>{paste(`<aside> </aside>`,'\n<aside> сайдбар',false,7)}},

        {key:'footer', fn:()=>{paste(`<footer> </footer>`,'\n<footer> футер (нижняя часть- реклама, контакты...)',false,8)}},

        {key:'nav', fn:()=>{paste(`<nav> </nav>`,'\n<nav> главное меню',false,5)}},

        {key:'section', fn:()=>{paste(`<section> </section>`,'\n<section> раздел страницы',false,9)}},

        {key:'canvas', fn:()=>{paste(`<canvas width='330' height 500></canvas>`,
`
<canvas>
Холст для рисования. Стоит обратить внимание,
что размер холста нужно задавать в HTML.
Размер назначенный в CSS изменит размер окна,
но не изменит количество точек на холсте!!!
`)}},
    ];
    //CSS__________________________________________________
    let levelCSS =[
        {key:'...',fn:()=>{
            defineKeyboard(levelOne);
        }, bg:retColor},

         {key:'monitor', fn:()=>{paste(
`
#monitor {

}
`,'\nCелектор монитор, для расположенных внутри нижнего окна элементов', false,10)},bg:syntColor},

        {br:true},

        {key:'wid', fn:()=>{paste('width: ','\nwidth ширина эдемента.\n Метрика: px-пиксели, vw - %от ширины экрана, em - % от размера радителя, fr - фпакция для flex и grid')}},

        {key:'hei', fn:()=>{paste('height: ','\nheight высота блочного эдемента.\n Метрика: px-пиксели, vh - %от высоты экрана, em - % от размера радителя, fr - фпакция для flex и grid')}},

        {key:'min', fn:()=>{paste('min-','\nmin- составное слово (минимум) для height и width',true)}},

        {key:'max', fn:()=>{paste('max-','\nmax- составное слово (максимум) для height и width',true)}},

        {key:'mar', fn:()=>{paste('margin: ','\nargin отступ от границ соседнего/родительского элемента')}},

        {key:'pad', fn:()=>{paste('padding: ','\npadding отступ от границ внутри элемента')}},

        {key:'bxSz', fn:()=>{paste('box-sizing: border-box;','\nborder-box или content-box\nborder-box устанавливает жесткие границы элемента')}},

        {br:true},

        {key:'pos', fn:()=>{paste('position: absolute;',
`
position
Задает способ позиционирования элементов.

absolute - Абсолютное позиционирование. 
relative - Относительное позиционирование. 
Элемент смещается относительно своего нормального положения
в потоке документа, но пространство, 
которое он занимал, остается зарезервированным.
fixed - Фиксированное позиционирование. 
Элемент удаляется из нормального потока документа и 
позиционируется относительно окна браузера. 
Остается на месте при прокрутке страницы.
static - Статичное позиционирование. 
Значение означает отсутствие позиционирования 
и элемент ведет себя как обычно.
sticky - Липкое позиционирование. 
Элемент ведет себя как relative, 
пока не достигнет заданной позиции при прокрутке, 
после чего прилипает к указанному месту (как fixed).
`)}},   
        {key:'bt', fn:()=>{paste('bottom:','\nbottom\nАбсолютная позиция от верхнего края')}},

        {key:'tp', fn:()=>{paste('top:','\ntop\nАбсолютная позиция от нижнего края')}},

        {key:'lf', fn:()=>{paste('left:','\nleft\nАбсолютная позиция от левого края')}}, 

        {key:'rt', fn:()=>{paste('right:','\nright\nАбсолютная позиция от правого края')}},

        {br:true},

        {key:'dis', fn:()=>{paste('display: flex;',
`
display - устанавливает способ отображения элемента
block - Блочный элемент.
inline - Строчный элемент.
inline-block - Строчно-блочный элемент.
list-item - Элемент станет пунктом списка 
и перед ним появится маркер списка.
flex - Устанавливает элемент как блочный, 
а его потомки станут flex элементами.
inline-flex - Устанавливает элемент как строчно-блочный, 
а его потомки станут flex элементами.
grid - Создает элемент-сетку.
none - Элемент вообще пропадет и все остальные 
элементы будут вести себя так, как будто этого элемента нет.
table - Элемент будет вести себя как таблица.
table-cell - Элемент будет вести себя как ячейка таблицы.
inline-table - Элемент будет вести себя как таблица, 
но при этом таблица является встроенным элементом и 
происходит ее обтекание другими элементами, например, текстом.
table-caption - Элемент будет вести себя как тег caption.
table-column - Элемент будет вести себя как колонка таблицы.
table-row - Элемент будет вести себя как ряд таблицы.
table-column-group - Элемент будет вести себя как тег colgroup.
table-footer-group - Элемент будет вести себя как тег tfoot.
table-header-group - Элемент будет вести себя как тег thead.
table-row-group - Элемент будет вести себя как тег tbody.
run-in - Устанавливает элемент как 
блочный или встроенный в зависимости от контекста.
`)}},

        {key:'flDir', fn:()=>{paste('flex-direction:','\nflex-direction\nНаправление flex: row / row-rverse / column / column-reverse')}},

        {key:'flBas', fn:()=>{paste('flex-basis:','\nflex-basis\nРазмер flex элемента вдоль главной оси (задается на селектор элемента)')}},

        {key:'juCo', fn:()=>{paste('justify-content:',
`
justify-content
Выравнивание элементов вдоль главной оси для flex блоков 
и по горизонтальной оси для гридов.

flex-start - Блоки прижаты к началу главной (горизонтальной) оси.
flex-end - Блоки прижаты к концу главной (горизонтальной) оси.
center - Блоки стоят по центру главной (горизонтальной) оси.
space-between - Блоки распределены вдоль главной (горизонтальной) оси, 
при этом первый элемент прижат к началу оси, а последний - к концу.
space-around - Блоки распределены вдоль главной (горизонтальной) оси,
при этом между первым блоком и началом оси, 
последним блоком и концом оси такой же промежуток, 
как и между остальными блоками.
`)}},

        {key:'alIt', fn:()=>{paste('align-items:',
`
align-items
Выравнивание элементов вдоль поперечной оси для flex блоков и 
по вертикальной оси для гридов.

flex-start - Блоки прижаты к началу поперечной (вертикальной) оси.
flex-end - Блоки прижаты к концу поперечной (вертикальной) оси.
center - Блоки стоят по центру поперечной (вертикальной) оси.
baseline - Элементы выравниваются по своей базовой линии. 
Базовая линия - это воображаемая линия, проходящая по нижнему 
краю символов без учета свисаний, например, как у букв 'p' и 'y'.
stretch - Блоки растянуты, занимая все доступное место по поперечной оси, 
при этом все же учитываются min-width и max-width, если они заданы. 
Если же задана ширина и высота для элементов - stretch будет проигнорирован.
`)}},

        {key:'gap', fn:()=>{paste('gap:','\ngap\nЗадает расстояние между элементами в гриде.')}},

        {key:'grTp', fn:()=>{paste('grid-template: repeat(4, 1fr)/repeat(3, 1fr);','\ngrid-template\nЗадает количество и ширину рядов и столбцов, которые будет занимать элемент в гриде или сетке.')}},

        {key:'grCl', fn:()=>{paste('grid-column: 1/3;','\ngrid-column\nЗадает начальную и конечную позиции элемента в гриде или сетке по столбцам.')}},

        {key:'grRw', fn:()=>{paste('grid-row: 1/3;','\ngrid-row\nЗадает начальную и конечную позиции элемента в гриде или сетке по рядам.')}},

        {key:'txtAl', fn:()=>{paste('text-align;','\ntext-align\nВыравнивание текста | center | left | right | justify | auto | start | end.')}},

        {br:true},

        {key:'border', fn:()=>{paste('border: 1px solid black;',
`
border - граница элемента (ширина тип цвет)
Второй параметр задает тип линии границы:
solid - Сплошная линия.
dotted - Граница в виде точек.
dashed - Граница в виде тире.
ridge - Граница в виде выпуклой линии.
double - Граница в виде двойной линии. 
Чтобы увидеть эффект толщина границы должна быть минимум 3px.
groove - Вогнутая граница.
inset - Вдавленная граница.
outset - Выпуклая граница.
none - Отсутствие границы.
`)}},
      
        {key:'boRad', fn:()=>{paste('border-radius:','\nborder-radius\nЗакругление углов в px или %')}},

        {key:'shad', fn:()=>{paste('box-shadow:',
`
box-shadow
Задает тень блоку.
Последовательность параметров

inset - Необязательный параметр.
Если он задан, то тень будет внутри контейнера, 
если не задан - то снаружи.
сдвиг по x - Задает смещение тени по оси X.
Положительное значение смещает вправо, отрицательное - влево.
сдвиг по y - Задает смещение тени по оси Y.
Положительное значение смещает вниз, отрицательное - вверх.
размытие - Задает размытие тени.
Чем больше значение - тем более размытой будет тень.
Необязательный параметр. Если не задан - тень будет четкой.
размер тени - Задает размер тени.
Положительное значение растягивает тень, отрицательное, наоборот, ее сжимает.
Необязательный параметр. Если не задан - тень будет такого же размера, что и элемент.
цвет - Задает цвет тени в любых единицах для цвета.
Необязательный параметр. Если не задан - цвет тени совпадает с цветом текста.

`)}},

        {key:'color', fn:()=>{paste('color:','\ncolor\nЦвет текста')}},

        {key:'backgnd', fn:()=>{paste('background:','\nbackground\nЗадний фон')}},

        {br:true},

        {key:'transform', fn:()=>{
            defineKeyboard(levelTransformCss)
        }, bg:groupColor},    

        {key:'transition', fn:()=>{paste('transition:all 0.8s ease;',
`
transition
Плавный переход, порядок ввода параметров:
1. Свойство - all для всех либо конкретно (width или color...)
2. Время выполнения в s или ms
3. Функция
4. Задержка перед началом s или ms

Функции
ease - Сначала медленно, потом быстро, в конце опять медленно.
ease-in - Начинается медленно и постепенно ускоряется.
ease-out - Начинается быстро и постепенно останавливается.
ease-in-out - Сначала медленно, потом быстро, 
в конце опять медленно. От ease отличается скоростью.
linear - Всегда одна и та же скорость.
step-start - Анимации нет, 
свойство сразу принимает окончательное значение.
step-end - Анимации нет, 
свойство ждет время, заданное в transition-duraton, 
а затем мгновенно принимает окончательное значение.
steps - Значение свойства изменяется скачками.
cubic-bezier - Кривая Безье.
`)}},
        {key:'usSel', fn:()=>{paste('user-select:',
`
user-select
Выделение текста и других элементов
none - Текст не выделяется.
contain - Выделение, начатое внутри элемента 
не выйдет за пределы этого элемента.
all - Если двойной клик произошел во вложенном элементе, 
будет выбрано все содержимое родителя с этим значением свойства.
auto - Вычисляемое значение, автоматически определяется 
следующим образом: для псевдоэлементов after и before 
значение равно none, для редактируемого элемента значение 
равно contain, если у родителя элемента значение 
all или none - такое же будет и у самого элемента, 
иначе значение будет text.
text - Пользователь может выделить текст в элементе.
`)}},

        {key:'poEv', fn:()=>{paste('pointer-events:','\npointer-events\nреакция на событие мыши none/auto')}},

        {key:'cur', fn:()=>{paste('cursor:pointer;',
`
cursor
Вид курсора над элементом несколько интересных:
pointer - палец
grabbing - рука зажата
grab - рука
вообще их очень много, надо гуглить)))

`)}},

        {br:true},

        {br:true},

         {key:'sel', fn:()=>{paste('::selection','\n::selection\nпсевдоэлемент - выделенный текст')}},

        {key:'link', fn:()=>{paste(':link','\n:link\nпсевдокласс - непосещенные ссылки')}},

        {key:'vis', fn:()=>{paste(':visited','\n:visited\nпсевдокласс - посещенные ссылки')}},

        {key:'hover', fn:()=>{paste(':hover','\n:hover\nпсевдокласс - курсор на элементе')}},

        {key:'active', fn:()=>{paste(':active','\n:active\nпсевдокласс - активный элемент (нажата лквая кнопка)')}},

        {key:'focus', fn:()=>{paste(':focus','\n:focus\nпсевдокласс - элемент формы в фокусе')}},

        {key:'focWit', fn:()=>{paste(':focus-within','\n:focus-within\nпсевдокласс - родитель элемента формы в фокусе')}},

        {key:'check', fn:()=>{paste(':checked','\n:checked\nпсевдокласс - отмеченный флажек (радио)')}},

        {key:'disa', fn:()=>{paste(':disabled','\n:disabled\nпсевдокласс - неактивный инпут')}},

        {key:'enab', fn:()=>{paste(':enabled','\n:enabled\nпсевдокласс - активный инпут')}},
       
    ];

//TransformCss___________________________________________________________________
    let levelTransformCss=[

         {key:'...',fn:()=>{
            defineKeyboard(levelCSS);
        }, bg:retColor},

        {br:true},

        {key:'transform', fn:()=>{paste('transform:','\ntransform\nТрансформации функция(x, y)')}},

        {key:'tran-orig', fn:()=>{paste('transform-origin:','\ntransform-origin\nЗадает точку, относительно которой будут происходить трансформации элемента, задаваемые свойством transform. X Y Z')}},

        {br:true},

        {br:true},

        {key:'rot', fn:()=>{paste('rotate()','\nrotate()\nтрансформации - функция поворота ед - deg',false,7)}},

        {key:'scl', fn:()=>{paste('scale()','\nscale()\nтрансформации - функция увеличение/уменьшение ед - 0.5',false,6)}},

        {key:'skew', fn:()=>{paste('skew()','\nskew()\nтрансформации - функция наклон ед - deg',false,5)}},

        {key:'trans', fn:()=>{paste('translate()','\ntranslate()\nтрансформации - функция смещение ед - px',false,5)}},

        {br:true},

    ];
//Object____________________________________________________
    let levelObject=[
        {key:'keys',fn:()=>{
            paste('keys()','\nObject.keys()\nМассив ключей (свойств) объекта',false, 5);
            defineKeyboard(levelOne);
        }, bg:retColor},

        {key:'values',fn:()=>{
            paste('values()','\nObject.values()\nМассив значений объекта',false, 7);
            defineKeyboard(levelOne);
        }, bg:retColor},

        {key:'entries',fn:()=>{
            paste('entries()','\nObject.entries()\nДвухмерный массив [[key,val],[key,val]...]',false,8);
            defineKeyboard(levelOne);
        }, bg:retColor},

        {key:'asign',fn:()=>{
            paste('assign(target, src1, src2 )',
`
Object.asign()
Поверхностное копирование/слияние объектов
target - целевой объект (объект изменится!!!)
src - источники
Копирование собственных свойств объекта по принципу:
новые свойства копируются / сиарые обновляются.
Объекты в объекте копируются ссылкой!!! (поверхностное копирование 1 уровня)
`,false,14);
            defineKeyboard(levelOne);
        }, bg:retColor},

        {key:'defineProp',fn:()=>{
            paste('defineProperty(obj, \'prop\',{writable: false})',
`
Object.defineProp()
Позволяет добавлять новые свойства объектам или изменять существующие свойства,
включая конфигурацию поведения этих свойств (например, сделать их доступными только для чтения).
- obj: Объект, в который добавляется или изменяется свойство.
- prop: Имя нового или существующего свойства.
- descriptor: Описание свойства (его характеристики).
_____________________________________________________
Атрибуты объекта descriptor:
- value: Значение свойства.
- writable: Определяет, разрешено ли перезапись значения свойства. По умолчанию false.
- enumerable: Показывает, отображается ли свойство при итерации (например, цикле for...of)
  или выводится ли оно методом Object.keys. По умолчанию false.
- configurable: Может ли само свойство быть удалено или переопределено. По умолчанию false.
С помощью данного метода также возможно задание геттера и сеттера свойства (гугли если нужно!!!)
`,false,18);
            defineKeyboard(levelOne);
        }, bg:retColor},

        {key:'frz',fn:()=>{
            paste('freeze()',
`
Object.freeze()
Используется в JavaScript для предотвращения изменения свойств объекта.
Когда объект заморожен (frozen), любые попытки изменить существующие свойства 
(например, присвоение новых значений, удаление существующих свойств или изменение перечисляемости, 
доступности записи или настраиваемости) будут игнорироваться или вызывать ошибку в строгом режиме.
`,false,7);
            defineKeyboard(levelOne);
        }, bg:retColor},

        {key:'seal',fn:()=>{
            paste('seal()',
`
Object.seal()
- Запечатывание: Метод делает объект неизменяемым относительно структуры 
  (нельзя добавлять новые свойства или удалять существующие).
- Изменение значений: Значения свойств остаются доступными для изменений.
- Наследуемые свойства: Наследуемые свойства объекта не подвергаются изменениям, 
  поскольку запечатывается сам объект, а не прототип цепочки наследования.
`,false,5);
            defineKeyboard(levelOne);
        }, bg:retColor},

        {key:'prevExten',fn:()=>{
            paste('preventExtensions()',
`
Object.preventExtensions()
- Предотвращение расширения: Невозможно добавить новые собственные свойства объекта.
- Изменение существующих свойств: Свойства объекта могут быть изменены 
  (их значения, конфигурации), включая удаление существующих свойств.
- Наследование: Если объект имеет родительские объекты через цепочку прототипов, 
  этот метод влияет только на сам объект, не затрагивая прототипы.
`,false,18);
            defineKeyboard(levelOne);
        }, bg:retColor},

    ]
//Array____________________________________________
    let levelArray = [
       {key:'isArray',fn:()=>{
            paste('isArray()',
`
Array.isArray()
Метод проверяет является ли данный объект массивом. 
В случае, если это так, то возвращается true, 
в противном случае - false.
`,false,8);
            defineKeyboard(levelOne);
        }, bg:retColor},

        {key:'of',fn:()=>{
            paste('of()',
`
Array.of()
Метод возвращает новый массив из указанных в параметре значений.
`,false,3);
            defineKeyboard(levelOne);
        }, bg:retColor},

        {key:'from',fn:()=>{
            paste('from()',
`
Array.from()
Метод возвращает новый массив из массивоподобного 
или итерируемого объекта (псевдомассива). 
Первым параметром метод принимает объект, 
из которого нужно сделать массив, 
вторым необязательным - функцию, 
которую нужно применить к элементам объекта.
`,false,5);
            defineKeyboard(levelOne);
        }, bg:retColor},
    ]
//Settings________________________________________________________________________________________________________
    let levelSettings =[

        {key:'...',fn:()=>{
            defineKeyboard(levelOne);
        }, bg:retColor},

        {key:'local', fn:()=>{setup('local')}, bg:specColor},

        {key:'save', fn:()=>{setup('save')}, bg:specColor},

        {key:'default', fn:()=>{setup('default')}, bg:specColor},

        {key:'delete', fn:()=>{setup('delete')}, bg:specColor},

        {key:'help', fn:()=>{setup('help')}, bg:specColor},

        {br:true},

        {key:'setup', fn:()=>{paste(
`setup({
   point:'select',
   description:true,
   closeSnip:false,
   autosave:true,
})
            `,'',false,10)}, bg:syntColor},

       {key:'start', fn:()=>{settings.point='start'; printObj(settings)}, bg:specColor},

       {key:'end', fn:()=>{settings.point='end'; printObj(settings)}, bg:specColor},

       {key:'select', fn:()=>{settings.point='select'; printObj(settings)}, bg:specColor}, 
       
       {key:'index', fn:()=>{settings.point='index'; printObj(settings)}, bg:specColor},

       {key:'closeSnip', fn:()=>{settings.closeSnip=!settings.closeSnip; printObj(settings)}, bg:specColor},

       {key:'desc', fn:()=>{settings.description=!settings.description; printObj(settings)}, bg:specColor},

       {key:'autosave', fn:()=>{settings.autosave=!settings.autosave; printObj(settings)}, bg:specColor},

    ]
//________________________________________________________________________________________________________________
    defineKeyboard(levelOne);
    function position(){cursor=code.selectionStart}
    function keyTab(){
        let v=' '.repeat(settings.tab);
        let txt=code.value;
        code.focus();
        code.value=txt.substring(0,cursor)+v+txt.substring(cursor);
        code.selectionStart=cursor+settings.tab;
        code.selectionEnd=cursor+settings.tab;
        cursor=cursor+settings.tab;
    }
    function paste(v,d,opt, index){
        if (!isHelp){
            let txt=code.value;
            code.value=txt.substring(0,cursor)+v+txt.substring(cursor);
            code.focus();
            try{
                switch (settings.point){
                    case 'select':
                        code.selectionStart = !opt? cursor:cursor+v.length;
                        code.selectionEnd = cursor+v.length;
                        cursor=cursor+v.length;
                    break;
                    case 'start':
                        code.selectionStart = !opt? cursor:cursor+v.length;
                        code.selectionEnd = !opt? cursor:cursor+v.length;
                        cursor= !opt? cursor:cursor+v.length;
                    break;
                    case 'end':
                        code.selectionStart = cursor+v.length;
                        code.selectionEnd = cursor+v.length;
                        cursor= cursor+v.length;
                    break;
                    case 'index':
                        code.selectionStart = index? cursor+index:cursor+v.length;
                        code.selectionEnd = index? cursor+index:cursor+v.length;
                        cursor = index? cursor+index:cursor+v.length;
                    break;
                    default:
                        throw new TypeError('Invalid settings!!! Invalid \'point\' property value, use: \'select\', \'start\', \'end\', or \'index\'')
                }
            } catch (err) {cls(); print(err)}
        }
         
        if ((settings.description && d) || isHelp )print(d)
        if (settings.closeSnip && !opt && !isHelp) keyboard();
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
            if(key.bg) bt.style.backgroundColor=key.bg;
            bt.addEventListener('click',key.fn)
            dvKeyboard.appendChild(bt);
        }
    }
    TAB.addEventListener('click',keyTab);
    code.addEventListener('mouseup',()=>setTimeout(position,0));
    code.addEventListener('keydown',()=>setTimeout(position,0));
    curLf.addEventListener('click',()=>{
        cursor-=1;
        code.focus();
        code.selectionStart=cursor;
        code.selectionEnd=cursor;
    });
    curRt.addEventListener('click',()=>{
        cursor+=1;
        code.focus();
        code.selectionStart=cursor;
        code.selectionEnd=cursor;
    });
    help.addEventListener('click',()=>{
        help.classList.toggle('active');
        isHelp=!isHelp;
        if(isHelp){
            code.classList.add('hidd');
            hidC.classList.add('sel');
            cls();
        } else {
            code.classList.remove('hidd');
            hidC.classList.remove('sel');            
        }
    })
    function hasCSS(){
        let css=code.value.indexOf('style.innerHTML=');
        if (css!==-1){ 
            cursor=css+18;
            code.focus();
            code.selectionStart=cursor;
            code.selectionEnd=cursor;
            return true
        } else {
            return false
        }
    }
    function hasHTML(){
        let html=code.value.indexOf('monitor.innerHTML=');
        if (html!==-1){ 
            cursor=html+20;
            code.focus();
            code.selectionStart=cursor;
            code.selectionEnd=cursor;
            return true
        } else {
            return false
        }
    }
    setup();
})()
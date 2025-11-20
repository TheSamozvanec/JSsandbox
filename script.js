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
    let local = localStorage.getItem('sandboxJSv2.0');
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

        {key:'let', fn:()=>{paste('let','\nОбъявление переменной')}},
       
        {key:'con', fn:()=>{paste('const','\nОбъявление константы')}},
        
        {key:'func', fn:()=>{paste(
'function name( ) { }',
`
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
с применением дополнительной обработки
`,
false, 60)}, bg:syntColor}, 
        
//        {br:true},

        {key:'for', fn:()=>{paste('for(let i=0; i<10; i++){  }',
`
Стандартный цикл i - счетчик, i<10 - условие лиммита,
i++ шаг прирощения можно i+=0.5 или другое
`,false, 24)}},

        {key:'f of', fn:()=>{paste('for(let elem of array){  }',
`
Цикл перебора массива. Цикл переберает весь 1 уровень массив array,
В каждой итерации elem получает значение очередного элемента массива 
`,false,23)}},

        {key:'f in', fn:()=>{paste('for(let key in obj){  }',
`
Цикл перебора объектаю Цикл переберает весь 1 уровень объекта obj.
В каждой итерации key имеет значение очередного ключа (свойства) объекта
`,false,20)}},

        {key:'whi', fn:()=>{paste('while (i!=10){  }',
`
Цикл, который будет выполняться до тех пор, пока выполняется условие в скобках
`,
            false,14)}},

        {key:'bre', fn:()=>{paste('break;')}},

        {key:'ctn', fn:()=>{paste('continue;')}},

         {key:'new', fn:()=>{paste('new')}},

        {br:true},

        {key:'if', fn:()=>{paste('if(  ) {  }','\nстандартное условие',false, 4)}},

        {key:'ife', fn:()=>{paste('if(  ) {\n  \n} else {  }',
`
Условие с альтернативой. Если условие не верное - выполняется код else.
Данная конструкция полезна, когда есть код, который выполняется только
в случае не выполнения условия. 
`,false,4)}, bg:syntColor},

        {key:'swt', fn:()=>{paste('switch (int){\n  case 1:\n\n  break;\n  case 2:\n\n  break; \n  case 3:\n\n  break; \n  default:\n\n}',
`
Многовариантное условие. В скобках указывается переменная
Каждый кейс содержит значение переменной и блок, который будет выполнен при указанном значении
Блок default будет выполнен, если ниодно значение не совпало
`,false,11)}, bg:syntColor},

        {key:'and', fn:()=>{paste('&&')}},

        {key:'or', fn:()=>{paste('||')}},

        {key:'type', fn:()=>{paste('typeof','\nполучение типа переменной print (typeof int) или let type=typeof int')}},

        {key:'num', fn:()=>{paste('Number(  )','\nпреобразование строки в число \'123\'=>123',false,8)}},

        {key:'prI', fn:()=>{paste('parseInt(\'str\')', 
`
Получение целого числа из строки числа с единицами измерения
parseint('10px') => 10
`,false,13)}},

        {key:'prF', fn:()=>{paste('parseFloat(\'str\')',
`
Получение дробного числа из строки числа с единицами измерения
parseint('10.3kg') => 10.3
`,false,15)}},

        {key:'str', fn:()=>{paste('String(  )','\n перевести значение в строку',false,8)}},

        {key:'boo', fn:()=>{paste('Boolean(  )','\n перевести значение в булеву единицу (true/false)',false,9)}},

//        {br:true}, 

        {key:'obj', fn:()=>{
            paste('Object.','статические методы объектов',true,7);
            defineKeyboard(levelObject);
        }, bg:subgropColor}, 

        {key:'arr', fn:()=>{
            paste('Array.','статические методы массивов',true,6);
            defineKeyboard(levelArray);
        }, bg:subgropColor},

        {key:'del', fn:()=>{paste('delete','удаление свойства объекта или элемента массива\n delete arr[1]')}},

        {key:'tr-c', fn:()=>{paste('try {\n\n}catch(err){\n\n}finally{  }')},bg:syntColor},

        {key:'trw', fn:()=>{paste('throw new Error(\'  \')')}},

        //{key:'cla', fn:()=>{paste('class')}},

        //{key:'ext', fn:()=>{paste('extends')}},

        {key:'Math', fn:()=>{
            paste('Math.','\nМатематические функции и константы',true,5);
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
            paste('random(  )','\nПолучайные числа',false,8);
            defineKeyboard(levelOne);
        }, bg:retColor},

        {key:'round',fn:()=>{
            paste('round(  )','\nОкругление до ближайшего целого',false,7);
            defineKeyboard(levelOne);
        }, bg:retColor},

        {key:'ceil',fn:()=>{
            paste('ceil(  )','\nОкругление в большую сторону',false,6);
            defineKeyboard(levelOne);
        }, bg:retColor},

        {key:'floor',fn:()=>{
            paste('floor(  )','\nОкругление в меньшую сторону',false,7);
            defineKeyboard(levelOne);
        }, bg:retColor},

        {key:'sqrt',fn:()=>{
            paste('sqrt(  )','\nКвадратный корень',false,6);
            defineKeyboard(levelOne);
        }, bg:retColor},

        {key:'sqrt',fn:()=>{
            paste('sqrt(  )','\nКвадратный корень',false,6);
            defineKeyboard(levelOne);
        }, bg:retColor},

        {key:'max',fn:()=>{
            paste('max(  )','\nМаксимум max(n1,n2...n) можно max(...[n1,n2])',false,5);
            defineKeyboard(levelOne);
        }, bg:retColor},

        {key:'min',fn:()=>{
            paste('min(  )','\nМинимум min(n1,n2...n) можно min(...[n1,n2])',false,5);
            defineKeyboard(levelOne);
        }, bg:retColor},

        {key:'abs',fn:()=>{
            paste('abs(  )','\nМодуль числа',false,5);
            defineKeyboard(levelOne);
        }, bg:retColor},

        {key:'sin',fn:()=>{
            paste('sin(  )','\nСинус (аргумент в радианах)',false,5);
            defineKeyboard(levelOne);
        }, bg:retColor},

        {key:'cos',fn:()=>{
            paste('cos(  )','\nКосинус (аргумент в радианах)',false,5);
            defineKeyboard(levelOne);
        }, bg:retColor},

        {key:'tan',fn:()=>{
            paste('tan(  )','\nТангенс (аргумент в радианах)',false,5);
            defineKeyboard(levelOne);
        }, bg:retColor},

        {key:'asin',fn:()=>{
            paste('asin(  )','\nАрксинус',false,6);
            defineKeyboard(levelOne);
        }, bg:retColor},

        {key:'acos',fn:()=>{
            paste('acos(  )','\nАрккосинус',false,6);
            defineKeyboard(levelOne);
        }, bg:retColor},

        {key:'atan',fn:()=>{
            paste('atan(  )','\nАрктангенс',false,6);
            defineKeyboard(levelOne);
        }, bg:retColor},

        {key:'exp',fn:()=>{
            paste('exp(  )','\nВозведение \'е\' в степень',false,5);
            defineKeyboard(levelOne);
        }, bg:retColor},

        {key:'log',fn:()=>{
            paste('log(  )','\nНатуральный логорифм',false,5);
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
            paste('SQRT2','\nКорень из 2');
            defineKeyboard(levelOne);
        }, bg:retColor},

    ];
    //STR____________________________________________________
    let levelSTR=[

        {key:'...',fn:()=>defineKeyboard(levelOne),bg:retColor},

        {key:'len',fn:()=>{paste('.length','\nСвойство - длинна строки str.lenght',)}},

        {key:'LowC',fn:()=>{paste('.toLowerCase()','\nМетод, переводит все символы в нижний регистр.')}},

        {key:'UppC',fn:()=>{paste('.toUpperCase()','\nМетод, переводит все символы в верхний регистр.')}},

        {key:'split',fn:()=>{paste('.split(  )','\nРазбивает строки в массив по указанному в первом параметре разделителю. Вторым параметром можно указать максимальное количество элементов массива\'.\'',false,8)}},

        {key:'subs',fn:()=>{paste('.substring(  )',
`
Метод возвращает подстроку из строки (исходная строка при этом не изменяется). 
Первый параметр задает номер символа, 
с которого метод начинает отрезать (нумерация идет с нуля), 
а второй параметр - номер символа, 
на котором следует закончить вырезание 
(символ с этим номером не включается в вырезанную часть). 
Второй параметр не является обязательным, если он не указан, 
то вырезаны будут все символы до конца строки.
`        
,false,12)}},

        {key:'slice',fn:()=>{paste('.slice(  )',
`
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
,false,8)}},

        {key:'indOf',fn:()=>{paste('.indexOf(  )',
`
Метод осуществляет поиск подстроки в строке. 
В первом параметре указываем искомую подстроку в нужном нам регистре. 
Метод вернет позицию первого совпадения, 
а если оно не найдено, то вернет -1. 
Вторым необязательным параметром можно передать номер символа, 
откуда следует начинать поиск.
`        
,false,10)}},

        {key:'lIndOf',fn:()=>{paste('.lastIndexOf(  )',
`
Метод аналогичен indexOf но начинает поиск с конца строки.
`        
,false,14)}},

        {key:'stWit',fn:()=>{paste('.startsWith(  )',
`
Метод проверяет начинается ли строка с указанной в первом параметре подстроки. 
Если начинается, то возвращает true, 
а если не начинается, то false. 
Вторым необязательным параметром метод принимает позицию, 
с которой начинать проверку (по умолчанию с начала строки).
`        
,false,13)}},

        {key:'enWit',fn:()=>{paste('.endsWith(  )',
`
Аналогично startsWith, но с конца строки.
Второй параметр - конец строки (если не указан - 
будет реальный конец строки).
`        
,false,11)}},

        {key:'trim',fn:()=>{paste('.trim()',
`
Удаляет пробелы в начале и в конце строки.
`        
,)}},

        {key:'chr',fn:()=>{paste('.charCodeAt(  )',
`
Метод возвращает код символа (числовое значение), 
стоящего на определенной позиции в строке. 
Нумерация символов начинается с 0. 
Если указанное число больше последнего символа строки, 
то метод возвращает NaN.
`        
,false,13)}},

        {key:'StChr',fn:()=>{paste('String.fromCharCode(  )',
`
Метод String.fromCharCode преобразует указанные значения единиц кода UTF-16 в строку.
let str = String.fromCharCode(65, 66, 67, 68, 69);
'ABCDE'
`        
,false,21)}},

        {key:'repl',fn:()=>{paste('.replace(  )',
`
Метод осуществляет поиск и замену частей строки. 
Первым параметром принимается подстрока, 
которую заменяем, а вторым - подстрока, 
на которую заменяем. 
В качестве первого параметра етод принимает регулярные строки и 
поддерживает работу с карманами регулярных строк.
`        
,false,10)}},

        {key:'at',fn:()=>{paste('.at(  )',
`
Метод осуществляет поиск символа по номеру его позиции в строке. 
В параметре метода мы указываем целое число, 
которое может быть положительным или отрицательным 
(в этом случае поиск ведется с конца строки).
`        
,false,5)}},

 {key:'incl',fn:()=>{paste('.includes(  )',
`
Метод выполняет поиск заданной строки в текущей с учетом регистра. 
Первым параметром метод принимает строку, которую нужно найти, 
вторым необязательным - позицию, 
с которой нужно начинать поиск. 
После выполнения метод возвращает true или false.
`        
,false,11)}},

        {key:'pEnd',fn:()=>{paste('.padEnd(  )',
`
Метод дополняет конец текущей строки до достижения длины, 
заданной в первом параметре. 
Вторым необязательным параметром указывается строка, 
которой мы хотим заполнить текущую.
`        
,false,9)}},

        {key:'pSta',fn:()=>{paste('.padStart(  )',
`
Тоже что padEnd, но для начала строки.
`        
,false,11)}},

        {key:'repe',fn:()=>{paste('.repeat(  )',
`
Метод создает новую строку, 
содержащую указанное количество копий первоначальной строки, 
слитых вместе. str.repeat(3)
`        
,false,9)}},

       
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

        {key:'exec',fn:()=>{paste('.exec(  )',
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
,false,7)}},

        {key:'test',fn:()=>{paste('.test(//)',
`
Метод проверяет, есть ли в строке хотя бы одно совпадение 
с регулярным выражением. 
Если есть - возвращается true, а если нет - false.
`        
,false,7)}},

        {key:'sear',fn:()=>{paste('.search(//)',
`
Метод находит совпадения строки с регулярным выражением и 
возвращает позицию первого совпадения. 
Если совпадений не найдено, то метод вернет -1.
`        
,false,9)}},

        {key:'split',fn:()=>{paste('.split(\'\')',
`
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

        {key:'Fix',fn:()=>{paste('.toFixed(  )','\nФиксированное округление num.toFixed(n)// n-знаков после \'.\'',false,10)}},

        {key:'Preci',fn:()=>{paste('.toPrecision(  )','\nФиксированное округление num.toPrecision(n)//n-знаков всего',false,14)}},
        {key:'toStr',fn:()=>{paste('.toString()',
`
Метод в большенстве случаев равносилен функции String(), но есть некоторые отличия.
В некоторых случаях именно он применим (в nodeJS приводит массив буфера stdIn в строку)
Также есть полезная опция, vожно передавать аргумент в метод, 
определяя систему счисления для числового значения:
(10).toString(2)=>'1010'
`)}}   
             
    ];
//ARR________________________________________________
    let leveARRAY = [

        {key:'...',fn:()=>defineKeyboard(levelOne),bg:retColor},

        {key:'len',fn:()=>{paste('.length','\nСвойство - длинна массива arr.lenght',)}},

        {key:'concat',fn:()=>{paste('.concat(  )',
`
Метод сливает указанные массивы в один общий массив. 
Метод применяется к одному из массивов, 
а в параметрах метода передаются остальные массивы для слияния. 
При этом метод не изменяет исходный массив, а возвращает новый.
`,false,9)}},

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
Метод изменяет порядок элементов в массиве на обратный.
Метод изменяет исходный массив и возвращает также перевернутый массив.
`)}},

        {key:'incl',fn:()=>{paste('.includes(  )',
`
Метод проверяет наличие элемента в массиве. 
Параметром принимает значение для поиска. 
Если такой элемент есть в массиве, 
то метод возвращает true, а если нет, то false.
`,false,11)}},

        {key:'fill',fn:()=>{paste('.fill(\'\')',
`
Метод заполняет массив заданными значениями. 
В первом параметре метода указывается нужное значение. 
Во втором и третьем необязательных параметрах 
задается начальная и конечная позиция для заполнения.
`        
,false,7)}},

        {key:'indOf',fn:()=>{paste('.indexOf(  )',
`
Метод осуществляет поиск элемента в массиве. 
В первом параметре указываем элемент для поиска. 
Метод возвращает номер первого найденного элемента, 
либо -1, если такого элемента нет. 
Второй необязательный параметр метода задает позицию, 
с которой следует начинать поиск.
`        
,false,10)}},

        {key:'lIndOf',fn:()=>{paste('.lastIndexOf(  )',
`
Метод аналогичен indexOf но начинает поиск с конца массива.
`        
,false,14)}},

        {key:'slice',fn:()=>{paste('.slice(  )',
`
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
,false,8)}},

        {key:'splice',fn:()=>{paste('.splice(  )',
`
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
,false,9)}},

        {key:'shift',fn:()=>{paste('.shift()',
`
Метод удаляет первый элемент из массива. 
При этом исходный массив изменяется, 
а результатом метода возвращается удаленный элемент.
`        
)}},

        {key:'pop',fn:()=>{paste('.pop()',
`
Метод удаляет последний элемент из массива. 
При этом исходный массив изменяется, 
а результатом метода возвращается удаленный элемент.
`        
)}},

        {key:'unshift',fn:()=>{paste('.unshift(  )',
`
Метод добавляет неограниченное количество новых элементов 
в начало массива. При этом исходный массив изменяется, 
а результатом возвращается новая длина массива.
`        
,false,10)}},

        {key:'push',fn:()=>{paste('.push(  )',
`
Метод добавляет неограниченное количество новых элементов 
в конец массива. При этом исходный массив изменяется, 
а результатом возвращается новая длина массива.
`        
,false,7)}},

        {key:'map',fn:()=>{paste('.map((el,n,arr)=>{  })',
`
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
Тоже самое что reduce, только обработка начинается с конца массива.
`        
,false,31)}},

       {key:'sort',fn:()=>{paste('.sort()',
`
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
Метод помогает найти первый элемент в массиве согласно 
переданному в параметре коллбэку. 
Если элемента нет, то возвращается undefined.
`        
,false,16)}},

        {key:'fiInd',fn:()=>{paste('.findIndex((el)=>el>0)',
`
Метод позволяет найти индекс первого элемента согласно 
переданному в параметре коллбэку. 
Если элемент не найден, то возвращается -1.
`        
,false,21)}},

        {key:'fiLInd',fn:()=>{paste('.findLastIndex((el)=>el>0)',
`
Аналогичен findIndex но поиск с конца массива.
`        
,false,25)}},

         {key:'flat',fn:()=>{paste('.flat()',
`
Метод уменьшает уровень вложенности многомерного массива. 
Может либо делать массив одномерным, 
либо уменьшать мерность на заданное значение.
Чтобы сделать одномерным массив любой фложенности
необходимо передать infinity. 
`        
)}},

        {key:'at',fn:()=>{paste('.at(  )',
`
Метод возвращает элемент массива с заданным индексом. 
В параметре метода указывается целое положительное или 
отрицательное число. В первом случае - идет поиск элемента 
с начала массива, во втором - с конца.
`        
,false,5)}},

    ];
//TIME ___________________________________________________
    let levelTIME =[

        {key:'...',fn:()=>{
            defineKeyboard(levelOne);
        }, bg:retColor}, 

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

        {key:'clearInterval',fn:()=>{paste('clearInterval(  )',
`
Функция останавливает таймер, заданный функцией setInterval. 
Функция принимает идентификатор того таймера, 
который нужно остановить. 
Идентификатор таймера возвращает функция setInterval.
let id=setInterval (()=>{})
`        
,false,15)}},

        {br:true},

        {key:'clearTimeout',fn:()=>{paste('clearTimeout(  )',
`
Функция останавливает таймер, установленный функцией setTimeout. 
Функция принимает идентификатор того таймера, 
который нужно остановить. Идентификатор таймера 
возвращает метод setTimeout.
`        
,false,14)}},

    ];
//getDate_________________________________________________
    let leveGetDATE = [

        {key:'FullYear',fn:()=>{
            paste('FullYear()','\nГод в формате гггг');
            defineKeyboard(levelTIME);
        }, bg:retColor},

         {key:'Month',fn:()=>{
            paste('Month()','\nМесяц (начинается с 0!)');
            defineKeyboard(levelTIME);
        }, bg:retColor},

        {key:'Date',fn:()=>{
            paste('Date()','\nДень месяца');
            defineKeyboard(levelTIME);
        }, bg:retColor},

        {key:'Hours',fn:()=>{
            paste('Hours()','\nЧасы (0-23)');
            defineKeyboard(levelTIME);
        }, bg:retColor},

        {key:'Minutes',fn:()=>{
            paste('Minutes()','\nМинуты (0-59)');
            defineKeyboard(levelTIME);
        }, bg:retColor},

        {key:'Seconds',fn:()=>{
            paste('Seconds()','\nСекунды (0-59)');
            defineKeyboard(levelTIME);
        }, bg:retColor},

        {key:'Milliseconds',fn:()=>{
            paste('Milliseconds()','\nМиллисекунды (0-999)');
            defineKeyboard(levelTIME);
        }, bg:retColor},

        {key:'Day',fn:()=>{
            paste('Day()','\nДень недели, понедельник - 1, суббота -6, воскресение - 0');
            defineKeyboard(levelTIME);
        }, bg:retColor},

        {key:'Time',fn:()=>{
            paste('Time()','\nВремя в формате timestamp.');
            defineKeyboard(levelTIME);
        }, bg:retColor},
  
    ];
//setDate_____________________________________________________
    let levelSetDATE=[

        {key:'FullYear',fn:()=>{
            paste('FullYear(  )','\nГод в формате гггг',false,10);
            defineKeyboard(levelTIME);
        }, bg:retColor},

         {key:'Month',fn:()=>{
            paste('Month(  )','\nМесяц (начинается с 0!)',false,7);
            defineKeyboard(levelTIME);
        }, bg:retColor},

        {key:'Date',fn:()=>{
            paste('Date(  )','\nДень месяца',false,6);
            defineKeyboard(levelTIME);
        }, bg:retColor},

        {key:'Hours',fn:()=>{
            paste('Hours(  )','\nЧасы (0-23)',false,7);
            defineKeyboard(levelTIME);
        }, bg:retColor},

        {key:'Minutes',fn:()=>{
            paste('Minutes(  )','\nМинуты (0-59)',false,9);
            defineKeyboard(levelTIME);
        }, bg:retColor},

        {key:'Seconds',fn:()=>{
            paste('Seconds(  )','\nСекунды (0-59)',false,9);
            defineKeyboard(levelTIME);
        }, bg:retColor},

        {key:'Milliseconds',fn:()=>{
            paste('Milliseconds(  )','\nМиллисекунды (0-999)',false,14);
            defineKeyboard(levelTIME);
        }, bg:retColor},

    ];
//getDOM___________________________________________________
    let levelGetDOM=[

         {key:'...',fn:()=>{
            defineKeyboard(levelOne);
        }, bg:retColor},

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
let authForm = document.querySelectorAll('.authForm')
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
let authForm = monitor.querySelectorAll('.authForm')
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
            paste('.contains(  )',
`
Метод позволяет проверить, 
содержит ли один элемент внутри себя другой. 
Параметром метода передается элемент (в виде переменной со ссылкой), 
который будет проверяться на то, что он находится внутри элемента, 
к которому применился метод.
`,false,11)}},

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
Свойство хранит ссылку на thead таблицы.
`)}},

        {key:'tFoot',fn:()=>{
            paste('.tFoot',
`
Свойство хранит ссылку на tfoot таблицы.
`)}},

        {key:'tBodies',fn:()=>{
            paste('.tBodies',
`
Свойство хранит массив всех tbody таблицы (их может быть несколько).
`)}},

    ];
//miscDOM___________________________________________________
    let levelMiscDOM=[

        {key:'...',fn:()=>{
            defineKeyboard(levelOne)
        },bg:retColor},

        {key:'create',fn:()=>{
            paste('document.createElement(\'\')',
`
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
            paste('.prepend(  )',
`
Метод позволяет вставить в начало какого-либо элемента другой элемент. 
Параметром метод принимает элемент, как правило созданный через createElement, 
либо строку. Можно добавить сразу несколько элементов или строк, 
перечислив их через запятую.
`,false,10)}},

        {key:'append',fn:()=>{
            paste('.append(  )',
`
Метод позволяет вставить в конец какого-либо элемента другой элемент. 
Параметром метод принимает элемент, как правило созданный через createElement, 
либо строку. Можно добавить сразу несколько элементов или строк, 
перечислив их через запятую.
`,false,10)}},

        {key:'Before',fn:()=>{
            paste('.insertBefore(  )',
`
Метод позволяет вставить элемент перед другим элементом. 
Чаще всего используется после создания элемента с помощью createElement. 
Метод применяется к родителю того элемента, 
перед которым произойдет вставка.
У метода 2 параметра
родитель.insertBefore(вставить элемент, перед кем вставить элемент);
`,false,15)}},

        {key:'insAdjE',fn:()=>{
            paste('.insertAdjacentElement(\'beforeBegin\',elem)',
`
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
Метод позволяет удалить элемент. 
Применяется к тому элементу, который нужно удалить.
`)}},

        {br:true},
        {br:true},

        {key:'text',fn:()=>{
            paste('.textContent',
`
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
Свойство  позволяет получить и изменить 
HTML код элемента (внутри элемента). 
`)}},

        {key:'oHT',fn:()=>{
            paste('.outerHTML',
`
Свойство позволяет получить и изменить 
HTML код элемента вместе с его тэгом.
`)}},

        {key:'tag',fn:()=>{
            paste('.tagName',
`
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
Свойство содержит псевдомассив CSS классов элемента, а
также позволяет добавлять и удалять классы элемента, 
проверять наличие определенного класса среди классов элемента.
`,true);
            defineKeyboard(leveClassList);
        }, bg:subgropColor},

        {key:'getComputedStyle',fn:()=>{
            paste('getComputedStyle(  )',
`
Функция getComputedStyle позволяет получить значение 
любого CSS свойства элемента, даже из CSS файла.
let stl = getComputedStyle(elem)
print(stl.width)
`,false,18)}},

        {br:true},
        {br:true},

        {key:'offsetWdt',fn:()=>{
            paste('.offsetWidth',
`
Свойство содержит полную ширину элемента 
(включает собственно ширину элемента, ширину границ, 
внутренние отступы, полосы прокрутки)
`)}},

        {key:'offsetHgt',fn:()=>{
            paste('.offsetHeight',
`
Свойство содержит полную высоту элемента 
(включает собственно высоту элемента, высоту границ, 
внутренние отступы, полосы прокрутки)
`)}},

        {key:'clientLeft',fn:()=>{
            paste('.clientLeft',
`
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

Свойство содержит ширину верхней границы (значение border-top).
`)}},

        {key:'clientWdt',fn:()=>{
            paste('.clientWidth',
`
Свойство содержит ширину элемента внутри границ вместе с padding, но без border и прокрутки.
`)}},

        {key:'clientHgt',fn:()=>{
            paste('.clientHeight',
`
Свойство содержит высоту элемента внутри границ вместе с padding, но без border и прокрутки.
`)}},

        {key:'offsetPrt',fn:()=>{
            paste('.offsetParent',
`
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
Свойство содержит левое смещение элемента 
относительно offsetParent (сниппет offsetPrt). 
Содержит расстояние от offsetParent до границы элемента.
`)}},

        {key:'ClientRect',fn:()=>{
            paste('.getBoundingClientRect()',
`
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

        {key:'...',fn:()=>{
            defineKeyboard(levelOne);
        }, bg:retColor},

        {key:'add=>',fn:()=>{
            paste('.addEventListener(\'\', (ev)=>{ })',
`
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
Метод позволяет удалить назначенный ранее 
через addEventListener обработчик события (отписаться). 
Для этого в параметрах нужно передать тип события 
и ту же функцию, которые передавались при назначении события. 
`,false,22);
            defineKeyboard(levelEv)},bg:subgropColor},

        {key:'prevDef',fn:()=>{
            paste('ev.preventDefault()',
`
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
Метод предотвращает дальнейшее распространение 
события по иерархии DOM (всплытие), 
ограничивая его обработку текущим элементом.
`)}},

        {key:'stImProp',fn:()=>{
            paste('ev.stopImmediatePropagation()',
`
Метод немедленно прерывает обработку события, 
предотвращая вызов всех оставшихся обработчиков 
на текущем элементе и остановив его дальнейшее распространение.
`)}},

        {key:'type',fn:()=>{
            paste('ev.type',
`
Свойство содержит тип произошедшего события.
`)}},

        {key:'target',fn:()=>{
            paste('ev.target',
`
Свойство содержит элемент, на котором сработало событие. 
Это не тот элемент, к которому был привязан обработчик 
этого события, а именно самый глубокий тег, 
на который непосредственно был, к примеру, совершен клик.
`)}}, 

        {key:'curTarg',fn:()=>{
            paste('ev.currentTarget',
`
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
Свойство позволяет проверить реальное ли событие 
(вызвано действием пользователем) или же сымитировано 
на JavaScript с помощью метода dispatchEvent. 
Принимает значение либо true (настоящее), либо false.
`)}},

        {key:'Ctrl',fn:()=>{
            paste('ev.ctrlKey',
`
Свойство позволяет узнать, нажата ли клавиша Ctrl во время события.
`)}},

        {key:'Alt',fn:()=>{
            paste('ev.altKey',
`
Свойство позволяет узнать, нажата ли клавиша Alt во время события.
`)}},

        {key:'Shift',fn:()=>{
            paste('ev.shiftKey',
`
Свойство позволяет узнать, нажата ли клавиша Shift во время события.
`)}},

        {key:'win',fn:()=>{
            paste('ev.metaKey',
`
Свойство позволяет узнать, нажата ли клавиша win 
(в linux это super, в mac - Cmd)  во время события.
`)}},

        {key:'clX',fn:()=>{
            paste('ev.clientX',
`
Возвращает горизонтальные координаты курсора относительно 
видимой области окна (viewport). 
Это означает, что при скролле страницы положение остаётся 
привязанным именно к видимому экрану, а не ко всей странице целиком.
`)}},

        {key:'clY',fn:()=>{
            paste('ev.clientY',
`
Возвращает вертикальные координаты курсора относительно 
видимой области окна (viewport). 
Это означает, что при скролле страницы положение остаётся 
привязанным именно к видимому экрану, а не ко всей странице целиком.
`)}},

        {key:'pgX',fn:()=>{
            paste('ev.pageX',
`
Возвращает горизонтальные координаты курсора относительно 
всего документа, в том числе и прокрученной части
за пределами экрана. 
`)}},

        {key:'pgY',fn:()=>{
            paste('ev.pageY',
`
Возвращает вертикальные координаты курсора относительно 
всего документа, в том числе и прокрученной части
за пределами экрана. 
`)}},

        {key:'osX',fn:()=>{
            paste('ev.offsetX',
`
Возвращает горизонтальные координаты курсора внутри элемента,
в котором произошло событие.
`)}},

        {key:'osY',fn:()=>{
            paste('ev.offsetY',
`
Возвращает вертикальные координаты курсора  внутри элемента,
в котором произошло событие.
`)}},

        {key:'code',fn:()=>{
            paste('ev.code',
`
Свойство позволяет узнать код нажатой клавиши при вводе текста.
В основном коды записываются KeyA - прификс Key и латинская буква
в верхнем регистре, за исключением некоторых клавишь
`)}},

        {key:'key',fn:()=>{
            paste('ev.key',
`
Свойство позволяет узнать какой символ на нажатой клавише.
Речь идет именно о символах с учетом регистра и расклада
`)}},

        {key:'key',fn:()=>{
            paste('ev.key',
`
Свойство позволяет узнать какой символ на нажатой клавише.
Речь идет именно о символах с учетом регистра и расклада
`)}},

        {key:'focus',fn:()=>{
            paste('.focus()',
`
Метод устанавливает фокус на элементе (чаще всего на инпуте). 
Это значит, что в этом инпуте начнет моргать курсор и вводимый 
с клавиатуры текст будет попадать именно в этот инпут.
`)}},

        {key:'blur',fn:()=>{
            paste('.blur()',
`
Метод снимает фокус с элемента.
`)}},

        {key:'select',fn:()=>{
            paste('.select()',
`
Метод выделяет элемент формы (удобно для копирования инпутов).
`)}},


         {key:'scrlVi',fn:()=>{
            paste('.scrollIntoView({behavior:\'smooth\', block: \'center\'})',
`
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

    ];
//LevelEv____________________________________________________
    let levelEv=[
        {key:'...',fn:()=>{
            defineKeyboard(levelEVENT);
        }, bg:retColor},

        {key:'click',fn:()=>{
            paste('click','\nКлик левой кнопкой мыши')
            defineKeyboard(levelEVENT);
        }, bg:retColor},

        {key:'moDn',fn:()=>{
            paste('mousedown','\nНажата левая кнопка мыши')
            defineKeyboard(levelEVENT);
        }, bg:retColor},

        {key:'moUp',fn:()=>{
            paste('mouseup','\nОтпущена левая кнопка мыши')
            defineKeyboard(levelEVENT);
        }, bg:retColor},

        {key:'moMov',fn:()=>{
            paste('mousemove','\nДвижение указателя мыши')
            defineKeyboard(levelEVENT);
        }, bg:retColor},

        {key:'moOut',fn:()=>{
            paste('mouseout','\nУказатель мыши покинул элемент')
            defineKeyboard(levelEVENT);
        }, bg:retColor},

        {key:'moOvr',fn:()=>{
            paste('mouseover','\nУказатель мыши находится внутри области отображения элемента')
            defineKeyboard(levelEVENT);
        }, bg:retColor},

        {key:'cont',fn:()=>{
            paste('contextmenu','\nПравая кнопка мыши')
            defineKeyboard(levelEVENT);
        }, bg:retColor},

        
        // {br:true},

        {key:'keyDn',fn:()=>{
            paste('keydown','\nКлавиша нажата')
            defineKeyboard(levelEVENT);
        }, bg:retColor},

        {key:'keyUp',fn:()=>{
            paste('keyup','\nКлавиша отпущена')
            defineKeyboard(levelEVENT);
        }, bg:retColor},

        {key:'chan',fn:()=>{
            paste('change','\nЭлемент теряет фокус ввода, \nа содержимое элемента изменилось за время, \nпока элемент был в фокусе.')
            defineKeyboard(levelEVENT);
        }, bg:retColor},

        {key:'inp',fn:()=>{
            paste('input','\nВвод текста(символа).\n События для input и textarea.\n Ev имеет свойство data - введенный символ')
            defineKeyboard(levelEVENT);
        }, bg:retColor},

        {key:'sel',fn:()=>{
            paste('select','\nКакая-то часть текста внутри элемента становится выделенной.')
            defineKeyboard(levelEVENT);
        }, bg:retColor},

        {key:'submit',fn:()=>{
            paste('submit','\nСобытие отправки формы(кнопка \'отправить\')')
            defineKeyboard(levelEVENT);
        }, bg:retColor},

        {br:true},

        {key:'blur',fn:()=>{
            paste('blur','\nПотеря фокуса (текстовые поля, кнопки, чекбокс...)')
            defineKeyboard(levelEVENT);
        }, bg:retColor},

        {key:'focus',fn:()=>{
            paste('focus','\nФокус (текстовые поля, кнопки, чекбокс...)')
            defineKeyboard(levelEVENT);
        }, bg:retColor},

        {key:'load',fn:()=>{
            paste('load','\nЗагрузка завершена')
            defineKeyboard(levelEVENT);
        }, bg:retColor},

        {key:'unload',fn:()=>{
            paste('unload','\nПроизводится выход из документа \n(закрытие или перенаправление страницы на другой адрес).')
            defineKeyboard(levelEVENT);
        }, bg:retColor},

        {key:'scroll',fn:()=>{
            paste('scroll','\nСрабатывает при прокрутке элемента.')
            defineKeyboard(levelEVENT);
        }, bg:retColor},

        {key:'error',fn:()=>{
            paste('error','\nОшибка (например при загрузке картинки)')
            defineKeyboard(levelEVENT);
        }, bg:retColor},

    ];
//attr____________________________________________________
    let levelAttr = [

        {key:'...',fn:()=>{
            defineKeyboard(levelMiscDOM);
        }, bg:retColor},

        {key:'get',fn:()=>{
            paste('.getAttribute(\'\')','\nМетод считывает значение заданного атрибута у тега.',false,15);
            defineKeyboard(levelMiscDOM);
        }, bg:retColor},

        {key:'set',fn:()=>{
            paste('.setAttribute(\'\')','\nМетод устанавливает значение заданного атрибута у тега.',false,15);
            defineKeyboard(levelMiscDOM);
        }, bg:retColor},

        {key:'rem',fn:()=>{
            paste('.removeAttribute(\'\')','\nМетод удаляет атрибут тега.',false,18);
            defineKeyboard(levelMiscDOM);
        }, bg:retColor},

         {key:'has',fn:()=>{
            paste('.hasAttribute(\'\')','\nМетод проверяет наличие атрибута true/false',false,15);
            defineKeyboard(levelMiscDOM);
        }, bg:retColor},

    ];
//classList_________________________________________________
    let leveClassList = [

        {key:'...',fn:()=>{
            defineKeyboard(levelMiscDOM);
        }, bg:retColor},

        {key:'add',fn:()=>{
            paste('.add(\'\')','\nДобавить класс элементу\nНазвание класса без точки!',false,6);
            defineKeyboard(levelMiscDOM);
        },bg:retColor},

        {key:'remove',fn:()=>{
            paste('.remove(\'\')','\nУдалить класс элемента\nНазвание класса без точки!',false,9);
            defineKeyboard(levelMiscDOM);
        },bg:retColor},

        {key:'contains',fn:()=>{
            paste('.contains(\'\')','\nПроверить наличие класса элемента\nНазвание класса без точки!',false,11);
            defineKeyboard(levelMiscDOM);
        },bg:retColor},

        {key:'toggle',fn:()=>{
            paste('.toggle(\'\')','\nПереключатель(убрать/поставить)\nНазвание класса без точки!',false,9);
            defineKeyboard(levelMiscDOM);
        },bg:retColor},

    ];

//HTML____________________________________________________
    let levelHTML =[
        {key:'...',fn:()=>{
            defineKeyboard(levelOne);
        }, bg:retColor},

        {br:true},

        {key:'p', fn:()=>{paste(`<p class=''> </p>`,'абзац',false,10)}},

        {key:'h1', fn:()=>{paste(`<h1 class=''> </h1>`,'заголовок 1',false,11)}},

        {key:'h2', fn:()=>{paste(`<h2 class=''> </h2>`,'заголовок 2',false,11)}},

        {key:'a', fn:()=>{paste(`<a class='' href=''> </a>`,'ссылка',false,10)}},

        {key:'img', fn:()=>{paste(`<img class='' src='' alt='' width='300' height='200'>`,'картинка',false,12)}},

        {key:'ul', fn:()=>{paste(
`
<ul class=''> 
  <li> text </li>
  <li> text </li>
</ul>
`,'',false,12)},bg:syntColor},

        {key:'ol', fn:()=>{paste(
`
<ol class=''> 
  <li> text </li>
  <li> text </li>
</ol>
`,'',false,12)},bg:syntColor},
        {key:'li', fn:()=>{'<li> <li>','',false,4}},

        {key:'div', fn:()=>{paste(`<div class=''> </div>`,'блок',false,12)}},

        {key:'sp', fn:()=>{paste(`<span class=''> </span>`,'строчный элемент',false,13)}},

        {br:true},
    
        {key:'br', fn:()=>{paste(`<br>`,'перенос')}},

        {key:'i', fn:()=>{paste(`<i></i>`,'курсив',false,3)}},

        {key:'b', fn:()=>{paste(`<b></b>`,'жирный',false,3)}},

        {key:'s', fn:()=>{paste(`<s></s>`,'зачеркнутый',false,3)}},

        {key:'hr', fn:()=>{paste(`<hr>`,'перенос с подчеркиванием')}},

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
`,'таблица',false,15)},bg:syntColor},

        {key:'tr', fn:()=>{paste(
`
  <tr>
    <td>text</td>
    <td>text</td>
    <td>text</td>
  </tr>
`,'\nCтрока таблицы. Внутри тега должны быть ячейки td или th (для заголовков)',false,20)},bg:syntColor},

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

        {key:'cap', fn:()=>{paste('<caption></caption>','Название таблицы размещается внутри тега <table> на первом месте (до таблицы)',false,9)}},

        {br:true},

        {key:'form', fn:()=>{paste(`<form class='' action='' method=''></form>`,
        `
        Тег служит контейнером для тегов input, textarea, select, button, fieldset.
        Указанные теги не обязательно следует размещать в теге form,
        Данный тег объединяет указанные теги и соберает в единый запрос при отправке
        submit
        `,false,13)}},

        {key:'input', fn:()=>{paste(`<input type='text' class=''>`,
`
Поле вводаю. Вид данного элемента определяется атрибутом type
text - простой текст
color - подбор цвета
number - только цифры
email - электронная почта
checkbox - чекбокс
radio - радиопереключатель
есть много других вариантов!
`,false,17)}},

        {key:'button', fn:()=>{paste(`<button class=''>button</button>`,'\nКнопка',false,15)}}, 

        {key:'textarea', fn:()=>{paste(`<textarea class=''></textarea>`,'\nПоле ввода больших текстов',false,17)}},

        {key:'select', fn:()=>{paste(
`
<select class=''> 
  <option> sel 1 </option>
  <option> sel 2 </option>
</select>
`,'Поле для выбора значений, если указать атрибут multiple появится возможность множественного выбора',false,16)},bg:syntColor},
        {key:'option', fn:()=>{paste(`<option value=''></option>`,
`
Пункт выбора в select, размещается внутри тега select
Атрибут value содержит фактическое значение, которое будет присвоено
тегу select при выборе данного пункта. Внутри тега - отображаемое значение
`,false, 15)}},
        {key:'label', fn:()=>{paste(`<label><input type="checkbox"> mark</label>`,
`
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
`,'Список рекомендованных значений для input, привязывается к input через id (см. пример)',false,30)},bg:syntColor},

        {br:true},

        {key:'header', fn:()=>{paste(`<header> </header>`,'хедер',false,8)}},

        {key:'main', fn:()=>{paste(`<main> </main>`,'контент',false,6)}},

        {key:'aside', fn:()=>{paste(`<aside> </aside>`,'сайдбар',false,7)}},

        {key:'footer', fn:()=>{paste(`<footer> </footer>`,'хедер',false,8)}},

        {key:'nav', fn:()=>{paste(`<nav> </nav>`,'главное меню',false,5)}},

        {key:'section', fn:()=>{paste(`<section> </section>`,'раздел страницы',false,9)}},

        {key:'canvas', fn:()=>{paste(`<canvas width='300' height 200></canvas>`,
`
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
`,'селектор монитор, для расположенных внутри нижнего окна элементов', false,10)},bg:syntColor},

        {br:true},

        {key:'wid', fn:()=>{paste('width: ','\nШирина эдемента.\n Метрика: px-пиксели, vw - %от ширины экрана, em - % от размера радителя, fr - фпакция для flex и grid')}},

        {key:'hei', fn:()=>{paste('height: ','\nВысота блочного эдемента.\n Метрика: px-пиксели, vh - %от высоты экрана, em - % от размера радителя, fr - фпакция для flex и grid')}},

        {key:'min', fn:()=>{paste('min-','\nСоставное слово (минимум) для height и width',true)}},

        {key:'max', fn:()=>{paste('max-','\nСоставное слово (максимум) для height и width',true)}},

        {key:'mar', fn:()=>{paste('margin: ','\nотступ от границ соседнего/родительского элемента')}},

        {key:'pad', fn:()=>{paste('padding: ','\nотступ от границ внутри элемента')}},

        {key:'bxSz', fn:()=>{paste('box-sizing: border-box;','\nborder-box или content-box\nborder-box устанавливает жесткие границы элемента')}},

        {br:true},

        {key:'pos', fn:()=>{paste('position: absolute;',
`
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
        {key:'bt', fn:()=>{paste('bottom:','\nАбсолютная позиция от верхнего края')}},

        {key:'tp', fn:()=>{paste('top:','\nАбсолютная позиция от нижнего края')}},

        {key:'lf', fn:()=>{paste('left:','\nАбсолютная позиция от левого края')}}, 

        {key:'rt', fn:()=>{paste('right:','\nАбсолютная позиция от правого края')}},

        {br:true},

        {key:'dis', fn:()=>{paste('display: flex;',
`
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

        {key:'flDir', fn:()=>{paste('flex-direction:','\nНаправление flex: row / row-rverse / column / column-reverse')}},

        {key:'flBas', fn:()=>{paste('flex-basis:','\nРазмер flex элемента вдоль главной оси (задается на селектор элемента)')}},

        {key:'juCo', fn:()=>{paste('justify-content:',
`
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

        {key:'gap', fn:()=>{paste('gap:','\nЗадает расстояние между элементами в гриде.')}},

        {key:'grTp', fn:()=>{paste('grid-template: repeat(4, 1fr)/repeat(3, 1fr);','\nЗадает количество и ширину рядов и столбцов, которые будет занимать элемент в гриде или сетке.')}},

        {key:'grCl', fn:()=>{paste('grid-column: 1/3;','\nЗадает начальную и конечную позиции элемента в гриде или сетке по столбцам.')}},

        {key:'grRw', fn:()=>{paste('grid-row: 1/3;','\nЗадает начальную и конечную позиции элемента в гриде или сетке по рядам.')}},

        {key:'txtAl', fn:()=>{paste('text-align;','\nВыравнивание текста | center | left | right | justify | auto | start | end.')}},

        {br:true},

        {key:'border', fn:()=>{paste('border: 1px solid black;',
`
Второй параметр задает тип линии бордюра:
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
      
        {key:'boRad', fn:()=>{paste('border-radius:','\nЗакругление углов в px или %')}},

        {key:'shad', fn:()=>{paste('box-shadow:',
`
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

        {key:'color', fn:()=>{paste('color:','\nЦвет текста')}},

        {key:'backgnd', fn:()=>{paste('background:','\nЗадний фон')}},

        {br:true},

        {key:'transform', fn:()=>{
            defineKeyboard(levelTransformCss)
        }, bg:groupColor},    

        {key:'transition', fn:()=>{paste('transition:all 0.8s ease;',
`
Плавный переход, порядок ввода параметров:
1. Свойство - all для всех либо конкретно width или color
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

        {key:'poEv', fn:()=>{paste('pointer-events:','\nреакция на событие мыши none/auto')}},

        {key:'cur', fn:()=>{paste('cursor:',
`
Вид курсора над элементом несколько интересных:
pointer - палец
grabbing - рука зажата
grab - рука
вообще их очень много, надо гуглить)))

`)}},

        {br:true},

        {br:true},

         {key:'sel', fn:()=>{paste('::selection','\nпсевдоэлемент - выделенный текст')}},

        {key:'link', fn:()=>{paste(':link','\nпсевдокласс - непосещенные ссылки')}},

        {key:'vis', fn:()=>{paste(':visited','\nпсевдокласс - посещенные ссылки')}},

        {key:'hover', fn:()=>{paste(':hover','\nпсевдокласс - курсор на элементе')}},

        {key:'active', fn:()=>{paste(':active','\nпсевдокласс - активный элемент (нажата лквая кнопка)')}},

        {key:'focus', fn:()=>{paste(':focus','\nпсевдокласс - элемент формы в фокусе')}},

        {key:'focWit', fn:()=>{paste(':focus-within','\nпсевдокласс - родитель элемента формы в фокусе')}},

        {key:'check', fn:()=>{paste(':checked','\nпсевдокласс - отмеченный флажек (радио)')}},

        {key:'disa', fn:()=>{paste(':disabled','\nпсевдокласс - неактивный инпут')}},

        {key:'enab', fn:()=>{paste(':enabled','\nпсевдокласс - активный инпут')}},
       
    ];

//TransformCss___________________________________________________________________
    let levelTransformCss=[

         {key:'...',fn:()=>{
            defineKeyboard(levelCSS);
        }, bg:retColor},

        {br:true},

        {key:'transform', fn:()=>{paste('transform:','\nтрансформации функция(x, y)')}},

        {key:'tran-orig', fn:()=>{paste('transform-origin:','\nзадает точку, относительно которой будут происходить трансформации элемента, задаваемые свойством transform. X Y Z')}},

        {br:true},

        {br:true},

        {key:'rot', fn:()=>{paste('rotate()','\nтрансформации - функция поворота ед - deg',false,7)}},

        {key:'scl', fn:()=>{paste('scale()','\nтрансформации - функция увеличение/уменьшение ед - 0.5',false,6)}},

        {key:'skew', fn:()=>{paste('skew()','\nтрансформации - функция наклон ед - deg',false,5)}},

        {key:'trans', fn:()=>{paste('translate()','\nтрансформации - функция смещение ед - px',false,5)}},

        {br:true},

    ];
//Object____________________________________________________
    let levelObject=[
        {key:'keys',fn:()=>{
            paste('keys(  )','Массив ключей (свойств) объекта',false, 6);
            defineKeyboard(levelOne);
        }, bg:retColor},

        {key:'values',fn:()=>{
            paste('values(  )','Массив значений объекта',false, 8);
            defineKeyboard(levelOne);
        }, bg:retColor},

        {key:'entries',fn:()=>{
            paste('entries(  )','Двухмерный массив [[key,val],[key,val]...]',false,9);
            defineKeyboard(levelOne);
        }, bg:retColor},

        {key:'asign',fn:()=>{
            paste('assign(target, src1, src2 )',
`
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
Позволяет добавлять новые свойства объектам или изменять существующие свойства,
включая конфигурацию поведения этих свойств (например, сделать их доступными только для чтения).
- obj: Объект, в который добавляется или изменяется свойство.
- prop: Имя нового или существующего свойства.
- descriptor: Описание свойства (его характеристики).
_____________________________________________________
Атрибуты объекта descriptor:
- value: Значение свойства.
- writable: Определяет, разрешено ли перезапись значения свойства. По умолчанию false.
- enumerable: Показывает, отображается ли свойство при итерации (например, цикле for...in)
  или выводится ли оно методом Object.keys. По умолчанию false.
- configurable: Может ли само свойство быть удалено или переопределено. По умолчанию false.
С помощью данного метода также возможно задание геттера и сеттера свойства (гугли если нужно!!!)
`,false,18);
            defineKeyboard(levelOne);
        }, bg:retColor},

        {key:'frz',fn:()=>{
            paste('freeze(  )',
`
Используется в JavaScript для предотвращения изменения свойств объекта.
Когда объект заморожен (frozen), любые попытки изменить существующие свойства 
(например, присвоение новых значений, удаление существующих свойств или изменение перечисляемости, 
доступности записи или настраиваемости) будут игнорироваться или вызывать ошибку в строгом режиме.
`,false,8);
            defineKeyboard(levelOne);
        }, bg:retColor},

        {key:'seal',fn:()=>{
            paste('seal(  )',
`
- Запечатывание: Метод делает объект неизменяемым относительно структуры 
  (нельзя добавлять новые свойства или удалять существующие).
- Изменение значений: Значения свойств остаются доступными для изменений.
- Наследуемые свойства: Наследуемые свойства объекта не подвергаются изменениям, 
  поскольку запечатывается сам объект, а не прототип цепочки наследования.
`,false,6);
            defineKeyboard(levelOne);
        }, bg:retColor},

        {key:'prevExten',fn:()=>{
            paste('preventExtensions(  )',
`
- Предотвращение расширения: Невозможно добавить новые собственные свойства объекта.
- Изменение существующих свойств: Свойства объекта могут быть изменены 
  (их значения, конфигурации), включая удаление существующих свойств.
- Наследование: Если объект имеет родительские объекты через цепочку прототипов, 
  этот метод влияет только на сам объект, не затрагивая прототипы.
`,false,19);
            defineKeyboard(levelOne);
        }, bg:retColor},

    ]
//Array____________________________________________
    let levelArray = [
       {key:'isArray',fn:()=>{
            paste('isArray(  )',
`
Метод проверяет является ли данный объект массивом. 
В случае, если это так, то возвращается true, 
в противном случае - false.
`,false,9);
            defineKeyboard(levelOne);
        }, bg:retColor},

        {key:'of',fn:()=>{
            paste('of(  )',
`
Метод возвращает новый массив из указанных в параметре значений.
`,false,4);
            defineKeyboard(levelOne);
        }, bg:retColor},

        {key:'from',fn:()=>{
            paste('from(  )',
`
Метод возвращает новый массив из массивоподобного 
или итерируемого объекта (псевдомассива). 
Первым параметром метод принимает объект, 
из которого нужно сделать массив, 
вторым необязательным - функцию, 
которую нужно применить к элементам объекта.
`,false,6);
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
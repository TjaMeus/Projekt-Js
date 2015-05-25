//variabel för ljudet när ormen äter
//biblioteket SoundJs används för att hämta ljudet 
var eat = new Audio();
eat.src = "SoundJS-master/_assets/audio/neck_snap-Vladimir-719669812.mp3";

//variabel för ljudet när det blir game over
//biblioteket SoundJs används för att hämta ljudet 
var death = new Audio();
death.src = "SoundJS-master/_assets/audio/Evil Laugh Cackle-SoundBible.com-957382653.mp3";

//här hämtar vi våra element från html-dokumentet
var getButton = document.getElementById('hamta');
var getList = document.getElementById('list');

//variabel som används för att spara användarens namn när spelet startar
//variabeln sparas i en prompt-funktion när spelet startar
var name;

var highscores = JSON.parse(localStorage.getItem('highscores'));

if (!highscores) {
    highscores = {
        scores : []
    };
} else {
    highscores.scores.sort(function(a,b) {
        return b.score - a.score;
    }).forEach(function(player){
        var text = player.name + " : " + player.score;
        var li = document.createElement("li");
        li.textContent = text;
        getList.appendChild(li);
    });
}

(function ($) {
    
        //variabel för att spara referensen från vårt html-dokument
        var canvas = document.getElementById('c'),
        
        //denna variabel är en referens till 2D-ritning
        //som tillåter oss att rita på vår canvas
        c = canvas.getContext('2d'),
        
        //height och width används till att bestämma dimensionen av spelplanen
        //pixelsize är variabeln som bestämmer hur stor varje pixel är i vårt spel
        //rate är hastigheten på spelet, hur snabbt ormen ska röra sig
        height, width, pixelsize, rate,
        
        //dir, åt vilken riktning ormen rör sig
        //newdir, åt vilken riktning ormen svänger
        //snake är en array av bitar av ormen
        //food är poistioneringen av "maten"
        //score är en variabel som sparar hur många gånger ormen har ätit maten
        dir, newdir, snake = [], food = [], score,
        
        //gstarted är true om spelet har startat
        //gpaused är true om spelet är pausat
        gstarted = false, gpaused = false;
    
    //funktion för att sätta upp inställningar och utseende för spelet
    //tar emot fyra argument
    function setup(h, w, ps, r) {
        height = h;
        width = w;
        pixelsize = ps;
        rate = r;
        canvas.height = h*ps;
        canvas.width = w*ps;

        //event-handler för att hantera våra knapptryckningar
        $(document).keydown(function (e) {
            switch(e.which) {
                //pil upp
                case 38:
                    if(dir != 2) {
                        //den nya riktningen av ormen
                        newdir = 0;
                    }
                    break;
                //pil höger    
                case 39:
                    if(dir != 3) {
                        //den nya riktningen av ormen
                        newdir = 1;
                    }
                    break;
                //pil ner    
                case 40:
                    if(dir != 0) {
                        //den nya riktningen av ormen
                        newdir = 2;
                    }
                    break;
                //pil vänster    
                case 37:
                    if(dir != 1) {
                        //den nya riktningen av ormen
                        newdir = 3;
                    }
                    break;
                //mellanslag
                //används för att starta och pausa spelet
                case 32:
                    if(!gstarted) {
                        startGame();
                    }
                    else {
                        togglePause();
                    }
                    break;
            }
        });
        //startsidan för spelet
        showIntro();
    }
    
    //funktion för startsidan för spelet
    function showIntro() {
        //sätter svart bakgrund till vår canvas
        c.fillStyle = 'transparent';
        //ritar upp en rektangel som är lika stor som vår canvas
        c.fillRect(0, 0, width*pixelsize, height*pixelsize);
        //använder röd färg till vår text
        c.fillStyle = 'red';
        //font och storlek
        c.font = '30px Creepster';
        //centrera vår text
        c.textAlign = 'center';
        //filltext tar emot argument för text, x-koordinat, y-koordinat och max-width
        c.fillText('Scary Snake', width/2*pixelsize, height/4*pixelsize, width*pixelsize);
        //använder vit färg till vår text
        c.fillStyle = '#fff';
        //font och storlek
        c.font = '16px Creepster';
        //här anger vi text för instruktioner för spelet
        c.fillText('Arrows = change direction.', width/2*pixelsize, height/2*pixelsize);
        c.fillText('Space = start/pause.', width/2*pixelsize, height/1.5*pixelsize);
    }

    // Funktionen för att starta spelet.
    // Ställer den första riktningen till höger och återställer våra andra spelvariabler
    function startGame() {
        // Omvandlar width och height till heltal med hjälp av den statiska funktionen "floor" i kombo med Math
        var x = Math.floor(width/2), y = Math.floor(height/2);
        // kallar på genFood-funktionen som gör att "maten" slumpvis placeras på spelplanen
        genFood();
        // Kommer att placera själva ormens huvud i mitten av spelplanen samt att 
        // tre delar(asså kroppens ökning) till vänster om huvudet.
        // varje element i "snake"-arrayen array av koordinater
        snake = [
            [x, y],
            [--x, y],
            [--x, y],
            [--x, y]
        ];
        dir = 1;
        newdir = 1;
        score = 0;
        gstarted = true;
        gpaused = false;
        // Kallar på frame-funktionen
        frame();
        // Vi placerar en prompt-funktion här för att användaren ska skriva in sitt namn
        // när den startar spelet
        name = prompt("Name"); 
    }
    
    // Funktionen som aktiveras då användaren dör
    function endGame() {
        // den här audio spelas när användaren dör
        death.play();
        // genom att sätta den till false kan man inte spela mer
        // och då skrivs det ut "Game Over" samt användarens score
        gstarted = false;
        c.fillStyle = 'rgba(0,0,0,0.8)';
        c.fillRect(0, 0, width*pixelsize, height*pixelsize);
        c.fillStyle = '#fff';
        c.font = '26px Creepster';
        c.textAlign = 'center';
        c.fillText('Game Over', width/2*pixelsize, height/2*pixelsize);
        c.fillStyle = '#fff';
        c.font = '16px Creepster';
        c.fillText('Score: ' + score, width/2*pixelsize, height/1.5*pixelsize);
        
        // Vill lagra highscore i en lista tills användaren väljer att uppdatera sidan
        //localStorage.setItem('score', score);
        highscores.scores.push({name:name,score:score});
        localStorage.setItem("highscores",JSON.stringify(highscores));

        while (getList.firstChild) {
            getList.removeChild(getList.firstChild);
        }

        highscores.scores.sort(function(a,b) {
            return b.score - a.score;
        }).forEach(function(player){
            var text = player.name + " : " + player.score;
            var li = document.createElement("li");
            li.textContent = text;
            getList.appendChild(li);
        });

            // Hämtar scorevariabeln 
            //var a = localStorage.getItem('score');
            // en variabel som ska skriva ut namnet och highscore
            //var n = name + ":" + " " + score;
            // Skapar ett listelement för varje element
            //var lista = document.createElement("li");
            // tar fram det aktuella highscoret med tillhörande namn hämtat från variabeln "n"
            //lista.textContent = n;
            // Lägger till i variabeln "lista" så att det visas som listor
            //getList.insertBefore(lista, getList.firstChild);
            // återställer localstorage
            // localStorage.clear();
        
    }
    
    // Funktion för paus
    function togglePause() {
        // om man trycker på mellanslag pausas spelet
        // "Paused" kommer att skrivas ut
        if(!gpaused) {
            gpaused = true;
            c.fillStyle = '#fff';
            c.font = '20px Creepster';
            c.textAlign = 'center';
            c.fillText('Paused', width/2*pixelsize, height/2*pixelsize);
        }
        // annars triggar den igång nästa "bildruta" för att återställa den pausade animationen
        // därav kallar den på frame-funktionen
        else {
            gpaused = false;
            frame();
        }
    }
    
    // Frame-funktionen
    function frame() {
        // Om spelet är startat eller pausat ska den inte göra någonting
        if(!gstarted || gpaused) {
            return;
        }
        // hämtar koordinaterna av ormens huvud vilket är första elementet i snake-arrayen
        var x = snake[0][0], y = snake[0][1];
        // här definieras hur man kan röra på ormens huvud med hjälp av en switch-funktion
        // med fyra olika utgångsvägar
        switch(newdir) {
            // y-- är y-minskning vilket definierar upp-pilen på tangentbordet
            case 0:
                y--;
                break;
            case 1:
            // x++ är x-ökning vilket är höger-pilen på tangentbordet
                x++;
                break;
            case 2:
            // y++ är y-ökning vilket är ned-pilen på tangentbordet
                y++;
                break;
            case 3:
            // x-- är x-minskning vilket är vänster-pilen på tangentbordet
                x--;
                break;
        }
        // Om huvudet kolliderar avslutas spelet.
        // Kallar på endgame-funktionen
        if(testCollision(x, y)) {
            endGame();
            return;
        }
        // lägger till nya koordinater i början av arrayen med hjälp av unshift-funktion
        snake.unshift([x, y]);
        // hanterar själva maten och highscore kopplingen samt att ny mat läggs till
        if(x == food[0] && y == food[1]) {
            // Om ormen lyckas äta adderas highscore med 1 poäng per gång
            score++;
            // eat-audio spelas upp varje gång ormen äter maten
            eat.play();
            // kallar på genFood-funktionen
            genFood();
        }
        // annars tas den sista delen av ormen bort med hjälp av pop-funktionen på snake-arrayen
        // skulle den inte tas bort växer ormen
        else {
            snake.pop();
        }
        // uppdaterar den nuvarande riktningen
        dir = newdir;
        // Själva spelplanens utseende
        // c.fillStyle = 'red';
        var img = document.getElementById("floor");
        c.drawImage(img, 0, 0);
        // c.fillRect(0, 0, width*pixelsize, height*pixelsize);
        // c.fillStyle = '#fff';
        // kallar på funktionerna drawFood och drawSnake
        drawFood();
        drawSnake();
        
        // sätter den nya "bildrutan" i rate, millisekunder. 
        setTimeout(frame, rate);
    }
      //denna funktion genererar mat på en slumpmässig plats med hjälp av math.random
    //och utgår utan på canvaset när den räknar ut vart den kan slumpa in maten
    function genFood() {
        var x, y;
        do {
            x = Math.floor(Math.random()*(width-1));
            y = Math.floor(Math.random()*(height-1));
        } while(testCollision(x, y));
        food = [x, y];
    }
    //tar och fyller den slumpmässig ytan genererad i genFood med en pixel
    function drawFood() {
        c.beginPath();        
        c.arc((food[0]*pixelsize)+pixelsize/2, (food[1]*pixelsize)+pixelsize/2, pixelsize/2, 0, Math.PI*2, false);
        c.fill();
    }
    // den utgår från ormens postion och fyller den pixeln. även när ormens postion stämmer med
    // matens postions adderas en pixel på ormens längd.
    function drawSnake() {
        var i, l, x, y;
        for(i = 0, l = snake.length; i < l; i++) {
            x = snake[i][0];
            y = snake[i][1];
            c.fillRect(x*pixelsize, y*pixelsize, pixelsize, pixelsize);
        }
    }
    //här är de värderna för Game over. alltså om ormen träffar sig själv eller kanterna av           //canvaset blir de game over. det denna om någont om detta stämmer blir de game over
    function testCollision(x, y) {
        var i, l;
        if(x < 0 || x > width-1) {
            return true;
        }
        if(y < 0 || y > height-1) {
            return true;
        }
        for(i = 0, l = snake.length; i < l; i++) {
            if(x == snake[i][0] && y == snake[i][1]) {
                return true;
            }
        }
        return false;
    }
    // height,width,pixelsize,rate. Det är här dessa värderna sätts in
    setup(30, 30, 10, 60);
 
}(jQuery));
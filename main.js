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
        c.fillStyle = '#000';
        //ritar upp en rektangel som är lika stor som vår canvas
        c.fillRect(0, 0, width*pixelsize, height*pixelsize);
        //använder vit färg till vår text
        c.fillStyle = '#fff';
        //font och storlek
        c.font = '30px sans-serif';
        //centrera vår text
        c.textAlign = 'center';
        //filltext tar emot argument för text, x-koordinat, y-koordinat och max-width
        c.fillText('Snake', width/2*pixelsize, height/4*pixelsize, width*pixelsize);
        //font och storlek
        c.font = '12px sans-serif';
        //här anger vi text för instruktioner för spelet
        c.fillText('Arrows = change direction.', width/2*pixelsize, height/2*pixelsize);
        c.fillText('Space = start/pause.', width/2*pixelsize, height/1.5*pixelsize);
    }
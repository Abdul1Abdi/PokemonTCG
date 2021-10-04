const app = {};

app.search=function(){
    $("#cardSearch").on("keyup",function(){
        let value = $(this).val().toLowerCase();
        $(".cardList li").filter(function(){
            $(this).toggle($(this).attr("class").toLowerCase().indexOf(value) > -1)
            $(this).children().toggle($(this).attr("class").toLowerCase().indexOf(value) > -1)
            console.log($(this).children())
            
        })
       
        
    })
}

app.updateCardList = function(cards){
    $cardList.empty()
    $(".cardListTitle").remove()
    $("#cardSearch").remove()
    $(".cardSection").prepend("<div class='flexContainer'><input type='text' id='cardSearch' placeholder='Search for a card...' ></div>")
    $(".cardSection").prepend("<h2 class='cardListTitle'>Card List</h2>")
    cards.forEach(function(card){
        cardListHTML = `
                        <li class="${card.name}">
                             <a href="${card.tcgplayer.url}">
                                <img src="${card.images.small}"  alt= "image of the ${card.name} card">
                                <p>Price: $${card.tcgplayer.price.toFixed(2)}</p>
                             <a>
                        </li>
                        `
        $cardList.append(cardListHTML)
    })
}

app.init = function (){
    $setList = $(".setList")
    $cardList = $(".cardList")

    $.ajax({
        url: 'https://api.pokemontcg.io/v2/sets',
        method: 'GET',
        dataType: 'json',
        data:{
            // q:`series:"Sword & Shield"`
            
        }
    }).then(function(res){
        res.data.forEach(function(set){
            setListHTML = `
                <li> 
                    <a href="#cardSection">
                        <img src="${set.images.logo}" alt= "logo of the ${set.name} set" class= "setImage" id = "${set.id}">
                    </a>
                    <p>${set.name}</p>
                    
                </li>
            `
            // I use prepend here to have the most recent sets first
            $setList.prepend(setListHTML)
        })
    })

    $setList.on("click",".setImage", function(e){
        e.preventDefault();

     
        const set = $(this).attr("id")
        $.ajax({
            url: 'https://api.pokemontcg.io/v2/cards',
            method: 'GET',
            dataType: 'json',
            headers:{"X-Api-Key": app.key},
            data:{
                q:`set.id:${set}`
                
            }
        }).then(function(res){
            
            console.log(res)
           res.data.forEach(function(card){
               // Cards come in different types such as normal, reverseholofoil, holofoil, and the API has differently named nested object. We use a for loop to go through each nested object under prices and get their market price property and use the highest one
               let higherPrice = 0;
               if (card.tcgplayer){
                    for (type in card.tcgplayer.prices){
                            if (card.tcgplayer.prices[type].market > higherPrice){
                                higherPrice = card.tcgplayer.prices[type].market;
                            }
                    }
                    card.tcgplayer.price = higherPrice
               }
               else{
                card.tcgplayer = {
                    price:higherPrice
                }
               }
               
           })
           //Sorts the card list based off of price in descending
           res.data.sort((a,b) => b.tcgplayer.price - a.tcgplayer.price);
        //    console.log(res.data)  

           app.updateCardList(res.data)
           app.search()
           })
           document.getElementById("cardSection").scrollIntoView();
        })
    }
    



$(function(){
    app.init();
});
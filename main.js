if (!localStorage.getItem('deck')) new_game()
update_cards()
update_score()
check_score()
update_ui()
/*Клик на кнопку "Новая игра"*/
document.getElementById('new_game').addEventListener('click', function(e) {
    if(localStorage.getItem("game_started")=='true') {
        Swal.fire({
            title: 'Сдаешься?',
            html: 'Вы действительно хотите начать новую игру?<br>Будет засчитано поражение',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            confirmButtonText: '<b class="swal">Сдаюсь</b>',
            cancelButtonColor: '#d33',
            cancelButtonText: '<b class="swal">Русские не сдаются</b>'
        }).then((result) => {
            if(result.isConfirmed) {
                localStorage.setItem('games_cnt', parseInt(localStorage.getItem('games_cnt'))+1)
                localStorage.setItem('losses_cnt',parseInt(localStorage.getItem('losses_cnt'))+1)
                new_game()
            }
        })
    } else {
        new_game()
    }
})
/*Клик на кнопку взятия карты*/
document.getElementById('take_card').addEventListener('click', function(e) {
    give_card(1,'player')
    update_cards()
    update_score()
    check_score()
    update_ui()
})

/*--Новая игра--*/
function new_game() {
    if(!localStorage.getItem('games_cnt')) localStorage.setItem('games_cnt', 0)
    if(!localStorage.getItem('wins_cnt')) localStorage.setItem('wins_cnt', 0)
    if(!localStorage.getItem('losses_cnt')) localStorage.setItem('losses_cnt', 0)
    create_deck()
    localStorage.setItem('game_started','true')
    localStorage.setItem('result','')
    give_card(2,'player')
    give_card(1,'dealer')
    update_cards()
    update_score()
    check_score()
    update_ui()
}

/*Создание колоды*/
function create_deck(){
    let nums = [2,3,4,5,6,7,8,9,10,110,210,310,11]
    let suits = ['hearts','diamonds','clubs','spades']
    let deck = []
    let val, num
    let iter = 0
    /*deck: число, масть, значение, кому принадлежит*/
    for (let i = 0;i<nums.length;i++){
        for (let l = 0; l<suits.length; l++){
            if(nums[i] == 110 || nums[i] == 210 || nums[i] == 310) {
                val = 10
            } else {
                val = nums[i]
            }
            switch (nums[i]) {
                case 110:
                    num = 'jack'
                    break
                case 210:
                    num = 'queen'
                    break
                case 310:
                    num = 'king'
                    break
                case 11:
                    num = 'ace'
                    break
                default:
                    num = nums[i]
                    break
            }
            deck[iter] = [num, suits[l], val, 'none']
            iter++
        }
    }
    localStorage.setItem('deck', JSON.stringify(deck))
    localStorage.setItem('player_cards',JSON.stringify([]))
    localStorage.setItem('dealer_cards',JSON.stringify([]))
}

/*Раздача карт*/
function give_card(cnt,who) {
    let deck = JSON.parse(localStorage.getItem('deck'))
    let player_cards = JSON.parse(localStorage.getItem('player_cards'))
    let dealer_cards = JSON.parse(localStorage.getItem('dealer_cards'))
    for (i=0;i<cnt;i++) {
        let rand = Math.floor(Math.random()*52) 
        while (deck[rand][3]!='none') {
            rand = Math.floor(Math.random()*52)
        }
        deck[rand][3]=who
        if (who == 'player') {
            player_cards[player_cards.length] = deck[rand]
            localStorage.setItem('player_cards',JSON.stringify(player_cards))
        }
        if (who == 'dealer') {
            dealer_cards[dealer_cards.length]  = deck[rand]
            localStorage.setItem('dealer_cards',JSON.stringify(dealer_cards))
        }
        /*console.log(deck[rand])*/
    }
    localStorage.setItem('deck',JSON.stringify(deck))
}

/*----*/
/*Отрисовка карт*/
function update_cards() {
    let deck = JSON.parse(localStorage.getItem('deck'))
    let dealer_div = document.querySelector('.dealer_cards')
    let player_div = document.querySelector('.player_cards')
    let player_cards = JSON.parse(localStorage.getItem('player_cards'))
    let dealer_cards = JSON.parse(localStorage.getItem('dealer_cards'))
    let card_pic = ''
    dealer_div.innerHTML = ""
    player_div.innerHTML = ""
    for(let i=0; i<player_cards.length; i++) {
        card_pic = `<img class="cards" alt="${player_cards[i][0]}_of_${player_cards[i][1]}" src="resources/PNG-cards-1.3/${player_cards[i][0]}_of_${player_cards[i][1]}.png"/>`
        player_div.insertAdjacentHTML('beforeend',card_pic)
    }
    for(let i=0; i<dealer_cards.length; i++) {
        card_pic = `<img class="cards" alt="${dealer_cards[i][0]}_of_${dealer_cards[i][1]}" src="resources/PNG-cards-1.3/${dealer_cards[i][0]}_of_${dealer_cards[i][1]}.png"/>`
        dealer_div.insertAdjacentHTML('beforeend',card_pic)
    }
}
/*Подсчет очков*/
function update_score() {
    let deck = JSON.parse(localStorage.getItem('deck'))
    let dealer_div = document.querySelector('.dealer_score')
    let player_div = document.querySelector('.player_score')
    player_div.innerHTML = ''
    dealer_div.innerHTML = ''
    let score = calc_score(deck)
    let dealer_score = score[0]
    let player_score = score[2]
    player_div.insertAdjacentHTML('beforeend','Ваш счёт: '+player_score)
    dealer_div.insertAdjacentHTML('beforeend','Счёт крупье: '+dealer_score)
}
/*простой подсчет, возврат [dealer_score,dealer_ace_cnt,player_score,player_ace_cnt]*/
function calc_score(deck) {
    let dealer_score = 0
    let dealer_ace_cnt = 0
    let player_score = 0
    let player_ace_cnt = 0
    for(let i=0; i<deck.length; i++) {
        if (deck[i][3]=='dealer') {
            if (deck[i][0] == 'ace'){
                dealer_ace_cnt++
            } else {
                dealer_score += deck[i][2]
            }
        }
        if (deck[i][3]=='player') {
            if (deck[i][0] == 'ace'){
                player_ace_cnt++
            } else {
                player_score += deck[i][2]
            }
        }
    }
    switch (player_ace_cnt) {
        case 1:
            player_score+11>21 ? player_score+=1 : player_score+=11
            break
        case 2:
            player_score+12>21 ? player_score+=2 : player_score+=12
            break
        case 3:
            player_score+13>21 ? player_score+=3 : player_score+=13
            break
        case 4:
            player_score+14>21 ? player_score+=4 : player_score+=14
            break
        default:
            break
    }
    switch (dealer_ace_cnt) {
        case 1:
            dealer_score+11>21 ? dealer_score+=1 : dealer_score+=11
            break
        case 2:
            dealer_score+12>21 ? dealer_score+=2 : dealer_score+=12
            break
        case 3:
            dealer_score+13>21 ? dealer_score+=3 : dealer_score+=13
            break
        case 4:
            dealer_score+14>21 ? dealer_score+=4 : dealer_score+=14
            break
        default:
            break
    }
    return [dealer_score,dealer_ace_cnt,player_score,player_ace_cnt]
}
/*Проверяем очки*/
function check_score(isInGame){
    let deck = JSON.parse(localStorage.getItem('deck'))
    let score = calc_score(deck)
    let dealer_score = score[0]
    let player_score = score[2]
    let ace = 0
    let ten = 0
    /*Проверка на Т+В/Д/К */
    for(let i=0; i<deck.length; i++) {
        if (deck[i][3]=='player') {
            if (deck[i][0] == 'ace') ace++ 
            if (deck[i][0] == 'jack' || deck[i][0] == 'queen' || deck[i][0] == 'king') ten++ 
        }
    }
    if (player_score==21 && ace == 1 && ten == 1) {
        set_result('victory',1) /*Блэкджек*/
    } else if (player_score>21) {
        set_result('defeat',0)
    } else if (isInGame==1){
        while (dealer_score<17){
            give_card(1,'dealer')
            deck = JSON.parse(localStorage.getItem('deck'))
            update_cards()
            update_score()
            score = calc_score(deck)
            dealer_score = score[0]
        }
        if (dealer_score>21 || dealer_score<player_score) {
            set_result('victory',0)
        } else if (dealer_score==player_score) {
            set_result('draw',0)
        } else if (dealer_score<=21 && dealer_score>player_score) {
            set_result('defeat',0)
        }
    }
}
/*Записываем результат */
function set_result(result,isBJ) {
    localStorage.setItem('result',result)
    let game_started = localStorage.getItem('game_started')
    if (game_started=='true') {
        localStorage.setItem('games_cnt', parseInt(localStorage.getItem('games_cnt'))+1)
        if (result=='victory') {
            localStorage.setItem('wins_cnt',parseInt(localStorage.getItem('wins_cnt'))+1)
            update_ui()
        } else if (result == 'defeat') {
            localStorage.setItem('losses_cnt',parseInt(localStorage.getItem('losses_cnt'))+1)
            update_ui()
        }
    }
    localStorage.setItem('game_started','false')

}
/*Клик на кнопку стоп*/
document.getElementById('stop').addEventListener('click', function(e) {
    check_score(1)
})
/*Обновление надписей и кнопок*/
function update_ui() {
    let result = localStorage.getItem('result')
    if (result) {
        document.querySelector('div.result').hidden=false
        let res_span = document.getElementById('result')
        if (result == 'victory') result = '<span class="win">'+'Победа!'+'</span>'
        if (result == 'defeat') result = '<span class="defeat">'+'Поражение.'+'</span>'
        res_span.innerHTML=result
    } else {
        document.querySelector('div.result').hidden=true
    }

    document.getElementById('games_cnt').innerHTML = localStorage.getItem('games_cnt')
    document.getElementById('wins_cnt').innerHTML = localStorage.getItem('wins_cnt')
    document.getElementById('losses_cnt').innerHTML = localStorage.getItem('losses_cnt')
    if (localStorage.getItem('game_started')=='false') {
        document.getElementById('take_card').disabled = true
        document.getElementById('stop').disabled = true
    } else if (localStorage.getItem('game_started')=='true') {
        document.getElementById('take_card').disabled = false
        document.getElementById('stop').disabled = false
    }
}

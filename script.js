document.addEventListener('DOMContentLoaded', () => {
    // --- State and DOM Elements ---
    let playerMoney = parseInt(localStorage.getItem('casinoPlayerMoney')) || 1000;
    const playerMoneyEl = document.getElementById('player-money');
    const blackjackPanel = document.getElementById('blackjack-panel');
    const roulettePanel = document.getElementById('roulette-panel');
    const showBlackjackBtn = document.getElementById('show-blackjack-btn');
    const showRouletteBtn = document.getElementById('show-roulette-btn');

    // Blackjack DOM
    const blackjackDealBtn = document.getElementById('blackjack-deal-btn');
    const blackjackHitBtn = document.getElementById('blackjack-hit-btn');
    const blackjackStayBtn = document.getElementById('blackjack-stay-btn');
    const blackjackBetInput = document.getElementById('blackjack-bet');
    const blackjackMessageEl = document.getElementById('blackjack-message');
    const blackjackActions = document.querySelector('#blackjack-panel .game-actions');
    const playerHandEl = document.getElementById('player-hand');
    const dealerHandEl = document.getElementById('dealer-hand');
    const playerScoreEl = document.getElementById('player-score');
    const dealerScoreEl = document.getElementById('dealer-score');

    // Roulette DOM
    const rouletteBetInput = document.getElementById('roulette-bet');
    const rouletteColorBtns = document.querySelectorAll('.roulette-color-btn');
    const rouletteNumberBtns = document.querySelectorAll('.roulette-number-btn');
    const rouletteResultEl = document.getElementById('roulette-result-display');
    const rouletteMessageEl = document.getElementById('roulette-message');

    // Blackjack game state
    let deck = [];
    let playerHand = [];
    let dealerHand = [];
    let blackjackBet = 0;
    const suits = ['hearts', 'diamonds', 'clubs', 'spades'];
    const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

    // --- Utility Functions ---
    function updateMoneyDisplay() {
        playerMoneyEl.textContent = playerMoney;
        localStorage.setItem('casinoPlayerMoney', playerMoney);
    }

    function switchGamePanel(panel) {
        document.querySelectorAll('.game-panel').forEach(p => p.classList.remove('active'));
        panel.classList.add('active');
        // Reset messages when switching games
        blackjackMessageEl.textContent = '';
        rouletteMessageEl.textContent = '';
    }

    // --- Blackjack Functions ---
    function createDeck() {
        deck = [];
        for (const suit of suits) {
            for (const value of values) {
                deck.push({ suit, value });
            }
        }
    }

    function shuffleDeck() {
        for (let i = deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck[i], deck[j]] = [deck[j], deck[i]];
        }
    }

    function getCardValue(card) {
        if (['J', 'Q', 'K'].includes(card.value)) return 10;
        if (card.value === 'A') return 11;
        return parseInt(card.value);
    }

    function getHandValue(hand) {
        let value = 0;
        let numAces = 0;
        for (const card of hand) {
            if (card.value === 'A') {
                numAces++;
            }
            value += getCardValue(card);
        }
        while (value > 21 && numAces > 0) {
            value -= 10;
            numAces--;
        }
        return value;
    }

    function renderHand(hand, element, showFirstCard = true) {
        element.innerHTML = '';
        hand.forEach((card, index) => {
            const cardEl = document.createElement('div');
            cardEl.className = 'card';
            if (!showFirstCard && index === 0) {
                cardEl.textContent = 'Hidden';
                cardEl.classList.add('hidden-card');
            } else {
                cardEl.textContent = `${card.value}`;
            }
            element.appendChild(cardEl);
        });
    }

    function updateBlackjackScore() {
        playerScoreEl.textContent = `Score: ${getHandValue(playerHand)}`;
        dealerScoreEl.textContent = `Score: ${getHandValue(dealerHand)}`;
    }

    function startBlackjack() {
        blackjackMessageEl.textContent = '';
        const betAmount = parseInt(blackjackBetInput.value);
        if (isNaN(betAmount) || betAmount <= 0) {
            blackjackMessageEl.textContent = 'Please enter a valid bet.';
            return;
        }
        if (betAmount > playerMoney) {
            blackjackMessageEl.textContent = 'You do not have enough money.';
            return;
        }

        blackjackBet = betAmount;
        playerMoney -= blackjackBet;
        updateMoneyDisplay();

        createDeck();
        shuffleDeck();
        playerHand = [];
        dealerHand = [];

        playerHand.push(deck.pop());
        dealerHand.push(deck.pop());
        playerHand.push(deck.pop());
        dealerHand.push(deck.pop());

        renderHand(playerHand, playerHandEl);
        renderHand(dealerHand, dealerHandEl, false);
        updateBlackjackScore();

        blackjackDealBtn.style.display = 'none';
        blackjackActions.style.display = 'block';

        if (getHandValue(playerHand) === 21) {
            endBlackjackGame();
        }
    }

    function hit() {
        playerHand.push(deck.pop());
        renderHand(playerHand, playerHandEl);
        updateBlackjackScore();

        if (getHandValue(playerHand) > 21) {
            blackjackMessageEl.textContent = 'You busted! You lose.';
            endBlackjackGame();
        }
    }

    async function stay() {
        blackjackActions.style.display = 'none';
        renderHand(dealerHand, dealerHandEl, true);

        while (getHandValue(dealerHand) < 17) {
            // Delay for dramatic effect
            await new Promise(resolve => setTimeout(resolve, 1000));
            dealerHand.push(deck.pop());
            renderHand(dealerHand, dealerHandEl, true);
        }
        endBlackjackGame();
    }

    function endBlackjackGame() {
        const playerScore = getHandValue(playerHand);
        const dealerScore = getHandValue(dealerHand);

        renderHand(dealerHand, dealerHandEl, true);
        updateBlackjackScore();

        if (playerScore > 21) {
            // Already handled in hit()
        } else if (dealerScore > 21 || playerScore > dealerScore) {
            blackjackMessageEl.textContent = 'You win!';
            playerMoney += blackjackBet * 2;
        } else if (playerScore < dealerScore) {
            blackjackMessageEl.textContent = 'Dealer wins! You lose.';
        } else {
            blackjackMessageEl.textContent = 'Push! It\'s a tie.';
            playerMoney += blackjackBet; // Return the bet
        }

        updateMoneyDisplay();
        blackjackDealBtn.style.display = 'block';
        blackjackActions.style.display = 'none';
    }

    // --- Roulette Functions ---
    function spinRoulette(betType) {
        rouletteMessageEl.textContent = '';
        const betAmount = parseInt(rouletteBetInput.value);
        if (isNaN(betAmount) || betAmount <= 0) {
            rouletteMessageEl.textContent = 'Please enter a valid bet.';
            return;
        }
        if (betAmount > playerMoney) {
            rouletteMessageEl.textContent = 'You do not have enough money.';
            return;
        }

        playerMoney -= betAmount;
        updateMoneyDisplay();

        // Animate the wheel spin
        const spinDuration = 3000;
        const result = Math.floor(Math.random() * 37); // 0-36
        rouletteResultEl.textContent = 'Spinning...';

        setTimeout(() => {
            let win = false;
            let outcomeMessage = `The ball landed on ${result}.`;

            if (result === 0) {
                // House always wins on 0 unless betting on green (not implemented)
            } else if (betType === 'red') {
                const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
                if (redNumbers.includes(result)) {
                    win = true;
                }
            } else if (betType === 'black') {
                const blackNumbers = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];
                if (blackNumbers.includes(result)) {
                    win = true;
                }
            } else if (betType === 'even') {
                if (result % 2 === 0) {
                    win = true;
                }
            } else if (betType === 'odd') {
                if (result % 2 !== 0) {
                    win = true;
                }
            }
            
            rouletteResultEl.textContent = outcomeMessage;
            if (win) {
                const winnings = betAmount * 2;
                playerMoney += winnings;
                rouletteMessageEl.textContent = `You won $${winnings}!`;
            } else {
                rouletteMessageEl.textContent = `You lost $${betAmount}. Better luck next time!`;
            }
            updateMoneyDisplay();
        }, spinDuration);
    }

    // --- Event Listeners ---
    showBlackjackBtn.addEventListener('click', () => switchGamePanel(blackjackPanel));
    showRouletteBtn.addEventListener('click', () => switchGamePanel(roulettePanel));

    blackjackDealBtn.addEventListener('click', startBlackjack);
    blackjackHitBtn.addEventListener('click', hit);
    blackjackStayBtn.addEventListener('click', stay);

    rouletteColorBtns.forEach(button => {
        button.addEventListener('click', () => spinRoulette(button.dataset.bet));
    });
    rouletteNumberBtns.forEach(button => {
        button.addEventListener('click', () => spinRoulette(button.dataset.bet));
    });

    // --- Initial setup ---
    updateMoneyDisplay();
    switchGamePanel(blackjackPanel);
});

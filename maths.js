
let answer;
let score = 0;
let backgroudImages = [];

function nextQuestion() {
    const n1 = Math.floor(Math.random() * 5);
    document.getElementById('n1').innerHTML = n1;

    const n2 = Math.floor(Math.random() * 5);
    document.getElementById('n2').innerHTML = n2;

    answer = n1 + n2;
}

function checkResult() {
    const prediction = predictImage();
    console.log(prediction, answer);
    
    if (prediction === answer) {
        score++;
        console.log('CORRECT', score);
        // Grow garden
        if (score <= 6) {
            // push image url to array
            backgroudImages.push(`url('images/background${score}.svg')`);
            document.body.style.backgroundImage = backgroudImages;
        } else {  // score = 6
            alert('CONGRATULATIONS!')   
            score = 0;
            backgroudImages = [];
            document.body.style.backgroundImage = backgroudImages;
        }

    } else {
        // Less garden
        if (score !== 0) {score--;}
        console.log('WRONG', score);
        alert('WRONG!');
        setTimeout(() => {
            backgroudImages.pop();
            // When using timeout, set all the code within the callback of setTimeout()
            document.body.style.backgroundImage = backgroudImages;
        }, 1000)
        
    }
}
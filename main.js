(function main() {
    let table = [
        [null, null, null],
        [null, null, null],
        [null, null, null]
    ]

    let mySymbol = "○";

    let dataConnection = null;

    // どっちのターンかを保持
    let turn = "○";
    
    // セルのクリックを検知
    document.querySelectorAll('.cell').forEach((element) => {
        element.addEventListener('click', (event) => {
            if(turn !== mySymbol) return;

            const target = event.target;
            const row = target.dataset.row;
            const col = target.dataset.col;
            table[row][col] = mySymbol;

            drawTable();
            const nextTurn = (turn === '○') ? '×' : '○';
            turn = nextTurn;
            const message = createMessage(table, nextTurn);
            dataConnection.send(message);
        })
    })

    function drawTable(){
        document.querySelectorAll('.cell').forEach((element) => {
            element.innerHTML = table[element.dataset.row][element.dataset.col];
        });
    }

    drawTable();


    // Peer作成
    const peer = new Peer({
        key: 'b405e267-de9a-4249-b5c3-43c59052f918'
    });

    // PeerID取得
    peer.on('open', () => {
        document.querySelector('#peer-id').textContent = peer.id;
    });

    // データチャネルでの送信処理
    document.querySelector('#send').onclick = () => {
        if(dataConnection === null){
            const destID = document.querySelector('#send-id').value;
            dataConnection = peer.connect(destID);
            dataConnection.on('open', () => {
                console.log('connection ok');
                turn = '×';
                const message = createMessage(table, turn);
                dataConnection.send(message);
            });
            dataConnection.on('data', (data) => {
                const message = JSON.parse(data);
                table = message['table'];
                turn = message['turn'];
                console.log(turn);
                console.log(mySymbol);
                drawTable();
            });
        }
    };

    // データチャネルの受信処理
    peer.on('connection', conn => {
        console.log('connection!');
        if(dataConnection === null){
            dataConnection = conn;
            mySymbol = "×";
            dataConnection.on('data', (data) => {
                const message = JSON.parse(data);
                table = message['table'];
                turn = message['turn'];
                drawTable();
                console.log(turn);
                console.log(mySymbol);
            });
        } else {
            conn.close();
        }
    });

    function createMessage(table, sysmbol){
        return JSON.stringify({
            table: table,
            turn: sysmbol
        });
    }
})()
(function main() {
    let table = [
        [null, null, null],
        [null, null, null],
        [null, null, null]
    ]

    let mySymbol = "○";

    let dataConnection = null;
    
    // セルのクリックを検知
    document.querySelectorAll('.cell').forEach((element) => {
        element.addEventListener('click', (event) => {
            const target = event.target;
            const row = target.dataset.row;
            const col = target.dataset.col;
            table[row][col] = mySymbol;

            drawTable();
            console.log(dataConnection);
            dataConnection.send(JSON.stringify(table))
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
        key: ''
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
            });
            dataConnection.on('data', (data) => {
                const tbl = JSON.parse(data);
                table = tbl;
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
                const tbl = JSON.parse(data);
                table = tbl;
                drawTable();
            });
        }
    });
})()
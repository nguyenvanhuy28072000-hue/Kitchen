

const courseData = {

"4000円":[
    "お造り",
    "サラダ",
    "揚げ物２種",
    "鳥バジルソース",
    "カレーつくね",
    "ちまき"
],
"4500円":[
    "お造り",
    "サラダ",
    "キスとなすの天ぷら",
    "つくねと万願寺",
    "さわら",
    "ちまき",
    "デザート"
],
"5000円":[
    "お造り",
    "湯葉",
    "サラダ",
    "エビとなすの天ぷら",
    "はもユーリンチ",
    "鶏のてりやき",
    "ちまき",
    "デザート"
],
"6000円":[
    "お造り",
    "湯葉",
    "サラダ",
    "はもと生麩の揚げ出し",
    "豚しゃぶ",
    "さわら",
    "ちまき",
    "デザート"
],
"7000円":[
    "お造り",
    "湯葉",
    "サラダ",
    "エビ、なす、万願寺の天ぷら",
    "はもユーリンチ",
    "鶏のてりやき",
    "さわら",
    "ちまき",
    "デザート"
]

};

let orders =
JSON.parse(localStorage.getItem("orders")) || [];

function saveOrders(){
localStorage.setItem(
"orders",
JSON.stringify(orders)
);
}



function addCourse(){

const course =
    document.getElementById("courseSelect").value;
const courseTime =
    document.getElementById("courseTime").value;
const people =
    document.getElementById("people").value;
const tableNo =
    document.getElementById("tableNo").value;
if(course === ""){
    alert("コースを選択してください");
    return;
}
if(courseTime === ""){
    alert("時間を入力してください");
    return;
}
if(people === ""){
    alert("人数を入力してください");
    return;
}
if(tableNo === ""){
    alert("卓番を入力してください");
    return;
}
orders.push({
    course: course,
    time: courseTime,
    people: people,
    table: tableNo,
    dishes: courseData[course].map(dish => ({
        name: dish,
        done: false
    }))
});
saveOrders();
render();
document.getElementById("people").value = "";
document.getElementById("tableNo").value = "";

}


function toggleDish(orderIndex,dishIndex){

orders[orderIndex]
    .dishes[dishIndex]
    .done =
!orders[orderIndex]
    .dishes[dishIndex]
    .done;
const allDone =
    orders[orderIndex]
    .dishes
    .every(d => d.done);
if(allDone){
    orders.splice(orderIndex,1);
}
saveOrders();
render();

}

function deleteOrder(index){

    if(confirm("このコースを削除しますか？")){
        orders.splice(index,1);
         saveOrders();
         render();
    }

}

function render(){

const body =
    document.getElementById("courseBody");
body.innerHTML = "";
orders.forEach((order,orderIndex)=>{
    const row =
        document.createElement("tr");
    let html = `
    <td>
        <button onclick="moveUp(${orderIndex})">▲</button>
        <button onclick="moveDown(${orderIndex})">▼</button>
    </td>
    
    <td>
        <button onclick="deleteOrder(${orderIndex})">削除</button> 
    </td>
        
    <td>
        <select onchange="updateCourse(${orderIndex}, this.value)">
             <option value="4000円" ${order.course === "4000円" ? "selected" : ""}>4000円</option>
             <option value="4500円" ${order.course === "4500円" ? "selected" : ""}>4500円</option>
             <option value="5000円" ${order.course === "5000円" ? "selected" : ""}>5000円</option>
             <option value="6000円" ${order.course === "6000円" ? "selected" : ""}>6000円</option>
             <option value="7000円" ${order.course === "7000円" ? "selected" : ""}>7000円</option>
        </select>
    </td>

   <td>
        <input type="time"
            value="${order.time}"
            onchange="updateField(${orderIndex}, 'time', this.value)">
    </td>

    <td>
        <input type="number"
            value="${order.people}"
            min="1"
            onchange="updateField(${orderIndex}, 'people', this.value)">
    </td>

    <td>
        <input type="text"
            value="${order.table}"
            onchange="updateField(${orderIndex}, 'table', this.value)">
    </td>
     
    `;
    for(let i=0;i<order.dishes.length;i++){
        if(order.dishes[i]){
            const dish =
                order.dishes[i];
            html += `
            <td
            class="dish ${dish.done ? 'done' : ''}"
            onclick="toggleDish(${orderIndex},${i})">
            ${dish.done ? '✓ ' : ''}
            ${dish.name}
            </td>
            `;
        }else{
            html += `
            <td>-</td>
            `;
        }
    }
    row.innerHTML = html;
    body.appendChild(row);
});

}

function moveUp(index){
    if(index === 0) return; // 一番上は動かせない

    const temp = orders[index];
    orders[index] = orders[index - 1];
    orders[index - 1] = temp;

    saveOrders();
    render();
}

function moveDown(index){
    if(index === orders.length - 1) return; // 一番下は動かせない

    const temp = orders[index];
    orders[index] = orders[index + 1];
    orders[index + 1] = temp;

    saveOrders();
    render();
}

function updateField(index, field, value){

    orders[index][field] = value;

    saveOrders();
    render();
}

function updateCourse(index, newCourse){

    // コース変更
    orders[index].course = newCourse;

    // 料理を再生成（ここ重要）
    orders[index].dishes = courseData[newCourse].map(dish => ({
        name: dish,
        done: false
    }));

    saveOrders();
    render();
}



render();



localStorage.clear();

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
            <button onclick="deleteOrder(${orderIndex})">削除</button>
           </td>
        <td>${order.course}</td>
        <td>${order.time}</td>
        <td>${order.people}</td>
        <td>${order.table}</td>
     
    `;
    for(let i=0;i<9;i++){
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

render();
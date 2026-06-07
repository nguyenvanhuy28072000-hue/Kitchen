localStorage.clear();

const courseData = {

"4000円":[
    "枝豆",
    "サラダ",
    "唐揚げ",
    "ポテト",
    "パスタ",
    "アイス"
],
"5000円":[
    "前菜",
    "刺身",
    "焼鳥",
    "揚物",
    "寿司",
    "汁物",
    "デザート"
],
"6000円":[
    "前菜",
    "刺身盛",
    "焼鳥盛",
    "天ぷら",
    "寿司",
    "鍋",
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
if(tableNo === ""){
    alert("卓番を入力してください");
    return;
}
orders.push({
    course: course,
    time: courseTime,
    table: tableNo,
    dishes: courseData[course].map(dish => ({
        name: dish,
        done: false
    }))
});
saveOrders();
render();
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
        <td>${order.course}</td>
        <td>${order.time}</td>
        <td>${order.table}</td>
    `;
    for(let i=0;i<7;i++){
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
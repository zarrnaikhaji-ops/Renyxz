const chat=document.getElementById("chat")

let mode="general"

function setMode(m){
mode=m
}

function add(text,type){

const div=document.createElement("div")

div.className=type

div.innerText=text

chat.appendChild(div)

}

async function send(){

const input=document.getElementById("prompt")

const text=input.value

if(!text) return

add("You: "+text,"user")

input.value=""

const res=await fetch("/ai",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
prompt:text,
mode:mode
})

})

const data=await res.json()

add("AI: "+data.reply,"ai")

}